(function (global) {
  "use strict";

  function createActionRouter(handlers) {
    var h = handlers || {};

    var routes = {
      "add-company": function () { return h.company.createCompany(); },
      "save-company": function () { return h.company.saveCompany(); },
      "delete-company": function () { return h.company.deleteCompany(); },
      "add-common-rules": function () { return h.company.saveCompanyRules(); },

      "add-department": function () { return h.department.createDepartment(); },
      "save-department": function () { return h.department.saveDepartment(); },
      "delete-department": function () { return h.department.deleteDepartment(); },

      "add-organization": function () { return h.organization.createOrganization(); },
      "save-organization": function () { return h.organization.saveOrganization(); },
      "delete-organization": function () { return h.organization.deleteOrganization(); },

      "add-ledger-row": function () { return h.ledger.saveLedgerRow(); },
      "save-ledger-row": function () { return h.ledger.saveLedgerRow(); },
      "delete-ledger-row": function () { return h.ledger.deleteLedgerRow(); },

      "preview-csv": function () { return h.csv.previewCsv(); },
      "import-csv": function () { return h.csv.importCsv(); },

      "approve-review": function (button) { return h.review.approveReview(button && button.getAttribute ? button.getAttribute("data-review-id") : ""); },
      "reject-review": function (button) { return h.review.rejectReview(button && button.getAttribute ? button.getAttribute("data-review-id") : ""); }
    };

    return {
      route: function route(action, button) {
        if (!routes[action]) {
          return Promise.resolve({
            ok: false,
            error_code: "ACTION_ROUTE_NOT_FOUND",
            error_message: "Action route not found: " + action,
            details: { action: action },
            request_id: "route_" + Date.now().toString(36)
          });
        }
        return routes[action](button || null);
      },
      hasRoute: function hasRoute(action) {
        return !!routes[action];
      }
    };
  }

  global.AICM = global.AICM || {};
  global.AICM.createActionRouter = createActionRouter;
})(window);
