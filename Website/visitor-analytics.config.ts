import type { Analytics } from "./quartz/cfg"

// Public installation values from Umami's Tracking code, never an API key.
const websiteId = process.env.UMAMI_WEBSITE_ID?.trim()
const scriptUrl = process.env.UMAMI_SCRIPT_URL?.trim()

function configuredAnalytics(): Analytics {
  if (!websiteId && !scriptUrl) return null
  if (!websiteId || !scriptUrl) {
    throw new Error("Set both UMAMI_WEBSITE_ID and UMAMI_SCRIPT_URL to enable visitor analytics.")
  }
  if (!/^[\da-f]{8}(-[\da-f]{4}){3}-[\da-f]{12}$/i.test(websiteId)) {
    throw new Error("UMAMI_WEBSITE_ID must be the website UUID from Umami's Tracking code.")
  }
  const url = new URL(scriptUrl)
  if (url.protocol !== "https:" || url.username || url.password || url.hash) {
    throw new Error(
      "UMAMI_SCRIPT_URL must be an HTTPS script URL without credentials or a fragment.",
    )
  }
  return { provider: "umami", websiteId, scriptSrc: url.href }
}

export const visitorAnalytics = configuredAnalytics()
