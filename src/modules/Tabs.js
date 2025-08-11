
import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ListAltIcon from '@mui/icons-material/ListAlt';
import TerminalIcon from '@mui/icons-material/Terminal';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import NotesIcon from '@mui/icons-material/Notes';

export default function MainTabs({ tab, onChange, labels }) {
  // Map tab index to icon
  const icons = [
    <PlayArrowIcon fontSize="small" sx={{ mr: 1, mb: '-2px' }} />, // Play
    <TerminalIcon fontSize="small" sx={{ mr: 1, mb: '-2px' }} />,  // Logs
    <SettingsIcon fontSize="small" sx={{ mr: 1, mb: '-2px' }} />,  // Settings
    <NotesIcon fontSize="small" sx={{ mr: 1, mb: '-2px' }} />,     // Credits
    <ListAltIcon fontSize="small" sx={{ mr: 1, mb: '-2px' }} />,   // Update Notes
  ];

  return (
    <Tabs
      value={tab}
      onChange={onChange}
      textColor="primary"
      indicatorColor="primary"
      variant="scrollable"
      scrollButtons="auto"
      sx={{ minHeight: 32, mx: 'auto' }}
    >
      {labels.map((label, i) => (
        <Tab
          key={label}
          label={
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {icons[i]}
              {label}
            </span>
          }
          sx={{ minHeight: 32, fontSize: 13, px: 1.5 }}
        />
      ))}
    </Tabs>
  );
}
