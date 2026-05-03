import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;
if (!coreFile) {
  console.error('CLEAN_CORE env missing');
  process.exit(1);
}

let src = fs.readFileSync(coreFile, 'utf8');
const before = src;

const scopeMarker = 'AICM_ROLEPLACEMENT_SCOPE_FIX_AXG_R1_V1';
const targetMarker = 'AICM_CHANGE_BUTTON_TARGET_VAR_AXF_V1';

function countRegex(re) {
  const m = src.match(re);
  return m ? m.length : 0;
}

function countText(needle) {
  return src.split(needle).length - 1;
}

function replaceIfPresent(from, to) {
  if (src.includes(from)) {
    src = src.replace(from, to);
    return 1;
  }
  return 0;
}

// ------------------------------------------------------------
// 1. Repair only payload call sites if old bad calls remain.
// Do not count function definitions.
// ------------------------------------------------------------
let payloadRepairCount = 0;

payloadRepairCount += replaceIfPresent(
  'rolePlacements: aicmAxcCompanyRolePlacements(company)',
  `// ${scopeMarker}
      rolePlacements: aicmAxcCompanyRolePlacements({
        aicm_user_company_id: body.aicm_user_company_id
      })`
);

payloadRepairCount += replaceIfPresent(
  'rolePlacements: aicmAxcDepartmentRolePlacements(department)',
  `// ${scopeMarker}
      rolePlacements: aicmAxcDepartmentRolePlacements({
        aicm_user_company_department_id: body.aicm_user_company_department_id
      })`
);

payloadRepairCount += replaceIfPresent(
  'rolePlacements: aicmAxcSectionRolePlacements(section)',
  `// ${scopeMarker}
      rolePlacements: aicmAxcSectionRolePlacements({
        aicm_user_company_section_id: body.aicm_user_company_section_id,
        aicm_user_company_department_id: body.aicm_user_company_department_id || (
          typeof aicmOrgSectionById === "function" && body.aicm_user_company_section_id
            ? ((aicmOrgSectionById(body.aicm_user_company_section_id) || {}).aicm_user_company_department_id || "")
            : ""
        )
      })`
);

// ------------------------------------------------------------
// 2. Fix department/section change button target var if needed.
// Root cause: old branch read undefined "target" instead of button.
// ------------------------------------------------------------
let targetFixCount = 0;

const oldDept = 'state.editingDepartmentId = (typeof target !== "undefined" && target && target.getAttribute) ? target.getAttribute("data-department-id") : "";';
const newDept = `// ${targetMarker}
      state.editingDepartmentId = button && button.getAttribute ? String(button.getAttribute("data-department-id") || "") : "";`;

const oldSection = 'state.editingSectionId = (typeof target !== "undefined" && target && target.getAttribute) ? target.getAttribute("data-section-id") : "";';
const newSection = `// ${targetMarker}
      state.editingSectionId = button && button.getAttribute ? String(button.getAttribute("data-section-id") || "") : "";`;

targetFixCount += replaceIfPresent(oldDept, newDept);
targetFixCount += replaceIfPresent(oldSection, newSection);

fs.writeFileSync(coreFile, src, 'utf8');

// Correct checks: payload-only bad calls.
const payloadOldCompanyCount = countRegex(/rolePlacements:\s*aicmAxcCompanyRolePlacements\(company\)/g);
const payloadOldDepartmentCount = countRegex(/rolePlacements:\s*aicmAxcDepartmentRolePlacements\(department\)/g);
const payloadOldSectionCount = countRegex(/rolePlacements:\s*aicmAxcSectionRolePlacements\(section\)/g);

// Function definitions are allowed and should not fail verification.
const functionCompanyCount = countRegex(/function\s+aicmAxcCompanyRolePlacements\(company\)/g);
const functionDepartmentCount = countRegex(/function\s+aicmAxcDepartmentRolePlacements\(department\)/g);
const functionSectionCount = countRegex(/function\s+aicmAxcSectionRolePlacements\(section\)/g);

console.log(`coreChanged=${src !== before}`);
console.log(`payloadRepairCount=${payloadRepairCount}`);
console.log(`targetFixCount=${targetFixCount}`);

console.log(`payloadOldCompanyCount=${payloadOldCompanyCount}`);
console.log(`payloadOldDepartmentCount=${payloadOldDepartmentCount}`);
console.log(`payloadOldSectionCount=${payloadOldSectionCount}`);

console.log(`functionCompanyCount=${functionCompanyCount}`);
console.log(`functionDepartmentCount=${functionDepartmentCount}`);
console.log(`functionSectionCount=${functionSectionCount}`);

console.log(`rolePlacementsCount=${countText('rolePlacements:')}`);
console.log(`scopeMarkerCount=${countText('AICM_ROLEPLACEMENT_SCOPE_FIX_AXG')}`);
console.log(`targetMarkerCount=${countText(targetMarker)}`);
console.log(`deptButtonReadCount=${countText('button.getAttribute("data-department-id")')}`);
console.log(`sectionButtonReadCount=${countText('button.getAttribute("data-section-id")')}`);
