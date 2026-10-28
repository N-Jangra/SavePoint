// Settings index and category detail templates for this app.
(() => {
  window.SplitAppPages = window.SplitAppPages || {};
  window.SplitAppPages.settings = context => {
    const { config, prefs, items, history, logEntries = [], esc, safeLucideName = value => value, settingsGroup, navItems, metadataSourceFilter = "all" } = context;
    const themeOptions = [["light", "Light"], ["dark", "Dark"], ["grey", "Grey"], ["amoled", "AMOLED"], ["flashbang", "Flashbang"], ["material-you", "Material You"], ["ocean", "Ocean"], ["forest", "Forest"], ["sunset", "Sunset"], ["rose", "Rose"], ["lavender", "Lavender"], ["nord", "Nord"], ["sand", "Sand"], ["mint", "Mint"], ["system", "System"]].map(([value, label]) => `${value}|${label}`);
    const fontOptions = ["system|System Default", "inter|Inter", "outfit|Outfit", "serif|Serif", "monospace|Monospace", "rounded|Rounded", "poppins|Poppins", "roboto|Roboto", "nunito|Nunito", "lato|Lato", "merriweather|Merriweather", "jetbrains-mono|JetBrains Mono", "open-sans|Open Sans", "montserrat|Montserrat", "oswald|Oswald", "raleway|Raleway", "ubuntu|Ubuntu", "playfair-display|Playfair Display", "fira-sans|Fira Sans", "rubik|Rubik", "quicksand|Quicksand", "caveat|Caveat"];
    const mainColors = [["#6366f1", "Indigo"], ["#f472b6", "Carnation Pink"], ["#16a34a", "Dark Green"], ["#b91c1c", "Maroon"], ["#2563eb", "Navy Blue"], ["#64748b", "Grey"], ["#e2e8f0", "White"], ["#a16207", "Brown"], ["#06b6d4", "Cool Cyan"], ["#f97316", "Fire"], ["#7c3aed", "Burple"], ["#22c55e", "Green"], ["#65a30d", "Apple"], ["#eab308", "Banan"], ["#f43f5e", "Party"], ["#fb7185", "Pink"], ["#8b5cf6", "Material You"]].map(([value, label]) => `${value}|${label}`);
    const settingGroups = [
      { id: "appearance", title: "Appearance", description: "Colors, type, motion, and navigation style.", icon: "palette", settings: [
        ["Text size", "textSize", "select", ["small|Small", "normal|Default", "large|Large"]], ["Reduce motion", "reduceMotion", "toggle"], ["Theme", "theme", "select", themeOptions],
        ["Animation speed", "animationSpeed", "select", ["off|Off", "fast|Fast", "normal|Normal", "slow|Slow"]], ["Fonts", "font", "select", fontOptions],
        ["Main color", "mainColor", "palette", mainColors],
        ["Bottom bar style", "bottomBarStyle", "select", ["box|Selected box", "icon-color|Icon color", "underline|Underline"]], ["Bottom bar corners", "bottomBarCorners", "select", ["round|Rounded", "sharp|Sharp"]], ["Bottom bar labels", "bottomBarLabels", "select", ["icons-labels|Icons + name", "icons-only|Icons only"]], ["Bottom bar background", "bottomBarBackground", "select", ["solid|Solid", "glass|Glass", "transparent|Transparent"]],
        ["Bottom bar transparency", "bottomBarTransparency", "range", 0, 100], ["Bottom bar layout", "bottomBarLayout", "page", { page: "nav-layout", value: "Manage" }], ["Bottom bar icons", "bottomBarIcons", "page", { page: "nav-icons", value: "Customize" }], ["Show sidebar", "showSidebar", "toggle"], ["Reset Appearance", "resetAppearance", "action"]
      ]},
      { id: "dashboard", title: "Dashboard", description: "Choose how your game collection is arranged.", icon: "layout-dashboard", settings: [
        ["Dashboard view", "dashboardView", "select", ["list|List", "compact-list|Compact list", "grid|Poster grid", "detailed-grid|Detailed grid", "compact-grid|Compact grid", "table|Table", "minimal-list|Minimal list", "large-grid|Large poster grid", "kanban|Kanban board", "timeline|Timeline"]],
        ["Default Category", "dashboardDefaultCategory", "select", ["remember|Remember last", "all|All categories", ...config.categories.map(category => `${category.key}|${category.name}`)]],
        ["Card Corner Style", "cardCorners", "select", ["rounded|Rounded", "soft|Soft", "square|Square"]],
        ["Dashboard Density", "dashboardDensity", "select", ["comfortable|Comfortable", "compact|Compact"]],
        ["Dashboard Grouping", "dashboardGroupBy", "select", ["status|Status", "category|Category", "release|Release date", "none|None"]],
        ["Dashboard Sorting", "dashboardSort", "select", ["updated-desc|Recently updated", "created-desc|Recently added", "progress-desc|Most progress", "progress-asc|Least progress", "rating-desc|Highest rated", "release-desc|Newest release", "alphabetical-asc|Title A–Z", "alphabetical-desc|Title Z–A"]],
        ["Show Thumbnails", "showThumbnails", "toggle"], ["Show Ratings", "showRatings", "toggle"], ["Show Progress", "showProgress", "toggle"],
        ["Rating Format", "ratingFormat", "select", ["5-stars|5 stars", "10-point|10 point"]],
        ["Reset Dashboard Preferences", "resetDashboard", "action"]
      ]},
      { id: "tracking", title: "Tracking", description: "Set progress behavior and default game status.", icon: "chart-no-axes-column-increasing", settings: [
        ["Automatic Completion", "automaticCompletion", "select", ["automatic|Automatic", "ask|Ask me", "manual|Manual"]], ["Default Status", "defaultStatus", "select", [...new Set(config.categories.flatMap(cat => cat.statuses))].map(status => `${status}|${status}`)],
        [config.progressLabel || "Playtime Increment", "progressIncrement", "select", ["1|1", "5|5", "10|10"]]
      ]},
      { id: "backups", title: "Backups & sync", description: "Import, export, and protect your library data.", icon: "database-backup", settings: [
        ["Export List", "export", "action", "Export your list as a file."], ["Import List", "import", "file", "Import your library from a file."],
        ["Backup Schedule", "backupSchedule", "select", ["never|Never", "daily|Daily"]], ["Backup Retention", "backupRetention", "select", ["3|Keep 3 backups", "5|Keep 5 backups", "10|Keep 10 backups", "20|Keep 20 backups"]],
        ["Backup Before Destructive Actions", "backupBeforeDestructive", "toggle"], ["Storage", "storageInfo", "page", { page: "storage-details", value: "View details" }], ["Folder Sync Delay", "folderSyncDelay", "select", ["0|Immediately", "30|30 seconds", "60|1 minute", "300|5 minutes"]],
        ["Backup Password Reminder", "backupPasswordReminder", "toggle"], ["Maximum Backup Size", "maximumBackupSize", "select", ["250|250 MB", "1000|1000 MB", "5000|5000 MB", "0|Unlimited"]], ["Validate Backup Location", "validateBackupLocation", "toggle"], ["Restore Preview", "restorePreview", "toggle"]
      ]},
      { id: "metadata", title: "Metadata", description: "Manage online sources, refresh, and artwork.", icon: "database", settings: [
        ["Metadata Mode", "metadataMode", "select", ["online|Online", "offline|Offline"]], ["Metadata Sources", "metadataSources", "page", { page: "metadata-sources", value: "Manage" }], ["Metadata Refresh Interval", "metadataRefreshInterval", "select", ["daily|Daily", "weekly|Weekly", "monthly|Monthly", "never|Never"]],
        ["Metadata Retry Limit", "metadataRetryLimit", "select", ["1|1 attempt", "3|3 attempts", "5|5 attempts"]], ["Offline Fallback", "offlineFallback", "select", ["cached|Use cached metadata", "none|Show no metadata"]],
        ["Metadata Sync Frequency", "metadataSyncFrequency", "select", ["immediate|Immediately", "hourly|Hourly", "daily|Daily", "manual|Manually"]], ["Metadata Sync Workers", "metadataWorkers", "select", ["1|1 worker", "2|2 workers", "5|5 workers", "10|10 workers"]],
        ["Automatic Thumbnail Cleanup", "thumbnailCleanup", "select", ["never|Never", "daily|Daily", "weekly|Weekly"]], ["Metadata Thumbnails", "metadataThumbnails", "toggle"], ["Thumbnail Size", "thumbnailSize", "select", ["small|Small", "medium|Medium", "large|Large"]], ["Thumbnail Quality", "thumbnailQuality", "select", ["low|Storage saver", "balanced|Balanced", "high|High quality"]]
      ]},
      { id: "storage", title: "Metadata & Storage", description: "Manage cached images and device storage limits.", icon: "hard-drive", settings: [
        ["Clear All Temporary Cache", "clear-cache", "action"], ["Clear Image Cache", "clear-images", "action", "Remove cached thumbnails."], ["Clear Metadata Cache", "clear-metadata", "action", "Tracked data is not affected."],
        ["Limit Image Cache", "imageCacheMaxEntries", "select", ["100|100 images", "250|250 images", "500|500 images", "1000|1000 images", "0|Unlimited"]], ["Background Encrypted Backups", "backgroundBackups", "toggle"], ["Storage Warning Limit", "storageWarningLimitMb", "select", ["250|250 MB", "500|500 MB", "1000|1000 MB", "2000|2000 MB"]], ["Backup Storage Limit", "backupStorageLimitMb", "select", ["500|500 MB", "1000|1000 MB", "5000|5000 MB", "0|Unlimited"]]
      ]},
      { id: "info", title: "App Info", description: "View app details and diagnostic logs.", icon: "info", settings: [["App Info", "appInfo", "page", { page: "app-info", value: "View details" }], ["Logcat", "logcat", "page", { page: "logcat", value: "View logs" }]] }
    ];

    function control(setting) {
      const [label, key, type, options, max] = setting;
      if (type === "toggle") return `<label class="toggle" aria-label="${esc(label)}"><input class="setting-control" type="checkbox" role="switch" data-pref="${key}" ${prefs[key] ? "checked" : ""}><span class="toggle-track" aria-hidden="true"></span></label>`;
      if (type === "select" || type === "palette") {
        const current = options.find(entry => entry.split("|")[0] === String(prefs[key]));
        const value = current ? current.split("|").slice(1).join("|") : (prefs[key] || options[0]?.split("|").slice(1).join("|") || "Choose");
        const swatch = type === "palette" ? `<span class="setting-picker-swatch" style="--choice-color:${esc(prefs[key] || "#6366f1")}"></span>` : "";
        return `<button type="button" class="setting-picker-trigger" data-setting-picker="${key}" data-picker-kind="${type === "palette" ? "palette" : key}" data-picker-options="${esc(JSON.stringify(options))}" aria-label="${esc(label)}: ${esc(value)}">${swatch}<span class="setting-picker-label">${esc(value)}</span><span class="setting-picker-chevron" aria-hidden="true">›</span></button>`;
      }
      if (type === "color") return `<input class="setting-control" type="color" data-pref="${key}" value="${esc(prefs[key])}">`;
      if (type === "number") return `<div class="toolbar"><input class="setting-control" style="max-width:125px" type="number" min="0" data-pref="${key}" value="${esc(prefs[key])}"><span class="muted">${esc(options)}</span></div>`;
      if (type === "range") return `<div class="toolbar"><input class="setting-control" type="range" min="${options}" max="${max}" data-pref="${key}" value="${esc(prefs[key])}"><output>${esc(prefs[key])}%</output></div>`;
      if (type === "page") {
        const bytes = new Blob([JSON.stringify({ items, history, preferences: prefs })]).size;
        const value = options.page === "storage-details" ? `${items.length} ${items.length === 1 ? "entry" : "entries"} · ${formatBytes(bytes)} used` : options.value || "Manage";
        return `<a class="setting-page-link" href="#settings/${esc(options.page)}"><span>${esc(value)}</span><span class="settings-chevron" aria-hidden="true">›</span></a>`;
      }
      if (type === "action") {
        if (key === "resetDashboard" || key === "resetAppearance") return `<button type="button" class="setting-reset-action" data-setting-action="${key}">Reset <span aria-hidden="true">↻</span></button>`;
        if (key.startsWith("clear-")) return `<button type="button" class="setting-cache-clear" data-setting-action="${key}">Clear</button>`;
        return `<button class="button secondary small" data-setting-action="${key}">${key === "export" ? "Export" : key.startsWith("clear-") ? "Clear" : "Open"}</button>`;
      }
      if (type === "file") return `<label class="button secondary small file-button">Choose file<input type="file" accept=".json,application/json" data-setting-action="import" hidden></label>`;
      if (type === "info") {
        const used = new Blob([JSON.stringify({ items, history })]).size;
        const size = used < 1024 * 1024 ? `${(used / 1024).toFixed(1)} KB` : `${(used / 1024 / 1024).toFixed(1)} MB`;
        return `<span class="muted setting-value">${esc(key === "storageInfo" ? `${items.length} entries · ${size} used` : options)}</span>`;
      }
      return "";
    }

    function renderGroup(group) {
      const sections = {
        appearance: { "Text size": "ACCESSIBILITY", "Reduce motion": "ACCESSIBILITY", Theme: "STYLE AND MOTION", "Animation speed": "STYLE AND MOTION", Fonts: "STYLE AND MOTION", "Main color": "STYLE AND MOTION", "Bottom bar style": "NAVIGATION", "Bottom bar labels": "NAVIGATION", "Bottom bar background": "NAVIGATION", "Bottom bar transparency": "NAVIGATION", "Bottom bar layout": "NAVIGATION", "Bottom bar icons": "NAVIGATION", "Show sidebar": "NAVIGATION", "Reset Appearance": "NAVIGATION" },
        dashboard: { "Dashboard view": "DASHBOARD", "Default Category": "DASHBOARD", "Card Corner Style": "DASHBOARD", "Dashboard Density": "DASHBOARD DISPLAY", "Dashboard Grouping": "DASHBOARD DISPLAY", "Dashboard Sorting": "DASHBOARD DISPLAY", "Show Thumbnails": "DASHBOARD DISPLAY", "Show Ratings": "DASHBOARD DISPLAY", "Show Progress": "DASHBOARD DISPLAY", "Reset Dashboard Preferences": "LAYOUT AND ACTIONS", "Rating Format": "LAYOUT AND ACTIONS" },
        tracking: { "Automatic Completion": "PROGRESS", "Default Status": "PROGRESS" },
        backups: { "Export List": "BACKUP AND RESTORE", "Import List": "BACKUP AND RESTORE", "Backup Schedule": "BACKUP SCHEDULE", "Backup Retention": "BACKUP SCHEDULE", "Backup Before Destructive Actions": "BACKUP SCHEDULE", Storage: "BACKUP AND RESTORE", "Folder Sync Delay": "BACKUP SCHEDULE", "Backup Password Reminder": "BACKUP SCHEDULE", "Maximum Backup Size": "BACKUP SCHEDULE", "Validate Backup Location": "BACKUP SCHEDULE", "Restore Preview": "BACKUP AND RESTORE" },
        metadata: { "Metadata Mode": "SOURCES", "Metadata Sources": "SOURCES", "Metadata Refresh Interval": "UPDATES", "Metadata Retry Limit": "UPDATES", "Offline Fallback": "UPDATES", "Metadata Sync Frequency": "UPDATES", "Metadata Sync Workers": "UPDATES", "Automatic Thumbnail Cleanup": "ARTWORK", "Metadata Thumbnails": "ARTWORK", "Thumbnail Size": "ARTWORK", "Thumbnail Quality": "ARTWORK" },
        storage: { "Clear All Temporary Cache": "CACHE MANAGEMENT", "Clear Image Cache": "CACHE MANAGEMENT", "Clear Metadata Cache": "CACHE MANAGEMENT", "Limit Image Cache": "CACHE MANAGEMENT", "Background Encrypted Backups": "STORAGE AND BACKUPS", "Storage Warning Limit": "STORAGE AND BACKUPS", "Backup Storage Limit": "STORAGE AND BACKUPS" },
        info: { "App Info": "APPLICATION", Logcat: "DIAGNOSTICS" }
      }[group.id] || {};
      const icons = { textSize: "type", reduceMotion: "accessibility", theme: "sun-moon", animationSpeed: "zap", font: "type", mainColor: "palette", bottomBarStyle: "panel-bottom", bottomBarLabels: "tags", bottomBarBackground: "blend", bottomBarTransparency: "sliders-horizontal", bottomBarLayout: "align-horizontal-distribute-center", bottomBarIcons: "panel-bottom", showSidebar: "panel-left", dashboardView: "layout-grid", cardCorners: "square", dashboardDensity: "rows3", dashboardGroupBy: "list-tree", dashboardSort: "arrow-up-down", showThumbnails: "image", showRatings: "star", showProgress: "chart-no-axes-column-increasing", resetDashboard: "rotate-ccw", ratingFormat: "star", automaticCompletion: "list-checks", defaultStatus: "circle-dot", progressIncrement: "plus", export: "upload", import: "download", backupSchedule: "calendar-clock", backupRetention: "archive", backupBeforeDestructive: "shield-check", storageInfo: "hard-drive", folderSyncDelay: "timer", backupPasswordReminder: "key-round", maximumBackupSize: "file-up", validateBackupLocation: "shield-check", restorePreview: "eye", metadataMode: "search", metadataSources: "database", metadataRefreshInterval: "clock", metadataRetryLimit: "refresh-cw", offlineFallback: "wifi-off", metadataSyncFrequency: "refresh-cw", metadataWorkers: "arrow-left-right", thumbnailCleanup: "trash2", metadataThumbnails: "image", thumbnailSize: "image", thumbnailQuality: "image", "clear-cache": "trash2", "clear-images": "image", "clear-metadata": "database", imageCacheMaxEntries: "hard-drive", backgroundBackups: "cloud-upload", storageWarningLimitMb: "triangle-alert", backupStorageLimitMb: "database", appInfo: "info", logcat: "scroll-text" };
      const descriptions = { textSize: "Adjust text size across the app.", reduceMotion: "Minimize transitions and animation.", theme: "Choose the app color theme.", animationSpeed: "Set transition speed.", font: "Choose the typeface used throughout the app.", mainColor: "Change the accent color.", bottomBarStyle: "Choose how navigation is highlighted.", bottomBarCorners: "Choose rounded or sharp bottom bar corners.", bottomBarLabels: "Show navigation icons alone or with their names.", bottomBarBackground: "Set the navigation background.", bottomBarTransparency: "Adjust navigation transparency.", bottomBarLayout: "Arrange navigation buttons.", bottomBarIcons: "Choose icons for bottom bar destinations other than Home.", showSidebar: "Show or hide the sidebar on wider screens.", dashboardView: "Choose list, compact list, grid, or table view.", dashboardDefaultCategory: "Choose which category opens on the Dashboard.", cardCorners: "Choose rounded, soft, or square Dashboard cards.", dashboardDensity: "Control the spacing between dashboard items.", dashboardGroupBy: "Group games by status, category, release date, or none.", dashboardSort: "Choose the default item order.", showThumbnails: "Show or hide artwork on the Dashboard.", showRatings: "Show or hide ratings in Dashboard cards.", showProgress: "Show or hide progress in Dashboard cards.", resetDashboard: "Restore the default Dashboard layout and display settings.", ratingFormat: "Choose how ratings are displayed.", automaticCompletion: "Choose how completed progress is handled.", defaultStatus: "Choose the status for new entries.", progressIncrement: "Choose the amount added per update.", export: "Save a copy of your library.", import: "Restore a library from a file.", backupSchedule: "Choose how often backups are created.", backupRetention: "Choose how many backups to keep.", backupBeforeDestructive: "Create a backup before data changes.", storageInfo: "View local library storage details.", folderSyncDelay: "Set the delay before folder sync.", backupPasswordReminder: "Show a reminder to protect backups.", maximumBackupSize: "Set a maximum backup file size.", validateBackupLocation: "Check the backup destination.", restorePreview: "Preview data before restoring.", metadataMode: "Choose online or offline metadata.", metadataSources: "Choose which metadata sources to use.", metadataRefreshInterval: "Set how often metadata is refreshed.", metadataRetryLimit: "Set retry attempts for failed requests.", offlineFallback: "Choose what to show without a connection.", metadataSyncFrequency: "Set how often metadata is synchronized.", metadataWorkers: "Choose simultaneous metadata requests.", thumbnailCleanup: "Set automatic artwork cleanup.", metadataThumbnails: "Enable or disable artwork downloads.", thumbnailSize: "Choose the saved artwork size.", thumbnailQuality: "Balance image quality and storage.", "clear-cache": "Remove temporary app files.", "clear-images": "Remove cached thumbnails.", "clear-metadata": "Remove cached metadata responses.", imageCacheMaxEntries: "Limit the number of cached images.", backgroundBackups: "Encrypt backups created in the background.", storageWarningLimitMb: "Choose when to show a storage warning.", backupStorageLimitMb: "Limit space used by backups.", appInfo: "About SavePoint and its features.", logcat: "Read or clear diagnostic logs." };
      icons.resetAppearance = "rotate-ccw";
      descriptions.resetAppearance = "Restore the default appearance and navigation settings.";
      const sectionRows = new Map();
      const resetSetting = group.settings.find(setting => setting[1] === "resetAppearance" || setting[1] === "resetDashboard");
      group.settings.forEach(setting => {
        if (setting[1] === "resetAppearance" || setting[1] === "resetDashboard") return;
        if (setting[1] === "bottomBarTransparency" && prefs.bottomBarBackground !== "transparent") return;
        const help = setting[3] && ["action", "file"].includes(setting[2]) && setting[3] !== descriptions[setting[1]] ? `<span class="setting-help setting-extra-help">${esc(setting[3])}</span>` : "";
        const section = sections[setting[0]] || (group.id === "tracking" && setting[1] === "progressIncrement" ? "PROGRESS" : "OPTIONS");
        if (!sectionRows.has(section)) sectionRows.set(section, []);
        let row = `<div class="setting-row" data-pref-setting="${esc(setting[1])}" data-setting-search-row="${esc(`${setting[0]} ${descriptions[setting[1]] || ""}`.toLowerCase())}"><span class="setting-icon" aria-hidden="true"><i data-lucide="${icons[setting[1]] || "circle"}"></i></span><div class="setting-row-copy"><div class="setting-title">${esc(setting[0])}</div><span class="setting-help">${esc(descriptions[setting[1]] || "Manage this setting.")}</span>${help}</div><div class="setting-row-control">${control(setting)}</div></div>`;
        if (setting[1] === "mainColor") {
          row += `<div class="category-colors-row" data-setting-search-row="main color category colors choose a color for each library category"><div><div class="setting-title">Category colors</div><span class="setting-help">Choose a color for each library category.</span></div><button type="button" class="category-colors-trigger" data-category-colors-picker><span>Customize</span><span aria-hidden="true">›</span></button></div>`;
        }
        sectionRows.get(section).push(row);
      });
      const sectionsHtml = [...sectionRows].map(([title, rows]) => `<section class="settings-section"><h2 class="settings-section-title">${esc(title)}</h2><div class="settings-list">${rows.join("")}</div></section>`).join("");
      const resetHtml = resetSetting ? `<section class="setting-reset-card" data-pref-setting="${esc(resetSetting[1])}" data-setting-search-row="${esc(`${resetSetting[0]} ${descriptions[resetSetting[1]]}`.toLowerCase())}"><div><strong>${esc(resetSetting[0])}</strong><span>${esc(descriptions[resetSetting[1]])}</span></div>${control(resetSetting)}</section>` : "";
      return `${sectionsHtml}${resetHtml}`;
    }

    const pageHeader = (title, parent, intro) => {
      const groupIcon = settingGroups.find(group => group.id === parent)?.icon || "settings";
      return `<header class="settings-page-heading settings-subpage-heading"><a class="settings-back" href="#settings/${parent}"><span aria-hidden="true">‹</span> Back</a><span class="settings-subpage-icon" aria-hidden="true"><i data-lucide="${groupIcon}"></i></span><h1>${esc(title)}</h1></header>${intro ? `<p class="manage-intro">${esc(intro)}</p>` : ""}`;
    };
    function renderNavLayout() {
      const nav = prefs.navBar || { order: (navItems || []).map(item => item.key), visible: {} };
      const tabs = new Map((navItems || []).map(item => [item.key, item]));
      const rows = nav.order.map((key, index) => {
        const item = tabs.get(key); if (!item) return "";
        const locked = Boolean(item.locked); const visible = nav.visible[key] !== false;
        const currentIcon = prefs.navIcons[key] || item.icon;
        const icon = key === "dashboard" && currentIcon === "controller" ? '<img src="icons/controller.svg" alt="">' : `<i data-lucide="${safeLucideName(currentIcon)}"></i>`;
        return `<div class="sortable-item nav-layout-row" draggable="true" data-nav-row="${esc(key)}"><span class="drag-handle" aria-hidden="true">⋮⋮</span><span class="sortable-label"><span class="manage-nav-row-icon">${icon}</span><span class="manage-nav-row-copy"><strong>${esc(item.label)}</strong><small>${locked ? "Always shown" : visible ? "Shown in bottom bar" : "Hidden from bottom bar"}</small></span></span><div class="nav-layout-actions"><button type="button" data-nav-move="up" data-nav-key="${esc(key)}" aria-label="Move ${esc(item.label)} up" ${index === 0 ? "disabled" : ""}>↑</button><button type="button" data-nav-move="down" data-nav-key="${esc(key)}" aria-label="Move ${esc(item.label)} down" ${index === nav.order.length - 1 ? "disabled" : ""}>↓</button><label class="toggle" aria-label="Show ${esc(item.label)} in bottom bar"><input type="checkbox" role="switch" data-nav-visible="${esc(key)}" ${visible ? "checked" : ""} ${locked ? "disabled" : ""}><span class="toggle-track" aria-hidden="true"></span></label></div></div>`;
      }).join("");
      return `<section class="settings-page settings-detail-page settings-manager-page">${pageHeader("Bottom Bar Layout", "appearance", "Choose which destinations appear in your bottom bar and arrange them in the order that feels right.")}<p class="manage-note">Home and Settings are always shown. Drag a row or use the arrow buttons to reorder destinations.</p><section class="settings-section"><h2 class="settings-section-title">Button arrangement</h2><div id="nav-bar-arrangement-list" class="sortable-list">${rows}</div></section><section class="settings-section"><h2 class="settings-section-title">Alignment</h2><div class="settings-list"><div class="setting-row"><span class="setting-icon" aria-hidden="true">☷</span><div class="setting-row-copy"><div class="setting-title">Bottom bar alignment</div><span class="setting-help">Set how the visible buttons are positioned.</span></div><div class="setting-row-control">${control(["Bottom bar alignment", "bottomBarLayout", "select", ["spread|Spread", "center|Centered", "left|Left"]])}</div></div></div></section></section>`;
    }
    function renderNavIcons() {
      const iconChoices = ["search", "sparkles", "compass", "calendar-days", "pie-chart", "settings", "gamepad-2", "bookmark", "trophy", "clock-3", "chart-no-axes-column-increasing", "library", "star", "heart", "house", "target", "zap", "play", "book-open", "layout-grid", "list", "image", "globe", "activity"];
      const editableItems = navItems || [];
      const rows = editableItems.map(item => {
        const currentIcon = prefs.navIcons[item.key] || item.icon;
        const choices = [...new Set([currentIcon, ...(item.key === "dashboard" ? ["controller"] : []), ...iconChoices])];
        const iconPreview = item.key === "dashboard" && currentIcon === "controller" ? '<img src="icons/controller.svg" alt="">' : `<i data-lucide="${safeLucideName(currentIcon)}"></i>`;
        return `<div class="setting-row nav-icon-setting-row"><span class="setting-icon" aria-hidden="true">${iconPreview}</span><div class="setting-row-copy"><div class="setting-title">${esc(item.label)}</div><span class="setting-help">Choose the bottom bar icon for ${esc(item.label)}.</span></div><div class="setting-row-control"><select class="setting-control" data-nav-icon-select="${esc(item.key)}" aria-label="${esc(item.label)} bottom bar icon">${choices.map(icon => `<option value="${esc(icon)}" ${icon === currentIcon ? "selected" : ""}>${icon === "controller" ? "SavePoint controller" : esc(icon.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" "))}</option>`).join("")}</select></div></div>`;
      }).join("");
      return `<section class="settings-page settings-detail-page settings-manager-page">${pageHeader("Bottom Bar Icons", "appearance", "Choose an icon for each destination. Home keeps its built-in icon.")}<section class="settings-section"><h2 class="settings-section-title">DESTINATION ICONS</h2><div class="settings-list">${rows}</div></section></section>`;
    }
    function renderMetadataSources() {
      const sources = window.SplitAppSources.list();
      const ordered = prefs.metadataSourceOrder.map(key => sources.find(source => source.key === key)).filter(Boolean);
      return `<section class="settings-page settings-detail-page settings-manager-page">${pageHeader("Metadata Sources", "metadata", "Choose which catalogs to search. Drag to change their order.")}<h2 class="settings-section-title">Built-in sources</h2><p class="metadata-sources-hint">Enable catalogs for discovery. Your order is used by the source picker.</p><div class="metadata-source-filters" role="group" aria-label="Filter metadata sources"><button type="button" class="metadata-source-filter${metadataSourceFilter === "all" ? " active" : ""}" data-source-filter="all" aria-pressed="${metadataSourceFilter === "all"}">All</button><button type="button" class="metadata-source-filter${metadataSourceFilter === "enabled" ? " active" : ""}" data-source-filter="enabled" aria-pressed="${metadataSourceFilter === "enabled"}">Enabled</button><button type="button" class="metadata-source-filter${metadataSourceFilter === "disabled" ? " active" : ""}" data-source-filter="disabled" aria-pressed="${metadataSourceFilter === "disabled"}">Disabled</button></div><section class="settings-section"><div id="builtin-metadata-sources-list" class="sortable-list">${ordered.map(source => {
        const enabled = window.SplitAppSources.isEnabled(source.key, prefs);
        const hidden = metadataSourceFilter === "enabled" ? !enabled : metadataSourceFilter === "disabled" ? enabled : false;
        return `<div class="sortable-item metadata-source-row" draggable="true" data-source-row="${esc(source.key)}" data-source-enabled-state="${enabled}" ${hidden ? "hidden" : ""}><span class="drag-handle" aria-hidden="true">⋮⋮</span><span class="sortable-label"><span class="manage-nav-row-copy"><strong>${esc(source.name)}</strong><small>${esc(source.categories.map(key => config.categories.find(category => category.key === key)?.label || key).join(", "))}</small></span></span><div class="source-row-actions"><button type="button" data-source-move="up" data-source-key="${esc(source.key)}" aria-label="Move ${esc(source.name)} up">↑</button><button type="button" data-source-move="down" data-source-key="${esc(source.key)}" aria-label="Move ${esc(source.name)} down">↓</button><label class="toggle" aria-label="Enable ${esc(source.name)}"><input type="checkbox" role="switch" data-source-enabled="${esc(source.key)}" ${enabled ? "checked" : ""}><span class="toggle-track" aria-hidden="true"></span></label></div>${source.keyRequired ? `<label class="source-api-key" ${enabled ? "" : "hidden"}><span>${esc(source.name)} API key</span><input type="password" data-source-api-key="${esc(source.key)}" value="${esc(prefs.apiKeys[source.key] || "")}" placeholder="Paste API key" autocomplete="off">${source.keyUrl ? `<a href="${esc(source.keyUrl)}" target="_blank" rel="noopener noreferrer">Get an API key</a>` : ""}</label>` : ""}</div>`;
      }).join("")}</div></section><section class="settings-section custom-sources-note"><h2 class="settings-section-title">Custom sources</h2><p>SavePoint currently supports the built-in provider connections listed above.</p></section></section>`;
    }
    function formatBytes(bytes) { return bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`; }
    function renderStorageDetails() {
      const jsonBytes = new Blob([JSON.stringify({ items, history, preferences: prefs })]).size;
      const categoryRows = config.categories.map(category => {
        const count = items.filter(item => item.category === category.key).length;
        return `<div class="storage-breakdown-row"><span>${esc(category.label)}</span><strong>${count} ${count === 1 ? "entry" : "entries"}</strong></div>`;
      }).join("");
      return `<section class="settings-page settings-detail-page storage-manager-page">${pageHeader("Storage", "backups", "Review estimated library and cache usage. Cache sizes refresh when this page opens.")}<div class="manage-intro-card"><span class="manage-intro-icon">▣</span><div><strong>Storage on this device</strong><p>Library data is estimated from the saved records. Cache totals use the browser’s Cache Storage API when available.</p></div></div><section class="storage-total-card" aria-live="polite"><span class="storage-total-icon">▤</span><span class="storage-total-copy"><span class="storage-total-label">Estimated total</span><strong id="storage-total">${esc(formatBytes(jsonBytes))}</strong><span class="storage-muted">${items.length} ${items.length === 1 ? "entry" : "entries"} · ${history.length} activity records</span></span></section><section class="storage-card"><h2>Storage breakdown</h2><div class="storage-breakdown"><div class="storage-breakdown-row"><span>Library data (estimate)</span><strong>${esc(formatBytes(jsonBytes))}</strong></div>${categoryRows}</div></section><section class="storage-card"><h2>Cache usage</h2><div id="storage-cache-breakdown" class="storage-breakdown"><div class="storage-breakdown-row"><span>Metadata and artwork cache</span><strong>Calculating…</strong></div></div></section><section class="storage-card storage-actions"><h2>Cache management</h2><button type="button" class="storage-action" data-storage-action="metadata"><span><strong>Clear metadata cache</strong><small>Remove saved online responses. Your library stays untouched.</small></span><span aria-hidden="true">⌫</span></button><button type="button" class="storage-action" data-storage-action="images"><span><strong>Clear image cache</strong><small>Remove cached artwork and thumbnails.</small></span><span aria-hidden="true">⌫</span></button><button type="button" class="storage-action" data-storage-action="temporary"><span><strong>Clear all temporary cache</strong><small>Remove metadata, images, and temporary app cache.</small></span><span aria-hidden="true">⌫</span></button><div class="storage-danger-zone"><h3>Delete saved data</h3><p>These actions remove data from this device.</p><button type="button" class="storage-action storage-danger" data-storage-action="clear-data"><span><strong>Clear tracked data</strong><small>Remove library items and activity history.</small></span><span aria-hidden="true">⌫</span></button><button type="button" class="storage-action storage-danger" data-storage-action="factory-reset"><span><strong>Factory reset</strong><small>Remove your library, preferences, and cached data.</small></span><span aria-hidden="true">⚠</span></button></div></section></section>`;
    }

    function renderAppInfo() {
      return `<section class="settings-page settings-detail-page app-info-page">${pageHeader("App Info", "info", "About SavePoint.")}<section class="app-info-hero"><span class="app-info-mark" aria-hidden="true">🎮</span><h2>${esc(config.name)}</h2><p>Version ${esc(config.version || "1.0.0")}</p><strong>${esc(config.tagline || "Keep track of your games.")}</strong></section><section class="storage-card app-info-card"><h2>What SavePoint does</h2><p>SavePoint keeps your game collection, progress, playtime, and ratings organized on this device.</p></section><section class="storage-card app-info-card"><h2>Privacy and storage</h2><p>Your library is stored locally. Online metadata search is optional and can be managed from Metadata settings.</p></section><section class="storage-card app-info-card"><h2>Game tracking</h2><p>SavePoint is focused on games. Track your backlog, active games, completed titles, and progress in one place.</p></section></section>`;
    }

    function renderLogcat() {
      const rows = logEntries.map(entry => {
        const when = entry.at ? new Date(entry.at).toLocaleString() : "Unknown time";
        return `<article class="logcat-entry"><div class="logcat-entry-meta"><strong class="logcat-level logcat-level-${esc(entry.level || "info")}">${esc(entry.level || "info")}</strong><time>${esc(when)}</time></div><p>${esc(entry.message || "")}</p></article>`;
      }).join("");
      return `<section class="settings-page settings-detail-page logcat-page">${pageHeader("Logcat", "info", "Recent frontend diagnostics for SavePoint.")}<div class="logcat-toolbar"><span>${logEntries.length} ${logEntries.length === 1 ? "entry" : "entries"}</span><button type="button" class="logcat-clear-button" data-log-action="clear" ${logEntries.length ? "" : "disabled"}>Clear logs</button></div>${rows ? `<div class="logcat-list">${rows}</div>` : `<div class="empty-state"><strong>No logs yet</strong><span>New app diagnostics will appear here.</span></div>`}</section>`;
    }

    if (settingsGroup === "nav-layout") return renderNavLayout();
    if (settingsGroup === "nav-icons") return renderNavIcons();
    if (settingsGroup === "metadata-sources") return renderMetadataSources();
    if (settingsGroup === "storage-details") return renderStorageDetails();
    if (settingsGroup === "app-info") return renderAppInfo();
    if (settingsGroup === "logcat") return renderLogcat();
    const selected = settingGroups.find(group => group.id === settingsGroup);
    if (selected) {
      const globalResults = settingGroups.filter(group => group.id !== selected.id).flatMap(group => group.settings.map(setting => {
        const searchText = `${setting[0]} ${group.title} ${group.description}`.toLowerCase();
        return `<a class="setting-search-result" data-settings-global-result data-search-value="${esc(searchText)}" href="#settings/${group.id}"><span class="setting-search-result-icon"><i data-lucide="${group.icon}"></i></span><span><strong>${esc(setting[0])}</strong><small>${esc(group.title)} · ${esc(group.description)}</small></span><span class="settings-chevron" aria-hidden="true">›</span></a>`;
      })).join("");
      const backupFolderManager = selected.id === "backups" ? renderBackupFolderManager() : "";
      return `<section class="settings-page settings-detail-page"><header class="settings-page-heading settings-subpage-heading"><a class="settings-back" href="#settings"><span aria-hidden="true">‹</span> Settings</a><span class="settings-subpage-icon" aria-hidden="true"><i data-lucide="${selected.icon}"></i></span><h1>${esc(selected.title)}</h1></header><label class="settings-search"><span aria-hidden="true">⌕</span><input type="search" data-settings-search data-search-group="${esc(selected.id)}" placeholder="Search all settings" aria-label="Search all settings"></label><div class="settings-global-results" data-settings-global-results hidden><h2 class="settings-section-title">More settings</h2>${globalResults}</div><div class="settings-detail-content">${backupFolderManager}${renderGroup(selected)}</div></section>`;
    }

    function renderBackupFolderManager() {
      const pluginAvailable = Boolean(window.SplitAppBackend?.isNativeFolderStorageAvailable?.());
      const savedUri = localStorage.getItem(window.SplitAppBackend?.folderUriKey || "") || "";
      let location = savedUri ? "Checking selected folder…" : "No database folder selected";
      if (savedUri) {
        try {
          const decoded = decodeURIComponent(savedUri);
          const treePath = decoded.match(/\/tree\/(.+)$/)?.[1];
          if (treePath) location = `Selected folder: /${treePath.replace(/^primary:/, "").replace(/^[^:]+:/, "")}`;
          else location = "A database folder is selected";
        } catch (_) { location = "A database folder is selected"; }
      }
      return `<section class="storage-card backup-folder-manager"><h2>SavePoint database folder</h2><p>SavePoint reads the database from this folder on startup and keeps it synced as you make changes. On a new install, selecting the same folder restores its database automatically.</p><p class="backup-folder-location" id="backup-folder-status" aria-live="polite">${esc(pluginAvailable ? location : "Folder storage is available in the Android app.")}</p><div class="backup-folder-actions"><button type="button" class="button secondary small" data-backup-folder-action="choose" ${pluginAvailable ? "" : "disabled"}>Choose folder</button><button type="button" class="button secondary small" data-backup-folder-action="check" ${pluginAvailable ? "" : "disabled"}>Check database</button></div></section>`;
    }

    const personalize = settingGroups.slice(0, 3);
    const library = settingGroups.slice(3, 6);
    const more = settingGroups.slice(6);
    const indexGroup = (title, groups) => `<section class="settings-index-group"><h2 class="settings-overline">${esc(title)}</h2><div class="settings-category-list">${groups.map(group => `<a class="settings-category-card" href="#settings/${group.id}"><span class="settings-category-icon"><i data-lucide="${group.icon}"></i></span><span class="settings-category-copy"><strong>${esc(group.title)}</strong><small>${esc(group.description)}</small></span><span class="settings-chevron">›</span></a>`).join("")}</div></section>`;
    const indexResults = settingGroups.flatMap(group => group.settings.map(setting => {
      const searchText = `${setting[0]} ${group.title} ${group.description}`.toLowerCase();
      return `<a class="setting-search-result" data-settings-index-result data-search-value="${esc(searchText)}" href="#settings/${group.id}"><span class="setting-search-result-icon"><i data-lucide="${group.icon}"></i></span><span><strong>${esc(setting[0])}</strong><small>${esc(group.title)} · ${esc(group.description)}</small></span><span class="settings-chevron" aria-hidden="true">›</span></a>`;
    })).join("");
    return `<section class="settings-page"><header class="settings-page-heading settings-index-heading"><h1>Settings</h1><p class="settings-page-subtitle">Personalize SavePoint</p></header><label class="settings-search"><span aria-hidden="true">⌕</span><input type="search" data-settings-index-search placeholder="Search all settings" aria-label="Search all settings"></label><div class="settings-global-results settings-index-results" data-settings-index-results hidden><h2 class="settings-section-title">Search results</h2>${indexResults}</div><div class="settings-index-no-results" data-settings-index-empty hidden>No matching settings.</div><div data-settings-index-categories>${indexGroup("Personalize", personalize)}${indexGroup("Your library", library)}${indexGroup("More", more)}</div></section>`;
  };
})();
