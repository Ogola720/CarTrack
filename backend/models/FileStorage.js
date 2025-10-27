const fs = require('fs').promises;
const path = require('path');

class FileStorage {
  constructor() {
    this.dataDir = path.join(__dirname, '../../data');
    this.carsFile = path.join(this.dataDir, 'cars.json');
    this.initialized = false;
  }

  async initialize() {
    try {
      // Create data directory if it doesn't exist
      await fs.mkdir(this.dataDir, { recursive: true });
      
      // Create cars file if it doesn't exist
      try {
        await fs.access(this.carsFile);
      } catch (error) {
        await fs.writeFile(this.carsFile, JSON.stringify([]));
      }
      
      this.initialized = true;
      console.log('File storage initialized');
    } catch (error) {
      console.error('Failed to initialize file storage:', error);
      throw error;
    }
  }

  async saveCars(cars) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Read existing cars
      const existingData = await fs.readFile(this.carsFile, 'utf8');
      const existingCars = JSON.parse(existingData);

      // Add new cars (simple append for now)
      const updatedCars = [...existingCars, ...cars.map(car => ({
        ...car,
        _id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date()
      }))];

      // Write back to file
      await fs.writeFile(this.carsFile, JSON.stringify(updatedCars, null, 2));
      
      console.log(`Saved ${cars.length} cars to file storage`);
      return { insertedCount: cars.length };
    } catch (error) {
      console.error('Error saving cars:', error);
      throw error;
    }
  }

  async getCars(filter = {}, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const data = await fs.readFile(this.carsFile, 'utf8');
      let cars = JSON.parse(data);

      // Apply basic filtering
      if (filter.isActive !== undefined) {
        cars = cars.filter(car => car.isActive === filter.isActive);
      }
      if (filter.make) {
        cars = cars.filter(car => car.make && car.make.toLowerCase().includes(filter.make.toLowerCase()));
      }
      if (filter.model) {
        cars = cars.filter(car => car.model && car.model.toLowerCase().includes(filter.model.toLowerCase()));
      }
      if (filter.estimatedProfit && filter.estimatedProfit.$gt !== undefined) {
        cars = cars.filter(car => car.estimatedProfit > filter.estimatedProfit.$gt);
      }

      // Apply sorting
      if (options.sort) {
        const sortField = Object.keys(options.sort)[0];
        const sortOrder = options.sort[sortField];
        cars.sort((a, b) => {
          const aVal = a[sortField] || 0;
          const bVal = b[sortField] || 0;
          return sortOrder === 1 ? aVal - bVal : bVal - aVal;
        });
      }

      // Apply pagination
      const limit = options.limit || cars.length;
      const skip = options.skip || 0;
      const paginatedCars = cars.slice(skip, skip + limit);

      return paginatedCars;
    } catch (error) {
      console.error('Error getting cars:', error);
      return [];
    }
  }

  async countCars(filter = {}) {
    const cars = await this.getCars(filter);
    return cars.length;
  }

  async getStats() {
    try {
      const cars = await this.getCars({ isActive: true });
      const profitableCars = cars.filter(car => car.estimatedProfit > 0);
      const highProfitCars = cars.filter(car => car.profitabilityScore >= 70);
      
      const totalProfit = profitableCars.reduce((sum, car) => sum + (car.estimatedProfit || 0), 0);
      const avgProfit = profitableCars.length > 0 ? totalProfit / profitableCars.length : 0;

      const makeStats = {};
      cars.forEach(car => {
        if (car.make) {
          makeStats[car.make] = (makeStats[car.make] || 0) + 1;
        }
      });

      const topMakes = Object.entries(makeStats)
        .map(([make, count]) => ({ _id: make, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalCars: cars.length,
        profitableCars: profitableCars.length,
        highProfitCars: highProfitCars.length,
        avgProfit,
        topMakes
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalCars: 0,
        profitableCars: 0,
        highProfitCars: 0,
        avgProfit: 0,
        topMakes: []
      };
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async clearData() {
    try {
      await fs.writeFile(this.carsFile, JSON.stringify([]));
      console.log('Data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
}

module.exports = new FileStorage();