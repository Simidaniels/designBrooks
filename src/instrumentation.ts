/**
 * Server startup hook — validates critical infrastructure readiness.
 * Runs once per Next.js server instance, before the server accepts requests.
 *
 * H4 remediation: the app refuses to boot in production without a valid
 * R2 storage configuration (presence + format validation). Deep connectivity
 * is enforced per operation — any storage call also fails closed.
 *
 * Runtime-specific code is imported lazily inside register() so the Edge
 * bundle never sees the Node-only storage module.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { checkStorageReadiness } = await import("@/lib/server/storage");
    const status = checkStorageReadiness();

    if (!status.ok) {
      // Fail closed: do not start a production server that would silently
      // write documents to ephemeral local disk.
      throw new Error(`[storage] ${status.message}`);
    }
    console.log(`[storage] ${status.message}`);
  }
}
