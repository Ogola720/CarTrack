const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const MockDataScraper = require('./mockDataScraper');

class JapanCarScraper {
  constructor() {
    this.browser = null;
    this.mockScraper = new MockDataScraper();
    this.useMockData = process.env.USE_MOCK_DATA === 'true' || false;
    this.sources = [
      {
        name: 'USS Auction',
        baseUrl: 'https://www.ussnet.co.jp',
        searchPath: '/search',
        enabled: true
      },
      {
        name: 'Goo-net',
        baseUrl: 'https://www.goo-net.com',
        searchPath: '/usedcar/search',
        enabled: true
      }
    ];
  }

  async initialize() {
    console.log('Initializing scraper with USE_MOCK_DATA:', process.env.USE_MOCK_DATA);
    console.log('Initial useMockData value:', this.useMockData);

    if (this.useMockData) {
      console.log('Mock data enabled, skipping browser initialization');
      return;
    }

    try {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ],
        timeout: 60000
      });
      console.log('Puppeteer browser initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Puppeteer browser:', error.message);
      console.log('Will use mock data instead');
      this.useMockData = true;
    }
  }

  async scrapeGooNet(searchParams = {}) {
    const page = await this.browser.newPage();
    const results = [];

    try {
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

      // Navigate to Goo-net search page
      const searchUrl = 'https://www.goo-net.com/usedcar/search/';
      await page.goto(searchUrl, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });

      // Apply search filters if provided
      if (searchParams.make) {
        await page.select('#maker', searchParams.make);
        await page.waitForTimeout(1000);
      }

      // Get search results
      const content = await page.content();
      const $ = cheerio.load(content);

      $('.usedcar-list-item').each((index, element) => {
        const $item = $(element);

        const car = {
          make: $item.find('.maker-name').text().trim(),
          model: $item.find('.model-name').text().trim(),
          year: parseInt($item.find('.year').text().replace(/[^\d]/g, '')),
          price: this.parsePrice($item.find('.price').text()),
          mileage: this.parseMileage($item.find('.mileage').text()),
          location: $item.find('.location').text().trim(),
          url: $item.find('a').attr('href'),
          source: 'Goo-net',
          scrapedAt: new Date()
        };

        if (car.make && car.model && car.price) {
          results.push(car);
        }
      });

    } catch (error) {
      console.error('Error scraping Goo-net:', error);
    } finally {
      await page.close();
    }

    return results;
  }

  async scrapeUSSAuction() {
    // USS Auction requires special handling due to authentication
    // This is a simplified version - real implementation would need proper auth
    const results = [];

    try {
      const response = await axios.get('https://www.ussnet.co.jp/api/search', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });

      // Parse USS auction data (format varies)
      if (response.data && response.data.results) {
        response.data.results.forEach(item => {
          const car = {
            make: item.maker,
            model: item.model,
            year: item.year,
            price: item.price,
            mileage: item.mileage,
            auctionGrade: item.grade,
            auctionDate: item.auctionDate,
            source: 'USS Auction',
            scrapedAt: new Date()
          };

          results.push(car);
        });
      }
    } catch (error) {
      console.error('Error scraping USS Auction:', error);
    }

    return results;
  }

  parsePrice(priceText) {
    if (!priceText) return null;

    // Remove non-numeric characters except decimal points
    const cleanPrice = priceText.replace(/[^\d.]/g, '');
    const price = parseFloat(cleanPrice);

    // Convert to JPY if needed (assuming万円 format)
    if (priceText.includes('万')) {
      return price * 10000;
    }

    return price;
  }

  parseMileage(mileageText) {
    if (!mileageText) return null;

    const cleanMileage = mileageText.replace(/[^\d]/g, '');
    return parseInt(cleanMileage) || null;
  }

  async scrapeAll(searchParams = {}) {
    console.log('Environment USE_MOCK_DATA:', process.env.USE_MOCK_DATA);
    console.log('this.useMockData:', this.useMockData);

    // If mock data is enabled or real scraping fails, use mock data
    if (this.useMockData) {
      console.log('Using mock data for testing...');
      return this.mockScraper.generateMockCars(30);
    }

    const allResults = [];
    let hasRealData = false;

    try {
      // Scrape Goo-net
      const gooResults = await this.scrapeGooNet(searchParams);
      if (gooResults.length > 0) {
        allResults.push(...gooResults);
        hasRealData = true;
      }

      // Scrape USS Auction
      const ussResults = await this.scrapeUSSAuction();
      if (ussResults.length > 0) {
        allResults.push(...ussResults);
        hasRealData = true;
      }

      console.log(`Scraped ${allResults.length} cars from Japanese sources`);

      // If no real data was obtained, fall back to mock data
      if (!hasRealData) {
        console.log('No real data obtained, falling back to mock data for testing...');
        return this.mockScraper.generateMockCars(25);
      }

    } catch (error) {
      console.error('Error in scrapeAll:', error);
      console.log('Falling back to mock data due to scraping errors...');
      return this.mockScraper.generateMockCars(20);
    }

    return allResults;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = JapanCarScraper;