import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar position="static">
      <Toolbar>
        <DirectionsCarIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Car Arbitrage System
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            component={Link}
            to="/"
            sx={{ 
              backgroundColor: isActive('/') ? 'rgba(255,255,255,0.1)' : 'transparent' 
            }}
          >
            Dashboard
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/cars"
            sx={{ 
              backgroundColor: isActive('/cars') ? 'rgba(255,255,255,0.1)' : 'transparent' 
            }}
          >
            Car Listings
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/admin"
            sx={{ 
              backgroundColor: isActive('/admin') ? 'rgba(255,255,255,0.1)' : 'transparent' 
            }}
          >
            Admin
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;