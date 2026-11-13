package com.cuemark.savepoint;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.View;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;

import androidx.lifecycle.Lifecycle;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "SavePoint";
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private boolean rendererGone = false;
    private boolean recoveryScheduled = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(LaunchStatePlugin.class);
        registerPlugin(BackupFolderPlugin.class);
        registerPlugin(CacheManagerPlugin.class);
        registerPlugin(EncryptedStorePlugin.class);
        registerPlugin(BackupSchedulerPlugin.class);
        registerPlugin(ShareIntentPlugin.class);
        registerPlugin(WidgetPlugin.class);
        registerPlugin(ProviderConsentPlugin.class);
        registerPlugin(ScrollbarControlPlugin.class);
        registerPlugin(SyncNotificationPlugin.class);
        super.onCreate(savedInstanceState);
        // A task removed from Recents starts at Games. A system-restored task
        // retains its saved route and scroll state after ordinary backgrounding.
        getSharedPreferences(LaunchStatePlugin.PREFS_NAME, MODE_PRIVATE)
                .edit()
                .putBoolean(LaunchStatePlugin.RESET_HOME_KEY, savedInstanceState == null)
                .apply();
        if (getBridge() != null && getBridge().getWebView() != null) {
            // Prevent Android edge stretching from pulling fixed bars with the page.
            getBridge().getWebView().setOverScrollMode(View.OVER_SCROLL_NEVER);
            getBridge().addWebViewListener(new WebViewListener() {
                @Override
                public boolean onRenderProcessGone(WebView webView, RenderProcessGoneDetail detail) {
                    rendererGone = true;
                    Log.w(TAG, "WebView renderer exited (crash=" + detail.didCrash() + ", url=" + webView.getUrl() + "); scheduling activity recovery");
                    recoverRendererWhenResumed();
                    return true;
                }
            });
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        if (rendererGone) recoverRendererWhenResumed();
    }

    private void recoverRendererWhenResumed() {
        if (!rendererGone || recoveryScheduled || isFinishing()) return;
        if (!getLifecycle().getCurrentState().isAtLeast(Lifecycle.State.RESUMED)) return;
        recoveryScheduled = true;
        mainHandler.postDelayed(() -> {
            recoveryScheduled = false;
            if (!rendererGone || isFinishing() || isChangingConfigurations()) return;
            if (!getLifecycle().getCurrentState().isAtLeast(Lifecycle.State.RESUMED)) return;
            rendererGone = false;
            Log.w(TAG, "Recreating activity after WebView renderer exit");
            recreate();
        }, 300);
    }

}
