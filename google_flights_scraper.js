// Google Flights scraper for round-trip flights
const puppeteer = require('puppeteer');

// Helper function for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function searchFlights(from, to, departDate, returnDate) {
  console.log(`Searching for flights from ${from} to ${to} (${departDate} - ${returnDate})`);
  
  // Launch the browser
  const browser = await puppeteer.launch({
    headless: false, // Set to false to see the browser in action
    defaultViewport: { width: 1200, height: 800 }
  });
  
  try {
    // Open a new page
    const page = await browser.newPage();
    
    // Navigate to Google Flights
    console.log('Navigating to Google Flights...');
    await page.goto('https://www.google.com/travel/flights', { 
      waitUntil: 'networkidle2',
      timeout: 60000 // Increase timeout to 60 seconds
    });
    
    // Wait for the page to load
    await page.waitForSelector('div[role="main"]', { timeout: 10000 });
    console.log('Page loaded successfully');

    // Make sure we're in round-trip mode (it's usually the default)
    console.log('Verifying round-trip is selected...');
    try {
      // Look for the trip options button (might be "Round trip" or similar text)
      const tripOptionSelector = 'div[aria-label="Trip type"][role="button"]';
      await page.waitForSelector(tripOptionSelector, { timeout: 5000 });
      
      // Get the current selected trip type
      const tripTypeText = await page.$eval(tripOptionSelector, el => el.textContent);
      
      // If not already set to Round trip, click to open dropdown and select it
      if (!tripTypeText.toLowerCase().includes('round trip')) {
        await page.click(tripOptionSelector);
        
        // Wait for the trip options menu to appear and click "Round trip"
        await page.waitForSelector('li[aria-label="Round trip"]', { timeout: 5000 });
        await page.click('li[aria-label="Round trip"]');
        console.log('Set to round-trip');
      } else {
        console.log('Already in round-trip mode');
      }
    } catch (error) {
      console.log('Could not verify trip type. Continuing with default (usually round-trip)...');
    }
    
    // Enter departure location
    console.log('Entering departure location...');
    await page.waitForSelector('input[placeholder="Where from?"]', { timeout: 10000 });
    await page.click('input[placeholder="Where from?"]');
    await page.type('input[placeholder="Where from?"]', from, { delay: 100 });
    
    // Wait for suggestions and click the first one
    await page.waitForSelector('li[role="option"]', { timeout: 10000 });
    await delay(1000); // Small delay to ensure suggestions are loaded
    await page.click('li[role="option"]:first-child');
    
    // Enter destination
    console.log('Entering destination...');
    await page.waitForSelector('input[placeholder="Where to?"]', { timeout: 10000 });
    await page.click('input[placeholder="Where to?"]');
    await page.type('input[placeholder="Where to?"]', to, { delay: 100 });
    
    // Wait for suggestions and click the first one
    await page.waitForSelector('li[role="option"]', { timeout: 10000 });
    await delay(1000); // Small delay to ensure suggestions are loaded
    await page.click('li[role="option"]:first-child');
    
    // Set departure date
    console.log('Setting departure date...');
    await enterDate(page, 'Departure', departDate);
    
    // Set return date
    console.log('Setting return date...');
    await enterDate(page, 'Return', returnDate);
    
    // Click the search button
    console.log('Executing search...');
    const searchButton = 'button[aria-label="Search"]';
    await page.waitForSelector(searchButton, { timeout: 10000 });
    await page.click(searchButton);
    
    // Wait for results to load
    console.log('Waiting for search results...');
    await page.waitForSelector('[role="list"] > div', { 
      timeout: 30000 
    });
    
    // Give extra time for results to fully load
    await delay(3000);
    
    // Extract flight information
    console.log('Extracting flight information...');
    const flights = await page.evaluate(() => {
      const flightElements = document.querySelectorAll('[role="list"] > div');
      
      return Array.from(flightElements).slice(0, 5).map(flightElement => {
        // Extract price
        const priceElement = flightElement.querySelector('[aria-label*="dollars"]');
        const price = priceElement ? priceElement.textContent.trim() : 'Price not found';
        
        // Extract airline
        const airlineElement = flightElement.querySelector('div[aria-label*="operated by"]');
        const airline = airlineElement ? airlineElement.textContent.trim() : 'Airline not found';
        
        // Extract departure and arrival times
        const timeElements = flightElement.querySelectorAll('div[role="row"] span[role="text"]');
        const times = Array.from(timeElements)
          .map(el => el.textContent.trim())
          .filter(text => text.match(/^[0-9]+:[0-9]+/)); // Filter for time format like "9:30 AM"
        
        const departureTime = times[0] || 'Time not found';
        const arrivalTime = times[1] || 'Time not found';
        
        // Extract duration
        const durationElement = flightElement.querySelector('div[aria-label*="Duration"]');
        const duration = durationElement ? durationElement.textContent.trim() : 'Duration not found';
        
        return {
          airline,
          departureTime,
          arrivalTime,
          duration,
          price
        };
      });
    });
    
    // Display the results
    console.log(`\nFound ${flights.length} round-trip flights from ${from} to ${to} (${departDate} - ${returnDate}):`);
    console.log('-----------------------------------------------------');
    flights.forEach((flight, index) => {
      console.log(`Flight ${index + 1}:`);
      console.log(`  Airline: ${flight.airline}`);
      console.log(`  Departure: ${flight.departureTime}`);
      console.log(`  Arrival: ${flight.arrivalTime}`);
      console.log(`  Duration: ${flight.duration}`);
      console.log(`  Price: ${flight.price}`);
      console.log('-----------------------------------------------------');
    });
    
    // Take a screenshot
    await page.screenshot({ path: 'google-flights-results.png' });
    console.log('Screenshot saved as google-flights-results.png');
    
    return flights;
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    // Keep the browser open for 10 seconds to see the results
    console.log('Keeping browser open for 10 seconds so you can see the results...');
    await delay(10000);
    
    // Close the browser
    await browser.close();
    console.log('Browser closed');
  }
}

// Helper function to enter dates
async function enterDate(page, fieldName, date) {
  // Click on the date field to open the calendar
  await page.waitForSelector(`input[placeholder="${fieldName}"]`, { timeout: 10000 });
  await page.click(`input[placeholder="${fieldName}"]`);
  
  // Alternative approach for date selection that's more robust
  console.log(`Using direct date input approach for ${fieldName}...`);
  try {
    // Clear any existing input in the date field
    await page.evaluate((field) => {
      const dateInputs = Array.from(document.querySelectorAll(`input[placeholder="${field}"]`));
      if (dateInputs.length > 0) {
        dateInputs[0].value = '';
      }
    }, fieldName);

    // Type the date directly in a format like "June 22, 2025"
    const [year, month, day] = date.split('-').map(num => parseInt(num, 10));
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const formattedDate = `${monthNames[month-1]} ${day}, ${year}`;
    console.log(`Entering date: ${formattedDate}`);
    
    await page.type(`input[placeholder="${fieldName}"]`, formattedDate, { delay: 100 });
    await page.keyboard.press('Enter');
    
    // Wait a moment for the date to be accepted
    await delay(1000);
    
    // Move focus away from date field to confirm
    await page.keyboard.press('Tab');
    
    console.log(`${fieldName} date entered successfully`);
  } catch (dateError) {
    console.error(`Error during direct date input for ${fieldName}:`, dateError);
    console.log(`Trying fallback date selection method for ${fieldName}...`);
    
    try {
      // Try clicking on any visible date in the calendar and then using keyboard navigation
      const anyDateSelector = 'div[data-iso] div[role="button"]';
      await page.waitForSelector(anyDateSelector, { timeout: 5000 });
      await page.click(anyDateSelector);
      
      // Use keyboard to navigate months
      // First go back to current month
      for (let i = 0; i < 12; i++) {
        await page.keyboard.press('ArrowLeft');
        await delay(100);
      }
      
      // Now navigate to desired month/year
      // This is a rough approach - we go forward by approximately the right number of months
      const today = new Date();
      const targetDate = new Date(year, month - 1, day);
      
      // Calculate months difference
      const monthsDiff = (year - today.getFullYear()) * 12 + (month - 1 - today.getMonth());
      
      // Navigate forward by that many months (Page Right goes forward a month)
      for (let i = 0; i < monthsDiff; i++) {
        await page.keyboard.press('PageDown');
        await delay(200);
      }
      
      // Now use arrow keys to select the specific day
      // This is approximate and may need adjustment
      for (let i = 0; i < day; i++) {
        await page.keyboard.press('ArrowRight');
        await delay(100);
      }
      
      // Select the date
      await page.keyboard.press('Enter');
      await delay(500);
      
      console.log(`${fieldName} date selected using keyboard navigation`);
    } catch (fallbackError) {
      console.error(`Fallback date selection for ${fieldName} also failed:`, fallbackError);
      throw new Error(`Unable to select ${fieldName} date using any method`);
    }
  }
}

// Run the flight search
const departureCity = 'Atlanta';
const destinationCity = 'New York';
const departureDate = '2025-06-22'; // Format: YYYY-MM-DD
const returnDate = '2025-06-25';    // Format: YYYY-MM-DD

searchFlights(departureCity, destinationCity, departureDate, returnDate)
  .then(flights => {
    console.log('Flight search completed successfully');
  })
  .catch(error => {
    console.error('Flight search failed:', error);
  }); 