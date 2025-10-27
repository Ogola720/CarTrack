const axios = require('axios');
const cheerio = require('cheerio');

// Mock resale values for testing
const mockResaleValues = {
  'Toyota Prius': { low: 15000, high: 25000, average: 20000 },
  'Toyota Camry': { low: 18000, high: 28000, average: 23000 },
  'Toyota Corolla': { low: 12000, high: 20000, average: 16000 },
  'Honda Civic': { low: 14000, high: 22000, average: 18000 },
  'Honda Accord': { low: 16000, high: 26000, average: 21000 },
  'Honda CR-V': { low: 20000, high: 32000, average: 26000 },
  'Nissan Altima': { low: 13000, high: 21000, average: 17000 },
  'Mazda3': { low: 12000, high: 19000, average: 15500 },
  'Subaru Outback': { low: 18000, high: 30000, average: 24000 }
};

class ClassicCarScraper {
  constructor() {
    this.baseUrl = 'https://classic.com';
    this.apiUrl = 'https://api.classic.com';
    this.useMockData = process.env.USE_MOCK_DATA === 'true' || false;
  }

  async getResaleValue(make, model, year) {
    // Use mock data if enabled or if real scraping fails
    if (this.useMockData) {
      return this.getMockResaleValue(make, model, year);
    }

    try {
      // First try the API approach
      const apiResult = await this.getValueFromAPI(make, model, year);
      if (apiResult) return apiResult;

      // Fallback to web scraping
      const webResult = await this.getValueFromWeb(make, model, year);
      if (webResult) return webResult;

      // If both fail, use mock data
      console.log(`No real data found for ${make} ${model} ${year}, using mock data`);
      return this.getMockResaleValue(make, model, year);
      
    } catch (error) {
      console.error(`Error getting resale value for ${make} ${model} ${year}:`, error);
      // Fallback to mock data on error
      return this.getMockResaleValue(make, model, year);
    }
  }

  getMockResaleValue(make, model, year) {
    const key = `${make} ${model}`;
    const mockData = mockResaleValues[key];
    
    if (mockData) {
      // Adjust for year (newer cars worth more)
      const currentYear = new Date().getFullYear();
      const age = currentYear - year;
      const ageFactor = Math.max(0.6, 1 - (age * 0.05)); // 5% depreciation per year
      
      return {
        lowValue: Math.round(mockData.low * ageFactor),
        highValue: Math.round(mockData.high * ageFactor),
        averageValue: Math.round(mockData.average * ageFactor),
        currency: 'USD',
        source: 'mock data',
        lastUpdated: new Date()
      };
    }

    // Generate generic mock data for unknown cars
    const baseValue = 15000 + (Math.random() * 10000); // $15k-25k base
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    const ageFactor = Math.max(0.5, 1 - (age * 0.08));
    const adjustedValue = baseValue * ageFactor;

    return {
      lowValue: Math.round(adjustedValue * 0.8),
      highValue: Math.round(adjustedValue * 1.2),
      averageValue: Math.round(adjustedValue),
      currency: 'USD',
      source: 'generated mock data',
      lastUpdated: new Date()
    };
  }

  async getValueFromAPI(make, model, year) {
    try {
      const searchQuery = `${make} ${model} ${year}`;
      const response = await axios.get(`${this.apiUrl}/search`, {
        params: {
          q: searchQuery,
          type: 'vehicle'
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      });

      if (response.data && response.data.results) {
        const exactMatch = response.data.results.find(result => 
          result.make.toLowerCase() === make.toLowerCase() &&
          result.model.toLowerCase() === model.toLowerCase() &&
          result.year === year
        );

        if (exactMatch && exactMatch.valuation) {
          return {
            lowValue: exactMatch.valuation.low,
            highValue: exactMatch.valuation.high,
            averageValue: exactMatch.valuation.average,
            currency: 'USD',
            source: 'classic.com API',
            lastUpdated: new Date()
          };
        }
      }
    } catch (error) {
      console.error('API request failed:', error.message);
    }

    return null;
  }

  async getValueFromWeb(make, model, year) {
    try {
      const searchUrl = `${this.baseUrl}/search?q=${encodeURIComponent(`${make} ${model} ${year}`)}`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 20000
      });

      const $ = cheerio.load(response.data);
      const results = [];

      $('.search-result-item').each((index, element) => {
        const $item = $(element);
        
        const itemMake = $item.find('.make').text().trim();
        const itemModel = $item.find('.model').text().trim();
        const itemYear = parseInt($item.find('.year').text().trim());
        const price = this.parsePrice($item.find('.price').text());

        if (itemMake.toLowerCase() === make.toLowerCase() &&
            itemModel.toLowerCase() === model.toLowerCase() &&
            itemYear === year && price) {
          results.push(price);
        }
      });

      if (results.length > 0) {
        const sortedPrices = results.sort((a, b) => a - b);
        const lowValue = sortedPrices[0];
        const highValue = sortedPrices[sortedPrices.length - 1];
        const averageValue = sortedPrices.reduce((sum, price) => sum + price, 0) / sortedPrices.length;

        return {
          lowValue,
          highValue,
          averageValue,
          currency: 'USD',
          source: 'classic.com web',
          sampleSize: results.length,
          lastUpdated: new Date()
        };
      }

    } catch (error) {
      console.error('Web scraping failed:', error.message);
    }

    return null;
  }

  parsePrice(priceText) {
    if (!priceText) return null;
    
    // Remove currency symbols and commas
    const cleanPrice = priceText.replace(/[$,]/g, '');
    const price = parseFloat(cleanPrice);
    
    return isNaN(price) ? null : price;
  }

  async batchGetValues(cars) {
    const results = [];
    
    for (const car of cars) {
      try {
        const resaleValue = await this.getResaleValue(car.make, car.model, car.year);
        
        results.push({
          ...car,
          resaleValue
        });

        // Add delay to avoid rate limiting (only for real requests)
        if (!this.useMockData) {
          await this.delay(1000);
        }
        
      } catch (error) {
        console.error(`Error processing ${car.make} ${car.model}:`, error);
        results.push({
          ...car,
          resaleValue: this.getMockResaleValue(car.make, car.model, car.year)
        });
      }
    }

    return results;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = ClassicCarScraper;