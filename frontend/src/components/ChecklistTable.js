import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
} from '@mui/icons-material';

const ChecklistTable = ({ checklistItems, isLoading, error }) => {
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState(null);
  const [sendingChecklist, setSendingChecklist] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState(null);

  const handleViewChecklist = (checklist) => {
    setSelectedChecklist(checklist);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleDownload = async (format) => {
    setDownloadingFormat(format);
    try {
      // Simulate download delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, this would call an API endpoint to generate the file
      let content = '';
      let filename = '';
      let mimeType = '';
      
      if (format === 'csv') {
        // Generate CSV content
        const headers = ['Item', 'Requirement', 'Status', 'Comments'];
        const rows = selectedChecklist.items.map(item => [
          item.id,
          item.requirement,
          item.status || 'Not Verified',
          item.comments || ''
        ]);
        
        content = [
          headers.join(','),
          ...rows.map(row => row.join(','))
        ].join('\n');
        
        filename = `checklist-${selectedChecklist.id}-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      } else if (format === 'pdf') {
        // In a real implementation, this would generate a PDF
        // For now, we'll just create a text representation
        content = `Checklist: ${selectedChecklist.title}\n\n`;
        selectedChecklist.items.forEach(item => {
          content += `Item: ${item.id}\nRequirement: ${item.requirement}\nStatus: ${item.status || 'Not Verified'}\nComments: ${item.comments || ''}\n\n`;
        });
        
        filename = `checklist-${selectedChecklist.id}-${new Date().toISOString().split('T')[0]}.txt`;
        mimeType = 'text/plain';
        // In a real implementation, this would be application/pdf
      }
      
      // Create and download the file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading checklist:', error);
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handleSendToAdmin = async () => {
    setSendingChecklist(true);
    setSendSuccess(false);
    setSendError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, this would send the checklist to an admin via API
      setSendSuccess(true);
    } catch (error) {
      console.error('Error sending checklist to admin:', error);
      setSendError('Failed to send checklist to admin. Please try again.');
    } finally {
      setSendingChecklist(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!checklistItems || checklistItems.length === 0) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        No checklists available for this document.
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Compliance Checklists
      </Typography>
      
      <TableContainer component={Paper} sx={{ mt: 2, mb: 4 }}>
        <Table aria-label="compliance checklists table">
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Items</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {checklistItems.map((checklist) => (
              <TableRow key={checklist.id} hover>
                <TableCell>{checklist.id}</TableCell>
                <TableCell>
                  <Typography variant="subtitle2">
                    {checklist.title_short || checklist.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {checklist.reference}
                  </Typography>
                </TableCell>
                <TableCell>{(checklist.items || []).length}</TableCell>
                <TableCell>
                  <Chip 
                    label={checklist.status || 'Not Verified'} 
                    color={checklist.status === 'Compliant' ? 'success' : 
                           checklist.status === 'Non-Compliant' ? 'error' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="View Checklist">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleViewChecklist(checklist)}
                      size="small"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Checklist Detail Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {selectedChecklist?.title}
          </Typography>
          <IconButton aria-label="close" onClick={handleCloseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedChecklist && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Checklist ID: {selectedChecklist.id}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  This checklist contains {(selectedChecklist.items || []).length} compliance items related to the document specifications.
                </Typography>
                {sendSuccess && (
                  <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                    Checklist successfully sent to admin!
                  </Alert>
                )}
                {sendError && (
                  <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                    {sendError}
                  </Alert>
                )}
              </Box>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell width="10%">Item</TableCell>
                      <TableCell width="60%">Requirement</TableCell>
                      <TableCell width="15%">Status</TableCell>
                      <TableCell width="15%">Comments</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedChecklist.items || []).map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.requirement}</TableCell>
                        <TableCell>
                          <Chip 
                            label={item.status || 'Not Verified'} 
                            color={item.status === 'Compliant' ? 'success' : 
                                  item.status === 'Non-Compliant' ? 'error' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{item.comments || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SendIcon />}
              onClick={handleSendToAdmin}
              disabled={sendingChecklist}
              sx={{ mr: 1 }}
            >
              {sendingChecklist ? 'Sending...' : 'Send to Admin'}
              {sendingChecklist && <CircularProgress size={24} sx={{ ml: 1 }} />}
            </Button>
          </Box>
          <Box>
            <Button
              variant="outlined"
              startIcon={<CsvIcon />}
              onClick={() => handleDownload('csv')}
              disabled={downloadingFormat !== null}
              sx={{ mr: 1 }}
            >
              {downloadingFormat === 'csv' ? 'Downloading...' : 'Download CSV'}
              {downloadingFormat === 'csv' && <CircularProgress size={24} sx={{ ml: 1 }} />}
            </Button>
            <Button
              variant="outlined"
              startIcon={<PdfIcon />}
              onClick={() => handleDownload('pdf')}
              disabled={downloadingFormat !== null}
            >
              {downloadingFormat === 'pdf' ? 'Downloading...' : 'Download PDF'}
              {downloadingFormat === 'pdf' && <CircularProgress size={24} sx={{ ml: 1 }} />}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChecklistTable;