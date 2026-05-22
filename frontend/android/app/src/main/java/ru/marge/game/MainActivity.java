package ru.marge.game;

import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(MonetizationBridgePlugin.class);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);

        WindowInsetsControllerCompat insetsController =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        if (insetsController != null) {
            insetsController.setAppearanceLightStatusBars(false);
            insetsController.setAppearanceLightNavigationBars(false);
        }

        WebView webView = bridge.getWebView();
        ViewCompat.setOnApplyWindowInsetsListener(getWindow().getDecorView(), (view, windowInsets) -> {
            Insets navigationBars = windowInsets.getInsets(WindowInsetsCompat.Type.navigationBars());
            Insets tappableElement = windowInsets.getInsets(WindowInsetsCompat.Type.tappableElement());
            DisplayMetrics displayMetrics = getResources().getDisplayMetrics();
            float density = displayMetrics.density == 0f ? 1f : displayMetrics.density;
            int bottomInsetPx = tappableElement.bottom > 0 ? tappableElement.bottom : navigationBars.bottom;
            int bottomInsetCssPx = Math.round(bottomInsetPx / density);

            webView.post(() ->
                webView.evaluateJavascript(
                    "document.documentElement.style.setProperty('--android-nav-bar-inset-bottom', '" + bottomInsetCssPx + "px')",
                    null
                )
            );

            return windowInsets;
        });
        ViewCompat.requestApplyInsets(getWindow().getDecorView());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
    }
}
