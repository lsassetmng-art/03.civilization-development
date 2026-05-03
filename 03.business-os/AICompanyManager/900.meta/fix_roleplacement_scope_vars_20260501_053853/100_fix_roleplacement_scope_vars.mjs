import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;
if (!coreFile) {
  console.error('CLEAN_CORE env missing');
  process.exit(1);
}

let src = fs.readFileSync(coreFile, 'utf8');
const before = src;

const marker = 'AICM_ROLEPLACEMENT_SCOPE_FIX_AXG_V1';

function countText(text, needle) {
  return String(text || '').split(needle).length - 1;
}

function replaceRequired(from, to, label) {
  if (!src.includes(from)) {
    console.error(`Missing expected text for ${label}: ${from}`);
    process.exit(1);
  }
  src = src.replace(from, to);
}

if (!src.includes(marker)) {
  // These replacements remove dependency on local variables that may not exist
  // inside saveCompanyUpdateFromForm / saveDepartmentUpdateFromForm / saveSectionUpdateFromForm.
  replaceRequired(
    'rolePlacements: aicmAxcCompanyRolePlacements(company)',
    `// ${marker}
      rolePlacements: aicmAxcCompanyRolePlacements({
        aicm_user_company_id: body.aicm_user_company_id
      })`,
    'company rolePlacements scope'
  );

  replaceRequired(
    'rolePlacements: aicmAxcDepartmentRolePlacements(department)',
    `// ${marker}
      rolePlacements: aicmAxcDepartmentRolePlacements({
        aicm_user_company_department_id: body.aicm_user_company_department_id
      })`,
    'department rolePlacements scope'
  );

  replaceRequired(
    'rolePlacements: aicmAxcSectionRolePlacements(section)',
    `// ${marker}
      rolePlacements: aicmAxcSectionRolePlacements({
        aicm_user_company_section_id: body.aicm_user_company_section_id,
        aicm_user_company_department_id: body.aicm_user_company_department_id || (
          typeof aicmOrgSectionById === "function" && body.aicm_user_company_section_id
            ? ((aicmOrgSectionById(body.aicm_user_company_section_id) || {}).aicm_user_company_department_id || "")
            : ""
        )
      })`,
    'section rolePlacements scope'
  );
}

fs.writeFileSync(coreFile, src, 'utf8');

console.log(`coreChanged=${src !== before}`);
console.log(`markerCount=${countText(src, marker)}`);
console.log(`companyOldScopeCount=${countText(src, 'aicmAxcCompanyRolePlacements(company)')}`);
console.log(`departmentOldScopeCount=${countText(src, 'aicmAxcDepartmentRolePlacements(department)')}`);
console.log(`sectionOldScopeCount=${countText(src, 'aicmAxcSectionRolePlacements(section)')}`);
console.log(`rolePlacementsCount=${countText(src, 'rolePlacements:')}`);
