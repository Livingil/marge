package ru.marge.game;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "MonetizationBridge")
public class MonetizationBridgePlugin extends Plugin {
    private static final String REWARDED_PROVIDER = "mock";
    private static final String PURCHASE_PROVIDER = "mock";
    private static final String REWARDED_PLACEMENT = "gameboard_utility";

    @PluginMethod
    public void getCapabilities(PluginCall call) {
        boolean consoleAppConfigured = !BuildConfig.RUSTORE_CONSOLE_APP_ID.isEmpty();
        boolean billingReady = BuildConfig.RUSTORE_BILLING_ENABLED && consoleAppConfigured;

        JSObject result = new JSObject();
        result.put("platform", "android");
        result.put("nativeAvailable", true);
        result.put("billingReady", billingReady);
        result.put("rewardedReady", false);
        result.put("environment", billingReady ? BuildConfig.RUSTORE_BILLING_ENVIRONMENT : "mock");
        result.put("rewardedProvider", billingReady ? "vkads" : REWARDED_PROVIDER);
        result.put("purchaseProvider", billingReady ? "rustore" : PURCHASE_PROVIDER);
        result.put("rewardedPlacement", REWARDED_PLACEMENT);
        call.resolve(result);
    }

    @PluginMethod
    public void launchRewardedAd(PluginCall call) {
        String placement = call.getString("placement", REWARDED_PLACEMENT);

        JSObject result = new JSObject();
        result.put("provider", REWARDED_PROVIDER);
        result.put("completed", true);
        result.put("placement", placement);
        call.resolve(result);
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
