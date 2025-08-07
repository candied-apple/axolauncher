import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Slider from '@mui/material/Slider';

import { GRADIENTS } from './Theme';

export default function SettingsTab({ t, language, setLanguage, accent, setAccent, ram, setRam }) {
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Minecraft Settings */}
      <Card sx={theme => ({ borderRadius: 2, background: theme.palette.background.paper, boxShadow: 4 })}>
        <CardContent sx={{ py: 2 }}>
          <Typography variant="h6" color="primary" gutterBottom sx={{ fontSize: 15 }}>{t.minecraftSettings}</Typography>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography id="ram-slider-label" sx={{ fontSize: 13, color: '#fff', mb: 0.5 }}>{t.ram.replace('MB', 'GB')}</Typography>
            <Slider
              aria-labelledby="ram-slider-label"
              valueLabelDisplay="auto"
              min={1}
              max={16}
              step={0.25}
              value={ram}
              onChange={(_, v) => setRam(v)}
              sx={{ color: theme => theme.palette.primary.main }}
              valueLabelFormat={v => `${v} GB`}
            />
          </Box>
        </CardContent>
      </Card>
      {/* Launcher Settings */}
      <Card sx={theme => ({ borderRadius: 2, background: theme.palette.background.paper, boxShadow: 4 })}>
        <CardContent sx={{ py: 2 }}>
          <Typography variant="h6" color="primary" gutterBottom sx={{ fontSize: 15 }}>{t.launcherSettings}</Typography>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mt: 1 }}>
            <TextField
              select
              label={t.language}
              variant="outlined"
              fullWidth
              value={language}
              onChange={e => setLanguage(e.target.value)}
              sx={{ fontSize: 13 }}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="tr">Türkçe</MenuItem>
            </TextField>
            <TextField
              select
              label={t.accentColor}
              variant="outlined"
              fullWidth
              value={accent}
              onChange={e => setAccent(e.target.value)}
              sx={{ fontSize: 13 }}
            >
              {Object.keys(GRADIENTS).map(name => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </TextField>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
