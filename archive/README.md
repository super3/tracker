# Web Scraping with Puppeteer

This repository contains examples of web scraping using Puppeteer, a Node.js library for controlling headless Chrome or Chromium.

## Examples

### 1. Basic URL Scraper

A simple script that extracts all URLs from a webpage.

### 2. Google Flights Scraper

An advanced script that searches for flight prices between cities on a specific date.

## Installation

1. Make sure you have Node.js installed (version 14.x or later recommended)
2. Clone this repository or download the files
3. Install the dependencies:

```bash
npm init -y
npm install puppeteer
```

## Basic URL Scraper

The `puppeteer_test.js` script extracts all hyperlinks from a webpage.

### Usage

```bash
node puppeteer_test.js
```

### Features

- Opens a visible browser window
- Extracts all hyperlinks from the target webpage
- Filters out non-HTTP links and empty URLs
- Prints the list of found URLs to the console

## Google Flights Scraper

The `google_flights_scraper.js` script searches for flights on Google Flights.

### Usage

```bash
node google_flights_scraper.js
```

By default, it searches for one-way flights from Atlanta to New York on June 22, 2025. You can modify the script to change these parameters.

### Features

- Navigates to Google Flights
- Sets search parameters (departure city, destination city, date)
- Configures for one-way flights
- Extracts flight information including:
  - Airlines
  - Departure and arrival times
  - Flight duration
  - Prices
- Takes a screenshot of the results
- Keeps the browser open for 10 seconds so you can see the results

### Customization

You can modify both scripts to:

- Run in headless mode by changing `headless: false` to `headless: true`
- Adjust viewport size by modifying the `defaultViewport` settings
- Extract different types of content
- Change the target websites

## License

MIT

# Budget Vacay Flight Scraper

A modular, testable Google Flights scraper built with Puppeteer for the Budget Vacay travel search application.

## Features

- 🧪 **Fully Testable**: Modular architecture with comprehensive unit tests
- 🔧 **Configurable**: Easy to configure browser settings and search parameters
- 📅 **Smart Date Handling**: Multiple date entry strategies with validation
- 🔍 **Robust Selectors**: Fallback selectors for reliable automation
- 📊 **Type Safety**: Clear interfaces and validation for all inputs
- 🎯 **Error Handling**: Graceful error handling and cleanup

## Installation

```bash
npm install
```

## Quick Start

### Basic Usage

```javascript
const { searchFlights } = require('./google_flights_scraper');

// Simple search
searchFlights('Atlanta', 'New York', '2025-06-22', '2025-06-25')
  .then(result => console.log('Search completed:', result))
  .catch(error => console.error('Search failed:', error));
```

### Advanced Usage

```javascript
const { 
  createFlightSearchConfig, 
  createScraper 
} = require('./google_flights_scraper');

// Create configuration with validation
const config = createFlightSearchConfig('Atlanta', 'New York', '2025-06-22', '2025-06-25');
const validation = config.validate();

if (!validation.isValid) {
  console.error('Invalid configuration:', validation.errors);
  return;
}

// Create headless scraper
const scraper = createScraper(true); // headless = true

// Run search
scraper.searchFlights(config)
  .then(result => console.log('Success:', result))
  .catch(error => console.error('Error:', error));
```

## API Reference

### Classes

#### `DateUtils`
Static utility class for date operations.

```javascript
const { DateUtils } = require('./google_flights_scraper');

// Format date for input fields
const formatted = DateUtils.formatDateForInput('2025-06-22');
// Returns: { year: 2025, month: 6, day: 22, monthName: 'June', ... }

// Validate date string
const isValid = DateUtils.isValidDateString('2025-06-22'); // true

// Get month name
const monthName = DateUtils.getMonthName(6); // 'June'
```

#### `FlightSearchConfig`
Configuration class with validation.

```javascript
const { FlightSearchConfig } = require('./google_flights_scraper');

const config = new FlightSearchConfig('Atlanta', 'New York', '2025-06-22', '2025-06-25');

// Validate configuration
const validation = config.validate();
if (validation.isValid) {
  console.log('Config is valid');
} else {
  console.log('Errors:', validation.errors);
}

// Get formatted dates
const departDate = config.getFormattedDepartDate();
const returnDate = config.getFormattedReturnDate();
```

#### `BrowserConfig`
Browser configuration utilities.

```javascript
const { BrowserConfig } = require('./google_flights_scraper');

// Get default config (headless: false)
const defaultConfig = BrowserConfig.getDefaultConfig();

// Get headless config
const headlessConfig = BrowserConfig.getHeadlessConfig();
```

#### `GoogleFlightsScraper`
Main scraper class.

```javascript
const { GoogleFlightsScraper, BrowserConfig } = require('./google_flights_scraper');

const scraper = new GoogleFlightsScraper(BrowserConfig.getHeadlessConfig());

// Initialize browser
await scraper.initialize();

// Navigate to Google Flights
await scraper.navigateToGoogleFlights();

// Cleanup
await scraper.cleanup();
```

### Factory Functions

#### `createFlightSearchConfig(from, to, departDate, returnDate)`
Creates a new `FlightSearchConfig` instance.

#### `createScraper(headless = false)`
Creates a new `GoogleFlightsScraper` instance with appropriate browser configuration.

#### `searchFlights(from, to, departDate, returnDate)`
Main convenience function for backward compatibility.

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

The test suite includes:

- ✅ **DateUtils**: Date formatting, validation, and month name utilities
- ✅ **FlightSearchConfig**: Configuration validation and error handling
- ✅ **BrowserConfig**: Browser configuration utilities
- ✅ **GoogleFlightsScraper**: Browser automation and search flow
- ✅ **Factory Functions**: Creation utilities
- ✅ **Integration Tests**: End-to-end functionality
- ✅ **Edge Cases**: Leap years, invalid dates, error conditions

### Coverage Thresholds

- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## Running the Scraper

### Command Line

```bash
# Run with default settings (visible browser)
npm run scrape

# Run headless
npm run scrape:headless
```

### Programmatic Usage

```javascript
// Using the main function
const { searchFlights } = require('./google_flights_scraper');
await searchFlights('Atlanta', 'New York', '2025-06-22', '2025-06-25');

// Using classes directly
const { createFlightSearchConfig, createScraper } = require('./google_flights_scraper');

const config = createFlightSearchConfig('Atlanta', 'New York', '2025-06-22', '2025-06-25');
const scraper = createScraper(true); // headless
await scraper.searchFlights(config);
```

## Configuration

### Date Format
All dates must be in `YYYY-MM-DD` format:
- ✅ `2025-06-22`
- ❌ `2025-6-22`
- ❌ `06/22/2025`

### Browser Settings
The scraper supports various browser configurations:

```javascript
const customConfig = {
  headless: true,
  defaultViewport: { width: 1920, height: 1080 },
  args: ['--no-sandbox', '--disable-web-security']
};

const scraper = new GoogleFlightsScraper(customConfig);
```

## Error Handling

The scraper includes comprehensive error handling:

```javascript
try {
  const result = await searchFlights('Atlanta', 'New York', '2025-06-22', '2025-06-25');
  console.log('Success:', result);
} catch (error) {
  if (error.message.includes('Invalid configuration')) {
    console.error('Configuration error:', error.message);
  } else if (error.message.includes('Navigation failed')) {
    console.error('Browser error:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Validation

Input validation is built-in:

```javascript
const config = createFlightSearchConfig('', '', 'invalid-date', 'invalid-date');
const validation = config.validate();

console.log(validation.isValid); // false
console.log(validation.errors);  // Array of error messages
```

## Architecture

The refactored scraper follows these principles:

1. **Separation of Concerns**: Business logic separated from browser automation
2. **Testability**: Pure functions and dependency injection
3. **Modularity**: Each class has a single responsibility
4. **Error Handling**: Graceful error handling and cleanup
5. **Configuration**: Flexible configuration system
6. **Validation**: Input validation with clear error messages

## Browser Compatibility

Tested with:
- Chrome/Chromium (recommended)
- Puppeteer default browser

## Troubleshooting

### Common Issues

1. **Date Validation Errors**
   - Ensure dates are in `YYYY-MM-DD` format
   - Check that return date is after departure date

2. **Browser Launch Failures**
   - Try running in headless mode
   - Check that Puppeteer is properly installed

3. **Selector Not Found**
   - Google Flights may have updated their UI
   - Check the `SELECTORS` constant for current selectors

### Debug Mode

Run with visible browser to debug issues:
```javascript
const scraper = createScraper(false); // visible browser
```

## Contributing

When contributing:

1. Write tests for new functionality
2. Maintain test coverage above 80%
3. Follow the existing architecture patterns
4. Update documentation for API changes

## License

MIT License - see LICENSE file for details.
