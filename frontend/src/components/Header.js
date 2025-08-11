import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
// Removed document icon to simplify the brand per request

const Header = () => {
  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ backgroundColor: 'transparent' }}>
      <Container maxWidth="lg">
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: 'none',
                color: 'text.primary',
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}
            >
              Construction Doc Parser
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button
              variant="contained"
              color="secondary"
              component={RouterLink}
              to="/"
              sx={{ mx: 1, borderRadius: '20px', boxShadow: 3 }}
            >
              Home
            </Button>
            <Button
              variant="contained"
              color="secondary"
              component={RouterLink}
              to="/upload"
              sx={{ mx: 1, borderRadius: '20px', boxShadow: 3 }}
            >
              Upload Document
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;