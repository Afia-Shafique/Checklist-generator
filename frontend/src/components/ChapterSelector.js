import React, { useEffect, useState } from 'react';
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
  Switch
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const ChapterSelector = ({ selectedChapters, setSelectedChapters, selectedRegion }) => {
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false); // ✅ Advanced toggle

  useEffect(() => {
    if (selectedRegion === "dubai") {
      fetch("/api/dubai/categories")
        .then(res => res.json())
        .then(data => {
          setCategories(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error loading Dubai categories:", err);
          setLoading(false);
        });
    }
  }, [selectedRegion]);

  // ✅ Filter categories if not advanced
  const visibleCategories = Object.keys(categories).filter(cat => {
    if (!showAdvanced && (cat === "General" || cat === "Security")) return false;
    return true;
  });

  // ✅ Get ALL visible checkbox IDs
  const allChapterIds = visibleCategories
    .flatMap(mainCat =>
      Array.isArray(categories[mainCat])
        ? categories[mainCat].flatMap(sub => sub.sections.map(sec => sec.section_id))
        : []
    );

  const handleToggleAll = () => {
    if (selectedChapters.length === allChapterIds.length) {
      setSelectedChapters([]);
    } else {
      setSelectedChapters(allChapterIds);
    }
  };

  const handleToggleCategory = (mainCat) => {
    const categoryIds = (categories[mainCat] || [])
      .flatMap(sub => sub.sections.map(sec => sec.section_id));

    const allSelected = categoryIds.every(id => selectedChapters.includes(id));
    if (allSelected) {
      setSelectedChapters(selectedChapters.filter(id => !categoryIds.includes(id)));
    } else {
      setSelectedChapters([
        ...selectedChapters,
        ...categoryIds.filter(id => !selectedChapters.includes(id))
      ]);
    }
  };

  const isCategorySelected = (mainCat) => {
    const ids = (categories[mainCat] || [])
      .flatMap(sub => sub.sections.map(sec => sec.section_id));
    return ids.length > 0 && ids.every(id => selectedChapters.includes(id));
  };

  const isCategoryIndeterminate = (mainCat) => {
    const ids = (categories[mainCat] || [])
      .flatMap(sub => sub.sections.map(sec => sec.section_id));
    const selectedCount = ids.filter(id => selectedChapters.includes(id)).length;
    return selectedCount > 0 && selectedCount < ids.length;
  };

  const handleToggleChapter = (chapterId) => {
    if (selectedChapters.includes(chapterId)) {
      setSelectedChapters(selectedChapters.filter(id => id !== chapterId));
    } else {
      setSelectedChapters([...selectedChapters, chapterId]);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mt: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
        Select Dubai Building Code Chapters
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Choose which curated chapters of the Dubai Building Code to use for matching.
      </Typography>

      {/* ✅ Advanced toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={showAdvanced}
              onChange={(e) => setShowAdvanced(e.target.checked)}
              color="primary"
            />
          }
          label="Advanced Mode"
        />
      </Box>

      {/* ✅ Select All */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedChapters.length === allChapterIds.length}
              indeterminate={selectedChapters.length > 0 && selectedChapters.length < allChapterIds.length}
              onChange={handleToggleAll}
            />
          }
          label="Select All Chapters"
        />
        <Typography variant="body2" color="text.secondary">
          {selectedChapters.length} of {allChapterIds.length} selected
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {loading ? (
        <Typography>Loading Dubai categories...</Typography>
      ) : (
        visibleCategories.map((mainCat) => (
          <Accordion key={mainCat} defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <FormControlLabel
                onClick={(event) => {
                  event.stopPropagation();
                  handleToggleCategory(mainCat);
                }}
                onFocus={(event) => event.stopPropagation()}
                control={
                  <Checkbox
                    checked={isCategorySelected(mainCat)}
                    indeterminate={isCategoryIndeterminate(mainCat)}
                  />
                }
                label={<Typography fontWeight="medium">{mainCat}</Typography>}
              />
            </AccordionSummary>
            <AccordionDetails>
              {Array.isArray(categories[mainCat])
                ? categories[mainCat].map((sub) => (
                    <Box key={sub.subcategory} sx={{ mb: 2, pl: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {sub.subcategory}
                      </Typography>
                      <FormGroup>
                        {sub.sections.map((sec) => (
                          <FormControlLabel
                            key={sec.section_id}
                            control={
                              <Checkbox
                                checked={selectedChapters.includes(sec.section_id)}
                                onChange={() => handleToggleChapter(sec.section_id)}
                              />
                            }
                            label={sec.section_title}
                          />
                        ))}
                      </FormGroup>
                    </Box>
                  ))
                : null}
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Paper>
  );
};

export default ChapterSelector;
