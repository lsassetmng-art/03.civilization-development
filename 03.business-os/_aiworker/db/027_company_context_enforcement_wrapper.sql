BEGIN;

CREATE OR REPLACE FUNCTION business.fn_aicm_aiworker_require_company_context(
  p_company_id uuid,
  p_action_code text DEFAULT 'unknown'
)
RETURNS void
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_current_company_id uuid;
BEGIN
  IF p_company_id IS NULL THEN
    RAISE EXCEPTION 'company_context_target_company_id_required:%', COALESCE(p_action_code, 'unknown')
      USING ERRCODE = '42501';
  END IF;

  v_current_company_id := business.fn_aicm_aiworker_current_company_id();

  IF v_current_company_id IS NULL THEN
    RAISE EXCEPTION 'company_context_missing:%', COALESCE(p_action_code, 'unknown')
      USING ERRCODE = '42501';
  END IF;

  IF v_current_company_id <> p_company_id THEN
    RAISE EXCEPTION 'company_context_mismatch:% current=% expected=%',
      COALESCE(p_action_code, 'unknown'),
      v_current_company_id,
      p_company_id
      USING ERRCODE = '42501';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION business.fn_company_robot_grant_entitlement_ctx(
  p_company_id uuid,
  p_aiworker_model_code text,
  p_quantity integer,
  p_business_offer_code text,
  p_entitlement_scope_code text,
  p_assignment_mode_code text
)
RETURNS uuid
LANGUAGE plpgsql
VOLATILE
AS $$
BEGIN
  PERFORM business.fn_aicm_aiworker_require_company_context(
    p_company_id,
    'grant_entitlement'
  );

  RETURN business.fn_company_robot_grant_entitlement(
    p_company_id,
    p_aiworker_model_code,
    p_quantity,
    p_business_offer_code,
    p_entitlement_scope_code,
    p_assignment_mode_code
  );
END;
$$;

CREATE OR REPLACE FUNCTION business.fn_company_robot_place_ctx(
  p_company_id uuid,
  p_aiworker_model_code text,
  p_target_level_code text,
  p_role_code text,
  p_internal_nickname text,
  p_target_id uuid,
  p_app_code text,
  p_placement_quantity integer,
  p_metadata_jsonb jsonb
)
RETURNS uuid
LANGUAGE plpgsql
VOLATILE
AS $$
BEGIN
  PERFORM business.fn_aicm_aiworker_require_company_context(
    p_company_id,
    'place_robot'
  );

  RETURN business.fn_company_robot_place(
    p_company_id,
    p_aiworker_model_code,
    p_target_level_code,
    p_role_code,
    p_internal_nickname,
    p_target_id,
    p_app_code,
    p_placement_quantity,
    p_metadata_jsonb
  );
END;
$$;

CREATE OR REPLACE FUNCTION business.fn_company_robot_placement_update_ctx(
  p_company_robot_placement_id uuid,
  p_internal_nickname text,
  p_role_code text,
  p_target_level_code text,
  p_target_id uuid,
  p_metadata_patch_jsonb jsonb
)
RETURNS uuid
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
  v_company_id uuid;
BEGIN
  SELECT company_id
    INTO v_company_id
  FROM business.company_robot_placement
  WHERE company_robot_placement_id = p_company_robot_placement_id;

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'company_robot_placement_not_found:%', p_company_robot_placement_id
      USING ERRCODE = 'P0002';
  END IF;

  PERFORM business.fn_aicm_aiworker_require_company_context(
    v_company_id,
    'update_placement'
  );

  RETURN business.fn_company_robot_placement_update(
    p_company_robot_placement_id,
    p_internal_nickname,
    p_role_code,
    p_target_level_code,
    p_target_id,
    p_metadata_patch_jsonb
  );
END;
$$;

CREATE OR REPLACE FUNCTION business.fn_company_robot_placement_deactivate_ctx(
  p_company_robot_placement_id uuid,
  p_reason text,
  p_metadata_patch_jsonb jsonb
)
RETURNS uuid
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
  v_company_id uuid;
BEGIN
  SELECT company_id
    INTO v_company_id
  FROM business.company_robot_placement
  WHERE company_robot_placement_id = p_company_robot_placement_id;

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'company_robot_placement_not_found:%', p_company_robot_placement_id
      USING ERRCODE = 'P0002';
  END IF;

  PERFORM business.fn_aicm_aiworker_require_company_context(
    v_company_id,
    'deactivate_placement'
  );

  RETURN business.fn_company_robot_placement_deactivate(
    p_company_robot_placement_id,
    p_reason,
    p_metadata_patch_jsonb
  );
END;
$$;

COMMENT ON FUNCTION business.fn_aicm_aiworker_require_company_context(uuid, text)
IS 'Requires app.current_company_id to match the target company_id before company-scoped robot writes.';

COMMENT ON FUNCTION business.fn_company_robot_grant_entitlement_ctx(uuid, text, integer, text, text, text)
IS 'Context-enforced wrapper for fn_company_robot_grant_entitlement.';

COMMENT ON FUNCTION business.fn_company_robot_place_ctx(uuid, text, text, text, text, uuid, text, integer, jsonb)
IS 'Context-enforced wrapper for fn_company_robot_place.';

COMMENT ON FUNCTION business.fn_company_robot_placement_update_ctx(uuid, text, text, text, uuid, jsonb)
IS 'Context-enforced wrapper for fn_company_robot_placement_update.';

COMMENT ON FUNCTION business.fn_company_robot_placement_deactivate_ctx(uuid, text, jsonb)
IS 'Context-enforced wrapper for fn_company_robot_placement_deactivate.';

COMMIT;
