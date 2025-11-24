// utils/logger.ts
export function logInfo(msg: string, meta?: any) {
  console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, meta ?? "");
}
export function logError(msg: string, meta?: any) {
  console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, meta ?? "");
}
export function logDebug(msg: string, meta?: any) {
  if (process.env.NODE_ENV !== "production") console.debug(`[DEBUG] ${new Date().toISOString()} - ${msg}`, meta ?? "");
}
