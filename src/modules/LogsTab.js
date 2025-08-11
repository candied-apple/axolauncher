import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function LogsTab({ t, logLines }) {
  return (
    <Card sx={theme => ({ maxWidth: 800, mx: 'auto', borderRadius: 2, background: '#181a20', boxShadow: 4, mb: 3 })}>
      <CardContent sx={{ py: 2 }}>
        <Typography variant="h6" color="primary" gutterBottom sx={{ fontSize: 16 }}>{t.logs}</Typography>
        <Box sx={{ background: '#23243a', color: '#b0b0b0', fontFamily: 'monospace', p: 1.2, borderRadius: 2, minHeight: 60, maxHeight: 420, overflow: 'auto', fontSize: 12 }}>
          {logLines && logLines.length > 0 ? (
            logLines.map((line, i) => <div key={i}>{line}</div>)
          ) : (
            <span style={{ color: '#666' }}>[No logs yet]</span>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
