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
