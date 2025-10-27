const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  // Basic car information
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  mileage: { type: Number },
  condition: { type: String },
  
  // Japanese listing data
  japanPrice: { type: Number, required: true },
  japanCurrency: { type: String, default: 'JPY' },
  japanListingUrl: { type: String },
  japanAuctionHouse: { type: String },
  japanListingDate: { type: Date },
  
  // African resale data
  africaResaleValue: { type: Number },
  africaCurrency: { type: String, default: 'USD' },
  resaleDataSource: { type: String },
  
  // Profitability calculations
  estimatedShippingCost: { type: Number },
  estimatedDutiesTaxes: { type: Number },
  estimatedTotalCost: { type: Number },
  estimatedProfit: { type: Number },
  profitMargin: { type: Number },
  profitabilityScore: { type: Number },
  
  // Additional details
  engineSize: { type: String },
  fuelType: { type: String },
  transmission: { type: String },
  bodyType: { type: String },
  color: { type: String },
  
  // System metadata
  lastUpdated: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  scrapingSource: { type: String },
  
}, {
  timestamps: true
});

// Indexes for better query performance
carSchema.index({ profitabilityScore: -1 });
carSchema.index({ make: 1, model: 1 });
carSchema.index({ year: 1 });
carSchema.index({ lastUpdated: -1 });

module.exports = mongoose.model('Car', carSchema);