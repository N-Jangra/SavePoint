package com.cuemark.savepoint;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Shows a progress notification while library metadata syncs in the background. */
@CapacitorPlugin(name = "SyncNotification")
public class SyncNotificationPlugin extends Plugin {
    private static final String CHANNEL = "metadata_sync";
    private static final int ID = 4107;

    private boolean allowed() {
        return Build.VERSION.SDK_INT < 33
            || getContext().checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        if (!allowed() && getActivity() != null) {
            ActivityCompat.requestPermissions(getActivity(), new String[]{Manifest.permission.POST_NOTIFICATIONS}, 4107);
        }
        call.resolve();
    }

    @PluginMethod
    public void update(PluginCall call) {
        if (!allowed()) { call.resolve(); return; }
        Context ctx = getContext();
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel ch = new NotificationChannel(CHANNEL, "Metadata sync", NotificationManager.IMPORTANCE_LOW);
            ch.setDescription("Progress while game details are fetched");
            ctx.getSystemService(NotificationManager.class).createNotificationChannel(ch);
        }
        boolean done = call.getBoolean("done", false);
        int max = Math.max(1, call.getInt("max", 1));
        int progress = call.getInt("progress", 0);
        Intent open = new Intent(ctx, MainActivity.class).setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(ctx, 0, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        NotificationCompat.Builder b = new NotificationCompat.Builder(ctx, CHANNEL)
            .setSmallIcon(ctx.getApplicationInfo().icon)
            .setContentTitle(call.getString("title", "Syncing metadata"))
            .setContentText(call.getString("text", ""))
            .setContentIntent(pi)
            .setOnlyAlertOnce(true)
            .setOngoing(!done)
            .setAutoCancel(done)
            .setCategory(Notification.CATEGORY_PROGRESS)
            .setProgress(done ? 0 : max, done ? 0 : progress, false);
        NotificationManagerCompat.from(ctx).notify(ID, b.build());
        call.resolve();
    }

    @PluginMethod
    public void cancel(PluginCall call) {
        NotificationManagerCompat.from(getContext()).cancel(ID);
        call.resolve();
    }
}
