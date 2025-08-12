import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControlLabel,
  Checkbox,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const ChapterSelector = ({
  selectedSubcategories,
  setSelectedSubcategories,
  selectedChapters,
  setSelectedChapters,
  selectedRegion
}) => {
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  const visibleCategories = Object.keys(categories).filter(cat => {
    if (!showAdvanced && (cat === "General" || cat === "Security")) return false;
    return true;
  });

  const handleToggleSubcategory = (mainCat, subId) => {
    const updatedSubs = selectedSubcategories.includes(subId)
      ? selectedSubcategories.filter(id => id !== subId)
      : [...selectedSubcategories, subId];
    setSelectedSubcategories(updatedSubs);

    // also update selectedChapters
    const mainCatHasSelection = updatedSubs.some(sub => 
      (categories[mainCat] || []).some(s => s.subcategory_id === sub)
    );

    setSelectedChapters(prev => {
      if (mainCatHasSelection) {
        return prev.includes(mainCat) ? prev : [...prev, mainCat];
      } else {
        return prev.filter(ch => ch !== mainCat);
      }
    });
  };

  const handleToggleCategory = (mainCat) => {
    const subIds = (categories[mainCat] || []).map(sub => sub.subcategory_id);
    const allSelected = subIds.every(id => selectedSubcategories.includes(id));

    if (allSelected) {
      setSelectedSubcategories(selectedSubcategories.filter(id => !subIds.includes(id)));
      setSelectedChapters(prev => prev.filter(ch => ch !== mainCat));
    } else {
      setSelectedSubcategories([...new Set([...selectedSubcategories, ...subIds])]);
      setSelectedChapters(prev => prev.includes(mainCat) ? prev : [...prev, mainCat]);
    }
  };

  const isCategorySelected = (mainCat) => {
    const subIds = (categories[mainCat] || []).map(sub => sub.subcategory_id);
    return subIds.length > 0 && subIds.every(id => selectedSubcategories.includes(id));
  };

  const isCategoryIndeterminate = (mainCat) => {
    const subIds = (categories[mainCat] || []).map(sub => sub.subcategory_id);
    const selectedCount = subIds.filter(id => selectedSubcategories.includes(id)).length;
    return selectedCount > 0 && selectedCount < subIds.length;
  };

  const allSubIds = visibleCategories.flatMap(mainCat =>
    (categories[mainCat] || []).map(sub => sub.subcategory_id)
  );

  const handleToggleAll = () => {
    if (selectedSubcategories.length === allSubIds.length) {
      setSelectedSubcategories([]);
      setSelectedChapters([]);
    } else {
      setSelectedSubcategories(allSubIds);
      setSelectedChapters(visibleCategories);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mt: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
        Select Dubai Building Code Chapters
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Choose which curated subcategories to use for matching.
      </Typography>

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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedSubcategories.length === allSubIds.length && allSubIds.length > 0}
              indeterminate={selectedSubcategories.length > 0 && selectedSubcategories.length < allSubIds.length}
              onChange={handleToggleAll}
            />
          }
          label="Select All Chapters"
        />
        <Typography variant="body2" color="text.secondary">
          {selectedSubcategories.length} of {allSubIds.length} selected
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
              {Array.isArray(categories[mainCat]) &&
                categories[mainCat].map((sub) => (
                  <Box key={sub.subcategory_id} sx={{ pl: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedSubcategories.includes(sub.subcategory_id)}
                          onChange={() => handleToggleSubcategory(mainCat, sub.subcategory_id)}
                        />
                      }
                      label={
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {sub.subcategory_name}
                        </Typography>
                      }
                    />
                  </Box>
                ))}
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Paper>
  );
};

export default ChapterSelector;
