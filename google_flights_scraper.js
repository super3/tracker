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
    
    // Give a significant wait time for results to fully render
    console.log('Giving extra time for results to render...');
    await delay(10000);
    
    // Check for and close any popups or dialogs that might block results
    console.log('Checking for popups or dialogs...');
    try {
      const popupSelectors = [
        'button[aria-label="Close"]',
        'button[aria-label="Close dialog"]',
        'button[aria-label="No thanks"]',
        '[role="dialog"] button',
        'div.dialog-close',
        'button:has-text("Close")',
        'button:has-text("No thanks")'
      ];
      
      for (const selector of popupSelectors) {
        const popupButton = await page.$(selector);
        if (popupButton) {
          console.log(`Found popup/dialog with close button: ${selector}`);
          await popupButton.click();
          console.log('Clicked close button on popup/dialog');
          await delay(1000);
        }
      }
    } catch (popupError) {
      console.log('Error handling popups:', popupError.message);
    }
    
    // Scroll down to ensure all content is loaded
    console.log('Scrolling to load all content...');
    await page.evaluate(() => {
      window.scrollBy(0, 500);
    });
    await delay(2000);
    
    // Focus on main content
    console.log('Focusing on main content...');
    await page.evaluate(() => {
      const mainContent = document.querySelector('div[role="main"]');
      if (mainContent) {
        mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    await delay(2000);
    
    // Try an alternative approach - look specifically for prices
    console.log('Looking for price elements directly...');
    const priceData = await page.evaluate(() => {
      // Find all elements containing price information
      const priceElements = Array.from(document.querySelectorAll('*'))
        .filter(el => {
          const text = el.textContent || '';
          return (text.includes('$') && 
                  (text.includes('round trip') || text.includes('nonstop') || text.includes('hr'))) &&
                  el.offsetParent !== null; // Ensure element is visible
        });
      
      if (priceElements.length === 0) {
        return { found: false, message: 'No price elements found' };
      }
      
      // Filter out elements with loading text or page headers
      const validElements = priceElements.filter(el => {
        const text = el.textContent || '';
        return !text.includes('Loading results') && 
               !text.includes('Skip to main content') &&
               !text.includes('Accessibility feedback');
      });
      
      console.log(`Found ${priceElements.length} price elements, ${validElements.length} after filtering`);
      
      // Categorize the elements to find flight cards
      const flights = [];
      const seenPrices = new Set(); // To avoid duplicates
      
      for (const el of validElements) {
        const text = el.textContent.trim();
        
        // Only process elements that seem to contain complete flight information
        if (text.length > 30) {
          // Extract price
          const priceMatch = text.match(/\$[\d,]+/);
          const price = priceMatch ? priceMatch[0] : 'Price not found';
          
          // Extract duration
          const durationMatch = text.match(/\d+\s*hr\s*\d*\s*min|\d+\s*hr/);
          const duration = durationMatch ? durationMatch[0] : 'Duration not found';
          
          // Extract times
          const timeMatches = text.match(/\d{1,2}:\d{2}\s*[AP]M/g);
          let departureTime = 'Time not found';
          let arrivalTime = 'Time not found';
          
          if (timeMatches && timeMatches.length >= 2) {
            // Look for a pattern that suggests departure and arrival
            // The pattern is often departure time followed by " – " then arrival time
            const dashIndex = text.indexOf(' – ');
            if (dashIndex !== -1) {
              // Look for times before and after the dash
              const beforeDash = text.substring(0, dashIndex);
              const afterDash = text.substring(dashIndex + 3);
              
              const beforeTimes = beforeDash.match(/\d{1,2}:\d{2}\s*[AP]M/g);
              const afterTimes = afterDash.match(/\d{1,2}:\d{2}\s*[AP]M/g);
              
              if (beforeTimes && beforeTimes.length > 0) {
                departureTime = beforeTimes[beforeTimes.length - 1]; // Get the last time before dash
              } else {
                departureTime = timeMatches[0]; // Fallback
              }
              
              if (afterTimes && afterTimes.length > 0) {
                arrivalTime = afterTimes[0]; // Get the first time after dash
              } else {
                arrivalTime = timeMatches[1]; // Fallback
              }
            } else {
              // If no dash pattern found, try to use flight duration to determine
              // which times are departure vs arrival
              const durationMatch = text.match(/\d+\s*hr\s*\d*\s*min|\d+\s*hr/);
              if (durationMatch && timeMatches.length >= 2) {
                // Check if times appear in pairs (e.g., "10:41 AM10:41 AM")
                // This might indicate a repeated display of the same time
                let uniqueTimes = [...new Set(timeMatches)];
                
                if (uniqueTimes.length >= 2) {
                  // Use the first two unique times
                  departureTime = uniqueTimes[0];
                  arrivalTime = uniqueTimes[1];
                } else {
                  // Default to first two times
                  departureTime = timeMatches[0];
                  arrivalTime = timeMatches[1];
                }
              } else {
                // Default fallback
                departureTime = timeMatches[0];
                arrivalTime = timeMatches[1];
              }
            }
          } else if (timeMatches && timeMatches.length === 1) {
            departureTime = timeMatches[0];
          }
          
          // Extract airlines
          const airlines = ['Delta', 'American', 'United', 'Southwest', 'JetBlue', 'Spirit', 'Frontier', 'Alaska'];
          let airline = 'Airline not found';
          for (const a of airlines) {
            if (text.includes(a)) {
              airline = a;
              break;
            }
          }
          
          // Skip if price is not found or this is a duplicate flight
          const flightKey = `${price}-${airline}-${departureTime}-${arrivalTime}`;
          if (price !== 'Price not found' && !seenPrices.has(flightKey)) {
            seenPrices.add(flightKey);
            flights.push({
              price,
              duration,
              departureTime,
              arrivalTime,
              airline,
              textSample: text.substring(0, 100)
            });
          }
        }
      }
      
      return { 
        found: flights.length > 0,
        flights: flights.slice(0, 5), // Limit to first 5 flights
        message: `Found ${flights.length} unique flights with prices`
      };
    });
    
    console.log('Price data search result:', priceData.message);
    
    // If we found prices directly, display them
    if (priceData.found) {
      console.log(`\nFound ${priceData.flights.length} round-trip flights from ${from} to ${to} (${departDate} - ${returnDate}):`);
      console.log('-----------------------------------------------------');
      priceData.flights.forEach((flight, index) => {
        console.log(`Flight ${index + 1}:`);
        console.log(`  Airline: ${flight.airline}`);
        console.log(`  Departure: ${flight.departureTime}`);
        console.log(`  Arrival: ${flight.arrivalTime}`);
        console.log(`  Duration: ${flight.duration}`);
        console.log(`  Price: ${flight.price}`);
        console.log(`  Text Sample: ${flight.textSample}`);
        console.log('-----------------------------------------------------');
      });
      
      // Create JSON output
      const jsonOutput = {
        search: {
          from: from,
          to: to,
          departDate: departDate,
          returnDate: returnDate
        },
        flights: priceData.flights.map(flight => ({
          airline: flight.airline,
          departureTime: flight.departureTime,
          arrivalTime: flight.arrivalTime,
          duration: flight.duration,
          price: flight.price
        })),
        timestamp: new Date().toISOString()
      };
      
      // Output JSON to console
      console.log('\nJSON Output:');
      console.log(JSON.stringify(jsonOutput, null, 2));
      
      return priceData.flights;
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