import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import './index.css';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { getTheme } from './modules/Theme';
import { TRANSLATIONS } from './modules/Translations';
import MainTabs from './modules/Tabs';
import TitleBar from './modules/TitleBar';
import PlayTab from './modules/PlayTab';
import LogsTab from './modules/LogsTab';
import SettingsTab from './modules/SettingsTab';
import CreditsTab from './modules/CreditsTab';
import UpdateNotesTab from './modules/UpdateNotesTab';

function App() {
  // Listen for game-status events from main process to update gameState
  React.useEffect(() => {
    if (window.electronAPI && window.electronAPI.onGameStatus) {
      window.electronAPI.onGameStatus((status) => {
        if (status && typeof status.running === 'boolean') {
          setGameState(status.running ? 'running' : 'idle');
        }
      });
    } else if (window.electron && window.electron.on) {
      window.electron.on('game-status', (event, status) => {
        if (status && typeof status.running === 'boolean') {
          setGameState(status.running ? 'running' : 'idle');
        }
      });
    }
  }, []);
  const [tab, setTab] = React.useState(0);
  const [showPassword, setShowPassword] = React.useState(false);
  const [username, setUsername] = React.useState(() => localStorage.getItem('username') || '');
  const [password, setPassword] = React.useState(() => localStorage.getItem('password') || '');
  const [progress, setProgress] = React.useState(0);
  const [showProgress, setShowProgress] = React.useState(false);
  const [accent, setAccent] = React.useState(() => localStorage.getItem('accent') || 'Pink');
  const [language, setLanguage] = React.useState(() => localStorage.getItem('language') || 'en');
  const [ram, setRam] = React.useState(() => {
    const saved = localStorage.getItem('ram');
    return saved ? Math.round(Number(saved)) : 4;
  });
  const [minRam, setMinRam] = React.useState(() => {
    const saved = localStorage.getItem('minRam');
    return saved ? Math.round(Number(saved)) : 2;
  });
  const [javaArgs, setJavaArgs] = React.useState(() => localStorage.getItem('javaArgs') || '');
  const [logLines, setLogLines] = React.useState([]);
  const [gameState, setGameState] = React.useState('idle'); // Persisted game state
  const theme = React.useMemo(() => getTheme(accent), [accent]);

  // Update CSS variables for scrollbar accent color when theme changes
  React.useEffect(() => {
    if (theme?.palette?.primary?.main && theme?.palette?.secondary?.main) {
      document.body.style.setProperty('--accent-primary', theme.palette.primary.main);
      document.body.style.setProperty('--accent-secondary', theme.palette.secondary.main);
    }
  }, [theme]);
  const t = TRANSLATIONS[language];

  // Toast state
  const [toast, setToast] = React.useState({ open: false, message: '', type: 'info' });

  React.useEffect(() => {
    function handleToast(data) {
      let msg = data.message;
      // If the backend sends the default 'Invalid credentials', localize it
      if (msg === 'Invalid credentials') {
        msg = t.invalidCredentials;
      }
      setToast({ open: true, message: msg, type: data.type || 'info' });
    }
    if (window.electronAPI?.onToast) {
      window.electronAPI.onToast(handleToast);
    } else if (window.electron && window.electron.on) {
      // fallback for contextBridge
      window.electron.on('toast', (event, data) => {
        handleToast(data);
      });
    }
  }, [t]);

  React.useEffect(() => { localStorage.setItem('language', language); }, [language]);
  React.useEffect(() => { localStorage.setItem('accent', accent); }, [accent]);
  React.useEffect(() => { localStorage.setItem('ram', ram); }, [ram]);
  React.useEffect(() => { localStorage.setItem('minRam', minRam); }, [minRam]);
  React.useEffect(() => { localStorage.setItem('javaArgs', javaArgs); }, [javaArgs]);
  React.useEffect(() => { localStorage.setItem('username', username); }, [username]);
  React.useEffect(() => { localStorage.setItem('password', password); }, [password]);
  React.useEffect(() => {
    let timer;
    if (showProgress && progress < 100) {
      timer = setTimeout(() => setProgress(p => Math.min(p + 5, 100)), 120);
    }
    return () => clearTimeout(timer);
  }, [showProgress, progress]);

  const handleTabChange = (event, newValue) => setTab(newValue);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TitleBar />
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(180deg, #181a20 0%, #23243a 100%)', p: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, maxWidth: 800, mx: 'auto', pt: 4, display: 'flex', justifyContent: 'center' }}>
          <MainTabs tab={tab} onChange={handleTabChange} labels={[t.play, t.logs, t.settings, t.credits, t.updateNotes]} />
        </Box>
        {tab === 0 && (
          <PlayTab
            t={t}
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showProgress={showProgress}
            setShowProgress={setShowProgress}
            progress={progress}
            setProgress={setProgress}
            logLines={logLines}
            setLogLines={setLogLines}
            ram={ram}
            minRam={minRam}
            javaArgs={javaArgs}
            gameState={gameState}
            setGameState={setGameState}
          />
        )}
        {tab === 1 && <LogsTab t={t} logLines={logLines} />}
        {tab === 2 && (
          <SettingsTab
            t={t}
            language={language}
            setLanguage={setLanguage}
            accent={accent}
            setAccent={setAccent}
            ram={ram}
            setRam={setRam}
            minRam={minRam}
            setMinRam={setMinRam}
            javaArgs={javaArgs}
            setJavaArgs={setJavaArgs}
          />
        )}
        {tab === 3 && <CreditsTab t={t} />}
  {tab === 4 && <UpdateNotesTab />}
      </Box>
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <MuiAlert elevation={6} variant="filled" onClose={() => setToast(t => ({ ...t, open: false }))} severity={toast.type} sx={{ width: '100%' }}>
          {toast.message}
        </MuiAlert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
