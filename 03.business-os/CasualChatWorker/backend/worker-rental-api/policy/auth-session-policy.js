function assertAuthenticatedContext(context) {
  if (!context || !context.actorUserId) {
    throw new Error("Authentication required.");
  }

  if (!context.actorType) {
    throw new Error("Actor type required.");
  }

  return true;
}

function assertUserScope(context, userId) {
  assertAuthenticatedContext(context);

  if (context.actorType === "operator" || context.actorType === "admin") {
    return true;
  }

  if (String(context.actorUserId) !== String(userId)) {
    throw new Error("User scope mismatch.");
  }

  return true;
}

function assertCasualChatWorkerScope(payload) {
  if (!payload || payload.app_code !== "CasualChatWorker") {
    throw new Error("Invalid app_code.");
  }

  if (payload.service_code !== "casual_chat_worker") {
    throw new Error("Invalid service_code.");
  }

  return true;
}

module.exports = {
  assertAuthenticatedContext,
  assertUserScope,
  assertCasualChatWorkerScope
};
