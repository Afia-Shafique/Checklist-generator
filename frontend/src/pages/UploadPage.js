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
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleUploadSuccess = (data, file) => {
    setUploadData({ ...data, originalFile: file });
    setActiveStep(1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };


// Only showing the key changes in handleNext()

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
      const formData = new FormData();
      formData.append('region', selectedRegion);

      if (selectedRegion === 'dubai') {
        formData.append('selected_chapters', JSON.stringify(selectedChapters));
        formData.append('selected_subcategories', JSON.stringify(selectedSubcategories));
      } else {
        selectedCodebooks.forEach(id => {
          const codebookId = id.startsWith('SBC-') ? id : `SBC-${id}`;
          formData.append('codebook_ids[]', codebookId);
        });
      }

      if (uploadData?.file) {
        formData.append('file', uploadData.file);
      } else if (uploadData?.originalFile) {
        formData.append('file', uploadData.originalFile);
      } else {
        setError('No uploaded file found.');
        setActiveStep(2);
        return;
      }

      const results = await matchSectionsWithCodebooks(formData);
      navigate('/results', {
        state: {
          uploadData,
          matchedClauses: results.matched_clauses || [],
          checklist: results.checklist || [],
          selectedRegion,
          referenceIds: selectedRegion === 'dubai' ? selectedChapters : selectedCodebooks
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
        return (
          <FileUpload
            onUploadSuccess={handleUploadSuccess}
            selectedRegion={selectedRegion}
            selectedChapters={selectedChapters}
            selectedSubcategories={selectedSubcategories}
          />
        );
      case 2:
        return selectedRegion === 'dubai' ? (
          <ChapterSelector
            selectedChapters={selectedChapters}
            setSelectedChapters={setSelectedChapters}
            selectedRegion={selectedRegion}
            selectedSubcategories={selectedSubcategories}
            setSelectedSubcategories={setSelectedSubcategories}
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
              Matching your specifications with Legal requirements.
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
