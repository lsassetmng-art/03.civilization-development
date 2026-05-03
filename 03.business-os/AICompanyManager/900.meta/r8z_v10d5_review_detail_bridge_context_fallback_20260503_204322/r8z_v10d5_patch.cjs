const fs = require("fs");

const corePath = process.argv[2];
const patchLog = process.argv[3];

const marker = "AICM_R8Z_V10D5_REVIEW_DETAIL_BRIDGE_CONTEXT_FALLBACK";
const log = [];

let src = fs.readFileSync(corePath, "utf8");

if (src.includes(marker)) {
  log.push("SKIP: marker already exists");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(0);
}

const startMarker = "// AICM_R8Z_V10D4_REVIEW_DETAIL_COMPAT_CLICK_BRIDGE_START";
const endMarker = "// AICM_R8Z_V10D4_REVIEW_DETAIL_COMPAT_CLICK_BRIDGE_END";

const start = src.indexOf(startMarker);
const end = src.indexOf(endMarker);

if (start < 0 || end < 0 || end <= start) {
  log.push("ERROR: V10D4 marker block not found");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(2);
}

let before = src.slice(0, start);
let block = src.slice(start, end);
let after = src.slice(end);

const fnStartNeedle = "    function rowsFromState() {";
const fnEndNeedle = "    function reviewId(row) {";

const fnStart = block.indexOf(fnStartNeedle);
const fnEnd = block.indexOf(fnEndNeedle);

if (fnStart < 0 || fnEnd < 0 || fnEnd <= fnStart) {
  log.push("ERROR: rowsFromState block not found inside V10D4");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(3);
}

const replacement = `    // ${marker}_START
    function rowsFromPayloadV10D5(payload) {
      payload = payload && typeof payload === "object" ? payload : {};

      var candidates = [
        payload.review_wait_items,
        payload.human_review_wait_items,
        payload.humanReviewWaitItems,
        payload.context && payload.context.review_wait_items,
        payload.data && payload.data.review_wait_items
      ];

      for (var i = 0; i < candidates.length; i += 1) {
        if (Array.isArray(candidates[i])) {
          return candidates[i].filter(function(row) {
            return row && typeof row === "object";
          });
        }
      }

      return [];
    }

    function ownerFromStateV10D5() {
      var s = app();
      var c = s && s.context && typeof s.context === "object" ? s.context : {};
      return text(
        s.owner_civilization_id ||
        s.ownerCivilizationId ||
        c.owner_civilization_id ||
        c.ownerCivilizationId ||
        "00000000-0000-4000-8000-000000000001"
      );
    }

    function companyFromStateV10D5() {
      var s = app();
      var c = s && s.context && typeof s.context === "object" ? s.context : {};
      return text(
        s.selectedCompanyId ||
        s.aicm_user_company_id ||
        s.companyId ||
        c.aicm_user_company_id ||
        c.selectedCompanyId ||
        c.company_id ||
        "8b9be487-7b74-4517-9b59-6c84a82ae6aa"
      );
    }

    function fetchRowsByContextV10D5() {
      if (typeof window !== "undefined" && Array.isArray(window.__aicmR8zV10d5ContextRows) && window.__aicmR8zV10d5ContextRows.length) {
        return window.__aicmR8zV10d5ContextRows;
      }

      if (typeof XMLHttpRequest === "undefined") return [];

      var s = app();
      var owner = ownerFromStateV10D5();
      var company = companyFromStateV10D5();

      var url = "/api/aicm/v2/context?owner_civilization_id=" + encodeURIComponent(owner);
      if (company) url += "&aicm_user_company_id=" + encodeURIComponent(company);
      url += "&v=r8z_v10d5_" + Date.now();

      try {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send(null);

        s.aicmR8zV10d5HttpStatus = xhr.status;
        s.aicmR8zV10d5FetchUrl = url;

        if (xhr.status < 200 || xhr.status >= 300) {
          s.aicmR8zV10d5FetchStatus = "http-error";
          s.aicmR8zV10d5Error = "context http " + String(xhr.status);
          return [];
        }

        var payload = {};
        try {
          payload = JSON.parse(xhr.responseText || "{}");
        } catch (parseError) {
          s.aicmR8zV10d5FetchStatus = "parse-error";
          s.aicmR8zV10d5Error = text(parseError && parseError.message ? parseError.message : parseError);
          return [];
        }

        var rows = rowsFromPayloadV10D5(payload);

        if (rows.length) {
          if (typeof window !== "undefined") window.__aicmR8zV10d5ContextRows = rows;

          try {
            if (!s.context || typeof s.context !== "object") s.context = {};
            s.context.review_wait_items = rows;
            s.review_wait_items = rows;
          } catch (_) {}
        }

        s.aicmR8zV10d5FetchStatus = "merged";
        s.aicmR8zV10d5Rows = rows.length;

        return rows;
      } catch (error) {
        s.aicmR8zV10d5FetchStatus = "error";
        s.aicmR8zV10d5Error = text(error && error.message ? error.message : error);
        return [];
      }
    }

    function rowsFromState() {
      var s = app();
      var ctx = s.context && typeof s.context === "object" ? s.context : {};
      var candidates = [
        ctx.review_wait_items,
        s.review_wait_items,
        ctx.human_review_wait_items,
        s.human_review_wait_items,
        typeof window !== "undefined" ? window.__aicmR8zV10d5ContextRows : null
      ];

      for (var i = 0; i < candidates.length; i += 1) {
        if (Array.isArray(candidates[i]) && candidates[i].length) return candidates[i];
      }

      return fetchRowsByContextV10D5();
    }
    // ${marker}_END

`;

block = block.slice(0, fnStart) + replacement + block.slice(fnEnd);

src = before + block + after;

fs.writeFileSync(corePath, src, "utf8");
log.push("PATCH_APPLIED: V10D5 replaced V10D4 rowsFromState with context fallback");
fs.writeFileSync(patchLog, log.join("\n") + "\n");
