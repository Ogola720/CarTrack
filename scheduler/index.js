const cron = require('node-cron');
const CarArbitrageScraper = require('../scraper/index');
const mongoose = require('mongoose');
require('dotenv').config();

class SchedulerService {
  constructor() {
    this.scraper = new CarArbitrageScraper();
    this.jobs = new Map();
  }

  async initialize() {
    await this.scraper.initialize();
    console.log('Scheduler service initialized');
  }

  startDailyFullScrape() {
    // Run full scrape daily at 2 AM
    const job = cron.schedule('0 2 * * *', async () => {
      console.log('Starting scheduled full scrape...');
      try {
        const result = await this.scraper.runFullScrape();
        console.log('Scheduled full scrape completed:', result);
        
        // Log to database or monitoring system
        await this.logJobExecution('daily_full_scrape', 'success', result);
        
      } catch (error) {
        console.error('Scheduled full scrape failed:', error);
        await this.logJobExecution('daily_full_scrape', 'error', { error: error.message });
      }
    }, {
      scheduled: false,
      timezone: "Asia/Tokyo" // Japan timezone
    });

    this.jobs.set('daily_full_scrape', job);
    job.start();
    console.log('Daily full scrape scheduled for 2:00 AM JST');
  }

  startHourlyUpdates() {
    // Update existing cars every 4 hours
    const job = cron.schedule('0 */4 * * *', async () => {
      console.log('Starting scheduled car updates...');
      try {
        await this.scraper.updateExistingCars();
        console.log('Scheduled car updates completed');
        
        await this.logJobExecution('hourly_updates', 'success', {});
        
      } catch (error) {
        console.error('Scheduled car updates failed:', error);
        await this.logJobExecution('hourly_updates', 'error', { error: error.message });
      }
    }, {
      scheduled: false
    });

    this.jobs.set('hourly_updates', job);
    job.start();
    console.log('Hourly updates scheduled every 4 hours');
  }

  startExchangeRateUpdates() {
    // Update exchange rates every hour
    const job = cron.schedule('0 * * * *', async () => {
      console.log('Updating exchange rates...');
      try {
        await this.updateExchangeRates();
        await this.logJobExecution('exchange_rate_update', 'success', {});
      } catch (error) {
        console.error('Exchange rate update failed:', error);
        await this.logJobExecution('exchange_rate_update', 'error', { error: error.message });
      }
    }, {
      scheduled: false
    });

    this.jobs.set('exchange_rate_update', job);
    job.start();
    console.log('Exchange rate updates scheduled hourly');
  }

  startDatabaseCleanup() {
    // Clean up old/inactive listings weekly
    const job = cron.schedule('0 3 * * 0', async () => {
      console.log('Starting database cleanup...');
      try {
        await this.cleanupDatabase();
        await this.logJobExecution('database_cleanup', 'success', {});
      } catch (error) {
        console.error('Database cleanup failed:', error);
        await this.logJobExecution('database_cleanup', 'error', { error: error.message });
      }
    }, {
      scheduled: false
    });

    this.jobs.set('database_cleanup', job);
    job.start();
    console.log('Database cleanup scheduled weekly on Sundays at 3:00 AM');
  }

  async updateExchangeRates() {
    try {
      // Fetch current exchange rates from a reliable API
      const axios = require('axios');
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
      
      if (response.data && response.data.rates) {
        const jpyRate = response.data.rates.JPY;
        
        // Update the profit calculator with new rates
        this.scraper.profitCalculator.updateExchangeRates({
          JPY_TO_USD: 1 / jpyRate,
          USD_TO_JPY: jpyRate
        });
        
        console.log(`Exchange rates updated: 1 USD = ${jpyRate} JPY`);
      }
    } catch (error) {
      console.error('Failed to update exchange rates:', error);
    }
  }

  async cleanupDatabase() {
    const Car = require('../backend/models/Car');
    
    try {
      // Remove cars older than 30 days that haven't been updated
      const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const result = await Car.updateMany(
        { 
          lastUpdated: { $lt: cutoffDate },
          isActive: true 
        },
        { 
          $set: { isActive: false } 
        }
      );
      
      console.log(`Deactivated ${result.modifiedCount} old car listings`);
      
      // Remove completely outdated records (older than 90 days)
      const deleteDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const deleteResult = await Car.deleteMany({
        lastUpdated: { $lt: deleteDate },
        isActive: false
      });
      
      console.log(`Deleted ${deleteResult.deletedCount} outdated car records`);
      
    } catch (error) {
      console.error('Database cleanup error:', error);
    }
  }

  async logJobExecution(jobName, status, data) {
    // Create a simple job log collection
    const JobLog = mongoose.model('JobLog', new mongoose.Schema({
      jobName: String,
      status: String,
      data: mongoose.Schema.Types.Mixed,
      executedAt: { type: Date, default: Date.now }
    }));

    try {
      await JobLog.create({
        jobName,
        status,
        data,
        executedAt: new Date()
      });
    } catch (error) {
      console.error('Failed to log job execution:', error);
    }
  }

  stopJob(jobName) {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      this.jobs.delete(jobName);
      console.log(`Stopped job: ${jobName}`);
    }
  }

  stopAllJobs() {
    for (const [name, job] of this.jobs) {
      job.stop();
      console.log(`Stopped job: ${name}`);
    }
    this.jobs.clear();
  }

  getJobStatus() {
    const status = {};
    for (const [name, job] of this.jobs) {
      status[name] = {
        running: job.running,
        scheduled: job.scheduled
      };
    }
    return status;
  }
}

// CLI execution
if (require.main === module) {
  const scheduler = new SchedulerService();
  
  scheduler.initialize()
    .then(() => {
      // Start all scheduled jobs
      scheduler.startDailyFullScrape();
      scheduler.startHourlyUpdates();
      scheduler.startExchangeRateUpdates();
      scheduler.startDatabaseCleanup();
      
      console.log('All scheduled jobs started');
      console.log('Scheduler is running... Press Ctrl+C to stop');
      
      // Graceful shutdown
      process.on('SIGINT', () => {
        console.log('\nShutting down scheduler...');
        scheduler.stopAllJobs();
        process.exit(0);
      });
    })
    .catch(error => {
      console.error('Failed to start scheduler:', error);
      process.exit(1);
    });
}

module.exports = SchedulerService;