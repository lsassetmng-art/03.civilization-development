const fs = require("fs");
const path = require("path");

const base = "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager";
const outDir = process.argv[2];

const ignoreParts = [
  "/node_modules/",
  "/.next/",
  "/dist/",
  "/build/",
  "/.git/",
  "/docs/verification/"
];

const targetExts = new Set([".js", ".jsx", ".ts", ".tsx", ".html"]);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const normalized = p.replace(/\\/g, "/");
    if (ignoreParts.some(x => normalized.includes(x))) continue;
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (targetExts.has(path.extname(p))) out.push(p);
  }
  return out;
}

function scanFunctionEnd(src, startIdx) {
  const openIdx = src.indexOf("{", startIdx);
  if (openIdx < 0) return -1;

  let depth = 0;
  let quote = null;
  let escape = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = openIdx; i < src.length; i++) {
    const c = src[i];
    const n = src[i + 1];

    if (lineComment) {
      if (c === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (c === "*" && n === "/") {
        blockComment = false;
        i++;
      }
      continue;
    }

    if (quote) {
      if (escape) {
        escape = false;
        continue;
      }
      if (c === "\\") {
        escape = true;
        continue;
      }
      if (c === quote) quote = null;
      continue;
    }

    if (c === "/" && n === "/") {
      lineComment = true;
      i++;
      continue;
    }

    if (c === "/" && n === "*") {
      blockComment = true;
      i++;
      continue;
    }

    if (c === "'" || c === '"' || c === "`") {
      quote = c;
      continue;
    }

    if (c === "{") depth++;
    if (c === "}") {
      depth--;
      if (depth === 0) return i + 1;
    }
  }

  return -1;
}

function replaceNamedFunction(src, fnName, replacement) {
  const idx = src.indexOf("function " + fnName);
  if (idx < 0) return { src, changed: false };
  const end = scanFunctionEnd(src, idx);
  if (end < 0) return { src, changed: false };
  return {
    src: src.slice(0, idx) + replacement.trim() + src.slice(end),
    changed: true
  };
}

const helper = `
/* AICM_MANAGER_PAYLOAD_ROBOT_ROLE_GUARD_V12 */
function aicmV12NormalizeRoleCode(input) {
  var s = String(input || "").trim().toLowerCase();
  s = s.replace(/[＿_\\s\\-]+/g, "_");
  s = s.replace(/配置/g, "");
  s = s.replace(/役割/g, "");
  s = s.replace(/ロール/g, "");
  if (s === "president" || s === "hd_r5p" || s === "社長" || s === "プレジデント") return "president";
  if (s === "manager" || s === "hd_r5" || s === "マネージャー" || s === "manager_role") return "manager";
  if (s === "leader" || s === "hd_r4" || s === "リーダー" || s === "leader_role") return "leader";
  if (s === "worker" || s === "hd_r3" || s === "ワーカー" || s === "worker_role") return "worker";
  if (s.indexOf("president") >= 0 || s.indexOf("プレジデント") >= 0) return "president";
  if (s.indexOf("manager") >= 0 || s.indexOf("マネージャー") >= 0) return "manager";
  if (s.indexOf("leader") >= 0 || s.indexOf("リーダー") >= 0) return "leader";
  if (s.indexOf("worker") >= 0 || s.indexOf("ワーカー") >= 0) return "worker";
  return s;
}

function aicmV12NormalizeText(input) {
  return String(input || "")
    .replace(/[－ー–—]/g, "-")
    .replace(/[：]/g, ":")
    .replace(/[／]/g, "/")
    .replace(/[　]/g, " ")
    .toLowerCase();
}

function aicmV12ContainsAny(source, list) {
  for (var i = 0; i < list.length; i++) {
    if (source.indexOf(list[i]) >= 0) return true;
  }
  return false;
}

function aicmV12HasExplicitRoleCode(source, roleCode) {
  var role = aicmV12NormalizeRoleCode(roleCode);
  var s = aicmV12NormalizeText(source).replace(/["'{}\\[\\],]/g, " ");
  var needles = [
    "role_code:" + role,
    "rolecode:" + role,
    "placement_role_code:" + role,
    "assignment_role_code:" + role,
    "target_role_code:" + role,
    "selected_role_code:" + role,
    "compatible_role_code:" + role,
    "role_code " + role,
    "rolecode " + role,
    "placement_role_code " + role,
    "assignment_role_code " + role,
    "target_role_code " + role,
    "selected_role_code " + role,
    "compatible_role_code " + role
  ];
  return aicmV12ContainsAny(s, needles);
}

function aicmV12HasRoleLabel(source, roleCode) {
  var role = aicmV12NormalizeRoleCode(roleCode);
  var s = aicmV12NormalizeText(source);
  if (role === "president") {
    return aicmV12ContainsAny(s, ["president", "プレジデント", "社長", "hd-r5p", "hdr5p"]);
  }
  if (role === "manager") {
    return aicmV12ContainsAny(s, ["manager", "マネージャー", "hd-r5", "hdr5"]);
  }
  if (role === "leader") {
    return aicmV12ContainsAny(s, ["leader", "リーダー", "hd-r4", "hdr4"]);
  }
  if (role === "worker") {
    return aicmV12ContainsAny(s, ["worker", "ワーカー", "hd-r3", "hdr3"]);
  }
  return false;
}

function aicmV12HasContradictingRobotLabel(source, expectedRole) {
  var role = aicmV12NormalizeRoleCode(expectedRole);
  var s = aicmV12NormalizeText(source);

  var isPayloadLike =
    s.indexOf("payload") >= 0 ||
    s.indexOf("配置payload") >= 0 ||
    s.indexOf("robot") >= 0 ||
    s.indexOf("selectedrobot") >= 0 ||
    s.indexOf("selected robot") >= 0;

  if (!isPayloadLike) return false;

  if (role === "manager") {
    return aicmV12ContainsAny(s, [
      "robot leader",
      "robot: leader",
      "robot leader / hd-r4",
      "robot: leader / hd-r4",
      "leader / hd-r4",
      "leader/hd-r4",
      "リーダー / hd-r4",
      "リーダー/hd-r4"
    ]);
  }

  if (role === "leader") {
    return aicmV12ContainsAny(s, [
      "robot manager",
      "robot: manager",
      "robot manager / hd-r5",
      "robot: manager / hd-r5",
      "manager / hd-r5",
      "manager/hd-r5",
      "マネージャー / hd-r5",
      "マネージャー/hd-r5"
    ]);
  }

  if (role === "worker") {
    return aicmV12ContainsAny(s, [
      "robot manager / hd-r5",
      "robot leader / hd-r4",
      "manager / hd-r5",
      "leader / hd-r4"
    ]);
  }

  return false;
}

function aicmV12TextSupportsExactRoleForTarget(text, targetRole) {
  var expected = aicmV12NormalizeRoleCode(targetRole);
  var source = aicmV12NormalizeText(text);

  if (!expected) return false;

  if (aicmV12HasContradictingRobotLabel(source, expected)) {
    return false;
  }

  if (aicmV12HasExplicitRoleCode(source, expected)) {
    return true;
  }

  return aicmV12HasRoleLabel(source, expected);
}

function aicmV12ResolveTargetRole(target) {
  if (target == null) return "";
  if (typeof target === "string") return aicmV12NormalizeRoleCode(target);
  return aicmV12NormalizeRoleCode(
    target.role_code ||
    target.roleCode ||
    target.placement_role_code ||
    target.placementRoleCode ||
    target.assignment_role_code ||
    target.assignmentRoleCode ||
    target.target_role_code ||
    target.targetRoleCode ||
    target.role ||
    target.roleName ||
    target.role_name ||
    ""
  );
}

function aicmV12IsRobotCompatibleWithTargetRole(robot, targetRole) {
  var expected = aicmV12NormalizeRoleCode(targetRole);
  if (!expected) return false;
  if (!robot) return false;

  var roleFields = [
    robot.role_code,
    robot.roleCode,
    robot.placement_role_code,
    robot.placementRoleCode,
    robot.assignment_role_code,
    robot.assignmentRoleCode,
    robot.compatible_role_code,
    robot.compatibleRoleCode,
    robot.target_role_code,
    robot.targetRoleCode,
    robot.role,
    robot.roleName,
    robot.role_name
  ];

  for (var i = 0; i < roleFields.length; i++) {
    if (aicmV12NormalizeRoleCode(roleFields[i]) === expected) return true;
  }

  var text = [
    robot.display_label,
    robot.displayLabel,
    robot.label,
    robot.name,
    robot.model_name,
    robot.modelName,
    robot.model_no,
    robot.modelNo,
    robot.model_code,
    robot.modelCode,
    robot.series_name,
    robot.seriesName
  ].filter(Boolean).join(" / ");

  return aicmV12TextSupportsExactRoleForTarget(text, expected);
}
`;

const roleTokenMatchImpl = `
function roleTokenMatch(text, word) {
  return aicmV12TextSupportsExactRoleForTarget(text, word);
}
`;

const businessOsTextSupportsTargetRoleImpl = `
function businessOsTextSupportsTargetRole(text, target) {
  var expected = aicmV12ResolveTargetRole(target);
  return aicmV12TextSupportsExactRoleForTarget(text, expected);
}
`;

const files = walk(base);

const candidates = files
  .map(file => ({ file, text: fs.readFileSync(file, "utf8") }))
  .filter(x =>
    x.text.indexOf("AICM_STRICT_ROLE_COMPATIBLE_ROBOT_RESOLVER_V11") >= 0 ||
    x.text.indexOf("businessOsTextSupportsTargetRole") >= 0 ||
    x.text.indexOf("roleTokenMatch") >= 0 ||
    x.text.indexOf("Manager配置payload") >= 0
  );

const patched = [];
const skipped = [];

for (const c of candidates) {
  let src = c.text;
  let changed = false;

  if (src.indexOf("function roleTokenMatch") >= 0 || src.indexOf("function businessOsTextSupportsTargetRole") >= 0) {
    if (src.indexOf("AICM_MANAGER_PAYLOAD_ROBOT_ROLE_GUARD_V12") < 0) {
      const markerBlock = src.match(/^((?:\/\* AICM[^\n]*\*\/\n)+)/);
      if (markerBlock) {
        src = src.replace(markerBlock[1], markerBlock[1] + "\n" + helper.trim() + "\n\n");
      } else {
        src = helper.trim() + "\n\n" + src;
      }
      changed = true;
    }

    let r1 = replaceNamedFunction(src, "roleTokenMatch", roleTokenMatchImpl);
    src = r1.src;
    changed = changed || r1.changed;

    let r2 = replaceNamedFunction(src, "businessOsTextSupportsTargetRole", businessOsTextSupportsTargetRoleImpl);
    src = r2.src;
    changed = changed || r2.changed;
  }

  if (changed && src !== c.text) {
    const rel = path.relative(base, c.file);
    const backup = path.join(outDir, "backup", rel + ".bak");
    fs.mkdirSync(path.dirname(backup), { recursive: true });
    fs.writeFileSync(backup, c.text, "utf8");
    fs.writeFileSync(c.file, src, "utf8");
    patched.push({ file: c.file, rel, backup });
  } else {
    skipped.push(c.file);
  }
}

const report = [
  "# Manager payload robot role guard V12 patch result",
  "",
  `base: ${base}`,
  `patched_count: ${patched.length}`,
  `candidate_count: ${candidates.length}`,
  "",
  "## Patched files",
  ...patched.map(x => `- ${x.rel}`),
  "",
  "## Backups",
  ...patched.map(x => `- ${path.relative(base, x.backup)}`),
  "",
  "## Skipped candidate files",
  ...skipped.map(x => `- ${path.relative(base, x)}`),
  "",
  "## Expected behavior",
  "- Manager配置payload + robot Leader / HD-R4 must no longer validate as OK.",
  "- Manager配置payload must accept Manager-compatible robots only.",
  "- HD-R4 may still appear in model/robot label when the selected robot is actually a Leader, but it must not be accepted for Manager placement.",
  ""
].join("\n");

fs.writeFileSync(path.join(outDir, "011_patch_result.md"), report, "utf8");
console.log(report);
