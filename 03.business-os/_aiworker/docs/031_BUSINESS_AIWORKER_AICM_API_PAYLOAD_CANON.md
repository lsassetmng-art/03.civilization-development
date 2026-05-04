# BusinessOS AIWorker AICompanyManager API Payload Canon

## GET company selector options

### Purpose
Return robot options for a company and role.

### Request
GET /api/v1/business/aiworker/aicm/company-selector-options?company_id={uuid}&role_code={role}

### Response
{
  "ok": true,
  "items": [
    {
      "company_robot_entitlement_id": "uuid",
      "company_id": "uuid",
      "robot_pool_id": "uuid",
      "aiworker_model_code": "HD-R5",
      "display_name": "Manager",
      "selector_label": "Manager / HD-R5",
      "aiworker_series_code": "HD",
      "manufacturer_code": "helios_dynamics",
      "recommended_role_codes": ["President","ExecutiveManager","Manager"],
      "usable_quantity": 1,
      "assignment_mode_code": "unlimited_placement",
      "status_code": "active"
    }
  ]
}

## GET global selector options

### Purpose
Return globally available Business robot pool options by role.

### Request
GET /api/v1/business/aiworker/aicm/global-selector-options?role_code={role}

### Response
{
  "ok": true,
  "items": [
    {
      "robot_pool_id": "uuid",
      "aiworker_model_code": "HD-R5",
      "display_name": "Manager",
      "selector_label": "Manager / HD-R5",
      "recommended_role_codes": ["President","ExecutiveManager","Manager"],
      "visible_available_quantity": 10,
      "status_code": "active"
    }
  ]
}

## POST grant entitlement

### Purpose
Grant company entitlement to use a robot model.

### Request
POST /api/v1/business/aiworker/company-entitlement/grant

{
  "company_id": "uuid",
  "aiworker_model_code": "HD-R5",
  "quantity": 1,
  "business_offer_code": "standard",
  "entitlement_scope_code": "company",
  "assignment_mode_code": "unlimited_placement"
}

### Response
{
  "ok": true,
  "company_robot_entitlement_id": "uuid"
}

## POST place robot

### Purpose
Place robot into company / department / section / role.

### Request
POST /api/v1/business/aiworker/company-robot/place

{
  "company_id": "uuid",
  "aiworker_model_code": "HD-R5",
  "target_level_code": "company",
  "target_id": null,
  "app_code": "AICompanyManager",
  "role_code": "President",
  "internal_nickname": "Zeus",
  "placement_quantity": 1,
  "metadata_jsonb": {
    "source": "AICompanyManager"
  }
}

### Response
{
  "ok": true,
  "company_robot_placement_id": "uuid",
  "display_label": "Zeus@President"
}
