import { ROUTES } from "../../lib/routing/routes";
import { requestPortalLogin, requestPortalSignup } from "../portal-api/auth-client";
import {
  clearPendingAuthResponse,
  clearPortalSession,
  getPortalSessionSummary,
  readPendingAuthResponse,
  savePendingAuthResponse,
  savePortalSession,
} from "./mock-session";
import {
  clearReturnContext,
  readReturnContext,
  saveReturnContext,
} from "../return-context/storage";
import type {
  CivilizationAuthBridge,
  PortalAuthReturnCommand,
  PortalAuthReturnResult,
  PortalAuthStartCommand,
  PortalAuthStartResult,
} from "../../types/bridge";

const buildErrorResult = (
  command: PortalAuthReturnCommand,
  message: string,
): PortalAuthReturnResult => ({
  bridgeMode: "mock",
  status: "error",
  mode: command.mode,
  returnTarget: ROUTES.error,
  message,
});

export const mockCivilizationAuthBridge: CivilizationAuthBridge = {
  mode: "mock",

  async startAuth(command: PortalAuthStartCommand): Promise<PortalAuthStartResult> {
    saveReturnContext(command.returnContext);

    const response =
      command.mode === "login"
        ? await requestPortalLogin({
            operation: "login",
            profilePreset: command.profilePreset,
            returnContext: command.returnContext,
          })
        : await requestPortalSignup({
            operation: "signup",
            profilePreset: command.profilePreset,
            returnContext: command.returnContext,
          });

    savePendingAuthResponse(response.data);

    return {
      bridgeMode: "mock",
      redirectUrl: response.data.authReturnUrl,
    };
  },

  async resolveAuthReturn(
    command: PortalAuthReturnCommand,
  ): Promise<PortalAuthReturnResult> {
    const pending = readPendingAuthResponse();
    const storedReturnContext = readReturnContext();

    if (command.status !== "success") {
      clearPendingAuthResponse();
      clearReturnContext();
      return buildErrorResult(
        command,
        "Authentication did not finish successfully.",
      );
    }

    if (!pending) {
      clearReturnContext();
      return buildErrorResult(
        command,
        "No pending authentication payload could be found.",
      );
    }

    savePortalSession(pending.session);

    const returnTarget =
      pending.returnContext.returnTarget ||
      command.searchReturnTarget ||
      storedReturnContext?.returnTarget ||
      ROUTES.launcher;

    clearPendingAuthResponse();
    clearReturnContext();

    return {
      bridgeMode: "mock",
      status: "authenticated",
      mode: command.mode,
      returnTarget,
      session: pending.session,
      message: `Authentication completed. Returning to ${returnTarget}.`,
    };
  },

  getSessionSummary() {
    return getPortalSessionSummary();
  },

  clearSession() {
    clearPortalSession();
    clearPendingAuthResponse();
    clearReturnContext();
  },
};
