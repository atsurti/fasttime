package com.alisurti.fasttime;

import android.content.Context;
import android.content.SharedPreferences;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Called from the web app (src/lib/native.js) whenever the fast changes.
 * Stores the current fast for the widget and redraws it.
 */
@CapacitorPlugin(name = "FastWidget")
public class FastWidgetPlugin extends Plugin {

    @PluginMethod
    public void update(PluginCall call) {
        Context context = getContext();
        SharedPreferences.Editor prefs =
                context.getSharedPreferences(FastWidgetProvider.PREFS, Context.MODE_PRIVATE).edit();

        String dinnerAt = call.getString("dinnerAt");
        String hours = call.getString("hours");
        try {
            if (dinnerAt == null || hours == null) {
                prefs.remove(FastWidgetProvider.KEY_DINNER_AT).remove(FastWidgetProvider.KEY_HOURS);
            } else {
                prefs.putLong(FastWidgetProvider.KEY_DINNER_AT, Long.parseLong(dinnerAt));
                prefs.putFloat(FastWidgetProvider.KEY_HOURS, Float.parseFloat(hours));
            }
        } catch (NumberFormatException e) {
            call.reject("Bad fast data");
            return;
        }
        prefs.apply();

        FastWidgetProvider.refreshAll(context);
        call.resolve();
    }
}
