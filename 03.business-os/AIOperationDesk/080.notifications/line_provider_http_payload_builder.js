export function buildLinePushPayload(eventPayload = {}) {
  const destinationRef = eventPayload.destination_ref || null;
  const title = eventPayload.title || "notification";
  const body = eventPayload.body || "";

  if (!destinationRef) {
    throw new Error("destination_ref is required for provider http payload build.");
  }

  return {
    to: destinationRef,
    messages: [
      {
        type: "text",
        text: `${title}\n${body}`.trim()
      }
    ]
  };
}
