# B6R95R3Z-R29E-R4 Material View Definition / Source Summary

## Status
READONLY_AUDIT_DONE

## Current finding from previous step
- old view drop is NOT ready.
- DB view dependencies remain.
- live server.js references remain.

## This audit collected
- target old/dependent view existence
- target old/dependent view columns
- full pg_get_viewdef output
- dependency graph from target views to referenced relations
- candidate source tables and identifier columns
- server.js material view reference context

## Next decision
Use this dump to decide exact DB design:

1. Material source table gets canonical identifier columns:
   - registry_code
   - public_model_no
   - runtime_model_code
   - legacy_material_model_code

2. New canonical view should expose both:
   - canonical public identifier for FK/reference: public_model_no or registry_code
   - runtime model_code for AIWorkerOS runtime profile: model_code/runtime_model_code

3. Existing old chain should not be kept long-term:
   - create new canonical view
   - switch dependent views and server.js to canonical view
   - verify references to old views are zero
   - then drop old views after Sato review and explicit boss GO

## Important policy
- DB destructive changes are not executed here.
- CASCADE DROP is forbidden.
- AICM untouched.
- server.js hardcoded one-off alias is forbidden.
- Identifier canon should be solved in DB/view design, not runtime workaround.

## Files
- SQL_LOG=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_114754_b6r95r3z_r29e_r4_material_view_definition_source_audit/011_material_view_definition_source_audit.log
- SERVER_REF=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_114754_b6r95r3z_r29e_r4_material_view_definition_source_audit/020_server_material_view_reference_context.txt
