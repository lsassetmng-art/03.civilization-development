(function (global) {
  "use strict";

  var STORAGE_KEY = "AICM_PHASE_AN_SPLIT_ADD_EDIT_STATE";
  var REVIEW_ACTIONS = {
    "approve-review": true,
    "reject-review": true,
    "request-review-revision": true
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function getState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { aiworkers: [], companies: [] };
    } catch (error) {
      return { aiworkers: [], companies: [] };
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state || { aiworkers: [], companies: [] }));
  }

  function setCurrentCompany(companyId) {
    if (companyId) {
      sessionStorage.setItem("AICM_CURRENT_COMPANY_ID", companyId);
      sessionStorage.setItem("AICM_PENDING_COMPANY_ID", companyId);
    }
  }

  function setPendingDepartment(departmentId) {
    if (departmentId) {
      sessionStorage.setItem("AICM_PENDING_DEPARTMENT_ID", departmentId);
    }
  }

  function setPendingReview(reviewItemId) {
    if (reviewItemId) {
      sessionStorage.setItem("AICM_PENDING_REVIEW_ITEM_ID", reviewItemId);
    }
  }

  function getCurrentCompanyId() {
    var select = byId("company-select");
    var state;

    if (select && select.value) return select.value;

    if (sessionStorage.getItem("AICM_CURRENT_COMPANY_ID")) {
      return sessionStorage.getItem("AICM_CURRENT_COMPANY_ID");
    }

    if (sessionStorage.getItem("AICM_PENDING_COMPANY_ID")) {
      return sessionStorage.getItem("AICM_PENDING_COMPANY_ID");
    }

    state = getState();
    if (state.companies && state.companies[0]) {
      return state.companies[0].id || state.companies[0].company_id || "";
    }

    return "";
  }

  function getCurrentCompany() {
    var state = getState();
    var companyId = getCurrentCompanyId();

    return (state.companies || []).find(function (company) {
      return company.id === companyId || company.company_id === companyId;
    }) || null;
  }

  function getCurrentDepartmentId() {
    var departmentSelect = byId("department-select");
    var company;

    if (departmentSelect && departmentSelect.value) return departmentSelect.value;

    if (sessionStorage.getItem("AICM_PENDING_DEPARTMENT_ID")) {
      return sessionStorage.getItem("AICM_PENDING_DEPARTMENT_ID");
    }

    company = getCurrentCompany();

    if (company && company.departments && company.departments[0]) {
      return company.departments[0].id || company.departments[0].department_id || "";
    }

    return "";
  }

  function firstReviewItem() {
    var state = getState();
    var found = null;

    (state.companies || []).forEach(function (company) {
      (company.departments || []).forEach(function (department) {
        if (!found && department.review_items && department.review_items[0]) {
          found = department.review_items[0];
        }
      });
    });

    return found;
  }

  function getReviewItemId(button) {
    var item;

    if (button && button.getAttribute) {
      if (button.getAttribute("data-review-id")) return button.getAttribute("data-review-id");
      if (button.getAttribute("data-review_item_id")) return button.getAttribute("data-review_item_id");
      if (button.getAttribute("data-id")) return button.getAttribute("data-id");
    }

    if (sessionStorage.getItem("AICM_PENDING_REVIEW_ITEM_ID")) {
      return sessionStorage.getItem("AICM_PENDING_REVIEW_ITEM_ID");
    }

    item = firstReviewItem();
    if (item) return item.id || item.review_item_id || "";

    return "";
  }

  function ensureDemoReviewIfMissing() {
    var state = getState();
    var company;
    var department;
    var reviewId;

    if (!state.companies || state.companies.length === 0) return "";

    company = state.companies[0];
    company.departments = company.departments || [];

    if (company.departments.length === 0) return "";

    department = company.departments[0];
    department.review_items = department.review_items || [];

    if (department.review_items.length > 0) {
      return department.review_items[0].id || department.review_items[0].review_item_id || "";
    }

    reviewId = "review-" + Date.now().toString(36);

    department.review_items.push({
      id: reviewId,
      review_item_id: reviewId,
      title: "納品候補レビュー",
      review_title: "納品候補レビュー",
      status: "承認待ち",
      review_status: "承認待ち",
      target_name: "LocalRepository pilot",
      note: "local review wiring demo item"
    });

    saveState(state);
    return reviewId;
  }

  function createRepository() {
    if (!global.AICM || !global.AICM.AicmLocalRepository) {
      return null;
    }

    return new global.AICM.AicmLocalRepository({
      storageKey: STORAGE_KEY
    });
  }

  function updateReviewStatusDirect(reviewItemId, status) {
    var state = getState();
    var found = null;

    (state.companies || []).forEach(function (company) {
      (company.departments || []).forEach(function (department) {
        (department.review_items || []).forEach(function (review) {
          if (review.id === reviewItemId || review.review_item_id === reviewItemId) {
            review.status = status;
            review.review_status = status;
            found = review;
          }
        });
      });
    });

    if (found) {
      saveState(state);
      return {
        ok: true,
        data: {
          review_item: found,
          state: state
        },
        warnings: [],
        request_id: "review_direct_" + Date.now().toString(36)
      };
    }

    return {
      ok: false,
      error_code: "REVIEW_ITEM_NOT_FOUND",
      error_message: "Review item not found.",
      details: {
        review_item_id: reviewItemId
      },
      request_id: "review_not_found_" + Date.now().toString(36)
    };
  }

  function isReviewAction(action) {
    return !!REVIEW_ACTIONS[action];
  }

  function handleReviewAction(action, button) {
    var repository = createRepository();
    var reviewItemId = getReviewItemId(button);
    var payload;

    if (!reviewItemId) {
      reviewItemId = ensureDemoReviewIfMissing();
    }

    if (!reviewItemId) {
      return Promise.resolve({
        ok: false,
        error_code: "REVIEW_ITEM_ID_REQUIRED",
        error_message: "Review item id is required.",
        details: {},
        request_id: "review_id_required"
      });
    }

    setCurrentCompany(getCurrentCompanyId());
    setPendingDepartment(getCurrentDepartmentId());
    setPendingReview(reviewItemId);

    payload = {
      review_item_id: reviewItemId,
      comment: ""
    };

    if (repository) {
      if (action === "approve-review" && repository.approveReview) {
        return repository.approveReview(payload);
      }

      if (action === "reject-review" && repository.rejectReview) {
        return repository.rejectReview(payload);
      }

      if (action === "request-review-revision" && repository.requestReviewRevision) {
        return repository.requestReviewRevision(payload);
      }
    }

    if (action === "approve-review") {
      return Promise.resolve(updateReviewStatusDirect(reviewItemId, "承認済み"));
    }

    if (action === "reject-review") {
      return Promise.resolve(updateReviewStatusDirect(reviewItemId, "差し戻し"));
    }

    if (action === "request-review-revision") {
      return Promise.resolve(updateReviewStatusDirect(reviewItemId, "修正待ち"));
    }

    return Promise.resolve({
      ok: false,
      error_code: "REVIEW_ACTION_NOT_SUPPORTED",
      error_message: "Review action is not supported: " + action,
      details: { action: action },
      request_id: "review_action_not_supported"
    });
  }

  function installMemoryHandlers() {
    document.addEventListener("click", function (event) {
      var target = event.target;
      var button = target && target.closest ? target.closest("[data-action]") : null;
      var action;
      var companySelect;
      var departmentSelect;

      if (!button) return;

      action = button.getAttribute("data-action");

      if (action === "switch-company") {
        companySelect = byId("company-select");
        if (companySelect && companySelect.value) setCurrentCompany(companySelect.value);
      }

      if (action === "switch-department") {
        departmentSelect = byId("department-select");
        if (departmentSelect && departmentSelect.value) setPendingDepartment(departmentSelect.value);
      }

      if (isReviewAction(action)) {
        setPendingReview(getReviewItemId(button));
      }
    }, true);

    document.addEventListener("change", function (event) {
      if (!event.target) return;

      if (event.target.id === "company-select" && event.target.value) {
        setCurrentCompany(event.target.value);
      }

      if (event.target.id === "department-select" && event.target.value) {
        setPendingDepartment(event.target.value);
      }
    }, true);
  }

  function installCaptureHandler() {
    document.addEventListener("click", function (event) {
      var target = event.target;
      var button = target && target.closest ? target.closest("[data-action]") : null;
      var action;

      if (!button) return;

      action = button.getAttribute("data-action");
      if (!isReviewAction(action)) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      handleReviewAction(action, button).then(function (result) {
        if (result && result.ok === false) {
          alert(result.error_message || "レビュー操作に失敗しました。");
          return;
        }

        location.reload();
      });
    }, true);
  }

  function init() {
    var companyId = getCurrentCompanyId();
    var departmentId = getCurrentDepartmentId();

    if (companyId) setCurrentCompany(companyId);
    if (departmentId) setPendingDepartment(departmentId);

    global.AICM = global.AICM || {};
    global.AICM.reviewLocalActionWiring = {
      storageKey: STORAGE_KEY,
      reviewActionsOnly: true,
      realApiConnect: false,
      dbApply: false,
      rlsApply: false,
      isReviewAction: isReviewAction,
      handleReviewAction: handleReviewAction,
      getReviewItemId: getReviewItemId,
      ensureDemoReviewIfMissing: ensureDemoReviewIfMissing
    };

    installMemoryHandlers();
    installCaptureHandler();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
