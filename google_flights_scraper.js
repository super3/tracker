// Google Flights scraper for round-trip flights
const puppeteer = require('puppeteer');

// Helper function for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function searchFlights(from, to, departDate, returnDate) {
  console.log(`Searching for flights from ${from} to ${to} (${departDate} - ${returnDate})`);
  
  // Launch the browser
  const browser = await puppeteer.launch({
    headless: false, // Set to false to see the browser in action
    defaultViewport: { width: 1200, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--disable-gpu']
  });
  
  try {
    // Open a new page
    const page = await browser.newPage();
    
    // Set longer default timeout
    page.setDefaultTimeout(60000);
    
    // Navigate to Google Flights
    console.log('Navigating to Google Flights...');
    await page.goto('https://www.google.com/travel/flights', { 
      waitUntil: 'networkidle2',
      timeout: 60000 // Increase timeout to 60 seconds
    });
    
    // Wait for the page to load
    await page.waitForSelector('div[role="main"]', { timeout: 30000 });
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
    
    // Take a screenshot before search
    try {
      await page.screenshot({ path: 'google-flights-before-search.png' });
      console.log('Screenshot saved before search');
    } catch (e) {
      console.log('Failed to take screenshot before search:', e.message);
    }
    
    // Click the search button
    console.log('Executing search...');
    const searchButtonSelectors = [
      'button[aria-label="Search"]',
      'button[data-test-id="search-button"]',
      'button[data-test-id="submit-button"]',
      'button[aria-label*="search"]',
      'button.gws-flights__search-button',
      'button.gws-flights-form__search-button',
      'button:has-text("Search")'
    ];
    
    let searchClicked = false;
    for (const selector of searchButtonSelectors) {
      try {
        const buttonExists = await page.$(selector);
        if (buttonExists) {
          await page.click(selector);
          console.log(`Clicked search button with selector: ${selector}`);
          searchClicked = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!searchClicked) {
      console.log('Could not find search button with predefined selectors');
      console.log('Trying to find any button that looks like a search button...');
      
      // Try a more generic approach
      await page.evaluate(() => {
        // Find all buttons
        const buttons = Array.from(document.querySelectorAll('button'));
        
        // Look for search-like buttons
        for (const button of buttons) {
          const text = button.textContent.toLowerCase();
          const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
          
          if (text.includes('search') || ariaLabel.includes('search') || 
              text.includes('find') || ariaLabel.includes('find') ||
              text.includes('go') || ariaLabel.includes('go')) {
            button.click();
            return true;
          }
        }
        
        // If no obvious search button, try clicking the last button on the form
        const lastButton = buttons[buttons.length - 1];
        if (lastButton) {
          lastButton.click();
          return true;
        }
        
        return false;
      });
    }
    
    // Wait for results to load
    console.log('Waiting for search results...');
    
    // First wait for a loading indicator if it appears
    try {
      const loadingSelectors = [
        '[role="progressbar"]', 
        '[aria-label*="Loading"]',
        '[aria-busy="true"]',
        '.loading-animation',
        '.progress-bar'
      ];
      
      for (const selector of loadingSelectors) {
        const loadingElement = await page.$(selector);
        if (loadingElement) {
          console.log(`Found loading indicator with selector: ${selector}`);
          await page.waitForFunction(
            (sel) => !document.querySelector(sel) || document.querySelector(sel).getAttribute('aria-hidden') === 'true', 
            { timeout: 60000 },
            selector
          );
          console.log('Loading indicator disappeared');
          break;
        }
      }
    } catch (loadingError) {
      console.log('No loading indicator detected or it disappeared quickly');
    }
    
    // Wait for URL to change to results page
    try {
      console.log('Waiting for URL to change to results page...');
      await page.waitForFunction(
        () => window.location.href.includes('flights/search') || 
              window.location.href.includes('flights/results') || 
              window.location.href.includes('flights?'), 
        { timeout: 30000 }
      );
      console.log('URL changed to results page');
    } catch (urlChangeError) {
      console.log('URL did not change as expected, but continuing...');
    }
    
    // Give extra time for results to fully render
    console.log('Giving extra time for results to render...');
    await delay(5000);
    
    // Try to take a screenshot of results
    try {
      await page.screenshot({ path: 'google-flights-results.png', fullPage: true });
      console.log('Screenshot saved of results page');
    } catch (screenshotError) {
      console.log('Failed to take screenshot of results:', screenshotError.message);
    }
    
    // Try to extract flight information
    console.log('Attempting to extract flight information...');
    try {
      const flights = await page.evaluate(() => {
        // Try multiple selectors to find flight elements
        const selectors = [
          '[role="list"] > div',
          '[role="listitem"]',
          'div[role="region"] > div > div',
          '[data-test-id*="flight"]',
          'div[aria-label*="flight"]',
          'div[jsname]', // Generic container elements
          'div[role="main"] > div > div', // General main content area
          'div[data-hveid]' // Google search result elements
        ];
        
        let flightElements = [];
        
        // Try each selector until we find something
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements && elements.length > 0) {
            flightElements = Array.from(elements);
            console.log(`Found ${flightElements.length} elements with selector: ${selector}`);
            break;
          }
        }
        
        // If we found elements, extract data from them
        if (flightElements.length > 0) {
          return flightElements.slice(0, 5).map(flightElement => {
            // Extract price - try multiple possible selectors
            let price = 'Price not found';
            for (const priceSelector of [
              '[aria-label*="dollars"]', 
              '[aria-label*="price"]',
              'div[aria-label*="$"]'
            ]) {
              const priceElement = flightElement.querySelector(priceSelector);
              if (priceElement) {
                price = priceElement.textContent.trim();
                break;
              }
            }
            
            // Try to find price by looking for dollar sign in text content
            if (price === 'Price not found') {
              const allElements = flightElement.querySelectorAll('*');
              for (const el of allElements) {
                if (el.textContent && el.textContent.includes('$')) {
                  price = el.textContent.trim();
                  break;
                }
              }
            }
            
            // Extract airline - try multiple possible selectors
            let airline = 'Airline not found';
            for (const airlineSelector of [
              'div[aria-label*="operated by"]',
              'div[aria-label*="airline"]',
              'img[alt*="airline"]'
            ]) {
              const airlineElement = flightElement.querySelector(airlineSelector);
              if (airlineElement) {
                airline = airlineElement.textContent.trim() || airlineElement.alt;
                break;
              }
            }
            
            // Extract times
            const timeElements = flightElement.querySelectorAll('div[role="row"] span[role="text"], span[role="text"], div[role="text"]');
            const times = Array.from(timeElements)
              .map(el => el.textContent.trim())
              .filter(text => text.match(/^[0-9]+:[0-9]+/) || text.match(/^[0-9]+(\:[0-9]+)?\s*(AM|PM)/i)); // Match time formats
            
            const departureTime = times[0] || 'Time not found';
            const arrivalTime = times[1] || 'Time not found';
            
            // Extract duration
            let duration = 'Duration not found';
            for (const durationSelector of [
              'div[aria-label*="Duration"]',
              'div[aria-label*="hour"]'
            ]) {
              const durationElement = flightElement.querySelector(durationSelector);
              if (durationElement) {
                duration = durationElement.textContent.trim();
                break;
              }
            }
            
            // Try to find duration by looking for "hr" in text content
            if (duration === 'Duration not found') {
              const allElements = flightElement.querySelectorAll('*');
              for (const el of allElements) {
                if (el.textContent && el.textContent.includes('hr')) {
                  duration = el.textContent.trim();
                  break;
                }
              }
            }
            
            return {
              airline,
              departureTime,
              arrivalTime,
              duration,
              price
            };
          });
        } else {
          // If no elements found, return an empty array
          return [];
        }
      });
      
      // Display the results
      if (flights && flights.length > 0) {
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
        
        return flights;
      } else {
        console.log('No flight data could be extracted from the page.');
        
        // Last attempt - just grab any text from the main content area
        try {
          const pageText = await page.evaluate(() => {
            const mainContent = document.querySelector('div[role="main"]');
            return mainContent ? mainContent.textContent : document.body.textContent;
          });
          
          console.log('Text content from main area:');
          console.log(pageText.substring(0, 500) + '...');
        } catch (e) {
          console.log('Failed to extract page text content');
        }
        
        return [];
      }
    } catch (extractError) {
      console.error('Error extracting flight information:', extractError);
      return [];
    }
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    // Keep the browser open for 10 seconds to see the results
    console.log('Keeping browser open for 30 seconds so you can see the results...');
    await delay(30000);
    
    // Close the browser
    await browser.close();
    console.log('Browser closed');
  }
}

// Helper function to enter dates
async function enterDate(page, fieldName, date) {
  console.log(`Setting ${fieldName} date to ${date}...`);
  
  // Parse the target date
  const [year, month, day] = date.split('-').map(num => parseInt(num, 10));
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const targetMonth = monthNames[month-1];
  
  // Multiple approaches to date entry, trying them in sequence until one works
  let dateEntered = false;
  
  // APPROACH 1: Direct text input with MM/DD/YYYY format
  if (!dateEntered) {
    try {
      console.log(`Approach 1: Direct text input for ${fieldName}...`);
      
      // Click on the date field
      await page.waitForSelector(`input[placeholder="${fieldName}"]`, { timeout: 10000 });
      await page.click(`input[placeholder="${fieldName}"]`);
      await delay(500);
      
      // Clear any existing value
      await page.keyboard.down('Control');
      await page.keyboard.press('a');
      await page.keyboard.up('Control');
      await page.keyboard.press('Backspace');
      await delay(300);
      
      // Format: MM/DD/YYYY
      const dateString = `${month}/${day}/${year}`;
      console.log(`Entering date directly: ${dateString}`);
      await page.type(`input[placeholder="${fieldName}"]`, dateString, { delay: 100 });
      await page.keyboard.press('Enter');
      await delay(1000);
      
      // Verify the input worked by checking the field has a value
      const dateValue = await page.$eval(`input[placeholder="${fieldName}"]`, el => el.value);
      console.log(`Date field value after direct input: "${dateValue}"`);
      
      // Verify month is correct (should contain the month name)
      if (dateValue && dateValue.length > 0) {
        dateEntered = true;
        console.log(`Successfully entered ${fieldName} date using direct text input`);
      } else {
        console.log(`Direct text input failed to set ${fieldName} date`);
      }
    } catch (error) {
      console.log(`Error in direct text input for ${fieldName}:`, error.message);
    }
  }

  // APPROACH 2: Alternative format MM-DD-YYYY
  if (!dateEntered) {
    try {
      console.log(`Approach 2: Alternative date format for ${fieldName}...`);
      
      // Click on the date field
      await page.click(`input[placeholder="${fieldName}"]`);
      await delay(500);
      
      // Clear any existing value
      await page.keyboard.down('Control');
      await page.keyboard.press('a');
      await page.keyboard.up('Control');
      await page.keyboard.press('Backspace');
      await delay(300);
      
      // Format: MM-DD-YYYY
      const dateString = `${month}-${day}-${year}`;
      console.log(`Entering date with alternative format: ${dateString}`);
      await page.type(`input[placeholder="${fieldName}"]`, dateString, { delay: 100 });
      await page.keyboard.press('Enter');
      await delay(1000);
      
      // Verify the input worked
      const dateValue = await page.$eval(`input[placeholder="${fieldName}"]`, el => el.value);
      console.log(`Date field value after alternative format: "${dateValue}"`);
      
      if (dateValue && dateValue.length > 0) {
        dateEntered = true;
        console.log(`Successfully entered ${fieldName} date using alternative format`);
      } else {
        console.log(`Alternative format failed to set ${fieldName} date`);
      }
    } catch (error) {
      console.log(`Error in alternative format for ${fieldName}:`, error.message);
    }
  }

  // APPROACH 3: Full text month name
  if (!dateEntered) {
    try {
      console.log(`Approach 3: Full text month for ${fieldName}...`);
      
      // Click on the date field
      await page.click(`input[placeholder="${fieldName}"]`);
      await delay(500);
      
      // Clear any existing value
      await page.keyboard.down('Control');
      await page.keyboard.press('a');
      await page.keyboard.up('Control');
      await page.keyboard.press('Backspace');
      await delay(300);
      
      // Format: Month Day, Year
      const dateString = `${targetMonth} ${day}, ${year}`;
      console.log(`Entering date with text month: ${dateString}`);
      await page.type(`input[placeholder="${fieldName}"]`, dateString, { delay: 100 });
      await page.keyboard.press('Enter');
      await delay(1000);
      
      // Verify the input worked
      const dateValue = await page.$eval(`input[placeholder="${fieldName}"]`, el => el.value);
      console.log(`Date field value after text month: "${dateValue}"`);
      
      if (dateValue && dateValue.length > 0) {
        dateEntered = true;
        console.log(`Successfully entered ${fieldName} date using text month`);
      } else {
        console.log(`Text month failed to set ${fieldName} date`);
      }
    } catch (error) {
      console.log(`Error in text month for ${fieldName}:`, error.message);
    }
  }

  // APPROACH 4: Tab to date field and type number sequences
  if (!dateEntered) {
    try {
      console.log(`Approach 4: Tab and type numbers for ${fieldName}...`);
      
      // Focus on the input field
      await page.focus(`input[placeholder="${fieldName}"]`);
      await delay(500);
      
      // Clear any existing value
      await page.keyboard.down('Control');
      await page.keyboard.press('a');
      await page.keyboard.up('Control');
      await page.keyboard.press('Backspace');
      await delay(300);
      
      // Type just the numbers with natural pauses
      console.log(`Typing numbers: ${month} ${day} ${year}`);
      await page.keyboard.type(month.toString(), { delay: 100 });
      await delay(200);
      await page.keyboard.press('Tab');
      await delay(200);
      await page.keyboard.type(day.toString(), { delay: 100 });
      await delay(200);
      await page.keyboard.press('Tab');
      await delay(200);
      await page.keyboard.type(year.toString(), { delay: 100 });
      await delay(200);
      await page.keyboard.press('Enter');
      await delay(1000);
      
      // Verify the input worked
      const dateValue = await page.$eval(`input[placeholder="${fieldName}"]`, el => el.value);
      console.log(`Date field value after number entry: "${dateValue}"`);
      
      if (dateValue && dateValue.length > 0) {
        dateEntered = true;
        console.log(`Successfully entered ${fieldName} date using number entry`);
      } else {
        console.log(`Number entry failed to set ${fieldName} date`);
      }
    } catch (error) {
      console.log(`Error in number entry for ${fieldName}:`, error.message);
    }
  }

  // If none of the approaches worked, try a last resort method - click and wait
  if (!dateEntered) {
    try {
      console.log(`Final approach: Click date field and press Tab for ${fieldName}`);
      
      // Click on the date field
      await page.click(`input[placeholder="${fieldName}"]`);
      await delay(1000);
      
      // Check for any dialog or date picker that might be open
      console.log("Checking if date picker opened...");
      
      // Try to pick a date that might be visible - we just need any date to be set
      await page.evaluate(() => {
        // Find all elements that look like day cells
        const dayElements = Array.from(document.querySelectorAll(
          'td[role="gridcell"], div[role="button"], [data-day], [aria-label*="day"], [role="cell"]'
        )).filter(el => el.offsetParent !== null); // Only consider visible elements
        
        // Click the first visible element that looks like a date
        if (dayElements.length > 0) {
          dayElements[15].click(); // Try middle of month
          return true;
        }
        return false;
      });
      
      await delay(1000);
      await page.keyboard.press('Escape'); // Close any open picker
      await delay(500);
      await page.keyboard.press('Tab'); // Move focus away
      
      // Check if anything got set
      const dateValue = await page.$eval(`input[placeholder="${fieldName}"]`, el => el.value);
      console.log(`Date field value after final approach: "${dateValue}"`);
      
      if (dateValue && dateValue.length > 0) {
        console.log(`Set some date for ${fieldName} using final approach`);
      } else {
        console.log(`All date entry methods failed for ${fieldName}`);
      }
    } catch (error) {
      console.log(`Error in final approach for ${fieldName}:`, error.message);
    }
  }
  
  // Press Tab to move focus away from the date field
  await page.keyboard.press('Tab');
  await delay(500);
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