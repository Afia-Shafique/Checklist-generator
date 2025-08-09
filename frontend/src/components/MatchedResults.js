import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Grid,
  Paper,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import GetAppIcon from '@mui/icons-material/GetApp';

const MatchedResults = ({ results }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [minSimilarity, setMinSimilarity] = useState(0.7);
  const [expandedId, setExpandedId] = useState(null);

  const handleAccordionChange = (id) => (event, isExpanded) => {
    setExpandedId(isExpanded ? id : null);
  };

  const getSimilarityColor = (score) => {
    if (score >= 0.85) return 'similarity-high';
    if (score >= 0.75) return 'similarity-medium';
    return 'similarity-low';
  };

  const filteredResults = results.filter(
    (item) =>
      item.similarity_score >= minSimilarity &&
      (searchTerm === '' ||
        item.user_section.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.matched_clause.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user_section.section_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.matched_clause.section_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExportResults = () => {
    // Create a more descriptive filename with date
    const date = new Date().toISOString().split('T')[0];
    const filename = `construction_doc_matches_${date}.json`;
    
    // Format the JSON with proper indentation for readability
    const jsonStr = JSON.stringify(results, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    
    // Create and trigger download
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
    }, 100);
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExportWithLoading = () => {
    setIsExporting(true);
    // Use setTimeout to allow UI to update before processing
    setTimeout(() => {
      try {
        handleExportResults();
      } finally {
        setIsExporting(false);
      }
    }, 100);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" color="primary">
            Matched Results
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleExportWithLoading}
            disabled={isExporting}
            sx={{ 
              fontWeight: 'bold',
              px: 3,
              py: 1,
              boxShadow: 3,
              '&:hover': { boxShadow: 5 }
            }}
            startIcon={isExporting ? <CircularProgress size={20} color="inherit" /> : <GetAppIcon />}
          >
            {isExporting ? 'Exporting...' : 'Download JSON Results'}
          </Button>
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search in results..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ mr: 2 }}>
                Min. Similarity:
              </Typography>
              <TextField
                type="number"
                value={minSimilarity}
                onChange={(e) => setMinSimilarity(parseFloat(e.target.value))}
                inputProps={{ min: 0, max: 1, step: 0.05 }}
                size="small"
                sx={{ width: 80 }}
              />
            </Box>
          </Grid>
        </Grid>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Showing {filteredResults.length} of {results.length} matches
        </Typography>

        {filteredResults.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
            No matches found with the current filters.
          </Typography>
        ) : (
          filteredResults.map((item, index) => (
            <Accordion 
              key={index} 
              expanded={expandedId === index}
              onChange={handleAccordionChange(index)}
              sx={{ mb: 2, borderRadius: 1, overflow: 'hidden' }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={12} sm={7}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {item.user_section.section_id}: {item.user_section.title.replace(item.user_section.section_id, '').trim()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Chip 
                      label={`SBC-${item.matched_clause.codebook}`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <Typography 
                      variant="body2" 
                      className={getSimilarityColor(item.similarity_score)}
                      fontWeight="medium"
                    >
                      {(item.similarity_score * 100).toFixed(0)}% Match
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" color="primary" gutterBottom>
                          User Specification
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Section {item.user_section.section_id}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body1" paragraph>
                          {item.user_section.content}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ height: '100%', bgcolor: 'rgba(1, 110, 79, 0.05)' }}>
                      <CardContent>
                        <Typography variant="h6" color="primary" gutterBottom>
                          Matched SBC Code
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {item.matched_clause.section_id}
                          </Typography>
                          <Chip 
                            label={`SBC-${item.matched_clause.codebook}`} 
                            size="small" 
                            color="primary"
                          />
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body1" paragraph>
                          {item.matched_clause.content}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Paper>
    </Box>
  );
};

export default MatchedResults;