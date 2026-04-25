export const CASUAL_CHAT_WORKER_FREE_TICKET_POLICY = Object.freeze({
  grantTiming: "monthly_beginning",
  grantedTicketCount: 2,
  minutesPerTicket: 30,
  carryoverEnabled: false,
  shortestContractMinutes: 30,
  ticketMeaning: "one ticket makes the shortest contract duration free",
  appSpecificMaxContractMinutes: 120
});

export function getMonthlyGrantForCasualChatWorker(targetMonth) {
  return {
    targetMonth,
    grantedTicketCount: CASUAL_CHAT_WORKER_FREE_TICKET_POLICY.grantedTicketCount,
    minutesPerTicket: CASUAL_CHAT_WORKER_FREE_TICKET_POLICY.minutesPerTicket,
    totalGrantedMinutes:
      CASUAL_CHAT_WORKER_FREE_TICKET_POLICY.grantedTicketCount *
      CASUAL_CHAT_WORKER_FREE_TICKET_POLICY.minutesPerTicket,
    carryoverEnabled: CASUAL_CHAT_WORKER_FREE_TICKET_POLICY.carryoverEnabled
  };
}
