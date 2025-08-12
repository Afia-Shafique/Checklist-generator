import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const DUBAI_CHAPTERS = [
  { id: 'chapter1', name: 'Chapter 1: General', category: 'General' },
  { id: 'chapter2', name: 'Chapter 2: Definitions', category: 'General' },
  { id: 'chapter3', name: 'Chapter 3: Use and Occupancy Classification', category: 'Classification' },
  { id: 'chapter4', name: 'Chapter 4: Special Detailed Requirements Based on Use and Occupancy', category: 'Classification' },
  { id: 'chapter5', name: 'Chapter 5: General Building Heights and Areas', category: 'Building Requirements' },
  { id: 'chapter6', name: 'Chapter 6: Types of Construction', category: 'Building Requirements' },
  { id: 'chapter7', name: 'Chapter 7: Fire and Smoke Protection Features', category: 'Fire Safety' },
  { id: 'chapter8', name: 'Chapter 8: Interior Finishes', category: 'Building Requirements' },
  { id: 'chapter9', name: 'Chapter 9: Fire Protection and Life Safety Systems', category: 'Fire Safety' },
  { id: 'chapter10', name: 'Chapter 10: Means of Egress', category: 'Fire Safety' },
  { id: 'chapter11', name: 'Chapter 11: Accessibility', category: 'Accessibility' },
  { id: 'chapter12', name: 'Chapter 12: Interior Environment', category: 'Environment' },
  { id: 'chapter13', name: 'Chapter 13: Energy Efficiency', category: 'Environment' },
  { id: 'chapter14', name: 'Chapter 14: Exterior Walls', category: 'Building Requirements' },
  { id: 'chapter15', name: 'Chapter 15: Roof Assemblies and Rooftop Structures', category: 'Building Requirements' },
  { id: 'chapter16', name: 'Chapter 16: Structural Design', category: 'Structural' },
  { id: 'chapter17', name: 'Chapter 17: Special Inspections and Tests', category: 'Structural' },
  { id: 'chapter18', name: 'Chapter 18: Soils and Foundations', category: 'Structural' },
  { id: 'chapter19', name: 'Chapter 19: Concrete', category: 'Materials' },
  { id: 'chapter20', name: 'Chapter 20: Aluminum', category: 'Materials' },
  { id: 'chapter21', name: 'Chapter 21: Masonry', category: 'Materials' },
  { id: 'chapter22', name: 'Chapter 22: Steel', category: 'Materials' },
  { id: 'chapter23', name: 'Chapter 23: Wood', category: 'Materials' },
  { id: 'chapter24', name: 'Chapter 24: Glass and Glazing', category: 'Materials' },
  { id: 'chapter25', name: 'Chapter 25: Gypsum Board, Gypsum Panel Products and Plaster', category: 'Materials' },
  { id: 'chapter26', name: 'Chapter 26: Plastic', category: 'Materials' },
  { id: 'chapter27', name: 'Chapter 27: Electrical', category: 'MEP Systems' },
  { id: 'chapter28', name: 'Chapter 28: Mechanical Systems', category: 'MEP Systems' },
  { id: 'chapter29', name: 'Chapter 29: Plumbing Systems', category: 'MEP Systems' },
  { id: 'chapter30', name: 'Chapter 30: Elevators and Conveying Systems', category: 'MEP Systems' },
  { id: 'chapter31', name: 'Chapter 31: Special Construction', category: 'Special' },
  { id: 'chapter32', name: 'Chapter 32: Encroachments into the Public Right-of-Way', category: 'Special' },
  { id: 'chapter33', name: 'Chapter 33: Safeguards During Construction', category: 'Special' },
  { id: 'chapter34', name: 'Chapter 34: Existing Structures', category: 'Special' },
  { id: 'chapter35', name: 'Chapter 35: Referenced Standards', category: 'References' },
];

const ChapterSelector = ({ selectedChapters, setSelectedChapters }) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  // Group chapters by category
  const chaptersByCategory = DUBAI_CHAPTERS.reduce((acc, chapter) => {
    if (!acc[chapter.category]) {
      acc[chapter.category] = [];
    }
    acc[chapter.category].push(chapter);
    return acc;
  }, {});

  // Toggle all chapters
  const handleToggleAll = () => {
    if (selectedChapters.length === DUBAI_CHAPTERS.length) {
      setSelectedChapters([]);
    } else {
      setSelectedChapters(DUBAI_CHAPTERS.map(chapter => chapter.id));
    }
  };

  // Toggle all chapters in a category
  const handleToggleCategory = (category) => {
    const categoryChapterIds = chaptersByCategory[category].map(chapter => chapter.id);
    const allSelected = categoryChapterIds.every(id => selectedChapters.includes(id));
    
    if (allSelected) {
      setSelectedChapters(selectedChapters.filter(id => !categoryChapterIds.includes(id)));
    } else {
      const newSelected = [...selectedChapters];
      categoryChapterIds.forEach(id => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      setSelectedChapters(newSelected);
    }
  };

  // Toggle a single chapter
  const handleToggleChapter = (chapterId) => {
    const currentIndex = selectedChapters.indexOf(chapterId);
    const newSelected = [...selectedChapters];

    if (currentIndex === -1) {
      newSelected.push(chapterId);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelectedChapters(newSelected);
  };

  // Check if all chapters in a category are selected
  const isCategorySelected = (category) => {
    return chaptersByCategory[category].every(chapter => 
      selectedChapters.includes(chapter.id)
    );
  };

  // Check if some chapters in a category are selected
  const isCategoryIndeterminate = (category) => {
    const categoryChapters = chaptersByCategory[category];
    const selectedCount = categoryChapters.filter(chapter => 
      selectedChapters.includes(chapter.id)
    ).length;
    return selectedCount > 0 && selectedCount < categoryChapters.length;
  };

  return (
    <Paper
      elevation={3}
      sx={{ p: 3, borderRadius: 2, mt: 3, direction: isArabic ? 'rtl' : 'ltr' }}
      dir={isArabic ? 'rtl' : 'ltr'}
      className={isArabic ? 'rtl' : ''}
    >
      <Typography variant="h6" gutterBottom color="primary" sx={{ textAlign: isArabic ? 'right' : 'left' }}>
        Select Dubai Building Code Chapters
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph sx={{ textAlign: isArabic ? 'right' : 'left' }}>
        Choose which chapters of the Dubai Building Code to use for matching.
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexDirection: isArabic ? 'row-reverse' : 'row' }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedChapters.length === DUBAI_CHAPTERS.length}
              indeterminate={selectedChapters.length > 0 && selectedChapters.length < DUBAI_CHAPTERS.length}
              onChange={handleToggleAll}
            />
          }
          label="Select All Chapters"
        />
        <Typography variant="body2" color="text.secondary">
          {selectedChapters.length} of {DUBAI_CHAPTERS.length} selected
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {Object.keys(chaptersByCategory).map((category) => (
        <Accordion key={category} defaultExpanded={false}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <FormControlLabel
              onClick={(event) => {
                event.stopPropagation();
                handleToggleCategory(category);
              }}
              onFocus={(event) => event.stopPropagation()}
              control={
                <Checkbox
                  checked={isCategorySelected(category)}
                  indeterminate={isCategoryIndeterminate(category)}
                />
              }
              label={<Typography fontWeight="medium">{category}</Typography>}
            />
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              <Grid container spacing={1}>
                {chaptersByCategory[category].map((chapter) => (
                  <Grid item xs={12} sm={6} key={chapter.id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedChapters.includes(chapter.id)}
                          onChange={() => handleToggleChapter(chapter.id)}
                        />
                      }
                      label={chapter.name}
                    />
                  </Grid>
                ))}
              </Grid>
            </FormGroup>
          </AccordionDetails>
        </Accordion>
      ))}
    </Paper>
  );
};

export default ChapterSelector;