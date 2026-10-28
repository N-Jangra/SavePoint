// Public detail facade for the app-specific metadata providers.
(() => {
  window.SplitAppDetails = Object.freeze({ load: (item, settings) => window.SplitAppDetailController.load(item, settings) });
})();
