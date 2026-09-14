import { readReturnContext } from "../return-context/storage";

export const readMockBridgeReturnContext = () => readReturnContext();

export const resolveMockBridgeRedirect = (fallback: string = "/me/launcher"): string =>
  readReturnContext()?.returnTarget ?? fallback;
