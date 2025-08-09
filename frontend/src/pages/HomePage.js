import React from 'react';
import { Box, Typography, Button, Container, Grid, Paper, Card, CardContent, CardActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ChecklistIcon from '@mui/icons-material/Checklist';
import AnalyticsIcon from '@mui/icons-material/Analytics';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ textAlign: 'center', mt: 4, mb: 6 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: 'primary.main',
          }}
        >
          Construction Document Parser
        </Typography>
        <Typography
          variant="h5"
          component="h2"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}
        >
          Extract, analyze, and match construction specifications with Saudi Building Code requirements
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          startIcon={<UploadFileIcon />}
          onClick={() => navigate('/upload')}
          sx={{ py: 1.5, px: 4, borderRadius: 2 }}
        >
          Upload Document
        </Button>
      </Box>

      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Card className="section-card" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <MenuBookIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Code Matching
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Automatically match your construction specifications with relevant SBC code requirements using advanced AI technology.
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 3, pb: 3 }}>
              <Button size="small" color="primary">
                Learn More
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className="section-card" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <ChecklistIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Compliance Checklist
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Generate comprehensive compliance checklists based on the matched code requirements to ensure your project meets all standards.
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 3, pb: 3 }}>
              <Button size="small" color="primary">
                Learn More
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className="section-card" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <AnalyticsIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Analysis & Reporting
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Get detailed analysis and reports on how your specifications align with building codes, with recommendations for improvements.
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 3, pb: 3 }}>
              <Button size="small" color="primary">
                Learn More
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 2,
          bgcolor: 'primary.main',
          color: 'white',
          mb: 6,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>
              Ready to analyze your construction documents?
            </Typography>
            <Typography variant="body1">
              Upload your specifications and get instant matching with relevant SBC codes.
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            md={4}
            sx={{ display: 'flex', justifyContent: { md: 'flex-end', xs: 'center' } }}
          >
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => navigate('/upload')}
            >
              Get Started
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default HomePage;