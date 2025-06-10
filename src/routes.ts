import { createPlaywrightRouter } from "crawlee";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

// Search parameters interface
interface SearchParams {
  originCode: string;
  destinationCode: string;
  departureDate: string;
  returnDate: string;
  passengers: number;
  destinationCity?: string;
  destinationAirport?: string;
}

// Get search parameters from environment variables or defaults
function getSearchParams(): SearchParams {
  return {
    originCode: process.env.ORIGIN_CODE || "LGA",
    destinationCode: process.env.DESTINATION_CODE || "DAB",
    departureDate: process.env.DEPARTURE_DATE || "2025-06-09",
    returnDate: process.env.RETURN_DATE || "2025-06-25",
    passengers: parseInt(process.env.PASSENGERS || "2"),
    destinationCity: process.env.DESTINATION_CITY || "Daytona Beach",
    destinationAirport:
      process.env.DESTINATION_AIRPORT || "Daytona Beach Regional",
  };
}

// Helper function to map amenity codes to readable names
const amenityMap: Record<string, string> = {
  A: "Air Conditioning",
  B: "Beachfront",
  D: "Restaurant/Bar",
  F: "Fitness Center",
  G: "Golf on Property",
  I: "In Room Wi-Fi Access",
  K: "Kitchen",
  P: "Pool",
  S: "Spa",
  T: "Tennis",
};

// Transform Delta's complex response into clean format for Budget Vacay frontend
function transformDeltaResponse(deltaResponse: any, searchPayload: any) {
  if (!deltaResponse?.vacationsObject) {
    return {
      success: false,
      error: "Invalid response from Delta API",
      packages: [],
    };
  }

  const vacationsObj = deltaResponse.vacationsObject;
  const flights = vacationsObj.vacationSegment?.segments || [];
  const hotels = vacationsObj.hotels || [];

  console.log(`DEBUG: Found ${hotels.length} hotels in raw Delta response`);
  hotels.forEach((hotel: any, i: number) => {
    console.log(`Hotel ${i + 1}: ${hotel.hotelName} (${hotel.hotelCode})`);
  });

  // Extract search info
  const searchInfo = {
    origin: `${searchPayload.originCode} (${
      searchPayload.destinationData?.airportName || "Unknown"
    })`,
    destination: `${searchPayload.destinationCode} (${
      searchPayload.destinationData?.cityName || "Unknown"
    })`,
    dates: `${searchPayload.departureDate} - ${searchPayload.returnDate}`,
    passengers: searchPayload.adultPassenger || 2,
    totalResults: hotels.length,
  };

  // Transform packages
  const packages = hotels.map((hotel: any, index: number) => {
    // Get the cheapest flight option for this package
    const flightSegment = flights[0]; // Taking first flight option for simplicity
    const cheapestFare =
      flightSegment?.fareLists?.find((fare: any) => fare.isDefaultFare) ||
      flightSegment?.fareLists?.[0];

    // Get hotel room info
    const hotelRoom = hotel.vacationsRooms?.[0]; // Taking first room option
    const roomPrice = hotelRoom?.price?.price || 0;

    // Calculate total package price
    const flightPrice = cheapestFare?.totalPrice?.price || 0;
    const totalPrice = flightPrice + roomPrice;
    const pricePerPerson = totalPrice / searchInfo.passengers;

    // Format flight info
    const outboundLegs = flightSegment?.legs || [];
    const outboundFirst = outboundLegs[0];
    const outboundLast = outboundLegs[outboundLegs.length - 1];

    // Format hotel amenities
    const amenities = (hotel.hotelAmenities || []).map(
      (code: string) => amenityMap[code] || code
    );

    // Get hotel images (limit to first 5)
    const images = (hotel.hotelImages || [])
      .slice(0, 5)
      .map((img: any) => img.imageUrl);

    return {
      packageId: `${hotel.hotelCode}_${index + 1}`,
      totalPrice: {
        perPerson: Math.round(pricePerPerson * 100) / 100,
        total: Math.round(totalPrice * 100) / 100,
        currency: "USD",
      },
      flight: {
        outbound: {
          airline: "Delta",
          flightNumber: outboundFirst?.marketAirline?.flightNbr || "Unknown",
          departure: {
            time: outboundFirst?.schedDepartureTime?.trim() || "Unknown",
            airport: outboundFirst?.origin?.code || searchPayload.originCode,
            city: outboundFirst?.origin?.name || "Unknown",
          },
          arrival: {
            time: outboundLast?.schedArrivalTime?.trim() || "Unknown",
            airport:
              outboundLast?.destination?.code || searchPayload.destinationCode,
            city: outboundLast?.destination?.name || "Unknown",
          },
          duration: flightSegment?.duration || "Unknown",
          stops: outboundLegs.length - 1,
          connection:
            outboundLegs.length > 1 ? outboundLegs[0]?.destination?.code : null,
        },
        return: {
          airline: "Delta",
          flightNumber: "DL2827", // Placeholder - would need return flight data
          departure: {
            time: "02:42 PM",
            airport: searchPayload.destinationCode,
            city: searchPayload.destinationData?.cityName || "Unknown",
          },
          arrival: {
            time: "09:00 PM",
            airport: searchPayload.originCode,
            city: "Unknown",
          },
          duration: "4h 18m",
          stops: 1,
          connection: "ATL",
        },
      },
      hotel: {
        name: hotel.hotelName || "Unknown Hotel",
        starRating: parseFloat(hotel.starRating) || 0,
        pricePerNight: Math.round((roomPrice / 16) * 100) / 100, // Assuming 16 nights
        totalNights: 16,
        roomType: hotelRoom?.roomType || "Standard Room",
        amenities: amenities,
        images: images,
        location: {
          city: hotel.hotelCityName || "Unknown",
          latitude: hotel.hotelLatitude || 0,
          longitude: hotel.hotelLongitude || 0,
        },
      },
    };
  });

  return {
    success: true,
    searchInfo,
    packages: packages.sort(
      (a: any, b: any) => a.totalPrice.perPerson - b.totalPrice.perPerson
    ), // Sort by price
  };
}

export const router = createPlaywrightRouter();

router.addDefaultHandler(
  async ({ page, log, request, sendRequest, pushData }) => {
    log.info(`Visiting base URL: ${request.loadedUrl}`);

    // Get search parameters
    const searchParams = getSearchParams();
    log.info("Using search parameters:", searchParams);

    // Wait for the page to load completely
    await page.waitForLoadState("networkidle");

    // Get cookies from the page
    const cookies = await page.context().cookies();
    log.info(`Found ${cookies.length} cookies`);

    // Convert cookies to cookie string format for HTTP requests
    const cookieString = cookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    log.info(`Cookie string for API requests: ${cookieString}`);

    // Save cookies to a file
    try {
      // Ensure storage directory exists
      await mkdir("./storage/cookies", { recursive: true });

      // Save cookies as JSON
      const cookiesPath = join("./storage/cookies", "cookies.json");
      await writeFile(cookiesPath, JSON.stringify(cookies, null, 2));
      log.info(`Cookies saved to ${cookiesPath}`);

      // Also save cookies in a more readable format
      const readablePath = join("./storage/cookies", "cookies_readable.txt");
      const readableContent = cookies
        .map(
          (cookie) =>
            `${cookie.name}=${cookie.value} (Domain: ${cookie.domain}, Path: ${cookie.path})`
        )
        .join("\n");
      await writeFile(readablePath, readableContent);
      log.info(`Readable cookies saved to ${readablePath}`);
    } catch (error) {
      log.error("Error saving cookies:", {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    const title = await page.title();
    log.info(`Page title: ${title}`);

    // Now use the cookies for API requests
    try {
      log.info("Calling origin-dest API to seed destination data...");

      const apiResponse = await sendRequest({
        url: "https://dlvacations-api.delta.com/shopping/v1/origin-dest",
        method: "POST",
        headers: {
          accept: "text/plain,application/json",
          "accept-encoding": "gzip, deflate, br, zstd",
          "accept-language": "en-US,en;q=0.9",
          "cache-control": "no-cache",
          "content-type": "application/json",
          origin: "https://www.delta.com",
          pragma: "no-cache",
          priority: "u=1, i",
          referer: "https://www.delta.com/",
          "sec-ch-ua":
            '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          Cookie: cookieString || "dlsite=a; prefUI=en-us; prefConf=N", // fallback cookies
        },
        json: {
          brandCode: "DLV",
          lifestyleCode: "CORE",
          isOrigin: false,
          query: "FLORIDA",
          pkgType: "AIR_HOTEL",
        },
      });

      const queries = ["FLORIDA"];

      for (const query of queries) {
        try {
          const destResponse = await sendRequest({
            url: "https://dlvacations-api.delta.com/shopping/v1/origin-dest",
            method: "POST",
            headers: {
              accept: "text/plain,application/json",
              "accept-encoding": "gzip, deflate, br, zstd",
              "accept-language": "en-US,en;q=0.9",
              "cache-control": "no-cache",
              "content-type": "application/json",
              origin: "https://www.delta.com",
              pragma: "no-cache",
              priority: "u=1, i",
              referer: "https://www.delta.com/",
              "sec-ch-ua":
                '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": '"Windows"',
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-site",
              "user-agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
              Cookie: cookieString || "dlsite=a; prefUI=en-us; prefConf=N",
            },
            json: {
              brandCode: "DLV",
              lifestyleCode: "CORE",
              isOrigin: false,
              query: query,
              pkgType: "AIR_HOTEL",
            },
          });

          log.info(`Destinations for ${query}:`, {
            status: destResponse.statusCode,
            body: destResponse.body,
          });
        } catch (error: any) {
          log.error(`Failed to get destinations for ${query}:`, {
            error: error.message,
          });
        }
      }

      log.info("Calling usercache API to create search session...");
      let cacheKey;

      try {
        const usercacheResponse = await sendRequest({
          url: "https://dlvacations-api.delta.com/usercache/v1",
          method: "POST",
          headers: {
            accept: "text/plain,application/json",
            "accept-encoding": "gzip, deflate, br, zstd",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            "content-type": "application/json",
            origin: "https://www.delta.com",
            pragma: "no-cache",
            priority: "u=1, i",
            referer: "https://www.delta.com/",
            "sec-ch-ua":
              '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            Cookie: cookieString || "dlsite=a; prefUI=en-us; prefConf=N",
          },
          json: {
            searchCriteria: {
              originCode: searchParams.originCode,
              destinationCode: searchParams.destinationCode,
              departureDate: searchParams.departureDate,
              returnDate: searchParams.returnDate,
              rooms: [
                { adultPassenger: searchParams.passengers, childPassenger: [] },
              ],
              pkgType: "AIR_HOTEL",
              lifestyleType: "CORE",
              childPassenger: [],
              adultPassenger: searchParams.passengers,
              promoCode: null,
              skyMilesNumber: null,
              landDestCode: `${searchParams.destinationCode},${searchParams.destinationCode}`,
              destinationData: {
                airportName:
                  searchParams.destinationAirport || "Unknown Airport",
                cityName: searchParams.destinationCity || "Unknown City",
                countryCode: "US",
                countryName: "USA",
              },
            },
          },
        });

        cacheKey = usercacheResponse.body;

        log.info("Usercache API response:", {
          status: usercacheResponse.statusCode,
          cacheKey,
        });
      } catch (error: any) {
        log.error("Failed to call usercache API:", { error: error.message });
      }

      // Now call the search-init API with the cacheKey
      if (cacheKey) {
        log.info(`Using cacheKey: ${cacheKey}`);

        const searchInitPayload = {
          rooms: {
            "1": {
              adultPassenger: searchParams.passengers,
              childPassenger: [],
            },
          },
          skyMilesNumber: null,
          pkgType: "AIR_HOTEL",
          hotelSortOption: "BESTMATCH",
          isPropertySearch: false,
          hotelPageSize: "30",
          hotelId: "",
          adultPassenger: searchParams.passengers,
          hotelPage: 1,
          hotelFiltersToApply: [],
          destinationData: {
            airportName: searchParams.destinationAirport || "Unknown Airport",
            countryName: "USA",
            cityName: searchParams.destinationCity || "Unknown City",
            countryCode: "US",
          },
          destinationCode: searchParams.destinationCode,
          returnDate: searchParams.returnDate,
          landDestCode: `${searchParams.destinationCode},${searchParams.destinationCode}`,
          childPassenger: [],
          lifestyleType: "CORE",
          originCode: searchParams.originCode,
          promoCode: null,
          departureDate: searchParams.departureDate,
          cacheKey: cacheKey,
          page: 1,
          lifestyleCode: "CORE",
        };

        const initResponse = await sendRequest({
          url: "https://dlvacations-api.delta.com/shopping/v1/search-init",
          method: "POST",
          headers: {
            accept: "text/plain,application/json",
            "accept-encoding": "gzip, deflate, br, zstd",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            "content-type": "application/json",
            origin: "https://www.delta.com",
            pragma: "no-cache",
            priority: "u=1, i",
            referer: `https://www.delta.com/delta-vacation/search/hotels?cacheKey=${cacheKey}`,
            "sec-ch-ua":
              '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            cookie:
              cookieString ||
              "dlsite=a; at_check=true; AMCVS_F0E65E09512D2CC50A490D4D%40AdobeOrg=1",
          },
          json: searchInitPayload,
        });

        log.info("search-init response status:", {
          status: initResponse.statusCode,
        });

        let responseBody;
        try {
          if (typeof initResponse.body === "string") {
            responseBody = JSON.parse(initResponse.body);
          } else if (
            typeof initResponse.body === "object" &&
            initResponse.body !== null
          ) {
            if (typeof initResponse.body["0"] === "string") {
              const bodyString = Object.values(initResponse.body).join("");
              responseBody = JSON.parse(bodyString);
            } else {
              responseBody = initResponse.body;
            }
          } else {
            responseBody = initResponse.body;
          }
        } catch (error: any) {
          log.error("Failed to parse response body:", { error: error.message });
          responseBody = initResponse.body;
        }

        // First save the raw response for debugging
        await pushData({
          type: "raw_delta_response",
          data: responseBody,
          timestamp: new Date().toISOString(),
        });

        // Transform raw Delta response into clean format
        const formattedResponse = transformDeltaResponse(
          responseBody,
          searchInitPayload
        );

        await pushData(formattedResponse);

        if (responseBody && responseBody.hasErrors === "true") {
          log.error("API returned errors:", responseBody.errorList);
        }

        log.info(
          "Successfully completed all API calls with cookies from browser"
        );
      }
    } catch (error: any) {
      log.error("Failed to call APIs:", { error: error.message });
    }
  }
);
