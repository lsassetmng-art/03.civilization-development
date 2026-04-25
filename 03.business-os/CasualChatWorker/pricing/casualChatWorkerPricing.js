import { assertValidContractInput } from "../domain/casualChatWorkerDomain.js";

export const CASUAL_CHAT_WORKER_PRICING = Object.freeze({
  currency: "JPY",
  baseMinutes: 30,
  basePriceJpy: 500,
  monthlyFreeTicketCount: 2,
  freeMinutesPerTicket: 30,
  maxFreeMinutesPerMonth: 60,
  carryoverEnabled: false
});

export function calculateBasePriceJpy(durationMinutes) {
  const duration = Number(durationMinutes);
  if (duration % CASUAL_CHAT_WORKER_PRICING.baseMinutes !== 0) {
    throw new Error("INVALID_PRICE_DURATION");
  }
  return (duration / CASUAL_CHAT_WORKER_PRICING.baseMinutes) * CASUAL_CHAT_WORKER_PRICING.basePriceJpy;
}

export function calculateQuote(input) {
  assertValidContractInput(input);

  const durationMinutes = Number(input.durationMinutes);
  const requestedFreeTicketCount = Number(input.requestedFreeTicketCount || 0);
  const availableFreeTicketCount = Number(input.availableFreeTicketCount || 0);

  const maxTicketByDuration = Math.floor(durationMinutes / CASUAL_CHAT_WORKER_PRICING.freeMinutesPerTicket);
  const appliedFreeTicketCount = Math.max(
    0,
    Math.min(
      requestedFreeTicketCount,
      availableFreeTicketCount,
      CASUAL_CHAT_WORKER_PRICING.monthlyFreeTicketCount,
      maxTicketByDuration
    )
  );

  const freeMinutes = appliedFreeTicketCount * CASUAL_CHAT_WORKER_PRICING.freeMinutesPerTicket;
  const paidMinutes = Math.max(0, durationMinutes - freeMinutes);
  const basePriceJpy = calculateBasePriceJpy(durationMinutes);
  const finalPriceJpy = calculateBasePriceJpy(paidMinutes);

  return {
    durationMinutes,
    basePriceJpy,
    availableFreeTicketCount,
    appliedFreeTicketCount,
    freeMinutes,
    paidMinutes,
    finalPriceJpy,
    currency: CASUAL_CHAT_WORKER_PRICING.currency
  };
}
