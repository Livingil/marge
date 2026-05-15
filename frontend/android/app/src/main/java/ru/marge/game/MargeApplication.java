package ru.marge.game;

import android.app.Application;
import io.appmetrica.analytics.AppMetrica;
import io.appmetrica.analytics.AppMetricaConfig;

public class MargeApplication extends Application {
    private static final String APP_METRICA_API_KEY = "ede8cb83-d635-4339-97e7-2ac57df30bf2";

    @Override
    public void onCreate() {
        super.onCreate();

        AppMetricaConfig config = AppMetricaConfig.newConfigBuilder(APP_METRICA_API_KEY).build();
        AppMetrica.activate(this, config);
        AppMetrica.enableActivityAutoTracking(this);
    }
}
