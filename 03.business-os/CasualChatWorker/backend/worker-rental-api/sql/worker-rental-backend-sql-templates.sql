-- WorkerRentalCore backend SQL templates
-- These are templates for backend implementation.
-- Do not execute this whole file directly.

-- service catalog
select *
from business.v_worker_rental_service_catalog_active
where app_code = $1
  and service_code = $2;

-- monthly free ticket rule
select *
from business.v_worker_rental_monthly_free_ticket_rule
where app_code = $1
  and service_code = $2;

-- price catalog
select *
from business.v_worker_rental_price_catalog_active
where app_code = $1
  and service_code = $2
  and rental_unit_kind = $3
  and rental_unit_count = $4
  and is_active = true;

-- entitlement balance
select *
from business.v_worker_rental_entitlement_balance_active
where app_code = $1
  and service_code = $2
  and user_id = $3
  and grant_period = $4;

-- contract history
select *
from business.v_worker_rental_contract_summary
where app_code = $1
  and service_code = $2
  and user_id = $3
order by created_at desc
limit $4
offset $5;
