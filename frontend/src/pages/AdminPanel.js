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
  Button,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  PlayArrow,
  Refresh,
  CleaningServices,
  Warning,
  CheckCircle,
  Error
} from '@mui/icons-material';
import axios from 'axios';

const AdminPanel = () => {
  const [loading, setLoading] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });

  const { data: dashboardData, refetch: refetchDashboard } = useQuery(
    'admin-dashboard',
    () => axios.get('/api/admin/dashboard').then(res => res.data),
    { refetchInterval: 30000 }
  );

  const { data: healthData, refetch: refetchHealth } = useQuery(
    'admin-health',
    () => axios.get('/api/admin/health').then(res => res.data),
    { refetchInterval: 15000 }
  );

  const { data: scrapingStatus, refetch: refetchScraping } = useQuery(
    'scraping-status',
    () => axios.get('/api/scraping/status').then(res => res.data),
    { refetchInterval: 10000 }
  );

  const { data: scrapingLogs } = useQuery(
    'scraping-logs',
    () => axios.get('/api/scraping/logs?limit=10').then(res => res.data),
    { refetchInterval: 30000 }
  );

  const handleAction = async (action, endpoint) => {
    setLoading(prev => ({ ...prev, [action]: true }));
    try {
      await axios.post(endpoint);
      // Refetch relevant data
      refetchDashboard();
      refetchHealth();
      refetchScraping();
    } catch (error) {
      console.error(`Error executing ${action}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [action]: false }));
    }
  };

  const handleCleanupAction = async (cleanupType) => {
    setLoading(prev => ({ ...prev, cleanup: true }));
    try {
      await axios.post('/api/admin/cleanup', { action: cleanupType });
      refetchDashboard();
      refetchHealth();
    } catch (error) {
      console.error('Cleanup error:', error);
    } finally {
      setLoading(prev => ({ ...prev, cleanup: false }));
      setConfirmDialog({ open: false, action: null });
    }
  };

  const getHealthStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle color="success" />;
      case 'warning': return <Warning color="warning" />;
      case 'critical': return <Error color="error" />;
      default: return <Error color="error" />;
    }
  };

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'error';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Panel
      </Typography>

      {/* System Health */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {getHealthStatusIcon(healthData?.status)}
              <Typography variant="h6" sx={{ ml: 1 }}>
                System Health: {healthData?.status || 'Unknown'}
              </Typography>
              <Chip
                label={`Score: ${Math.round(healthData?.healthScore || 0)}/100`}
                color={getHealthStatusColor(healthData?.status)}
                sx={{ ml: 2 }}
              />
            </Box>

            {healthData?.recommendations?.length > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Recommendations:</Typography>
                <ul>
                  {healthData.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Stale Cars
                    </Typography>
                    <Typography variant="h4">
                      {healthData?.issues?.staleCars || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Missing Resale Data
                    </Typography>
                    <Typography variant="h4">
                      {healthData?.issues?.missingResaleData || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Invalid Profits
                    </Typography>
                    <Typography variant="h4">
                      {healthData?.issues?.invalidProfits || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={loading.fullScrape ? <CircularProgress size={20} /> : <PlayArrow />}
                disabled={loading.fullScrape}
                onClick={() => handleAction('fullScrape', '/api/scraping/trigger-full-scrape')}
              >
                Run Full Scrape
              </Button>
              <Button
                variant="outlined"
                startIcon={loading.updates ? <CircularProgress size={20} /> : <Refresh />}
                disabled={loading.updates}
                onClick={() => handleAction('updates', '/api/scraping/trigger-updates')}
              >
                Update Existing Cars
              </Button>
              <Button
                variant="outlined"
                color="warning"
                startIcon={loading.cleanup ? <CircularProgress size={20} /> : <CleaningServices />}
                disabled={loading.cleanup}
                onClick={() => setConfirmDialog({ open: true, action: 'remove_stale' })}
              >
                Clean Stale Data
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Scraping Status */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Scraping Status
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Total Active Cars:</strong> {scrapingStatus?.totalActiveCars || 0}
              </Typography>
              <Typography variant="body2">
                <strong>Updated Last 24h:</strong> {scrapingStatus?.carsUpdatedLast24h || 0}
              </Typography>
              <Typography variant="body2">
                <strong>Avg Profitability Score:</strong> {Math.round(scrapingStatus?.averageProfitabilityScore || 0)}
              </Typography>
              <Typography variant="body2">
                <strong>Scraper Status:</strong> {scrapingStatus?.scraperStatus || 'Unknown'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            {scrapingLogs && scrapingLogs.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Job</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {scrapingLogs.slice(0, 5).map((log, index) => (
                      <TableRow key={index}>
                        <TableCell>{log.jobName}</TableCell>
                        <TableCell>
                          <Chip
                            label={log.status}
                            color={log.status === 'success' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(log.executedAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="textSecondary">No recent activity</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* System Overview */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Cars
                    </Typography>
                    <Typography variant="h4">
                      {dashboardData?.overview?.totalCars || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Profitable Cars
                    </Typography>
                    <Typography variant="h4">
                      {dashboardData?.overview?.profitableCars || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      High Profit Cars
                    </Typography>
                    <Typography variant="h4">
                      {dashboardData?.overview?.highProfitCars || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Avg Profit
                    </Typography>
                    <Typography variant="h4">
                      ${Math.round(dashboardData?.profitStats?.avgProfit || 0).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, action: null })}
      >
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to clean stale data? This will deactivate cars that haven't been updated in 30 days.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, action: null })}>
            Cancel
          </Button>
          <Button
            onClick={() => handleCleanupAction(confirmDialog.action)}
            color="warning"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel;