import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MatchedResults from '../components/MatchedResults';
import SpecSummary from '../components/SpecSummary';
import ChecklistTable from '../components/ChecklistTable';

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Check if we have data from the navigation state
    if (location.state?.uploadData && (location.state?.matchedClauses || location.state?.checklist)) {
      setData({
        uploadData: location.state.uploadData,
        matchedClauses: location.state.matchedClauses || [],
        checklist: location.state.checklist || [],
        selectedCodebooks: location.state.selectedCodebooks || [],
        selectedRegion: location.state.selectedRegion || 'saudi',
        referenceIds: location.state.referenceIds || []
      });
      setLoading(false);
    } else {
      // No data, show error
      setError('No processing data found. Please upload a document first.');
      setLoading(false);
    }
  }, [location]);

  const checklists = Array.isArray(data?.checklist) ? data.checklist.filter(Boolean) : [];
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleBackToUpload = () => {
    navigate('/upload');
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 3 }}>
          Loading Results...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToUpload}
        >
          Back to Upload
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToUpload}
          sx={{ mb: 3 }}
        >
          Back to Upload
        </Button>

        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            Document Analysis Results
          </Typography>

          <Typography variant="body1" paragraph>
            Document processed successfully. Below are the matches between your specifications
            and the selected reference materials.
          </Typography>

          {data?.uploadData?.metadata?.project_name && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Project: {data.uploadData.metadata.project_name}
              </Typography>
            </Box>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Reference Material Used:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {data?.selectedCodebooks?.map((codebook) => (
                <Chip
                  key={codebook}
                  label={codebook}
                  color="primary"
                  variant="outlined"
                  className="codebook-chip"
                />
              ))}
              {data?.referenceIds?.map((refId) => (
                <Chip
                  key={refId}
                  label={refId}
                  color="secondary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Document Sections: {data?.uploadData?.sections?.length || 0}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Matched Clauses: {data?.matchedClauses?.length || 0}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Region: {data?.selectedRegion === 'dubai' ? 'Dubai' : 'Saudi Arabia'}
            </Typography>
          </Box>
        </Paper>
        
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="results tabs"
              variant="fullWidth"
            >
              <Tab label="Checklists" />
              <Tab label="Spec Summary" />
              <Tab label="Detailed Results" />
            </Tabs>
          </Box>
          
          {/* Tab Content */}
          <Box sx={{ py: 2 }}>
            {activeTab === 0 && (
              <ChecklistTable checklistItems={checklists} isLoading={loading} error={error} />
            )}

            {activeTab === 1 && (
              data?.matchedClauses?.length > 0 ? (
                <SpecSummary matchedResults={data.matchedClauses} />
              ) : (
                <Alert severity="info">
                  No matches found. Try selecting different reference material or uploading a different document.
                </Alert>
              )
            )}

            {activeTab === 2 && (
              data?.matchedClauses?.length > 0 ? (
                <MatchedResults results={data.matchedClauses} />
              ) : (
                <Alert severity="info" sx={{ mt: 3 }}>
                  No matches found between your document and the selected reference materials.
                  Try selecting different reference materials or check your document content.
                </Alert>
              )
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ResultsPage;