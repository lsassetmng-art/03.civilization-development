\set ON_ERROR_STOP on

BEGIN;

DO $$
DECLARE
  v_first boolean;
  v_second boolean;
  v_other boolean;
  v_hash text := repeat('a', 64);
BEGIN
  SELECT civilization.consume_persona_auth_handoff(
    v_hash,
    clock_timestamp() + interval '120 seconds'
  )
  INTO v_first;

  SELECT civilization.consume_persona_auth_handoff(
    v_hash,
    clock_timestamp() + interval '120 seconds'
  )
  INTO v_second;

  SELECT civilization.consume_persona_auth_handoff(
    repeat('b', 64),
    clock_timestamp() + interval '120 seconds'
  )
  INTO v_other;

  IF v_first IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'FIRST_CONSUMPTION_FAILED';
  END IF;

  IF v_second IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'REPLAY_NOT_REJECTED';
  END IF;

  IF v_other IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'DISTINCT_CODE_REJECTED';
  END IF;

  RAISE NOTICE 'R20_FIRST_REPLAY_TEST=PASS';
END;
$$;

ROLLBACK;
