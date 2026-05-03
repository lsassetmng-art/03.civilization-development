#!/data/data/com.termux/files/usr/bin/bash
set -eu
test -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260427_142846_phase_ox_pa_first_real_use_actual_node_server/030_first_real_use_actual_node_response_meta.log"
test -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260427_142846_phase_ox_pa_first_real_use_actual_node_server/020_first_real_use_actual_node_response_body.json"
grep -q "HTTP_CODE=" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260427_142846_phase_ox_pa_first_real_use_actual_node_server/030_first_real_use_actual_node_response_meta.log"
echo "RESULT: PASS"
echo "OX_PA_RESPONSE_ARTIFACTS_PRESENT"
echo "DB WRITE: NOT EXECUTED BY CHECK SCRIPT"
