const express = require('express');
const router = express.Router();
const CarArbitrageScraper = require('../../scraper/index');

let scraper = null;

// Initialize scraper
async function initializeScraper() {
  if (!scraper) {
    scraper = new CarArbitrageScraper();
    await scraper.initialize();
  }
  return scraper;
}

// Manual trigger for full scrape
router.post('/trigger-full-scrape', async (req, res) => {
  try {
    const scraperInstance = await initializeScraper();
    
    // Run scrape in background
    scraperInstance.runFullScrape()
      .then(result => {
        console.log('Manual full scrape completed:', result);
      })
      .catch(error => {
        console.error('Manual full scrape failed:', error);
      });

    res.json({ 
      message: 'Full scrape started',
      status: 'running',
      timestamp: new Date()
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manual trigger for updates
router.post('/trigger-updates', async (req, res) => {
  try {
    const scraperInstance = await initializeScraper();
    
    // Run updates in background
    scraperInstance.updateExistingCars()
      .then(() => {
        console.log('Manual updates completed');
      })
      .catch(error => {
        console.error('Manual updates failed:', error);
      });

    res.json({ 
      message: 'Car updates started',
      status: 'running',
      timestamp: new Date()
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get scraping status
router.get('/status', async (req, res) => {
  try {
    const Car = require('../models/Car');
    
    // Get recent scraping statistics
    const totalCars = await Car.countDocuments({ isActive: true });
    const recentCars = await Car.countDocuments({
      isActive: true,
      lastUpdated: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    const avgProfitability = await Car.aggregate([
      { $match: { isActive: true, profitabilityScore: { $gt: 0 } } },
      { $group: { _id: null, avgScore: { $avg: '$profitabilityScore' } } }
    ]);

    res.json({
      totalActiveCars: totalCars,
      carsUpdatedLast24h: recentCars,
      averageProfitabilityScore: avgProfitability[0]?.avgScore || 0,
      lastUpdateCheck: new Date(),
      scraperStatus: scraper ? 'initialized' : 'not initialized'
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get scraping logs
router.get('/logs', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const JobLog = mongoose.model('JobLog', new mongoose.Schema({
      jobName: String,
      status: String,
      data: mongoose.Schema.Types.Mixed,
      executedAt: { type: Date, default: Date.now }
    }));

    const { limit = 50, jobName } = req.query;
    
    const filter = {};
    if (jobName) filter.jobName = jobName;

    const logs = await JobLog.find(filter)
      .sort({ executedAt: -1 })
      .limit(parseInt(limit));

    res.json(logs);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;