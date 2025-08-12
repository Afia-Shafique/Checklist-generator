import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Typography, Box, Stepper, Step, StepLabel, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import CodebookSelector from '../components/CodebookSelector';
import RegionSelector from '../components/RegionSelector';
import ChapterSelector from '../components/ChapterSelector';
import { matchSectionsWithCodebooks } from '../services/api';

const steps = ['Select Region', 'Upload Document', 'Select Reference Material', 'Process & Match'];

const UploadPage = () => {
  const { i18n, t } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [activeStep, setActiveStep] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [uploadData, setUploadData] = useState(null);
  const [selectedCodebooks, setSelectedCodebooks] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Initialize RTL state when component mounts
  useEffect(() => {
    // Set document direction and language
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
    
    // Add/remove RTL class to body for CSS targeting
    if (isArabic) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [isArabic, i18n.language]);

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

  // Enhanced button styles using project color scheme
  const buttonStyles = {
    backButton: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f1f3f4 50%, #e8eaed 100%)',
      color: '#5f6368',
      border: '1px solid #dadce0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      '&:hover': {
        background: 'linear-gradient(135deg, #f1f3f4 0%, #e8eaed 50%, #dadce0 100%)',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
        color: '#3c4043',
      },
    },
    nextButton: {
      background: 'linear-gradient(135deg, #ffa725 0%, #ff8c00 100%)',
      color: '#ffffff',
      boxShadow: '0 4px 12px rgba(255, 167, 37, 0.35)',
      '&:hover': {
        background: 'linear-gradient(135deg, #ff8c00 0%, #ff6b35 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 16px rgba(255, 167, 37, 0.4)',
        color: '#ffffff',
      },
    },
    processButton: {
      background: 'linear-gradient(135deg, #ffa725 0%, #ff8c00 100%)',
      color: '#ffffff',
      boxShadow: '0 4px 12px rgba(255, 167, 37, 0.35)',
      '&:hover': {
        background: 'linear-gradient(135deg, #ff8c00 0%, #ff6b35 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 16px rgba(255, 167, 37, 0.4)',
        color: '#ffffff',
      },
    },
  };

  return (
    <div 
      dir={isArabic ? 'rtl' : 'ltr'}
      className={isArabic ? 'rtl' : ''}
      style={{ 
        direction: isArabic ? 'rtl' : 'ltr',
        textAlign: isArabic ? 'right' : 'left'
      }}
    >
      <Container
        maxWidth="md"
        sx={{ 
          direction: isArabic ? 'rtl' : 'ltr',
          textAlign: isArabic ? 'right' : 'left'
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          align="center"
          gutterBottom
          sx={{ 
            mt: 3, 
            color: 'primary.main', 
            textAlign: isArabic ? 'right' : 'left',
            direction: isArabic ? 'rtl' : 'ltr'
          }}
        >
          Document Processing
        </Typography>

        <Stepper
          activeStep={activeStep}
          sx={{ 
            mb: 4, 
            mt: 4, 
            flexDirection: isArabic ? 'row-reverse' : 'row',
            direction: isArabic ? 'rtl' : 'ltr'
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel sx={{ direction: isArabic ? 'rtl' : 'ltr' }}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ direction: isArabic ? 'rtl' : 'ltr' }}>
          {getStepContent(activeStep)}
        </Box>

        {error && (
          <Typography 
            color="error" 
            sx={{ 
              mt: 2, 
              textAlign: isArabic ? 'right' : 'center',
              direction: isArabic ? 'rtl' : 'ltr'
            }}
          >
            {error}
          </Typography>
        )}

        {activeStep !== 3 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 3,
              flexDirection: isArabic ? 'row-reverse' : 'row',
              direction: isArabic ? 'rtl' : 'ltr'
            }}
          >
            <Button
              onClick={handleBack}
              variant="outlined"
              disabled={activeStep === 0}
              sx={{ 
                direction: isArabic ? 'rtl' : 'ltr',
                ...buttonStyles.backButton,
                borderRadius: '20px',
                padding: '10px 20px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
              }}
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
              sx={{ 
                direction: isArabic ? 'rtl' : 'ltr',
                ...(activeStep === 2 ? buttonStyles.processButton : buttonStyles.nextButton),
                borderRadius: '20px',
                padding: '10px 20px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
              }}
            >
              {activeStep === 2 ? 'Process Document' : 'Next'}
            </Button>
          </Box>
        )}
      </Container>
    </div>
  );
};

export default UploadPage;