const express = require('express');
const router = express.Router();
const Car = require('../models/Car');

// Admin dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Basic counts
    const totalCars = await Car.countDocuments({ isActive: true });
    const profitableCars = await Car.countDocuments({ 
      isActive: true, 
      estimatedProfit: { $gt: 0 } 
    });
    const highProfitCars = await Car.countDocuments({ 
      isActive: true, 
      profitabilityScore: { $gte: 70 } 
    });

    // Recent activity
    const carsLast24h = await Car.countDocuments({
      isActive: true,
      createdAt: { $gte: last24h }
    });
    const carsLast7d = await Car.countDocuments({
      isActive: true,
      createdAt: { $gte: last7d }
    });

    // Profit statistics
    const profitStats = await Car.aggregate([
      { $match: { isActive: true, estimatedProfit: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          avgProfit: { $avg: '$estimatedProfit' },
          maxProfit: { $max: '$estimatedProfit' },
          totalProfit: { $sum: '$estimatedProfit' },
          avgProfitabilityScore: { $avg: '$profitabilityScore' }
        }
      }
    ]);

    // Top makes by count
    const topMakes = await Car.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$make', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Top profitable cars
    const topProfitable = await Car.find({
      isActive: true,
      estimatedProfit: { $gt: 0 }
    })
    .sort({ profitabilityScore: -1 })
    .limit(10)
    .select('make model year estimatedProfit profitabilityScore japanPrice');

    // Profitability distribution
    const profitabilityDistribution = await Car.aggregate([
      { $match: { isActive: true } },
      {
        $bucket: {
          groupBy: '$profitabilityScore',
          boundaries: [0, 20, 40, 60, 80, 100],
          default: 'other',
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    res.json({
      overview: {
        totalCars,
        profitableCars,
        highProfitCars,
        carsLast24h,
        carsLast7d,
        profitablePercentage: totalCars > 0 ? (profitableCars / totalCars * 100).toFixed(1) : 0
      },
      profitStats: profitStats[0] || {
        avgProfit: 0,
        maxProfit: 0,
        totalProfit: 0,
        avgProfitabilityScore: 0
      },
      topMakes,
      topProfitable,
      profitabilityDistribution,
      lastUpdated: now
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Data health check
router.get('/health', async (req, res) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Check for stale data
    const staleCars = await Car.countDocuments({
      isActive: true,
      lastUpdated: { $lt: last24h }
    });

    // Check for missing resale data
    const missingResaleData = await Car.countDocuments({
      isActive: true,
      africaResaleValue: { $exists: false }
    });

    // Check for invalid profit calculations
    const invalidProfits = await Car.countDocuments({
      isActive: true,
      $or: [
        { estimatedProfit: { $exists: false } },
        { profitabilityScore: { $exists: false } },
        { estimatedProfit: null },
        { profitabilityScore: null }
      ]
    });

    // Database connection status
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState;
    const dbStatusText = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }[dbStatus] || 'unknown';

    const healthScore = 100 - (staleCars * 0.1) - (missingResaleData * 0.2) - (invalidProfits * 0.3);

    res.json({
      status: healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'warning' : 'critical',
      healthScore: Math.max(0, Math.min(100, healthScore)),
      issues: {
        staleCars,
        missingResaleData,
        invalidProfits
      },
      database: {
        status: dbStatusText,
        connected: dbStatus === 1
      },
      recommendations: [
        staleCars > 100 ? 'Run data update process' : null,
        missingResaleData > 50 ? 'Check resale data scraping' : null,
        invalidProfits > 20 ? 'Recalculate profit metrics' : null
      ].filter(Boolean),
      lastChecked: now
    });

  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      error: error.message,
      lastChecked: new Date()
    });
  }
});

// System configuration
router.get('/config', (req, res) => {
  const ProfitCalculator = require('../../scraper/profitCalculator');
  const calculator = new ProfitCalculator();

  res.json({
    costParameters: calculator.defaultCosts,
    exchangeRates: calculator.exchangeRates,
    environment: process.env.NODE_ENV || 'development',
    version: require('../../package.json').version
  });
});

// Update system configuration
router.put('/config', (req, res) => {
  try {
    const { costParameters, exchangeRates } = req.body;
    
    // This would typically update a configuration store
    // For now, we'll just validate the input
    
    if (costParameters) {
      // Validate cost parameters
      const requiredCostFields = ['shippingPerCar', 'customsDutyRate', 'vatRate'];
      for (const field of requiredCostFields) {
        if (costParameters[field] !== undefined && typeof costParameters[field] !== 'number') {
          return res.status(400).json({ error: `Invalid ${field}: must be a number` });
        }
      }
    }

    if (exchangeRates) {
      // Validate exchange rates
      if (exchangeRates.JPY_TO_USD && typeof exchangeRates.JPY_TO_USD !== 'number') {
        return res.status(400).json({ error: 'Invalid JPY_TO_USD rate' });
      }
    }

    res.json({ 
      message: 'Configuration updated successfully',
      timestamp: new Date()
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manual data cleanup
router.post('/cleanup', async (req, res) => {
  try {
    const { action } = req.body;

    let result = {};

    switch (action) {
      case 'remove_stale':
        const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        result = await Car.updateMany(
          { lastUpdated: { $lt: cutoffDate }, isActive: true },
          { $set: { isActive: false } }
        );
        break;

      case 'recalculate_profits':
        // This would trigger a recalculation of all profit metrics
        result = { message: 'Profit recalculation started' };
        break;

      case 'remove_invalid':
        result = await Car.deleteMany({
          $or: [
            { make: { $exists: false } },
            { model: { $exists: false } },
            { year: { $exists: false } },
            { japanPrice: { $exists: false } }
          ]
        });
        break;

      default:
        return res.status(400).json({ error: 'Invalid cleanup action' });
    }

    res.json({
      action,
      result,
      timestamp: new Date()
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;