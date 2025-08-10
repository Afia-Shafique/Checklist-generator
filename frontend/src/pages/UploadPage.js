import React, { useState } from 'react';
import { Container, Typography, Box, Stepper, Step, StepLabel, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import CodebookSelector from '../components/CodebookSelector';
import RegionSelector from '../components/RegionSelector';
import ChapterSelector from '../components/ChapterSelector';
import { matchSectionsWithCodebooks } from '../services/api';

const steps = ['Select Region', 'Upload Document', 'Select Reference Material', 'Process & Match'];

const UploadPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [uploadData, setUploadData] = useState(null);
  const [selectedCodebooks, setSelectedCodebooks] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState([]);
  // const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleUploadSuccess = (data, file) => {
    setUploadData({ ...data, originalFile: file });
    setActiveStep(1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleNext = async () => {
    if (activeStep === 2) {
      if (selectedRegion === 'dubai' && selectedChapters.length === 0) {
        setError('Please select at least one chapter');
        return;
      } else if (selectedRegion !== 'dubai' && selectedCodebooks.length === 0) {
        setError('Please select at least one codebook');
        return;
      }

      setActiveStep(3);
      setError('');

      try {
        // Build FormData for backend
        const formData = new FormData();
        formData.append('region', selectedRegion);
        // Add codebook/chapter IDs
        const ids = selectedRegion === 'dubai' ? selectedChapters : selectedCodebooks;
        ids.forEach(id => {
          if (selectedRegion === 'dubai') {
            formData.append('codebook_ids[]', `DUBAI-${id}`);
          } else {
            // If id already starts with 'SBC-', don't add again
            const codebookId = id.startsWith('SBC-') ? id : `SBC-${id}`;
            formData.append('codebook_ids[]', codebookId);
          }
        });
        // Add the uploaded file (must be the original File object)
        if (uploadData && uploadData.file) {
          formData.append('file', uploadData.file);
        } else if (uploadData && uploadData.originalFile) {
          formData.append('file', uploadData.originalFile);
        } else {
          setError('No uploaded file found.');
          setActiveStep(2);
          return;
        }

        const results = await matchSectionsWithCodebooks(formData);
        console.log('DEBUG: Backend /api/match response:', results);
        navigate('/results', {
          state: {
            uploadData,
            matchedClauses: results.matched_clauses || [],
            checklist: results.checklist || [],
            selectedRegion,
            referenceIds: ids
          }
        });
      } catch (err) {
        console.error('Processing error:', err);
        setError('An error occurred during processing. Please try again.');
        setActiveStep(2);
      }
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <RegionSelector selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} />;
      case 1:
        return <FileUpload onUploadSuccess={handleUploadSuccess} selectedRegion={selectedRegion} />;
      case 2:
        return selectedRegion === 'dubai' ? (
          <ChapterSelector
            selectedChapters={selectedChapters}
            setSelectedChapters={setSelectedChapters}
          />
        ) : (
          <CodebookSelector
            selectedCodebooks={selectedCodebooks}
            setSelectedCodebooks={setSelectedCodebooks}
          />
        );
      case 3:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 3 }}>
              Processing Document
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Matching your specifications with SBC codebooks...
            </Typography>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ mt: 3, color: 'primary.main' }}>
        Document Processing
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {getStepContent(activeStep)}

      {error && (
        <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
          {error}
        </Typography>
      )}

      {activeStep !== 3 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button 
            onClick={handleBack} 
            variant="outlined"
            disabled={activeStep === 0}
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={
              (activeStep === 0 && !selectedRegion) ||
              (activeStep === 1 && !uploadData) ||
              (activeStep === 2 && selectedRegion === 'dubai' && selectedChapters.length === 0) ||
              (activeStep === 2 && selectedRegion !== 'dubai' && selectedCodebooks.length === 0)
            }
          >
            {activeStep === 2 ? 'Process Document' : 'Next'}
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default UploadPage;