"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const backend = fs.readFileSync(path.join(__dirname, "../frontend/backend/app.js"), "utf8");
const native = fs.readFileSync(path.join(__dirname, "../android/app/src/main/java/com/cuemark/savepoint/ShareIntentPlugin.java"), "utf8");

test("native library exports publish permission-aware progress and completion notifications", () => {
  const start = backend.indexOf("async function exportLibrary("), end = backend.indexOf("// Plain-text exports", start);
  const exportCode = backend.slice(start, end);
  const picker = exportCode.indexOf("plugin.createDocument({ fileName");
  const permission = exportCode.indexOf("requestExportNotificationPermission");
  assert.ok(permission >= 0 && permission < picker, "notification permission is requested before the Android save picker");
  assert.match(exportCode, /startExportNotification/);
  assert.match(exportCode, /updateExportNotification/);
  assert.match(exportCode, /finishExportNotification/);
  assert.match(exportCode, /success: exportSucceeded/);
  assert.match(native, /public void startExportNotification\(PluginCall call\)/);
  assert.match(native, /public void requestExportNotificationPermission\(PluginCall call\)/);
  assert.match(native, /requestPermissionForAlias\("notifications", call, "exportNotificationPermissionOnlyResult"\)/);
  assert.match(native, /NotificationChannel\(EXPORT_CHANNEL_ID, "Backups and transfers"/);
});
