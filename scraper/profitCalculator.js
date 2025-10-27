class ProfitCalculator {
  constructor() {
    // Default cost estimates (can be configured)
    this.defaultCosts = {
      shippingPerCar: 1500, // USD
      insuranceRate: 0.02, // 2% of car value
      customsDutyRate: 0.25, // 25% in many African countries
      vatRate: 0.15, // 15% VAT
      clearanceAndHandling: 500, // USD
      localTransportation: 300, // USD
      documentationFees: 200, // USD
      profitMarginTarget: 0.20 // 20% minimum profit margin
    };

    // Exchange rates (should be updated regularly)
    this.exchangeRates = {
      JPY_TO_USD: 0.0067, // 1 JPY = 0.0067 USD (approximate)
      USD_TO_JPY: 149.25
    };
  }

  calculateProfitability(japanCar, resaleData) {
    if (!japanCar || !resaleData) {
      return null;
    }

    try {
      // Convert Japan price to USD
      const japanPriceUSD = this.convertJPYToUSD(japanCar.price);
      
      // Calculate all costs
      const costs = this.calculateAllCosts(japanPriceUSD);
      
      // Total investment
      const totalCost = japanPriceUSD + costs.totalAdditionalCosts;
      
      // Expected resale value (use average or conservative estimate)
      const expectedResaleValue = resaleData.averageValue || resaleData.lowValue;
      
      if (!expectedResaleValue) {
        return null;
      }

      // Calculate profit metrics
      const grossProfit = expectedResaleValue - totalCost;
      const profitMargin = (grossProfit / totalCost) * 100;
      const roi = (grossProfit / japanPriceUSD) * 100;
      
      // Calculate profitability score (0-100)
      const profitabilityScore = this.calculateProfitabilityScore({
        profitMargin,
        grossProfit,
        roi,
        carAge: new Date().getFullYear() - japanCar.year,
        mileage: japanCar.mileage
      });

      return {
        japanPriceUSD,
        totalCost,
        expectedResaleValue,
        grossProfit,
        profitMargin,
        roi,
        profitabilityScore,
        costBreakdown: costs,
        isRecommended: profitabilityScore >= 60 && profitMargin >= 15,
        riskLevel: this.assessRiskLevel(profitabilityScore, profitMargin)
      };

    } catch (error) {
      console.error('Error calculating profitability:', error);
      return null;
    }
  }

  calculateAllCosts(carValueUSD) {
    const shipping = this.defaultCosts.shippingPerCar;
    const insurance = carValueUSD * this.defaultCosts.insuranceRate;
    const customsDuty = carValueUSD * this.defaultCosts.customsDutyRate;
    const vat = (carValueUSD + customsDuty) * this.defaultCosts.vatRate;
    const clearance = this.defaultCosts.clearanceAndHandling;
    const transport = this.defaultCosts.localTransportation;
    const documentation = this.defaultCosts.documentationFees;

    const totalAdditionalCosts = shipping + insurance + customsDuty + vat + clearance + transport + documentation;

    return {
      shipping,
      insurance,
      customsDuty,
      vat,
      clearance,
      transport,
      documentation,
      totalAdditionalCosts
    };
  }

  calculateProfitabilityScore(metrics) {
    let score = 0;

    // Profit margin weight (40%)
    if (metrics.profitMargin >= 30) score += 40;
    else if (metrics.profitMargin >= 20) score += 30;
    else if (metrics.profitMargin >= 15) score += 20;
    else if (metrics.profitMargin >= 10) score += 10;

    // Gross profit weight (30%)
    if (metrics.grossProfit >= 5000) score += 30;
    else if (metrics.grossProfit >= 3000) score += 25;
    else if (metrics.grossProfit >= 2000) score += 20;
    else if (metrics.grossProfit >= 1000) score += 15;
    else if (metrics.grossProfit >= 500) score += 10;

    // ROI weight (20%)
    if (metrics.roi >= 50) score += 20;
    else if (metrics.roi >= 30) score += 15;
    else if (metrics.roi >= 20) score += 10;
    else if (metrics.roi >= 10) score += 5;

    // Car condition factors (10%)
    if (metrics.carAge <= 5) score += 5;
    else if (metrics.carAge <= 10) score += 3;
    else if (metrics.carAge <= 15) score += 1;

    if (metrics.mileage && metrics.mileage <= 50000) score += 5;
    else if (metrics.mileage && metrics.mileage <= 100000) score += 3;
    else if (metrics.mileage && metrics.mileage <= 150000) score += 1;

    return Math.min(100, Math.max(0, score));
  }

  assessRiskLevel(profitabilityScore, profitMargin) {
    if (profitabilityScore >= 80 && profitMargin >= 25) return 'Low';
    if (profitabilityScore >= 60 && profitMargin >= 15) return 'Medium';
    if (profitabilityScore >= 40 && profitMargin >= 10) return 'High';
    return 'Very High';
  }

  convertJPYToUSD(jpyAmount) {
    return jpyAmount * this.exchangeRates.JPY_TO_USD;
  }

  convertUSDToJPY(usdAmount) {
    return usdAmount * this.exchangeRates.USD_TO_JPY;
  }

  updateExchangeRates(newRates) {
    this.exchangeRates = { ...this.exchangeRates, ...newRates };
  }

  updateCostParameters(newCosts) {
    this.defaultCosts = { ...this.defaultCosts, ...newCosts };
  }
}

module.exports = ProfitCalculator;