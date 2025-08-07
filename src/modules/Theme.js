import { createTheme } from '@mui/material/styles';

export const GRADIENTS = {
  Pink: ['#ff6fcb', '#ffb86c'],
  Orange: ['#ffb86c', '#ff6fcb'],
  Blue: ['#8ca6db', '#23243a'],
  Purple: ['#b993d6', '#8ca6db'],
};

export const getTheme = (gradientName = 'Pink') => {
  const [main, secondary] = GRADIENTS[gradientName] || GRADIENTS.Pink;
  return createTheme({
    palette: {
      mode: 'dark',
      primary: { main },
      secondary: { main: secondary },
      background: { default: '#181a20', paper: '#23243a' },
    },
    typography: {
      fontFamily: 'Segoe UI, Roboto, Arial, sans-serif',
      fontWeightBold: 700,
      fontSize: 13,
    },
  });
};
