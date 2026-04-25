(function () {
  var shell = window.BusinessOSCommonOSLaunchShell;
  var config = window.BusinessOSCommonOSLaunchConfig;

  if (!shell || !config) return;
  shell.render('app', config);
})();
