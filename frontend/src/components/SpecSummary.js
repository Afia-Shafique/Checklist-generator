import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const SpecSummary = ({ matchedResults }) => {
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleViewDetails = (spec) => {
    setSelectedSpec(spec);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Function to truncate text to first 2 lines
  const truncateText = (text, maxLines = 2) => {
    if (!text) return '';
    
    const lines = text.split('\n');
    if (lines.length <= maxLines) return text;
    
    return lines.slice(0, maxLines).join('\n') + '...';
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Matching Specification Sections
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {matchedResults.map((result, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="subtitle1" component="div" fontWeight="medium">
                    {result.section_id || `Section ${index + 1}`}
                  </Typography>
                  <Chip 
                    label={`${Math.round(result.similarity_score * 100)}% Match`}
                    color={result.similarity_score > 0.8 ? 'success' : 
                           result.similarity_score > 0.6 ? 'primary' : 'default'}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Codebook: {result.codebook || 'Not specified'}
                </Typography>
                
                <Divider sx={{ my: 1 }} />
                
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
                  User Specification:
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'pre-line',
                    bgcolor: 'grey.50',
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  {truncateText(result.user_section?.content || 'No content available')}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
                  Matched Code:
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'pre-line',
                    bgcolor: 'grey.50',
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  {truncateText(result.matched_clause?.content || 'No content available')}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => handleViewDetails(result)}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Detail Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedSpec && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {selectedSpec.section_id || 'Specification Detail'}
              </Typography>
              <IconButton aria-label="close" onClick={handleCloseDialog} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Similarity Score
                    </Typography>
                    <Chip 
                      label={`${Math.round(selectedSpec.similarity_score * 100)}% Match`}
                      color={selectedSpec.similarity_score > 0.8 ? 'success' : 
                             selectedSpec.similarity_score > 0.6 ? 'primary' : 'default'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Codebook
                    </Typography>
                    <Typography variant="body1">
                      {selectedSpec.codebook || 'Not specified'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  User Specification
                </Typography>
                <Typography variant="body2" paragraph>
                  Section ID: {selectedSpec.user_section?.section_id || 'N/A'}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.50', p: 2, borderRadius: 1 }}
                >
                  {selectedSpec.user_section?.content || 'No content available'}
                </Typography>
              </Paper>
              
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Matched Building Code
                </Typography>
                <Typography variant="body2" paragraph>
                  Section ID: {selectedSpec.matched_clause?.section_id || 'N/A'}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.50', p: 2, borderRadius: 1 }}
                >
                  {selectedSpec.matched_clause?.content || 'No content available'}
                </Typography>
              </Paper>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default SpecSummary;