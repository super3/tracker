// Google Flights scraper for round-trip flights
const puppeteer = require('puppeteer');

// Helper function for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Date utilities - pure functions that can be easily tested
 */
class DateUtils {
  static formatDateForInput(dateString) {
    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
    return {
      year,
      month,
      day,
      monthName: DateUtils.getMonthName(month),
      mmddyyyy: `${month}/${day}/${year}`,
      mmddyyyy_dash: `${month}-${day}-${year}`,
      fullText: `${DateUtils.getMonthName(month)} ${day}, ${year}`
    };
  }

  static getMonthName(monthNumber) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[monthNumber - 1];
  }

  static isValidDateString(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
    const date = new Date(year, month - 1, day);
    
    return date.getFullYear() === year && 
           date.getMonth() === month - 1 && 
           date.getDate() === day;
  }
}

/**
 * Flight search configuration and validation
 */
class FlightSearchConfig {
  constructor(from, to, departDate, returnDate) {
    this.from = from;
    this.to = to;
    this.departDate = departDate;
    this.returnDate = returnDate;
  }

  validate() {
    const errors = [];
    
    if (!this.from || this.from.trim().length === 0) {
      errors.push('Departure city is required');
    }
    
    if (!this.to || this.to.trim().length === 0) {
      errors.push('Destination city is required');
    }
    
    if (!DateUtils.isValidDateString(this.departDate)) {
      errors.push('Invalid departure date format. Use YYYY-MM-DD');
    }
    
    if (!DateUtils.isValidDateString(this.returnDate)) {
      errors.push('Invalid return date format. Use YYYY-MM-DD');
    }
    
    if (errors.length === 0) {
      const departureDate = new Date(this.departDate);
      const returnDate = new Date(this.returnDate);
      
      if (returnDate <= departureDate) {
        errors.push('Return date must be after departure date');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  getFormattedDepartDate() {
    return DateUtils.formatDateForInput(this.departDate);
  }

  getFormattedReturnDate() {
    return DateUtils.formatDateForInput(this.returnDate);
  }
}

/**
 * Browser configuration for puppeteer
 */
class BrowserConfig {
  static getDefaultConfig() {
    return {
      headless: false,
      defaultViewport: { width: 1200, height: 800 },
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage', 
        '--disable-accelerated-2d-canvas', 
        '--disable-gpu'
      ]
    };
  }

  static getHeadlessConfig() {
    return {
      ...BrowserConfig.getDefaultConfig(),
      headless: true
    };
  }
}

/**
 * Selector constants for better maintainability
 */
const SELECTORS = {
  MAIN_CONTENT: 'div[role="main"]',
  TRIP_TYPE_BUTTON: 'div[aria-label="Trip type"][role="button"]',
  ROUND_TRIP_OPTION: 'li[aria-label="Round trip"]',
  FROM_INPUT: 'input[placeholder="Where from?"]',
  TO_INPUT: 'input[placeholder="Where to?"]',
  SUGGESTION_OPTION: 'li[role="option"]',
  SEARCH_BUTTONS: [
    'button[aria-label="Search"]',
    'button[data-test-id="search-button"]',
    'button[data-test-id="submit-button"]',
    'button[aria-label*="search"]',
    'button.gws-flights__search-button',
    'button.gws-flights-form__search-button',
    'button:has-text("Search")'
  ],
  LOADING_INDICATORS: [
    '[role="progressbar"]', 
    '[aria-label*="Loading"]',
    '[aria-busy="true"]',
    '.loading-animation',
    '.progress-bar'
  ]
};

/**
 * Page interaction utilities
 */
class PageInteractions {
  constructor(page) {
    this.page = page;
  }

  async waitForSelector(selector, timeout = 10000) {
    return await this.page.waitForSelector(selector, { timeout });
  }

  async clickElement(selector) {
    await this.page.click(selector);
  }

  async typeText(selector, text, options = { delay: 100 }) {
    await this.page.type(selector, text, options);
  }

  async clearInput(selector) {
    await this.page.click(selector);
    await this.page.keyboard.down('Control');
    await this.page.keyboard.press('a');
    await this.page.keyboard.up('Control');
    await this.page.keyboard.press('Backspace');
    await delay(300);
  }

  async getInputValue(selector) {
    return await this.page.$eval(selector, el => el.value);
  }

  async selectFirstSuggestion() {
    await this.waitForSelector(SELECTORS.SUGGESTION_OPTION);
    await delay(1000);
    await this.clickElement(`${SELECTORS.SUGGESTION_OPTION}:first-child`);
  }
}

/**
 * Date entry strategies
 */
class DateEntryStrategies {
  constructor(pageInteractions) {
    this.pageInteractions = pageInteractions;
  }

  async tryDirectInput(fieldName, formattedDate) {
    try {
      console.log(`Trying direct input for ${fieldName}...`);
      const selector = `input[placeholder="${fieldName}"]`;
      
      await this.pageInteractions.clearInput(selector);
      await this.pageInteractions.typeText(selector, formattedDate.mmddyyyy);
      await this.pageInteractions.page.keyboard.press('Enter');
      await delay(1000);
      
      const value = await this.pageInteractions.getInputValue(selector);
      return value && value.length > 0;
    } catch (error) {
      console.log(`Direct input failed for ${fieldName}:`, error.message);
      return false;
    }
  }

  async tryAlternativeFormat(fieldName, formattedDate) {
    try {
      console.log(`Trying alternative format for ${fieldName}...`);
      const selector = `input[placeholder="${fieldName}"]`;
      
      await this.pageInteractions.clearInput(selector);
      await this.pageInteractions.typeText(selector, formattedDate.mmddyyyy_dash);
      await this.pageInteractions.page.keyboard.press('Enter');
      await delay(1000);
      
      const value = await this.pageInteractions.getInputValue(selector);
      return value && value.length > 0;
    } catch (error) {
      console.log(`Alternative format failed for ${fieldName}:`, error.message);
      return false;
    }
  }

  async tryFullTextFormat(fieldName, formattedDate) {
    try {
      console.log(`Trying full text format for ${fieldName}...`);
      const selector = `input[placeholder="${fieldName}"]`;
      
      await this.pageInteractions.clearInput(selector);
      await this.pageInteractions.typeText(selector, formattedDate.fullText);
      await this.pageInteractions.page.keyboard.press('Enter');
      await delay(1000);
      
      const value = await this.pageInteractions.getInputValue(selector);
      return value && value.length > 0;
    } catch (error) {
      console.log(`Full text format failed for ${fieldName}:`, error.message);
      return false;
    }
  }

  async tryNumberSequence(fieldName, formattedDate) {
    try {
      console.log(`Trying number sequence for ${fieldName}...`);
      const selector = `input[placeholder="${fieldName}"]`;
      
      await this.pageInteractions.page.focus(selector);
      await this.pageInteractions.clearInput(selector);
      
      await this.pageInteractions.page.keyboard.type(formattedDate.month.toString(), { delay: 100 });
      await delay(200);
      await this.pageInteractions.page.keyboard.press('Tab');
      await delay(200);
      await this.pageInteractions.page.keyboard.type(formattedDate.day.toString(), { delay: 100 });
      await delay(200);
      await this.pageInteractions.page.keyboard.press('Tab');
      await delay(200);
      await this.pageInteractions.page.keyboard.type(formattedDate.year.toString(), { delay: 100 });
      await delay(200);
      await this.pageInteractions.page.keyboard.press('Enter');
      await delay(1000);
      
      const value = await this.pageInteractions.getInputValue(selector);
      return value && value.length > 0;
    } catch (error) {
      console.log(`Number sequence failed for ${fieldName}:`, error.message);
      return false;
    }
  }
}

/**
 * Main flight scraper class
 */
class GoogleFlightsScraper {
  constructor(browserConfig = BrowserConfig.getDefaultConfig()) {
    this.browserConfig = browserConfig;
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    this.browser = await puppeteer.launch(this.browserConfig);
    this.page = await this.browser.newPage();
    this.page.setDefaultTimeout(60000);
    this.pageInteractions = new PageInteractions(this.page);
    this.dateEntryStrategies = new DateEntryStrategies(this.pageInteractions);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async navigateToGoogleFlights() {
    console.log('Navigating to Google Flights...');
    await this.page.goto('https://www.google.com/travel/flights', { 
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    await this.pageInteractions.waitForSelector(SELECTORS.MAIN_CONTENT, 30000);
    console.log('Page loaded successfully');
  }

  async ensureRoundTripMode() {
    console.log('Verifying round-trip is selected...');
    try {
      await this.pageInteractions.waitForSelector(SELECTORS.TRIP_TYPE_BUTTON, 5000);
      
      const tripTypeText = await this.page.$eval(SELECTORS.TRIP_TYPE_BUTTON, el => el.textContent);
      
      if (!tripTypeText.toLowerCase().includes('round trip')) {
        await this.pageInteractions.clickElement(SELECTORS.TRIP_TYPE_BUTTON);
        await this.pageInteractions.waitForSelector(SELECTORS.ROUND_TRIP_OPTION, 5000);
        await this.pageInteractions.clickElement(SELECTORS.ROUND_TRIP_OPTION);
        console.log('Set to round-trip');
      } else {
        console.log('Already in round-trip mode');
      }
    } catch (error) {
      console.log('Could not verify trip type. Continuing with default (usually round-trip)...');
    }
  }

  async enterLocation(inputSelector, location) {
    await this.pageInteractions.waitForSelector(inputSelector);
    await this.pageInteractions.clickElement(inputSelector);
    await this.pageInteractions.typeText(inputSelector, location);
    await this.pageInteractions.selectFirstSuggestion();
  }

  async enterDepartureLocation(from) {
    console.log('Entering departure location...');
    await this.enterLocation(SELECTORS.FROM_INPUT, from);
  }

  async enterDestination(to) {
    console.log('Entering destination...');
    await this.enterLocation(SELECTORS.TO_INPUT, to);
  }

  async enterDate(fieldName, formattedDate) {
    console.log(`Setting ${fieldName} date...`);
    
    const strategies = [
      () => this.dateEntryStrategies.tryDirectInput(fieldName, formattedDate),
      () => this.dateEntryStrategies.tryAlternativeFormat(fieldName, formattedDate),
      () => this.dateEntryStrategies.tryFullTextFormat(fieldName, formattedDate),
      () => this.dateEntryStrategies.tryNumberSequence(fieldName, formattedDate)
    ];

    for (const strategy of strategies) {
      if (await strategy()) {
        console.log(`Successfully entered ${fieldName} date`);
        await this.page.keyboard.press('Tab');
        await delay(500);
        return true;
      }
    }
    
    console.log(`All date entry methods failed for ${fieldName}`);
    return false;
  }

  async clickSearchButton() {
    console.log('Executing search...');
    
    for (const selector of SELECTORS.SEARCH_BUTTONS) {
      try {
        const buttonExists = await this.page.$(selector);
        if (buttonExists) {
          await this.pageInteractions.clickElement(selector);
          console.log(`Clicked search button with selector: ${selector}`);
          return true;
        }
      } catch (e) {
        continue;
      }
    }
    
    // Fallback to generic search
    return await this.page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      
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
      return false;
    });
  }

  async waitForResults() {
    console.log('Waiting for search results...');
    
    // Wait for loading indicators to disappear
    for (const selector of SELECTORS.LOADING_INDICATORS) {
      try {
        const loadingElement = await this.page.$(selector);
        if (loadingElement) {
          await this.page.waitForFunction(
            (sel) => !document.querySelector(sel) || document.querySelector(sel).getAttribute('aria-hidden') === 'true', 
            { timeout: 60000 },
            selector
          );
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    // Wait for URL change
    try {
      await this.page.waitForFunction(
        () => window.location.href.includes('flights/search') || 
              window.location.href.includes('flights/results') || 
              window.location.href.includes('flights?'), 
        { timeout: 30000 }
      );
    } catch (e) {
      console.log('URL did not change as expected, but continuing...');
    }
    
    await delay(10000); // Extra time for results to render
  }

  async searchFlights(config) {
    const validation = config.validate();
    if (!validation.isValid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    console.log(`Searching for flights from ${config.from} to ${config.to} (${config.departDate} - ${config.returnDate})`);
    
    try {
      await this.initialize();
      await this.navigateToGoogleFlights();
      await this.ensureRoundTripMode();
      await this.enterDepartureLocation(config.from);
      await this.enterDestination(config.to);
      await this.enterDate('Departure', config.getFormattedDepartDate());
      await this.enterDate('Return', config.getFormattedReturnDate());
      
      const searchSuccess = await this.clickSearchButton();
      if (!searchSuccess) {
        throw new Error('Could not find or click search button');
      }
      
      await this.waitForResults();
      
      console.log('Flight search completed successfully');
      return { success: true, message: 'Search completed' };
      
    } finally {
      await this.cleanup();
    }
  }
}

// Factory function for creating flight search configurations
function createFlightSearchConfig(from, to, departDate, returnDate) {
  return new FlightSearchConfig(from, to, departDate, returnDate);
}

// Factory function for creating scrapers
function createScraper(headless = false) {
  const config = headless ? BrowserConfig.getHeadlessConfig() : BrowserConfig.getDefaultConfig();
  return new GoogleFlightsScraper(config);
}

// Main function for backward compatibility
async function searchFlights(from, to, departDate, returnDate) {
  const config = createFlightSearchConfig(from, to, departDate, returnDate);
  const scraper = createScraper();
  return await scraper.searchFlights(config);
}

// Module exports
module.exports = {
  DateUtils,
  FlightSearchConfig,
  BrowserConfig,
  GoogleFlightsScraper,
  createFlightSearchConfig,
  createScraper,
  searchFlights,
  SELECTORS,
  delay
};

// Run if this file is executed directly
if (require.main === module) {
  const departureCity = 'Atlanta';
  const destinationCity = 'New York';
  const departureDate = '2025-06-22';
  const returnDate = '2025-06-25';

  searchFlights(departureCity, destinationCity, departureDate, returnDate)
    .then(result => {
      console.log('Flight search completed:', result);
    })
    .catch(error => {
      console.error('Flight search failed:', error);
    });
} 