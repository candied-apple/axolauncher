import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function UpdateNotesTab({ t }) {
  return (
    <Card sx={theme => ({ maxWidth: 600, mx: 'auto', borderRadius: 2, background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`, boxShadow: 4, mb: 3 })}>
      <CardContent sx={{ py: 2 }}>
        <Typography variant="h6" color="#23243a" gutterBottom sx={{ fontSize: 16 }}>{t.updateNotesTitle}</Typography>
        <Box sx={{ color: '#23243a', mt: 1 }}>
          <Typography variant="body2" sx={{ fontSize: 13 }}><b>v1.0.0</b> - {t.initialRelease}<br />- Material UI design<br />- Login and launch features<br />- {t.settings}, {t.logs}, {t.credits}, {t.updateNotes} tabs</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
