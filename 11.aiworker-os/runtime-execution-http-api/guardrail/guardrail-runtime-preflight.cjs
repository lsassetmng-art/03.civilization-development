// ============================================================
// AIWorkerOS Guardrail Knowledge DB runtime preflight helper
// GKD-4E-R3C CommonJS-safe helper.
// Responsibility: AIWorkerOS runtime-only guardrail evaluation.
// ============================================================

'use strict';

let PgPool = null;
let guardrailPool = null;

function loadPgPool() {
  if (PgPool) return PgPool;
  try {
    const pg = require('pg');
    PgPool = pg.Pool;
    return PgPool;
  } catch (error) {
    return null;
  }
}

function getGuardrailDatabaseUrl() {
  return process.env.PERSONA_DATABASE_URL || '';
}

function getGuardrailPool() {
  const connectionString = getGuardrailDatabaseUrl();
  if (!connectionString) return null;
  const Pool = loadPgPool();
  if (!Pool) return null;
  if (!guardrailPool) {
    guardrailPool = new Pool({ connectionString });
  }
  return guardrailPool;
}

function inferGuardrailWorkType(input = {}) {
  const text = JSON.stringify(input || {}).toLowerCase();

  if (input.git_push_flag || input.GIT_PUSH === 'YES' || text.includes('git push')) return 'git_push';
  if (input.ddl_apply_flag || input.seed_apply_flag || input.db_write_flag || input.DB_WRITE === 'YES' || input.DDL_APPLY === 'YES' || input.SEED_APPLY === 'YES') return 'db_apply';
  if (input.api_post_flag || input.API_POST === 'YES') return 'api_patch';
  if (input.ui_flag || input.UI_PATCH === 'YES' || text.includes('ui_patch') || text.includes('screen')) return 'ui_patch';
  if (text.includes('server_patch')) return 'server_patch';
  if (text.includes('artifact') || text.includes('deliverable') || text.includes('zip')) return 'artifact_generation';
  if (text.includes('code_patch') || text.includes('patch')) return 'code_patch';
  if (text.includes('handoff')) return 'handoff';

  return 'report_only';
}

function buildGuardrailPreflightInput(runtimeRequest = {}) {
  const body = runtimeRequest && typeof runtimeRequest.body === 'object' ? runtimeRequest.body : runtimeRequest;
  const targetWorkTypeCode = body.target_work_type_code || body.work_type_code || inferGuardrailWorkType(body);

  return {
    request_id: String(body.request_id || body.id || body.runtime_request_id || body.job_id || ''),
    target_os_code: String(body.target_os_code || body.os_code || '11.aiworker-os'),
    target_app_code: body.target_app_code || body.source_app_code || body.app_code || null,
    target_work_type_code: String(targetWorkTypeCode || 'report_only'),
    target_file_pattern: body.target_file_pattern || null,
    db_write_flag: Boolean(body.db_write_flag || body.DB_WRITE === 'YES'),
    ddl_apply_flag: Boolean(body.ddl_apply_flag || body.DDL_APPLY === 'YES'),
    seed_apply_flag: Boolean(body.seed_apply_flag || body.SEED_APPLY === 'YES'),
    api_post_flag: Boolean(body.api_post_flag || body.API_POST === 'YES'),
    ui_flag: Boolean(body.ui_flag || body.UI_PATCH === 'YES'),
    git_flag: Boolean(body.git_flag || body.GIT_PUSH === 'YES' || targetWorkTypeCode === 'git_push'),
    boss_go_flag: Boolean(body.boss_go_flag || body.BOSS_GO === 'YES'),
    ai_review_status_code: String(body.ai_review_status_code || body.AI_REVIEW || ''),
    request_summary_text: String(body.request_summary_text || body.summary || body.title || '')
  };
}

async function queryRows(sql, params = []) {
  const pool = getGuardrailPool();
  if (!pool) return [];
  const result = await pool.query(sql, params);
  return result.rows || [];
}

function hasAcceptedAiReview(input) {
  return /PASS|ACCEPT|accepted|ACCEPT_FOR/i.test(String(input.ai_review_status_code || ''));
}

async function runGuardrailPreflight(runtimeRequest = {}) {
  const input = buildGuardrailPreflightInput(runtimeRequest);
  const matchedRuleCodes = [];
  const matchedPatternCodes = [];
  const notes = [];

  const scopedRules = await queryRows(
    `select rule_code, severity_code, required_action_text, prohibited_action_text,
            applies_to_db_write_flag, applies_to_api_post_flag, applies_to_ui_flag, applies_to_git_flag
       from aiworker.vw_guardrail_preflight_for_scope
      where target_os_code in ($1, 'common')
        and (target_app_code is null or target_app_code = $2)
        and (target_work_type_code is null or target_work_type_code = $3)
      order by priority_int asc, severity_code desc, rule_code asc`,
    [input.target_os_code, input.target_app_code, input.target_work_type_code]
  );

  const blockingConditions = await queryRows(
    `select condition_code, severity_code, required_action_text
       from aiworker.vw_guardrail_blocking_condition
      order by severity_code desc, condition_code asc`
  );

  for (const row of scopedRules) matchedRuleCodes.push(row.rule_code);
  for (const row of blockingConditions) matchedPatternCodes.push(row.condition_code);

  let status = 'pass';
  let blocking = false;
  let reviewRequired = false;
  let confirmationRequired = false;
  let uiTestRequired = false;

  if ((input.db_write_flag || input.ddl_apply_flag || input.seed_apply_flag || input.api_post_flag || input.git_flag) && !input.boss_go_flag) {
    status = 'blocked';
    blocking = true;
    notes.push('Explicit Boss GO is required before DB/API/git execution.');
  }

  if ((input.db_write_flag || input.ddl_apply_flag || input.seed_apply_flag) && !hasAcceptedAiReview(input)) {
    status = 'blocked';
    blocking = true;
    notes.push('AI review must be accepted before DB write, DDL apply, or seed apply.');
  }

  if (input.ui_flag) {
    uiTestRequired = true;
    if (status === 'pass') status = 'warn';
    notes.push('UI-centered verification is required for UI changes.');
  }

  if (!input.target_work_type_code) {
    status = 'insufficient_context';
    reviewRequired = true;
    notes.push('target_work_type_code is missing.');
  }

  if (blocking) status = 'blocked';
  else if (confirmationRequired) status = 'confirmation_required';
  else if (reviewRequired) status = 'review_required';

  return {
    ok: !blocking,
    check_status_code: status,
    blocking_flag: blocking,
    review_required_flag: reviewRequired,
    confirmation_required_flag: confirmationRequired,
    ui_test_required_flag: uiTestRequired,
    matched_rule_codes: Array.from(new Set(matchedRuleCodes)),
    matched_pattern_codes: Array.from(new Set(matchedPatternCodes)),
    check_summary_text: notes.length ? notes.join(' ') : 'Guardrail preflight passed.',
    required_next_action_text: blocking ? notes.join(' ') : ''
  };
}

async function persistGuardrailRuntimeCheckResult(runtimeRequest = {}, decision = {}) {
  const pool = getGuardrailPool();
  if (!pool) return null;

  const input = buildGuardrailPreflightInput(runtimeRequest);
  const result = await pool.query(
    `insert into aiworker.guardrail_runtime_check_result
       (request_id, target_os_code, target_app_code, target_work_type_code,
        check_status_code, blocking_flag, review_required_flag, confirmation_required_flag,
        ui_test_required_flag, matched_rule_codes, matched_pattern_codes,
        check_summary_text, required_next_action_text)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     returning runtime_check_result_id`,
    [
      input.request_id || null,
      input.target_os_code,
      input.target_app_code,
      input.target_work_type_code,
      decision.check_status_code || 'pass',
      Boolean(decision.blocking_flag),
      Boolean(decision.review_required_flag),
      Boolean(decision.confirmation_required_flag),
      Boolean(decision.ui_test_required_flag),
      decision.matched_rule_codes || [],
      decision.matched_pattern_codes || [],
      decision.check_summary_text || '',
      decision.required_next_action_text || ''
    ]
  );

  return result.rows && result.rows[0] ? result.rows[0].runtime_check_result_id : null;
}

async function runAndPersistGuardrailPreflight(runtimeRequest = {}) {
  const decision = await runGuardrailPreflight(runtimeRequest);
  try {
    decision.runtime_check_result_id = await persistGuardrailRuntimeCheckResult(runtimeRequest, decision);
  } catch (error) {
    decision.persistence_error_message = error && error.message ? error.message : String(error);
  }
  return decision;
}

module.exports = {
  inferGuardrailWorkType,
  buildGuardrailPreflightInput,
  runGuardrailPreflight,
  persistGuardrailRuntimeCheckResult,
  runAndPersistGuardrailPreflight
};
