package ru.marge.game;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.my.target.ads.Reward;
import com.my.target.ads.RewardedAd;
import com.my.target.common.models.IAdLoadingError;

@CapacitorPlugin(name = "MonetizationBridge")
public class MonetizationBridgePlugin extends Plugin implements RewardedAd.RewardedAdListener {
    private static final String TAG = "MonetizationBridge";
    private static final String REWARDED_PROVIDER = "mock";
    private static final String PURCHASE_PROVIDER = "mock";
    private static final String REWARDED_PLACEMENT = "gameboard_utility";
    private static final long REWARDED_TIMEOUT_MS = 20000L;
    private RewardedAd rewardedAd = null;
    private PluginCall pendingRewardedCall = null;
    private boolean rewardedGranted = false;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private Runnable rewardedTimeoutRunnable = null;

    @PluginMethod
    public void getCapabilities(PluginCall call) {
        boolean consoleAppConfigured = !BuildConfig.RUSTORE_CONSOLE_APP_ID.isEmpty();
        boolean billingReady = BuildConfig.RUSTORE_BILLING_ENABLED && consoleAppConfigured;
        boolean rewardedReady = BuildConfig.VK_REWARDED_ENABLED && BuildConfig.VK_REWARDED_SLOT_ID > 0;
        String rewardedPlacement = BuildConfig.VK_REWARDED_PLACEMENT.isEmpty()
            ? REWARDED_PLACEMENT
            : BuildConfig.VK_REWARDED_PLACEMENT;

        JSObject result = new JSObject();
        result.put("platform", "android");
        result.put("nativeAvailable", true);
        result.put("billingReady", billingReady);
        result.put("rewardedReady", rewardedReady);
        result.put("environment", billingReady ? BuildConfig.RUSTORE_BILLING_ENVIRONMENT : "mock");
        result.put("rewardedProvider", rewardedReady ? "vkads" : REWARDED_PROVIDER);
        result.put("purchaseProvider", billingReady ? "rustore" : PURCHASE_PROVIDER);
        result.put("rewardedPlacement", rewardedPlacement);
        call.resolve(result);
    }

    @PluginMethod
    public void launchRewardedAd(PluginCall call) {
        String requestedPlacement = call.getString("placement", REWARDED_PLACEMENT);
        String placement = BuildConfig.VK_REWARDED_PLACEMENT.isEmpty()
            ? requestedPlacement
            : BuildConfig.VK_REWARDED_PLACEMENT;

        boolean rewardedReady = BuildConfig.VK_REWARDED_ENABLED && BuildConfig.VK_REWARDED_SLOT_ID > 0;
        if (!rewardedReady) {
            Log.w(TAG, "launchRewardedAd: rewarded is not ready (disabled or slot id missing)");
            JSObject result = new JSObject();
            result.put("provider", REWARDED_PROVIDER);
            result.put("completed", true);
            result.put("placement", placement);
            call.resolve(result);
            return;
        }
        if (pendingRewardedCall != null) {
            Log.w(TAG, "launchRewardedAd: rejected because another flow is in progress");
            call.reject("Rewarded ad flow is already in progress");
            return;
        }

        try {
            Log.i(TAG, "launchRewardedAd: start loading, slotId=" + BuildConfig.VK_REWARDED_SLOT_ID + ", placement=" + placement);
            pendingRewardedCall = call;
            rewardedGranted = false;
            if (rewardedAd != null) {
                rewardedAd.setListener(null);
                rewardedAd.destroy();
                rewardedAd = null;
            }
            rewardedTimeoutRunnable = () -> {
                if (pendingRewardedCall != null) {
                    Log.e(TAG, "launchRewardedAd: timeout waiting for SDK callbacks");
                    pendingRewardedCall.reject("VK rewarded ad timeout");
                    pendingRewardedCall = null;
                }
                rewardedGranted = false;
                if (rewardedAd != null) {
                    rewardedAd.setListener(null);
                    rewardedAd.destroy();
                    rewardedAd = null;
                }
            };
            mainHandler.postDelayed(rewardedTimeoutRunnable, REWARDED_TIMEOUT_MS);
            rewardedAd = new RewardedAd(BuildConfig.VK_REWARDED_SLOT_ID, getContext());
            rewardedAd.setListener(this);
            rewardedAd.load();
        } catch (Exception error) {
            clearRewardedTimeout();
            Log.e(TAG, "launchRewardedAd: failed to start", error);
            pendingRewardedCall = null;
            rewardedGranted = false;
            call.reject("Failed to start VK rewarded ad", error);
        }
    }

    private void clearRewardedTimeout() {
        if (rewardedTimeoutRunnable != null) {
            mainHandler.removeCallbacks(rewardedTimeoutRunnable);
            rewardedTimeoutRunnable = null;
        }
    }

    @Override
    protected void handleOnDestroy() {
        clearRewardedTimeout();
        if (rewardedAd != null) {
            rewardedAd.setListener(null);
            rewardedAd.destroy();
            rewardedAd = null;
        }
        pendingRewardedCall = null;
        rewardedGranted = false;
        super.handleOnDestroy();
    }

    @Override
    public void onLoad(RewardedAd ad) {
        if (rewardedAd == null) {
            return;
        }
        Log.i(TAG, "onLoad: showing rewarded ad");
        rewardedAd.show();
    }

    @Override
    public void onNoAd(IAdLoadingError adLoadingError, RewardedAd ad) {
        clearRewardedTimeout();
        if (pendingRewardedCall != null) {
            String errorMessage = adLoadingError != null ? adLoadingError.getMessage() : "no ad";
            Log.w(TAG, "onNoAd: " + errorMessage);
            pendingRewardedCall.reject("VK rewarded ad not available: " + errorMessage);
            pendingRewardedCall = null;
        }
        rewardedGranted = false;
        if (rewardedAd != null) {
            rewardedAd.setListener(null);
            rewardedAd.destroy();
            rewardedAd = null;
        }
    }

    @Override
    public void onClick(RewardedAd ad) {
        // no-op
    }

    @Override
    public void onDismiss(RewardedAd ad) {
        clearRewardedTimeout();
        Log.i(TAG, "onDismiss: completed=" + rewardedGranted);
        if (pendingRewardedCall != null) {
            JSObject result = new JSObject();
            result.put("provider", "vkads");
            result.put("completed", rewardedGranted);
            result.put("placement", BuildConfig.VK_REWARDED_PLACEMENT.isEmpty() ? REWARDED_PLACEMENT : BuildConfig.VK_REWARDED_PLACEMENT);
            pendingRewardedCall.resolve(result);
            pendingRewardedCall = null;
        }
        rewardedGranted = false;
        if (rewardedAd != null) {
            rewardedAd.setListener(null);
            rewardedAd.destroy();
            rewardedAd = null;
        }
    }

    @Override
    public void onReward(Reward reward, RewardedAd ad) {
        Log.i(TAG, "onReward: reward granted");
        rewardedGranted = true;
    }

    @Override
    public void onDisplay(RewardedAd ad) {
        // no-op
    }

    @Override
    public void onFailedToShow(RewardedAd ad) {
        clearRewardedTimeout();
        Log.e(TAG, "onFailedToShow");
        if (pendingRewardedCall != null) {
            pendingRewardedCall.reject("VK rewarded ad failed to show");
            pendingRewardedCall = null;
        }
        rewardedGranted = false;
        if (rewardedAd != null) {
            rewardedAd.setListener(null);
            rewardedAd.destroy();
            rewardedAd = null;
        }
    }

    @PluginMethod
    public void launchPurchase(PluginCall call) {
        String sessionId = call.getString("sessionId", "");
        if (sessionId.isEmpty()) {
            call.reject("Missing purchase session id");
            return;
        }

        if (BuildConfig.RUSTORE_BILLING_ENABLED && !BuildConfig.RUSTORE_CONSOLE_APP_ID.isEmpty()) {
            call.reject("RuStore Billing dependency is connected, but native purchase flow is not implemented yet");
            return;
        }

        JSObject result = new JSObject();
        result.put("provider", PURCHASE_PROVIDER);
        result.put("completed", true);
        result.put("transactionId", "mock-" + sessionId);
        call.resolve(result);
    }
}
