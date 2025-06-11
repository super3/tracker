import { PlaywrightCrawler, ProxyConfiguration } from "crawlee";

import { router } from "./routes.js";

const startUrls = ["https://www.delta.com/us/en/delta-vacations"];

const crawler = new PlaywrightCrawler({
  // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
  requestHandler: router,
  // Limit to just the base URL for cookie collection
  maxRequestsPerCrawl: 1,
  // Enable persistent context to better handle cookies
  launchContext: {
    launchOptions: {
      headless: true, // Set to false if you want to see the browser
    },
  },
  preNavigationHooks: [
    async ({ blockRequests }) => {
      // Block all requests to URLs that include `adsbygoogle.js` and also all defaults.
      await blockRequests({
        extraUrlPatterns: ["adsbygoogle.js"],
      });
    },
  ],
});

await crawler.run(startUrls);
