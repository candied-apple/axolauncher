
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function UpdateNotesTab() {
  return (
    <Card sx={theme => ({
      maxWidth: 800,
      mx: 'auto',
      borderRadius: 2,
      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
      boxShadow: 4,
      mb: 3
    })}>
      <CardContent sx={{ py: 2 }}>
        <Typography variant="h6" color="#fff" gutterBottom sx={{ fontSize: 16 }}>Update Notes</Typography>
        <Box sx={{ color: '#fff', mt: 1 }}>
          <Typography variant="body2" sx={{ fontSize: 13 }}><b>v1.0.0</b> - Initial release<br />- Material UI design<br />- Login and launch features<br />- Settings, Logs, Credits, Update Notes tabs</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
