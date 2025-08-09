import React from 'react';
import {
  Typography,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Grid,
  Card,
  CardContent,

} from '@mui/material';

const RegionSelector = ({ selectedRegion, setSelectedRegion }) => {
  const handleRegionChange = (event) => {
    setSelectedRegion(event.target.value);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mt: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
        Select Region
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Choose the region to check compliance with
      </Typography>

      <FormControl component="fieldset" sx={{ width: '100%', mt: 2 }}>
        <FormLabel component="legend" sx={{ mb: 2 }}>
          Available Regions
        </FormLabel>
        <RadioGroup
          aria-label="region"
          name="region"
          value={selectedRegion}
          onChange={handleRegionChange}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card 
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  border: selectedRegion === 'saudi' ? '2px solid' : '1px solid',
                  borderColor: selectedRegion === 'saudi' ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 3,
                  },
                }}
              >
               
                <CardContent sx={{ flexGrow: 1 }}>
                  <FormControlLabel
                    value="saudi"
                    control={<Radio />}
                    label={
                      <Typography variant="h6" component="div">
                        Saudi Arabia
                      </Typography>
                    }
                  />
                  <Typography variant="body2" color="text.secondary">
                    Use Saudi Building Code (SBC) standards for Checklist 
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card 
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  border: selectedRegion === 'dubai' ? '2px solid' : '1px solid',
                  borderColor: selectedRegion === 'dubai' ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 3,
                  },
                }}
              >
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <FormControlLabel
                    value="dubai"
                    control={<Radio />}
                    label={
                      <Typography variant="h6" component="div">
                        Dubai
                      </Typography>
                    }
                  />
                  <Typography variant="body2" color="text.secondary">
                       Use Dubai Building Code (DBC) standards for Checklist 
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </RadioGroup>
      </FormControl>
    </Paper>
  );
};

export default RegionSelector;