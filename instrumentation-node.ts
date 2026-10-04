import { getConfig } from "@/lib/config"

export function validateConfig() {
  try {
    getConfig()
  } catch (e) {
    // A throw here leaves the server up and answering 500s, which Cloud Run would treat as healthy.
    console.error(e)
    process.exit(1)
  }
}
