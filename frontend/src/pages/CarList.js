import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Chip,
  CircularProgress,
  Pagination
} from '@mui/material';
import axios from 'axios';

const CarList = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    make: '',
    model: '',
    minYear: '',
    maxYear: '',
    minProfit: '',
    maxPrice: '',
    sortBy: 'profitabilityScore',
    sortOrder: 'desc'
  });

  const { data, isLoading, refetch } = useQuery(
    ['cars', filters],
    () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      return axios.get(`/api/cars?${params}`).then(res => res.data);
    },
    { keepPreviousData: true }
  );

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (event, newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Low': return 'success';
      case 'Medium': return 'warning';
      case 'High': return 'error';
      default: return 'default';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    if (score >= 40) return 'error';
    return 'default';
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Car Listings
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Make"
              value={filters.make}
              onChange={(e) => handleFilterChange('make', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Model"
              value={filters.model}
              onChange={(e) => handleFilterChange('model', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Min Year"
              type="number"
              value={filters.minYear}
              onChange={(e) => handleFilterChange('minYear', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Max Year"
              type="number"
              value={filters.maxYear}
              onChange={(e) => handleFilterChange('maxYear', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Min Profit ($)"
              type="number"
              value={filters.minProfit}
              onChange={(e) => handleFilterChange('minProfit', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Max Price (¥)"
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Sort By"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <MenuItem value="profitabilityScore">Profitability Score</MenuItem>
              <MenuItem value="estimatedProfit">Estimated Profit</MenuItem>
              <MenuItem value="profitMargin">Profit Margin</MenuItem>
              <MenuItem value="japanPrice">Japan Price</MenuItem>
              <MenuItem value="year">Year</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Order"
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            >
              <MenuItem value="desc">Descending</MenuItem>
              <MenuItem value="asc">Ascending</MenuItem>
            </TextField>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={() => setFilters({
            page: 1, limit: 20, make: '', model: '', minYear: '', maxYear: '',
            minProfit: '', maxPrice: '', sortBy: 'profitabilityScore', sortOrder: 'desc'
          })}>
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {/* Results */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1">
          Showing {data?.cars?.length || 0} of {data?.total || 0} cars
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {(data?.cars || []).map((car) => (
          <Grid item xs={12} md={6} lg={4} key={car._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6">
                    {car.make} {car.model}
                  </Typography>
                  <Chip
                    label={`${Math.round(car.profitabilityScore || 0)}/100`}
                    color={getScoreColor(car.profitabilityScore)}
                    size="small"
                  />
                </Box>

                <Typography color="textSecondary" gutterBottom>
                  {car.year} • {car.mileage?.toLocaleString() || 'N/A'} km
                </Typography>

                <Box sx={{ my: 2 }}>
                  <Typography variant="body2">
                    <strong>Japan Price:</strong> ¥{car.japanPrice?.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Resale Value:</strong> ${car.africaResaleValue?.toLocaleString() || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    <strong>Est. Profit:</strong> ${Math.round(car.estimatedProfit || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Profit Margin:</strong> {car.profitMargin?.toFixed(1) || 0}%
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={car.scrapingSource || 'Unknown'}
                    size="small"
                    variant="outlined"
                  />
                  {car.transmission && (
                    <Chip
                      label={car.transmission}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {car.fuelType && (
                    <Chip
                      label={car.fuelType}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  Updated: {new Date(car.lastUpdated).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {data?.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={data.totalPages}
            page={filters.page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
};

export default CarList;