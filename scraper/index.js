const JapanCarScraper = require('./japanScraper');
const ClassicCarScraper = require('./classicScraper');
const ProfitCalculator = require('./profitCalculator');
const mongoose = require('mongoose');
const Car = require('../backend/models/Car');
const FileStorage = require('../backend/models/FileStorage');
require('dotenv').config();

class CarArbitrageScraper {
  constructor() {
    this.japanScraper = new JapanCarScraper();
    this.classicScraper = new ClassicCarScraper();
    this.profitCalculator = new ProfitCalculator();
    this.useFileStorage = false;
  }

  async initialize() {
    // For testing, use file storage when USE_MOCK_DATA is true
    if (process.env.USE_MOCK_DATA === 'true') {
      console.log('Using file storage for testing');
      this.useFileStorage = true;
      await FileStorage.initialize();
    } else {
      // Try to connect to MongoDB, fallback to file storage
      try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/car-arbitrage', {
          serverSelectionTimeoutMS: 5000 // 5 second timeout
        });
        console.log('Connected to MongoDB');
      } catch (error) {
        console.log('MongoDB not available, using file storage');
        this.useFileStorage = true;
        await FileStorage.initialize();
      }
    }
    
    // Initialize scrapers
    await this.japanScraper.initialize();
    
    console.log('Car arbitrage scraper initialized');
  }

  async runFullScrape() {
    console.log('Starting full scrape process...');
    
    try {
      // Step 1: Scrape Japanese car listings
      console.log('Scraping Japanese car listings...');
      const japanCars = await this.japanScraper.scrapeAll();
      console.log(`Found ${japanCars.length} cars from Japanese sources`);

      // Step 2: Get resale values from classic.com
      console.log('Getting resale values from classic.com...');
      const carsWithResaleData = await this.classicScraper.batchGetValues(japanCars);
      
      // Step 3: Calculate profitability for each car
      console.log('Calculating profitability...');
      const processedCars = [];
      
      for (const car of carsWithResaleData) {
        if (car.resaleValue) {
          const profitAnalysis = this.profitCalculator.calculateProfitability(car, car.resaleValue);
          
          if (profitAnalysis) {
            const carDocument = {
              make: car.make,
              model: car.model,
              year: car.year,
              mileage: car.mileage,
              condition: car.condition,
              
              japanPrice: car.price,
              japanCurrency: 'JPY',
              japanListingUrl: car.url,
              japanAuctionHouse: car.source,
              japanListingDate: car.scrapedAt,
              
              africaResaleValue: car.resaleValue.averageValue,
              africaCurrency: 'USD',
              resaleDataSource: car.resaleValue.source,
              
              estimatedShippingCost: profitAnalysis.costBreakdown.shipping,
              estimatedDutiesTaxes: profitAnalysis.costBreakdown.customsDuty + profitAnalysis.costBreakdown.vat,
              estimatedTotalCost: profitAnalysis.totalCost,
              estimatedProfit: profitAnalysis.grossProfit,
              profitMargin: profitAnalysis.profitMargin,
              profitabilityScore: profitAnalysis.profitabilityScore,
              
              engineSize: car.engineSize,
              fuelType: car.fuelType,
              transmission: car.transmission,
              bodyType: car.bodyType,
              color: car.color,
              
              scrapingSource: car.source,
              lastUpdated: new Date()
            };
            
            processedCars.push(carDocument);
          }
        }
      }

      // Step 4: Save to database
      console.log(`Saving ${processedCars.length} processed cars to database...`);
      await this.saveCarsToDatabase(processedCars);
      
      console.log('Full scrape completed successfully');
      
      return {
        totalScraped: japanCars.length,
        withResaleData: carsWithResaleData.filter(c => c.resaleValue).length,
        saved: processedCars.length,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error in full scrape:', error);
      throw error;
    }
  }

  async saveCarsToDatabase(cars) {
    if (this.useFileStorage) {
      const result = await FileStorage.saveCars(cars);
      console.log(`File storage operation completed: ${result.insertedCount} cars saved`);
    } else {
      const operations = cars.map(car => ({
        updateOne: {
          filter: {
            make: car.make,
            model: car.model,
            year: car.year,
            japanPrice: car.japanPrice,
            japanListingUrl: car.japanListingUrl
          },
          update: { $set: car },
          upsert: true
        }
      }));

      if (operations.length > 0) {
        const result = await Car.bulkWrite(operations);
        console.log(`Database operation completed: ${result.upsertedCount} new, ${result.modifiedCount} updated`);
      }
    }
  }

  async updateExistingCars() {
    console.log('Updating existing cars with fresh resale data...');
    
    try {
      // Get cars that need updates (older than 24 hours)
      const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const carsToUpdate = await Car.find({
        isActive: true,
        lastUpdated: { $lt: cutoffDate }
      }).limit(50); // Process in batches

      console.log(`Updating ${carsToUpdate.length} cars`);

      for (const car of carsToUpdate) {
        try {
          const resaleValue = await this.classicScraper.getResaleValue(car.make, car.model, car.year);
          
          if (resaleValue) {
            const profitAnalysis = this.profitCalculator.calculateProfitability({
              price: car.japanPrice,
              year: car.year,
              mileage: car.mileage
            }, resaleValue);

            if (profitAnalysis) {
              await Car.findByIdAndUpdate(car._id, {
                africaResaleValue: resaleValue.averageValue,
                estimatedProfit: profitAnalysis.grossProfit,
                profitMargin: profitAnalysis.profitMargin,
                profitabilityScore: profitAnalysis.profitabilityScore,
                lastUpdated: new Date()
              });
            }
          }

          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          console.error(`Error updating car ${car._id}:`, error);
        }
      }

      console.log('Update completed');
      
    } catch (error) {
      console.error('Error in updateExistingCars:', error);
    }
  }

  async cleanup() {
    await this.japanScraper.close();
    if (!this.useFileStorage) {
      await mongoose.connection.close();
    }
  }
}

// CLI execution
if (require.main === module) {
  const scraper = new CarArbitrageScraper();
  
  const command = process.argv[2] || 'full';
  
  scraper.initialize()
    .then(async () => {
      if (command === 'full') {
        return await scraper.runFullScrape();
      } else if (command === 'update') {
        return await scraper.updateExistingCars();
      }
    })
    .then(result => {
      console.log('Scraping completed:', result);
      return scraper.cleanup();
    })
    .catch(error => {
      console.error('Scraping failed:', error);
      return scraper.cleanup();
    })
    .finally(() => {
      process.exit(0);
    });
}

module.exports = CarArbitrageScraper;