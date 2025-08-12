import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Paper,
  Divider,
  Button,
} from '@mui/material';

const CODEBOOKS = [
  { id: 'SBC-1101', name: 'SBC-1101_Residential_Building_Code', category: 'Building' },
  { id: 'SBC-201', name: 'SBC-201_Building_Code', category: 'Building' },
  { id: 'SBC-301', name: 'SBC-301_Loading_Code', category: 'Structural' },
  { id: 'SBC-302', name: 'SBC-302_Construction_Code', category: 'Construction' },
  { id: 'SBC-303', name: 'SBC-303_Soil_Foundation', category: 'Structural' },
  { id: 'SBC-305', name: 'SBC-305_Masonry', category: 'Structural' },
  { id: 'SBC-306', name: 'SBC-306_Steel', category: 'Structural' },
  { id: 'SBC-501', name: 'SBC-501_Mechanical', category: 'Mechanical' },
  { id: 'SBC-701', name: 'SBC-701_Plumbing', category: 'Plumbing' },
  { id: 'SBC-801', name: 'SBC-801_Fire', category: 'Fire' },
  { id: 'SBC-901', name: 'SBC-901_Existing_Building_Code', category: 'Building' },
];

// Group codebooks by category
const groupedCodebooks = CODEBOOKS.reduce((acc, codebook) => {
  if (!acc[codebook.category]) {
    acc[codebook.category] = [];
  }
  acc[codebook.category].push(codebook);
  return acc;
}, {});

const CodebookSelector = ({ selectedCodebooks, setSelectedCodebooks }) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const handleToggleAll = () => {
    if (selectedCodebooks.length === CODEBOOKS.length) {
      setSelectedCodebooks([]);
    } else {
      setSelectedCodebooks(CODEBOOKS.map((book) => book.id));
    }
  };

  const handleToggleCategory = (category) => {
    const categoryCodebooks = CODEBOOKS.filter(
      (book) => book.category === category
    ).map((book) => book.id);

    const allSelected = categoryCodebooks.every((id) =>
      selectedCodebooks.includes(id)
    );

    if (allSelected) {
      // Remove all from this category
      setSelectedCodebooks(
        selectedCodebooks.filter((id) => !categoryCodebooks.includes(id))
      );
    } else {
      // Add all from this category that aren't already selected
      const newSelected = [...selectedCodebooks];
      categoryCodebooks.forEach((id) => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      setSelectedCodebooks(newSelected);
    }
  };

  const handleToggleCodebook = (codebookId) => {
    if (selectedCodebooks.includes(codebookId)) {
      setSelectedCodebooks(selectedCodebooks.filter((id) => id !== codebookId));
    } else {
      setSelectedCodebooks([...selectedCodebooks, codebookId]);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{ p: 3, borderRadius: 2, mt: 3, direction: isArabic ? 'rtl' : 'ltr' }}
      dir={isArabic ? 'rtl' : 'ltr'}
      className={isArabic ? 'rtl' : ''}
    >
      <Typography variant="h6" gutterBottom color="primary" sx={{ textAlign: isArabic ? 'right' : 'left' }}>
        Select Codebooks for Matching
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph sx={{ textAlign: isArabic ? 'right' : 'left' }}>
        Choose which SBC codebooks to use for matching with your document sections.
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexDirection: isArabic ? 'row-reverse' : 'row' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={handleToggleAll}
          sx={{ mr: 1 }}
        >
          {selectedCodebooks.length === CODEBOOKS.length
            ? 'Deselect All'
            : 'Select All'}
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <FormControl component="fieldset" sx={{ width: '100%' }}>
        {Object.entries(groupedCodebooks).map(([category, books]) => (
          <Box key={category} sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={books
                    .map((book) => book.id)
                    .every((id) => selectedCodebooks.includes(id))}
                  indeterminate={
                    books
                      .map((book) => book.id)
                      .some((id) => selectedCodebooks.includes(id)) &&
                    !books
                      .map((book) => book.id)
                      .every((id) => selectedCodebooks.includes(id))
                  }
                  onChange={() => handleToggleCategory(category)}
                  color="primary"
                />
              }
              label={
                <Typography variant="subtitle1" fontWeight="bold">
                  {category}
                </Typography>
              }
            />
            <FormGroup sx={{ ml: 3 }}>
              {books.map((book) => (
                <FormControlLabel
                  key={book.id}
                  control={
                    <Checkbox
                      checked={selectedCodebooks.includes(book.id)}
                      onChange={() => handleToggleCodebook(book.id)}
                      color="primary"
                    />
                  }
                  label={book.name.replace('_', ' ')}
                />
              ))}
            </FormGroup>
          </Box>
        ))}
      </FormControl>
    </Paper>
  );
};

export default CodebookSelector;