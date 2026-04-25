(function () {
  var theme = window.BusinessOSCommonOSThemeTokens || {};
  var bridge = window.BusinessOSCommonOSProviderBridge || {};
  var appConfig = window.BusinessOSCommonOSAppConfig || {};
  var adapter = (window.BusinessOSCommonOSAdapters || {})['NameCardManager'] || {};
  var syncRegistry = window.BusinessOSCommonOSSyncRegistry || {};
  var mapper = window.BusinessOSCommonOSViewMapper;
  var shell = window.BusinessOSCommonOSShell;

  if (!mapper || !shell) return;

  shell.applyTheme(theme);
  shell.render('app', mapper.toShellViewModel(appConfig, adapter, syncRegistry, bridge));
})();
