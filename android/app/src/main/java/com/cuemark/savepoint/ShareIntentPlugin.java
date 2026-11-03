package com.cuemark.savepoint;

import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.webkit.MimeTypeMap;

import androidx.core.content.FileProvider;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PermissionState;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "ShareIntent", permissions = {
    @Permission(alias = "notifications", strings = { "android.permission.POST_NOTIFICATIONS" })
})
public class ShareIntentPlugin extends Plugin {
    private final ExecutorService imageExecutor = Executors.newSingleThreadExecutor();
    private static final String DOWNLOAD_CHANNEL_ID = "image-downloads";

    @PluginMethod
    public void getInitialShare(PluginCall call) {
        Intent intent = getActivity().getIntent();
        JSObject result = new JSObject();
        String text = extractText(intent);
        if (text != null && !text.isEmpty()) {
            result.put("text", text);
            result.put("type", intent.getType() == null ? "" : intent.getType());
            call.resolve(result);
        } else {
            result.put("text", "");
            result.put("type", "");
            call.resolve(result);
        }
    }

    private String extractText(Intent intent) {
        if (intent == null) return "";
        String text = intent.getStringExtra(Intent.EXTRA_TEXT);
        if (text != null && !text.isEmpty()) return text;
        Uri data = intent.getData();
        return data == null ? "" : data.toString();
    }

    @PluginMethod
    public void shareImage(PluginCall call) { withImage(call, "share"); }

    @PluginMethod
    public void copyImage(PluginCall call) { withImage(call, "copy"); }

    @PluginMethod
    public void downloadImage(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && getPermissionState("notifications") != PermissionState.GRANTED) {
            requestPermissionForAlias("notifications", call, "downloadNotificationPermissionResult");
            return;
        }
        withImage(call, "download");
    }

    @PermissionCallback
    private void downloadNotificationPermissionResult(PluginCall call) { withImage(call, "download"); }

    private void withImage(PluginCall call, String action) {
        String source = call.getString("src", "");
        String requestedName = call.getString("filename", "SavePoint-image");
        String title = call.getString("title", "SavePoint image");
        if (source.isEmpty()) { call.reject("The image source is empty."); return; }
        String filename = requestedName.replaceAll("[^A-Za-z0-9._-]", "-").replaceAll("\\.+$", "");
        if (filename.isEmpty()) filename = "SavePoint-image";
        final String safeFilename = filename;
        imageExecutor.execute(() -> {
            try {
                ImageData image = readImage(source);
                if ("download".equals(action)) {
                    String location = saveDownload(safeFilename, image);
                    String actualName = location.substring(location.lastIndexOf('/') + 1);
                    boolean notified = postDownloadNotification(actualName, location);
                    JSObject result = new JSObject(); result.put("location", location); result.put("notification", notified); call.resolve(result);
                    return;
                }
                File cached = cacheImage(safeFilename, image);
                Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", cached);
                if ("copy".equals(action)) {
                    getActivity().runOnUiThread(() -> {
                        try {
                            ClipboardManager clipboard = (ClipboardManager) getContext().getSystemService(Context.CLIPBOARD_SERVICE);
                            clipboard.setPrimaryClip(ClipData.newUri(getContext().getContentResolver(), title, uri));
                            JSObject result = new JSObject(); result.put("copied", true); call.resolve(result);
                        } catch (Exception error) { call.reject("Could not copy the image.", error); }
                    });
                } else {
                    getActivity().runOnUiThread(() -> {
                        try {
                            Intent send = new Intent(Intent.ACTION_SEND);
                            send.setType(image.mimeType);
                            send.putExtra(Intent.EXTRA_STREAM, uri);
                            send.putExtra(Intent.EXTRA_SUBJECT, title);
                            send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                            Intent chooser = Intent.createChooser(send, "Share image");
                            chooser.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                            getActivity().startActivity(chooser);
                            JSObject result = new JSObject(); result.put("shared", true); call.resolve(result);
                        } catch (Exception error) { call.reject("Could not open Android sharing.", error); }
                    });
                }
            } catch (Exception error) {
                call.reject(error.getMessage() == null ? "Could not process this image." : error.getMessage(), error);
            }
        });
    }

    private ImageData readImage(String source) throws Exception {
        byte[] bytes;
        String mime = "";
        if (source.startsWith("data:")) {
            int comma = source.indexOf(',');
            if (comma < 0) throw new Exception("Invalid image data.");
            String header = source.substring(5, comma);
            int semicolon = header.indexOf(';');
            mime = (semicolon < 0 ? header : header.substring(0, semicolon)).toLowerCase(Locale.ROOT);
            String payload = source.substring(comma + 1);
            bytes = header.contains("base64")
                ? android.util.Base64.decode(payload, android.util.Base64.DEFAULT)
                : URLDecoder.decode(payload, StandardCharsets.UTF_8.name()).getBytes(StandardCharsets.UTF_8);
        } else {
            URLConnection connection = new URL(source).openConnection();
            connection.setConnectTimeout(15000);
            connection.setReadTimeout(20000);
            connection.setRequestProperty("User-Agent", "SavePoint Android");
            if (connection instanceof HttpURLConnection) ((HttpURLConnection) connection).setInstanceFollowRedirects(true);
            mime = connection.getContentType() == null ? "" : connection.getContentType().split(";")[0].trim().toLowerCase(Locale.ROOT);
            try (InputStream input = connection.getInputStream()) { bytes = readLimited(input); }
            finally { if (connection instanceof HttpURLConnection) ((HttpURLConnection) connection).disconnect(); }
        }
        if (bytes.length == 0) throw new Exception("The image is empty.");
        if (bytes.length > 25 * 1024 * 1024) throw new Exception("This image is too large to process.");
        if (!mime.startsWith("image/")) {
            BitmapFactory.Options options = new BitmapFactory.Options();
            options.inJustDecodeBounds = true;
            BitmapFactory.decodeByteArray(bytes, 0, bytes.length, options);
            mime = options.outMimeType == null ? "image/jpeg" : options.outMimeType;
        }
        return new ImageData(bytes, mime);
    }

    private byte[] readLimited(InputStream input) throws Exception {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        byte[] buffer = new byte[8192];
        int total = 0, count;
        while ((count = input.read(buffer)) != -1) {
            total += count;
            if (total > 25 * 1024 * 1024) throw new Exception("This image is too large to process.");
            output.write(buffer, 0, count);
        }
        return output.toByteArray();
    }

    private String extension(String mime) {
        String extension = MimeTypeMap.getSingleton().getExtensionFromMimeType(mime);
        return extension == null || extension.isEmpty() ? "jpg" : extension;
    }

    private File cacheImage(String baseName, ImageData image) throws Exception {
        File directory = new File(getContext().getCacheDir(), "shared-images");
        if (!directory.exists() && !directory.mkdirs()) throw new Exception("Could not prepare the image.");
        File file = new File(directory, UUID.randomUUID() + "-" + baseName + "." + extension(image.mimeType));
        try (FileOutputStream output = new FileOutputStream(file)) { output.write(image.bytes); }
        return file;
    }

    private String saveDownload(String baseName, ImageData image) throws Exception {
        String filename = baseName.replaceAll("\\.[A-Za-z0-9]{2,5}$", "") + "." + extension(image.mimeType);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentValues values = new ContentValues();
            values.put(MediaStore.Downloads.DISPLAY_NAME, filename);
            values.put(MediaStore.Downloads.MIME_TYPE, image.mimeType);
            values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
            values.put(MediaStore.Downloads.IS_PENDING, 1);
            Uri uri = getContext().getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
            if (uri == null) throw new Exception("Could not save the image to Downloads.");
            try (OutputStream output = getContext().getContentResolver().openOutputStream(uri)) {
                if (output == null) throw new Exception("Could not write the downloaded image.");
                output.write(image.bytes);
            } catch (Exception error) {
                getContext().getContentResolver().delete(uri, null, null);
                throw error;
            }
            ContentValues ready = new ContentValues(); ready.put(MediaStore.Downloads.IS_PENDING, 0);
            getContext().getContentResolver().update(uri, ready, null, null);
            return "Downloads/" + filename;
        }
        File directory = getContext().getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
        if (directory == null) throw new Exception("Downloads storage is unavailable.");
        if (!directory.exists() && !directory.mkdirs()) throw new Exception("Could not prepare Downloads.");
        File target = new File(directory, filename);
        try (FileOutputStream output = new FileOutputStream(target)) { output.write(image.bytes); }
        return target.getAbsolutePath();
    }

    private boolean postDownloadNotification(String filename, String location) {
        try {
            Context context = getContext();
            if (!NotificationManagerCompat.from(context).areNotificationsEnabled()) return false;
            NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager == null) return false;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                NotificationChannel channel = new NotificationChannel(DOWNLOAD_CHANNEL_ID, "Image downloads", NotificationManager.IMPORTANCE_DEFAULT);
                channel.setDescription("Shows when an image has finished saving to Downloads.");
                manager.createNotificationChannel(channel);
            }
            NotificationCompat.Builder notification = new NotificationCompat.Builder(context, DOWNLOAD_CHANNEL_ID)
                .setSmallIcon(android.R.drawable.stat_sys_download_done)
                .setContentTitle("Download complete")
                .setContentText(filename)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(filename + " saved to " + location))
                .setCategory(NotificationCompat.CATEGORY_STATUS)
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setAutoCancel(true);
            Intent launch = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
            if (launch != null) {
                int flags = PendingIntent.FLAG_UPDATE_CURRENT;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
                PendingIntent pendingIntent = PendingIntent.getActivity(context, (int) System.currentTimeMillis(), launch, flags);
                notification.setContentIntent(pendingIntent);
            }
            manager.notify((int) (System.currentTimeMillis() & 0x7fffffff), notification.build());
            return true;
        } catch (SecurityException denied) {
            return false;
        } catch (Exception ignored) {
            return false;
        }
    }

    private static class ImageData {
        final byte[] bytes;
        final String mimeType;
        ImageData(byte[] bytes, String mimeType) { this.bytes = bytes; this.mimeType = mimeType; }
    }
}
