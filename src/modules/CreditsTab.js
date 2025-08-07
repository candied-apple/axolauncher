import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function CreditsTab({ t }) {
  return (
    <Card sx={theme => ({ maxWidth: 600, mx: 'auto', borderRadius: 2, background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`, boxShadow: 4, mb: 3 })}>
      <CardContent sx={{ py: 2 }}>
        <Typography variant="h6" color="#fff" gutterBottom sx={{ fontSize: 16 }}>{t.creditsTitle}</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
          <Typography variant="body2" color="#fff" sx={{ fontSize: 13 }}>{t.design}: <b>candiedapple</b></Typography>
          <Typography variant="body2" color="#fff" sx={{ fontSize: 13 }}>{t.backend}: <b>axolotl</b></Typography>
          <Typography variant="body2" color="#fff" sx={{ fontSize: 13 }}>{t.testing}: <b>luthien</b></Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
