import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const handleRegionChange = (event) => {
    setSelectedRegion(event.target.value);
  };

  return (
    <Paper
      elevation={3}
      sx={{ 
        p: 3, 
        borderRadius: 2, 
        mt: 3, 
        direction: isArabic ? 'rtl' : 'ltr',
        textAlign: isArabic ? 'right' : 'left'
      }}
      dir={isArabic ? 'rtl' : 'ltr'}
      className={isArabic ? 'rtl' : ''}
    >
      <Typography 
        variant="h6" 
        gutterBottom 
        color="primary" 
        sx={{ 
          textAlign: isArabic ? 'right' : 'left',
          direction: isArabic ? 'rtl' : 'ltr'
        }}
      >
        Select Region
      </Typography>
      <Typography 
        variant="body2" 
        color="text.secondary" 
        paragraph 
        sx={{ 
          textAlign: isArabic ? 'right' : 'left',
          direction: isArabic ? 'rtl' : 'ltr'
        }}
      >
        Choose the region to check compliance with
      </Typography>

      <FormControl 
        component="fieldset" 
        sx={{ 
          width: '100%', 
          mt: 2,
          direction: isArabic ? 'rtl' : 'ltr'
        }}
      >
        <FormLabel 
          component="legend" 
          sx={{ 
            mb: 2,
            textAlign: isArabic ? 'right' : 'left',
            direction: isArabic ? 'rtl' : 'ltr'
          }}
        >
          Available Regions
        </FormLabel>
        <RadioGroup
          aria-label="region"
          name="region"
          value={selectedRegion}
          onChange={handleRegionChange}
          sx={{ direction: isArabic ? 'rtl' : 'ltr' }}
        >
          <Grid 
            container 
            spacing={3}
            sx={{ 
              direction: isArabic ? 'rtl' : 'ltr',
              flexDirection: isArabic ? 'row-reverse' : 'row'
            }}
          >
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
                  direction: isArabic ? 'rtl' : 'ltr',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 3,
                  },
                }}
              >
               
                <CardContent 
                  sx={{ 
                    flexGrow: 1,
                    direction: isArabic ? 'rtl' : 'ltr',
                    textAlign: isArabic ? 'right' : 'left'
                  }}
                >
                  <FormControlLabel
                    value="saudi"
                    control={<Radio />}
                    label={
                      <Typography 
                        variant="h6" 
                        component="div"
                        sx={{ 
                          direction: isArabic ? 'rtl' : 'ltr',
                          textAlign: isArabic ? 'right' : 'left'
                        }}
                      >
                        Saudi Arabia
                      </Typography>
                    }
                    sx={{ 
                      direction: isArabic ? 'rtl' : 'ltr',
                      flexDirection: isArabic ? 'row-reverse' : 'row'
                    }}
                  />
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      direction: isArabic ? 'rtl' : 'ltr',
                      textAlign: isArabic ? 'right' : 'left'
                    }}
                  >
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
                  direction: isArabic ? 'rtl' : 'ltr',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 3,
                  },
                }}
              >
                
                <CardContent 
                  sx={{ 
                    flexGrow: 1,
                    direction: isArabic ? 'rtl' : 'ltr',
                    textAlign: isArabic ? 'right' : 'left'
                  }}
                >
                  <FormControlLabel
                    value="dubai"
                    control={<Radio />}
                    label={
                      <Typography 
                        variant="h6" 
                        component="div"
                        sx={{ 
                          direction: isArabic ? 'rtl' : 'ltr',
                          textAlign: isArabic ? 'right' : 'left'
                        }}
                      >
                        Dubai
                      </Typography>
                    }
                    sx={{ 
                      direction: isArabic ? 'rtl' : 'ltr',
                      flexDirection: isArabic ? 'row-reverse' : 'row'
                    }}
                  />
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      direction: isArabic ? 'rtl' : 'ltr',
                      textAlign: isArabic ? 'right' : 'left'
                    }}
                  >
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