# Delta Vacations Scraper API

A REST API service that scrapes Delta Vacations for flight and hotel package deals.

## 🚀 Features

- **Clean JSON API**: Transforms Delta's raw data into structured vacation packages
- **Flight Information**: Times, airlines, prices, stops, and connections
- **Hotel Details**: Names, star ratings, amenities, images, and pricing
- **Dynamic Search**: Search by airport codes, dates, and passenger count
- **CORS Support**: Ready for frontend integration
- **TypeScript**: Full type safety

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Request/Response Examples](#requestresponse-examples)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Response Format](#response-format)

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone and install dependencies
git clone <repository-url>
cd deltaScraper/browserDelta
npm install

# Build the project
npm run build

# Start the API server
npm run start:api
```

The API will be available at `http://localhost:3000`

### Basic Usage

```bash
# Health check
curl http://localhost:3000/api/health

# Search vacation packages
curl -X POST http://localhost:3000/api/search-vacations \
  -H "Content-Type: application/json" \
  -d '{
    "originCode": "ATL",
    "destinationCode": "MCO",
    "departureDate": "2025-08-01",
    "returnDate": "2025-08-08",
    "passengers": 2
  }'
```

## 🛠 API Endpoints

### `GET /api/health`

Health check endpoint to verify API status.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 12345,
  "version": "1.0.0"
}
```

### `GET /api/docs`

Returns interactive API documentation with examples and schema information.

### `POST /api/search-vacations`

Search for Delta vacation packages with dynamic parameters.

**Request Body:**

```json
{
  "originCode": "string",           // Required: 3-letter airport code (e.g., "ATL")
  "destinationCode": "string",      // Required: 3-letter airport code (e.g., "MCO")
  "departureDate": "string",        // Required: YYYY-MM-DD format (e.g., "2025-08-01")
  "returnDate": "string",           // Required: YYYY-MM-DD format (e.g., "2025-08-08")
  "passengers": number,             // Required: 1-9 passengers
  "destinationCity": "string",      // Optional: City name (e.g., "Orlando")
  "destinationAirport": "string"    // Optional: Airport name (e.g., "Orlando International")
}
```

## 📝 Request/Response Examples

### Successful Search

**Request:**

```bash
curl -X POST http://localhost:3000/api/search-vacations \
  -H "Content-Type: application/json" \
  -d '{
    "originCode": "ATL",
    "destinationCode": "MCO",
    "departureDate": "2025-08-01",
    "returnDate": "2025-08-08",
    "passengers": 2,
    "destinationCity": "Orlando",
    "destinationAirport": "Orlando International"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "success": true,
    "searchInfo": {
      "origin": "ATL (Atlanta)",
      "destination": "MCO (Orlando)",
      "dates": "2025-08-01 - 2025-08-08",
      "passengers": 2,
      "totalResults": 25
    },
    "packages": [
      {
        "packageId": "MCO_HOTEL123_FLIGHT456",
        "totalPrice": {
          "perPerson": 1492.5,
          "total": 2985.0,
          "currency": "USD"
        },
        "flight": {
          "outbound": {
            "airline": "Delta",
            "flightNumber": "DL1234",
            "departure": {
              "time": "08:30 AM",
              "airport": "ATL",
              "city": "Atlanta"
            },
            "arrival": {
              "time": "10:15 AM",
              "airport": "MCO",
              "city": "Orlando"
            },
            "duration": "1h 45m",
            "stops": 0,
            "connection": null
          },
          "return": {
            "airline": "Delta",
            "flightNumber": "DL5678",
            "departure": {
              "time": "07:20 PM",
              "airport": "MCO",
              "city": "Orlando"
            },
            "arrival": {
              "time": "09:05 PM",
              "airport": "ATL",
              "city": "Atlanta"
            },
            "duration": "1h 45m",
            "stops": 0,
            "connection": null
          }
        },
        "hotel": {
          "name": "Residence Inn by Marriott Orlando at SeaWorld",
          "starRating": 3,
          "address": "11000 Westwood Blvd, Orlando, FL 32821",
          "location": {
            "coordinates": {
              "latitude": 28.4158,
              "longitude": -81.4558
            }
          },
          "amenities": [
            "Pool",
            "Fitness Center",
            "In Room Wi-Fi Access",
            "Kitchen"
          ],
          "images": [
            "https://images.delta.com/hotel123_img1.jpg",
            "https://images.delta.com/hotel123_img2.jpg"
          ],
          "checkIn": "2025-08-01",
          "checkOut": "2025-08-08",
          "nights": 7
        }
      }
    ]
  },
  "meta": {
    "requestId": "req_1705320600000",
    "processingTimeMs": 8500,
    "searchParams": {
      "originCode": "ATL",
      "destinationCode": "MCO",
      "departureDate": "2025-08-01",
      "returnDate": "2025-08-08",
      "passengers": 2,
      "destinationCity": "Orlando",
      "destinationAirport": "Orlando International"
    },
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Validation Error

**Response (400 Bad Request):**

```json
{
  "error": "Validation failed",
  "details": [
    "originCode must be a 3-letter airport code",
    "departureDate must be in YYYY-MM-DD format"
  ],
  "hint": "See GET /api/docs for valid request format"
}
```

### Rate Limit Error

**Response (429 Too Many Requests):**

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 45
}
```

## 🌍 Environment Variables

You can configure default search parameters using environment variables:

```bash
# Default search parameters (optional)
ORIGIN_CODE=ATL                    # Default origin airport
DESTINATION_CODE=MCO               # Default destination airport
DEPARTURE_DATE=2025-08-01          # Default departure date
RETURN_DATE=2025-08-08             # Default return date
PASSENGERS=2                       # Default passenger count
DESTINATION_CITY=Orlando           # Default destination city name
DESTINATION_AIRPORT=Orlando International  # Default airport name

# Server configuration
PORT=3000                          # API server port (default: 3000)
NODE_ENV=development               # Environment mode
```

Example usage with environment variables:

```bash
ORIGIN_CODE=JFK DESTINATION_CODE=MIA npm run start:api
```

## 🔧 Development

### Scripts

```bash
# Development (scraper only)
npm run start:dev

# Production scraper
npm run start:prod

# API server
npm run start:api

# Build TypeScript
npm run build

# Install Playwright browsers
npm run postinstall
```

### Project Structure

```
browserDelta/
├── src/
│   ├── main.ts              # Original scraper entry point
│   ├── routes.ts            # Core scraping logic & data transformation
│   └── scraper-service.ts   # Modular scraper service class
├── api-server.ts            # Express.js API server
├── storage/
│   ├── datasets/default/    # Scraped data output
│   └── cookies/            # Saved browser cookies
├── package.json
└── README.md
```

### Adding New Features

1. **Data Transformation**: Modify `transformDeltaResponse()` in `src/routes.ts`
2. **API Endpoints**: Add new routes in `api-server.ts`
3. **Validation**: Update validation logic in `scraper-service.ts`
4. **Search Parameters**: Extend `SearchParams` interface

## ⚡ Rate Limiting

The API implements rate limiting to prevent bot detection and ensure fair usage:

- **Limit**: 40 requests per minute per IP address
- **Window**: 60 seconds
- **Headers**: Rate limit info included in response headers
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining in current window
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

## 🚨 Error Handling

### Common Error Codes

| Code | Description           | Common Causes                                                   |
| ---- | --------------------- | --------------------------------------------------------------- |
| 400  | Bad Request           | Invalid airport codes, malformed dates, invalid passenger count |
| 429  | Too Many Requests     | Rate limit exceeded                                             |
| 500  | Internal Server Error | Scraping failed, Delta site changes                             |
| 504  | Gateway Timeout       | Request took too long (>30 seconds)                             |

### Error Response Format

```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message",
  "details": "Technical details (development only)",
  "meta": {
    "processingTimeMs": 1250,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## 📊 Response Format

### Main Response Structure

```typescript
interface APIResponse {
  success: boolean;
  data?: {
    success: boolean;
    searchInfo: SearchInfo;
    packages: VacationPackage[];
  };
  error?: string;
  message?: string;
  meta: {
    requestId: string;
    processingTimeMs: number;
    searchParams: SearchParams;
    timestamp: string;
  };
}
```

### Vacation Package Structure

```typescript
interface VacationPackage {
  packageId: string;
  totalPrice: {
    perPerson: number;
    total: number;
    currency: string;
  };
  flight: {
    outbound: FlightSegment;
    return: FlightSegment;
  };
  hotel: {
    name: string;
    starRating: number;
    address: string;
    location: {
      coordinates: {
        latitude: number;
        longitude: number;
      };
    };
    amenities: string[];
    images: string[];
    checkIn: string;
    checkOut: string;
    nights: number;
  };
}
```

### Amenity Mapping

The API maps Delta's amenity codes to readable names:

| Code | Amenity              |
| ---- | -------------------- |
| A    | Air Conditioning     |
| B    | Beachfront           |
| D    | Restaurant/Bar       |
| F    | Fitness Center       |
| G    | Golf on Property     |
| I    | In Room Wi-Fi Access |
| K    | Kitchen              |
| P    | Pool                 |
| S    | Spa                  |
| T    | Tennis               |

## 🏗 Production Considerations

- **Redis**: Replace in-memory rate limiting with Redis for multi-instance deployments
- **Monitoring**: Add logging, metrics, and health monitoring
- **Caching**: Implement response caching for popular routes
- **Load Balancing**: Use multiple instances behind a load balancer
- **Error Tracking**: Integrate with Sentry or similar service
- **Database**: Store search history and analytics

## 📞 Support

For questions, issues, or feature requests:

1. Check existing issues in the repository
2. Create a new issue with detailed reproduction steps
3. Include API request/response examples when reporting bugs

## 📜 License
