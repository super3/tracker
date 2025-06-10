import express from "express";
import cors from "cors";
import DeltaVacationsScraper, { SearchParams } from "./src/scraper-service";

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize scraper service
const scraperService = new DeltaVacationsScraper();

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting (simple in-memory store - use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 40; // 5 requests per minute per IP (scraping is slow)

function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const key = ip;

  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
  }

  const entry = rateLimitStore.get(key)!;

  if (now > entry.resetTime) {
    // Reset window
    entry.count = 1;
    entry.resetTime = now + RATE_LIMIT_WINDOW;
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetTime: entry.resetTime,
    };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - entry.count,
    resetTime: entry.resetTime,
  };
}

// API Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "Delta Vacations Scraper API",
    version: "1.0.0",
    uptime: process.uptime(),
  });
});

// API documentation
app.get("/api/docs", (req, res) => {
  res.json({
    title: "Delta Vacations Scraper API",
    version: "1.0.0",
    description: "REST API for searching Delta vacation packages",
    endpoints: {
      "GET /api/health": "Health check endpoint",
      "GET /api/docs": "API documentation",
      "POST /api/search-vacations": "Search for vacation packages",
    },
    searchEndpoint: {
      method: "POST",
      url: "/api/search-vacations",
      description: "Search for Delta vacation packages",
      body: {
        originCode: 'string (3-letter airport code, e.g., "ATL")',
        destinationCode: 'string (3-letter airport code, e.g., "MCO")',
        departureDate: 'string (YYYY-MM-DD format, e.g., "2025-08-01")',
        returnDate: 'string (YYYY-MM-DD format, e.g., "2025-08-08")',
        passengers: "number (1-9)",
        destinationCity: 'string (optional, e.g., "Orlando")',
        destinationAirport: 'string (optional, e.g., "Orlando International")',
      },
      example: {
        originCode: "ATL",
        destinationCode: "MCO",
        departureDate: "2025-08-01",
        returnDate: "2025-08-08",
        passengers: 2,
        destinationCity: "Orlando",
        destinationAirport: "Orlando International",
      },
    },
    rateLimit: {
      window: "1 minute",
      maxRequests: 5,
      note: "Scraping operations are intensive, so rate limits are strict",
    },
  });
});

// Main search endpoint
app.post("/api/search-vacations", async (req, res) => {
  const startTime = Date.now();

  try {
    // Rate limiting
    const clientIP = req.ip || req.socket.remoteAddress || "unknown";
    const rateCheck = checkRateLimit(clientIP);

    // Set rate limit headers
    res.set({
      "X-RateLimit-Limit": RATE_LIMIT_MAX_REQUESTS.toString(),
      "X-RateLimit-Remaining": rateCheck.remaining.toString(),
      "X-RateLimit-Reset": Math.ceil(rateCheck.resetTime / 1000).toString(),
    });

    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: "Rate limit exceeded",
        message: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((rateCheck.resetTime - Date.now()) / 1000),
      });
    }

    // Validate input
    const validation = DeltaVacationsScraper.validateSearchParams(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors,
        hint: "See GET /api/docs for valid request format",
      });
    }

    const searchParams: SearchParams = {
      originCode: req.body.originCode.toUpperCase(),
      destinationCode: req.body.destinationCode.toUpperCase(),
      departureDate: req.body.departureDate,
      returnDate: req.body.returnDate,
      passengers: req.body.passengers,
      destinationCity: req.body.destinationCity,
      destinationAirport: req.body.destinationAirport,
    };

    console.log(
      `🔍 API Request from ${clientIP}: ${searchParams.originCode} → ${searchParams.destinationCode}, ${searchParams.departureDate} to ${searchParams.returnDate}, ${searchParams.passengers} passengers`
    );

    // Run the scraper
    const result = await scraperService.searchVacations(searchParams);

    const processingTime = Date.now() - startTime;

    console.log(
      `✅ API Response: Found ${
        result.packages?.length || 0
      } vacation packages in ${processingTime}ms`
    );

    res.json({
      success: true,
      data: result,
      meta: {
        requestId: `req_${Date.now()}`,
        processingTimeMs: processingTime,
        searchParams: searchParams,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ API Error after ${processingTime}ms:`, error.message);

    // Determine appropriate status code
    let statusCode = 500;
    if (error.message.includes("timeout")) {
      statusCode = 504;
    } else if (
      error.message.includes("validation") ||
      error.message.includes("invalid")
    ) {
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      error: statusCode === 500 ? "Internal server error" : "Request failed",
      message:
        statusCode === 500
          ? "Failed to search vacation packages"
          : error.message,
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
      meta: {
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not found",
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableEndpoints: [
      "GET /api/health",
      "GET /api/docs",
      "POST /api/search-vacations",
    ],
  });
});

// Error handler
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("🚨 Unhandled error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred",
    });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Delta Vacations API Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📖 Documentation: http://localhost:${PORT}/api/docs`);
  console.log(
    `🔍 Search endpoint: POST http://localhost:${PORT}/api/search-vacations`
  );
  console.log("");
  console.log("💡 Example usage:");
  console.log(`curl -X POST http://localhost:${PORT}/api/search-vacations \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(
    `  -d '{"originCode":"ATL","destinationCode":"MCO","departureDate":"2025-08-01","returnDate":"2025-08-08","passengers":2}'`
  );
});

export default app;
