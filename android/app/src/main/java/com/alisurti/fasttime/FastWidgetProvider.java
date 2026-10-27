package com.alisurti.fasttime;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.SystemClock;
import android.view.View;
import android.widget.RemoteViews;
import java.text.DateFormat;
import java.util.Date;

/**
 * Home-screen widget. Shows the same three states as the app:
 *   fasting  -> live countdown (Android's own Chronometer, so it ticks with the app closed)
 *   eating   -> "You can eat", since when
 *   no fast  -> "Finished dinner?" (tap to open the app and log it)
 * The state changes (fast ends, window goes stale) are picked up by a light,
 * non-waking alarm, so it costs essentially no battery.
 */
public class FastWidgetProvider extends AppWidgetProvider {

    static final String PREFS = "fasttime_widget";
    static final String KEY_DINNER_AT = "dinnerAt";
    static final String KEY_HOURS = "hours";
    static final String ACTION_REFRESH = "com.alisurti.fasttime.WIDGET_REFRESH";

    private static final long HOUR = 3600000L;
    private static final long PROGRESS_STEP = 15 * 60000L; // redraw the progress bar every 15 min

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        refreshAll(context);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager manager, int id, Bundle options) {
        refreshAll(context);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_REFRESH.equals(intent.getAction())) refreshAll(context);
    }

    @Override
    public void onDisabled(Context context) {
        AlarmManager alarms = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarms != null) alarms.cancel(refreshIntent(context));
    }

    static void refreshAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, FastWidgetProvider.class));
        if (ids == null || ids.length == 0) return;
        long now = System.currentTimeMillis();
        manager.updateAppWidget(ids, build(context, now));
        scheduleNext(context, now);
    }

    private static RemoteViews build(Context context, long now) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        long dinnerAt = prefs.getLong(KEY_DINNER_AT, 0L);
        float hours = prefs.getFloat(KEY_HOURS, 0f);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_fast);
        views.setOnClickPendingIntent(R.id.widget_root, openAppIntent(context));
        DateFormat clock = android.text.format.DateFormat.getTimeFormat(context);

        if (dinnerAt > 0 && hours > 0) {
            long end = dinnerAt + (long) (hours * HOUR);
            long stale = dinnerAt + (long) (Math.max(24f, hours + 4f) * HOUR);

            if (now < end) {
                views.setTextViewText(R.id.widget_label, context.getString(R.string.widget_left_to_fast));
                views.setViewVisibility(R.id.widget_title, View.GONE);
                views.setViewVisibility(R.id.widget_timer, View.VISIBLE);
                views.setChronometer(R.id.widget_timer, SystemClock.elapsedRealtime() + (end - now), null, true);
                views.setChronometerCountDown(R.id.widget_timer, true);
                views.setTextViewText(R.id.widget_sub,
                        context.getString(R.string.widget_eat_at, clock.format(new Date(end))));
                int progress = (int) Math.max(0, Math.min(1000, (now - dinnerAt) * 1000L / Math.max(1L, end - dinnerAt)));
                views.setViewVisibility(R.id.widget_progress, View.VISIBLE);
                views.setProgressBar(R.id.widget_progress, 1000, progress, false);
                return views;
            }

            if (now < stale) {
                showText(views, context.getString(R.string.widget_eating_window),
                        context.getString(R.string.widget_you_can_eat),
                        context.getString(R.string.widget_since, clock.format(new Date(end))));
                return views;
            }
        }

        showText(views, context.getString(R.string.app_name),
                context.getString(R.string.widget_finished_dinner),
                context.getString(R.string.widget_tap_to_log));
        return views;
    }

    private static void showText(RemoteViews views, String label, String title, String sub) {
        views.setChronometer(R.id.widget_timer, SystemClock.elapsedRealtime(), null, false);
        views.setViewVisibility(R.id.widget_timer, View.GONE);
        views.setViewVisibility(R.id.widget_progress, View.GONE);
        views.setViewVisibility(R.id.widget_title, View.VISIBLE);
        views.setTextViewText(R.id.widget_label, label);
        views.setTextViewText(R.id.widget_title, title);
        views.setTextViewText(R.id.widget_sub, sub);
    }

    /** Next moment the widget needs redrawing: progress step, end of fast, or window going stale. */
    private static void scheduleNext(Context context, long now) {
        AlarmManager alarms = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarms == null) return;
        PendingIntent pending = refreshIntent(context);
        alarms.cancel(pending);

        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        long dinnerAt = prefs.getLong(KEY_DINNER_AT, 0L);
        float hours = prefs.getFloat(KEY_HOURS, 0f);
        if (dinnerAt <= 0 || hours <= 0) return;

        long end = dinnerAt + (long) (hours * HOUR);
        long stale = dinnerAt + (long) (Math.max(24f, hours + 4f) * HOUR);
        long next;
        if (now < end) next = Math.min(end, now + PROGRESS_STEP);
        else if (now < stale) next = stale;
        else return;

        // RTC (not RTC_WAKEUP): never wakes the phone; it fires as soon as the
        // screen is next on, which is the only time anyone can see the widget.
        alarms.setWindow(AlarmManager.RTC, next, 30000L, pending);
    }

    private static PendingIntent refreshIntent(Context context) {
        Intent intent = new Intent(context, FastWidgetProvider.class).setAction(ACTION_REFRESH);
        return PendingIntent.getBroadcast(context, 1, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private static PendingIntent openAppIntent(Context context) {
        Intent intent = new Intent(context, MainActivity.class)
                .setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
}
