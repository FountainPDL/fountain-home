"use client"

import { useEffect } from "react"

export function AdBlocker() {
  useEffect(() => {
    const blockAds = () => {
      const adDomains = [
        "doubleclick.net",
        "googlesyndication.com",
        "pagead2.googlesyndication.com",
        "adservice.google.com",
        "ads.google.com",
        "googleadservices.com",
        "google-analytics.com",
        "analytics.google.com",
        "facebook.com/tr",
        "connect.facebook.net",
        "platform.twitter.com",
        "cdn.syndication.twimg.com",
        "ads.twitter.com",
        "adnxs.com",
        "criteo.com",
        "rubiconproject.com",
        "openx.net",
        "pubmatic.com",
        "appnexus.com",
      ]

      // Block scripts from ad networks
      const originalFetch = window.fetch
      ;(window as any).fetch = function (...args: any[]) {
        const url = args[0]?.toString?.() || ""
        if (adDomains.some((domain) => url.includes(domain))) {
          return Promise.reject(new Error("Ad blocked"))
        }
        return originalFetch.apply(this, args)
      }

      // Block XMLHttpRequest to ad networks
      const originalXHR = XMLHttpRequest.prototype.open
      XMLHttpRequest.prototype.open = function (method: string, url: string, ...rest: any[]) {
        if (adDomains.some((domain) => url.includes(domain))) {
          return
        }
        return originalXHR.apply(this, [method, url, ...rest])
      }

      const originalIframeDescriptor = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, "src")
      if (originalIframeDescriptor) {
        Object.defineProperty(HTMLIFrameElement.prototype, "src", {
          set(value: string) {
            if (!adDomains.some((domain) => value.includes(domain))) {
              originalIframeDescriptor.set?.call(this, value)
            }
          },
          get() {
            return originalIframeDescriptor.get?.call(this)
          },
        })
      }

      // Remove ad-related iframes and scripts
      const removeAds = () => {
        const adSelectors = [
          'iframe[src*="doubleclick"]',
          'iframe[src*="googlesyndication"]',
          'iframe[src*="pagead"]',
          'iframe[src*="adservice"]',
          'iframe[src*="ads.google"]',
          'iframe[src*="criteo"]',
          'iframe[src*="rubiconproject"]',
          'script[src*="doubleclick"]',
          'script[src*="googlesyndication"]',
          'script[src*="google-analytics"]',
          'script[src*="analytics.google"]',
          'script[src*="facebook.com/tr"]',
          'script[src*="connect.facebook"]',
        ]

        adSelectors.forEach((selector) => {
          document.querySelectorAll(selector).forEach((el) => {
            el.remove()
          })
        })
      }

      // Run ad removal on page load and periodically
      removeAds()
      const interval = setInterval(removeAds, 5000)

      return () => clearInterval(interval)
    }

    blockAds()
  }, [])

  return null
}
