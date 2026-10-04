export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateConfig } = await import("./instrumentation-node")
    validateConfig()
  }
}
