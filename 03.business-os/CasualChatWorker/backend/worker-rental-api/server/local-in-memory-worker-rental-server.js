const http = require("http");
const { createInMemoryWorkerRentalRepository } = require("../repositories/in-memory-worker-rental-repository");
const { createWorkerRentalHttpHandler } = require("./worker-rental-http-router");

function createLocalInMemoryServer(options = {}) {
  const repository = options.repository || createInMemoryWorkerRentalRepository();
  const userId = options.userId || "00000000-0000-0000-0000-000000000001";

  const handler = createWorkerRentalHttpHandler({
    workerRentalRepository: repository,
    contextProvider: async () => ({
      actorType: "member",
      actorUserId: userId
    }),
    idFactory: {
      quoteId: () => `quote-local-${Date.now()}`
    }
  });

  const server = http.createServer(handler);

  return {
    server,
    repository,
    listen(port = 0) {
      return new Promise((resolve) => {
        server.listen(port, "127.0.0.1", () => {
          resolve(server.address());
        });
      });
    },
    close() {
      return new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }
  };
}

if (require.main === module) {
  const runtimePort = Number(process.env.CCW_LOCAL_TEST_PORT || 8787);
  const localServer = createLocalInMemoryServer();

  localServer.listen(runtimePort).then((address) => {
    console.log(`CasualChatWorker local WorkerRental server listening on ${address.address}:${address.port}`);
  });
}

module.exports = {
  createLocalInMemoryServer
};
