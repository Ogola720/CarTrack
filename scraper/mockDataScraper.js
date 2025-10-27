// Mock data scraper for testing purposes
// This generates realistic sample data when real scraping fails

class MockDataScraper {
  constructor() {
    this.carMakes = ['Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru', 'Mitsubishi', 'Suzuki'];
    this.toyotaModels = ['Prius', 'Camry', 'Corolla', 'RAV4', 'Highlander', 'Land Cruiser', 'Vitz'];
    this.hondaModels = ['Civic', 'Accord', 'CR-V', 'Fit', 'Pilot', 'Odyssey', 'HR-V'];
    this.nissanModels = ['Altima', 'Sentra', 'Rogue', 'Pathfinder', 'Murano', 'Note', 'March'];
    this.mazdaModels = ['Mazda3', 'Mazda6', 'CX-5', 'CX-9', 'MX-5', 'Demio', 'Axela'];
    this.subaruModels = ['Outback', 'Forester', 'Impreza', 'Legacy', 'XV', 'Levorg', 'WRX'];
    
    this.modelsByMake = {
      'Toyota': this.toyotaModels,
      'Honda': this.hondaModels,
      'Nissan': this.nissanModels,
      'Mazda': this.mazdaModels,
      'Subaru': this.subaruModels,
      'Mitsubishi': ['Outlander', 'Lancer', 'Pajero', 'Eclipse', 'Mirage'],
      'Suzuki': ['Swift', 'Vitara', 'Jimny', 'Alto', 'Wagon R']
    };
  }

  generateMockCars(count = 50) {
    const cars = [];
    
    for (let i = 0; i < count; i++) {
      const make = this.getRandomElement(this.carMakes);
      const model = this.getRandomElement(this.modelsByMake[make]);
      const year = this.getRandomYear();
      const mileage = this.getRandomMileage();
      const price = this.getRandomPrice(make, model, year, mileage);
      
      const car = {
        make,
        model,
        year,
        mileage,
        price,
        condition: this.getRandomCondition(),
        engineSize: this.getRandomEngineSize(),
        fuelType: this.getRandomFuelType(),
        transmission: this.getRandomTransmission(),
        bodyType: this.getRandomBodyType(),
        color: this.getRandomColor(),
        location: this.getRandomLocation(),
        url: `https://mock-auction.jp/car/${i + 1}`,
        source: this.getRandomSource(),
        scrapedAt: new Date()
      };
      
      cars.push(car);
    }
    
    return cars;
  }

  getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  getRandomYear() {
    const currentYear = new Date().getFullYear();
    // Generate years from 2010 to current year, with bias toward newer cars
    const minYear = 2010;
    const yearRange = currentYear - minYear + 1;
    const randomValue = Math.random();
    
    // Bias toward newer cars (exponential distribution)
    const biasedRandom = Math.pow(randomValue, 0.5);
    return Math.floor(minYear + (biasedRandom * yearRange));
  }

  getRandomMileage() {
    // Generate realistic mileage based on car age
    const baseMileage = Math.random() * 200000; // 0 to 200,000 km
    return Math.floor(baseMileage);
  }

  getRandomPrice(make, model, year, mileage) {
    // Base price calculation with some realism
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    
    let basePrice = 2000000; // 2 million yen base
    
    // Adjust for make (premium brands cost more)
    const premiumMakes = ['Toyota', 'Honda', 'Subaru'];
    if (premiumMakes.includes(make)) {
      basePrice *= 1.2;
    }
    
    // Adjust for model popularity
    const popularModels = ['Prius', 'Civic', 'Corolla', 'CR-V'];
    if (popularModels.includes(model)) {
      basePrice *= 1.15;
    }
    
    // Depreciation based on age
    const depreciationRate = 0.15; // 15% per year
    basePrice *= Math.pow(1 - depreciationRate, age);
    
    // Adjust for mileage (higher mileage = lower price)
    const mileageFactor = Math.max(0.5, 1 - (mileage / 300000));
    basePrice *= mileageFactor;
    
    // Add some randomness
    const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
    basePrice *= randomFactor;
    
    return Math.floor(Math.max(300000, basePrice)); // Minimum 300k yen
  }

  getRandomCondition() {
    const conditions = ['Excellent', 'Good', 'Fair', 'Poor'];
    const weights = [0.1, 0.4, 0.4, 0.1]; // Most cars are Good or Fair
    return this.weightedRandom(conditions, weights);
  }

  getRandomEngineSize() {
    const sizes = ['1.0L', '1.3L', '1.5L', '1.8L', '2.0L', '2.4L', '3.0L', '3.5L'];
    return this.getRandomElement(sizes);
  }

  getRandomFuelType() {
    const types = ['Gasoline', 'Hybrid', 'Diesel', 'Electric'];
    const weights = [0.6, 0.25, 0.1, 0.05];
    return this.weightedRandom(types, weights);
  }

  getRandomTransmission() {
    const transmissions = ['Automatic', 'Manual', 'CVT'];
    const weights = [0.7, 0.2, 0.1];
    return this.weightedRandom(transmissions, weights);
  }

  getRandomBodyType() {
    const types = ['Sedan', 'Hatchback', 'SUV', 'Wagon', 'Coupe', 'Convertible'];
    const weights = [0.3, 0.25, 0.2, 0.15, 0.08, 0.02];
    return this.weightedRandom(types, weights);
  }

  getRandomColor() {
    const colors = ['White', 'Black', 'Silver', 'Gray', 'Blue', 'Red', 'Green', 'Yellow'];
    const weights = [0.3, 0.25, 0.15, 0.1, 0.08, 0.07, 0.03, 0.02];
    return this.weightedRandom(colors, weights);
  }

  getRandomLocation() {
    const locations = ['Tokyo', 'Osaka', 'Nagoya', 'Yokohama', 'Kobe', 'Fukuoka', 'Sapporo'];
    return this.getRandomElement(locations);
  }

  getRandomSource() {
    const sources = ['Mock Goo-net', 'Mock USS Auction', 'Mock JAA', 'Mock TAA'];
    return this.getRandomElement(sources);
  }

  weightedRandom(items, weights) {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }
    
    return items[items.length - 1];
  }
}

module.exports = MockDataScraper;