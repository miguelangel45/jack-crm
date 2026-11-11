export function generateUniqueTicketId() {
  const now = new Date();
  const year = now.getFullYear();
  const timeStamp = now.getTime();
  const randomPart = String(Math.floor(Math.random() * 900000) + 100000);

  return `${year}${String(timeStamp).slice(-6)}${randomPart}`;
}

export function generateProcessId(ticketId: string, processName = "PROC") {
  const safeProcess = String(processName).replace(/\D/g, "").slice(0, 4) || "0001";
  const randomPart = String(Math.floor(Math.random() * 9000) + 1000);
  return `${ticketId}${safeProcess}${randomPart}`;
}
