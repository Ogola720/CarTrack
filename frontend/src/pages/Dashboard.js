import React from 'react';
import { useQuery } from 'react-query';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery(
    'dashboard-stats',
    () => axios.get('/api/admin/dashboard').then(res => res.data),
    { refetchInterval: 30000 }
  );

  const { data: topCars } = useQuery(
    'top-profitable-cars',
    () => axios.get('/api/cars/top-profitable?limit=5').then(res => res.data),
    { refetchInterval: 60000 }
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Cars
              </Typography>
              <Typography variant="h4">
                {stats?.overview?.totalCars || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Profitable Cars
              </Typography>
              <Typography variant="h4">
                {stats?.overview?.profitableCars || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {stats?.overview?.profitablePercentage || 0}% of total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                High Profit Cars
              </Typography>
              <Typography variant="h4">
                {stats?.overview?.highProfitCars || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg Profit
              </Typography>
              <Typography variant="h4">
                ${Math.round(stats?.profitStats?.avgProfit || 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Top Makes Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Top Car Makes
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={stats?.topMakes || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Profitability Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Profitability Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={stats?.profitabilityDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, count }) => `${_id}-${_id + 20}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(stats?.profitabilityDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Profitable Cars */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Profitable Cars
            </Typography>
            <Grid container spacing={2}>
              {(topCars || []).map((car, index) => (
                <Grid item xs={12} sm={6} md={4} key={car._id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6">
                        {car.make} {car.model}
                      </Typography>
                      <Typography color="textSecondary">
                        {car.year}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Japan Price: ¥{car.japanPrice?.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        Est. Profit: ${Math.round(car.estimatedProfit || 0).toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        Score: {Math.round(car.profitabilityScore || 0)}/100
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;