-- TEST-ONLY; run only against an explicitly approved STAGING database
-- AFTER the reviewed migration. Never run during the Termux B1 branch script.
-- This transaction rolls back synthetic test records even when all assertions pass.
BEGIN;
DO $verify$
DECLARE
    v_code_hash bytea := decode(repeat('a1',32),'hex');
    v_state_hash bytea := decode(repeat('b2',32),'hex');
    v_challenge text := repeat('C',43);
    v_issue boolean;
    v_wrong boolean;
    v_first boolean;
    v_second boolean;
BEGIN
    SELECT civilization.persona_handoff_issue_v1(
        v_code_hash,'persona-b1-synthetic-test',v_state_hash,
        v_challenge,'https://persona-test.invalid',
        '/persona-menu/api/auth/callback'
    ) INTO v_issue;
    IF v_issue IS DISTINCT FROM true THEN
        RAISE EXCEPTION 'B1 issue did not register synthetic token';
    END IF;

    SELECT civilization.persona_handoff_consume_v1(
        v_code_hash,'persona-b1-synthetic-test',v_state_hash,
        v_challenge,'https://wrong-origin.invalid',
        '/persona-menu/api/auth/callback'
    ) INTO v_wrong;
    IF v_wrong IS DISTINCT FROM false THEN
        RAISE EXCEPTION 'B1 wrong callback origin was accepted';
    END IF;

    SELECT civilization.persona_handoff_consume_v1(
        v_code_hash,'persona-b1-synthetic-test',v_state_hash,
        v_challenge,'https://persona-test.invalid',
        '/persona-menu/api/auth/callback'
    ) INTO v_first;
    IF v_first IS DISTINCT FROM true THEN
        RAISE EXCEPTION 'B1 first consume failed';
    END IF;

    SELECT civilization.persona_handoff_consume_v1(
        v_code_hash,'persona-b1-synthetic-test',v_state_hash,
        v_challenge,'https://persona-test.invalid',
        '/persona-menu/api/auth/callback'
    ) INTO v_second;
    IF v_second IS DISTINCT FROM false THEN
        RAISE EXCEPTION 'B1 replay was accepted';
    END IF;

    RAISE NOTICE 'B1_LEDGER_SYNTHETIC_TEST=PASS (rollback follows)';
END;
$verify$;
ROLLBACK;
