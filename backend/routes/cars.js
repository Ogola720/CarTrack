const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const FileStorage = require('../models/FileStorage');

// Get all cars with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      make,
      model,
      minYear,
      maxYear,
      minProfit,
      maxPrice,
      sortBy = 'profitabilityScore',
      sortOrder = 'desc'
    } = req.query;

    const useFileStorage = process.env.USE_MOCK_DATA === 'true';

    if (useFileStorage) {
      // Use file storage
      const filter = { isActive: true };
      if (make) filter.make = make;
      if (model) filter.model = model;
      if (minProfit) filter.estimatedProfit = { $gt: parseFloat(minProfit) };

      const options = {
        sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
        limit: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      };

      const cars = await FileStorage.getCars(filter, options);
      const total = await FileStorage.countCars(filter);

      res.json({
        cars,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      });
    } else {
      // Use MongoDB
      const filter = { isActive: true };
      if (make) filter.make = new RegExp(make, 'i');
      if (model) filter.model = new RegExp(model, 'i');
      if (minYear) filter.year = { ...filter.year, $gte: parseInt(minYear) };
      if (maxYear) filter.year = { ...filter.year, $lte: parseInt(maxYear) };
      if (minProfit) filter.estimatedProfit = { ...filter.estimatedProfit, $gte: parseFloat(minProfit) };
      if (maxPrice) filter.japanPrice = { ...filter.japanPrice, $lte: parseFloat(maxPrice) };

      const cars = await Car.find(filter)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await Car.countDocuments(filter);

      res.json({
        cars,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top profitable cars
router.get('/top-profitable', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const cars = await Car.find({ 
      isActive: true,
      profitabilityScore: { $gt: 0 }
    })
    .sort({ profitabilityScore: -1 })
    .limit(parseInt(limit));

    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get car by ID
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json(car);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const useFileStorage = process.env.USE_MOCK_DATA === 'true';

    if (useFileStorage) {
      const stats = await FileStorage.getStats();
      res.json(stats);
    } else {
      const totalCars = await Car.countDocuments({ isActive: true });
      const profitableCars = await Car.countDocuments({ 
        isActive: true, 
        estimatedProfit: { $gt: 0 } 
      });
      
      const avgProfit = await Car.aggregate([
        { $match: { isActive: true, estimatedProfit: { $gt: 0 } } },
        { $group: { _id: null, avgProfit: { $avg: '$estimatedProfit' } } }
      ]);

      const topMakes = await Car.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$make', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      res.json({
        totalCars,
        profitableCars,
        avgProfit: avgProfit[0]?.avgProfit || 0,
        topMakes
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;