import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

export default function TitleBar() {
  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: 36,
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      userSelect: 'none',
      WebkitAppRegion: 'drag',
      background: 'rgba(24,26,32,0.85)',
      borderBottom: '1px solid #23243a',
      pr: 1,
    }}>
      <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5, WebkitAppRegion: 'no-drag' }}>
        <Button
          onClick={() => window.electronAPI?.minimize()}
          sx={theme => ({ minWidth: 28, height: 28, color: '#fff', background: 'rgba(255,255,255,0.08)', borderRadius: '50%', '&:hover': { background: theme.palette.primary.main, color: '#23243a' }, p: 0 })}
        >
          <svg width="14" height="14" viewBox="0 0 18 18"><rect x="4" y="9" width="10" height="2" rx="1" fill="currentColor" /></svg>
        </Button>
        <Button
          onClick={() => window.electronAPI?.close()}
          sx={theme => ({ minWidth: 28, height: 28, color: '#fff', background: 'rgba(255,255,255,0.08)', borderRadius: '50%', '&:hover': { background: theme.palette.primary.main, color: '#23243a' }, p: 0 })}
        >
          <svg width="14" height="14" viewBox="0 0 18 18"><line x1="5" y1="5" x2="13" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="13" y1="5" x2="5" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </Button>
      </Box>
    </Box>
  );
}
