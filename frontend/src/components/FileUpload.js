import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { uploadDocument } from '../services/api';
import { useNavigate } from 'react-router-dom';

const FileUpload = ({ onUploadSuccess, selectedRegion }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles) => {
    setError('');
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
        '.docx',
      ],
      'text/plain': ['.txt'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    // Pass the selected region to the backend
    formData.append('region', selectedRegion || 'saudi');

    setLoading(true);
    setError('');

    try {
      // Call the API endpoint with the file and region
      const result = await uploadDocument(formData, selectedRegion || 'saudi');
      
      if (onUploadSuccess) {
        onUploadSuccess(result, file);
      } else {
        // Navigate to results page with the data
        navigate('/results', { state: { data: result } });
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(
        err.message || 'Failed to upload document. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper
        elevation={3}
        sx={{ p: 4, borderRadius: 2, backgroundColor: 'background.paper' }}
      >
        <Typography variant="h5" gutterBottom align="center" color="primary">
          Upload Construction Document
        </Typography>

        <Box
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}
          sx={{ mt: 3, mb: 3 }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon
            sx={{ fontSize: 48, color: 'primary.main', mb: 2 }}
          />
          {isDragActive ? (
            <Typography variant="body1">Drop the file here...</Typography>
          ) : (
            <Typography variant="body1">
              Drag & drop a file here, or click to select a file
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG
          </Typography>
        </Box>

        {file && (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="body2">
              Selected file: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={!file || loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{ minWidth: 150 }}
          >
            {loading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default FileUpload;