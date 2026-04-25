const routes = require("../routes/worker-rental-routes-v2");

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

function createRouteDeps({ workerRentalRepository, context, idFactory }) {
  return {
    context,
    workerRentalRepository,
    idFactory: idFactory || {
      quoteId: () => `quote-${Date.now()}`
    },
    repositories: {
      serviceCatalog: {
        findActive: (appCode, serviceCode) => workerRentalRepository.findServiceCatalog(appCode, serviceCode)
      },
      entitlementBalance: {
        findActive: (appCode, serviceCode, userId, grantPeriod) => workerRentalRepository.findEntitlementBalance(appCode, serviceCode, userId, grantPeriod)
      },
      priceCatalog: {
        findActive: (appCode, serviceCode, rentalUnitKind, rentalUnitCount) => workerRentalRepository.findPriceRow(appCode, serviceCode, rentalUnitKind, rentalUnitCount)
      }
    }
  };
}

function createWorkerRentalHttpHandler({ workerRentalRepository, contextProvider, idFactory }) {
  if (!workerRentalRepository) {
    throw new Error("workerRentalRepository is required.");
  }

  return async function workerRentalHttpHandler(req, res) {
    try {
      const url = new URL(req.url, "http://localhost");
      const context = contextProvider ? await contextProvider(req) : { actorType: "member", actorUserId: url.searchParams.get("user_id") };
      const deps = createRouteDeps({ workerRentalRepository, context, idFactory });

      const routeReq = {
        query: Object.fromEntries(url.searchParams.entries()),
        body: {}
      };

      if (req.method === "GET" && url.pathname === "/api/v1/business/worker-rental/service/catalog") {
        const payload = await routes.getServiceCatalog(routeReq, deps);
        sendJson(res, 200, payload);
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/v1/business/worker-rental/entitlement/balance") {
        const payload = await routes.getEntitlementBalance(routeReq, deps);
        sendJson(res, 200, payload);
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/v1/business/worker-rental/quote") {
        routeReq.body = await readBody(req);
        const payload = await routes.postQuote(routeReq, deps);
        sendJson(res, 200, payload);
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/v1/business/worker-rental/confirm") {
        routeReq.body = await readBody(req);
        const payload = await routes.postConfirmWithTransaction(routeReq, deps);
        sendJson(res, 200, payload);
        return;
      }

      sendJson(res, 404, {
        error: "not_found"
      });
    } catch (error) {
      sendJson(res, 400, {
        error: "bad_request",
        message: error.message
      });
    }
  };
}

module.exports = {
  createRouteDeps,
  createWorkerRentalHttpHandler
};
