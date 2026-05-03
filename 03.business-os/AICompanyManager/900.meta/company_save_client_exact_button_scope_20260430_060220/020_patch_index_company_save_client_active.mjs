import fs from "node:fs";

const indexFile = process.argv[2];
let html = fs.readFileSync(indexFile, "utf8");

const scriptLine = '<script src="assets/js/aicm-company-persistent-save-client.js?v=20260430_ahu_ahx_exact_button_scope"></script>';

const activeRe = /<script[^>]+aicm-company-persistent-save-client\.js[^>]*><\/script>/;
const disabledRe = /<!--\s*AHQ_AHT_DISABLED_COMPANY_PERSISTENT_SAVE_CLIENT_NAV_INTERCEPT:\s*(<script[^>]+aicm-company-persistent-save-client\.js[^>]*><\/script>)\s*-->/g;

if (activeRe.test(html)) {
  console.log("company save client already active");
} else if (disabledRe.test(html)) {
  html = html.replace(disabledRe, scriptLine);
  console.log("company save client re-enabled from AHQ disabled comment");
} else {
  const anchorRe = /(<script[^>]+aicm-robot-placement-persistent-save-client\.js[^>]*><\/script>)/;
  if (anchorRe.test(html)) {
    html = html.replace(anchorRe, "$1\n" + scriptLine);
    console.log("company save client inserted after robot placement save client");
  } else {
    html = html.replace("</head>", "  " + scriptLine + "\n</head>");
    console.log("company save client inserted before head close");
  }
}

fs.writeFileSync(indexFile, html);
