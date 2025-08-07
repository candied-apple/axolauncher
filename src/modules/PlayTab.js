import React, { useEffect, useRef, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';


export default function PlayTab({ t, username, setUsername, password, setPassword, showPassword, setShowPassword, logLines, setLogLines }) {
  const [progressText, setProgressText] = useState('');
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const logBoxRef = useRef(null);

  useEffect(() => {
    // Helper for bytes formatting
    function formatBytes(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Store listener refs so we can remove them
    let logListener = null;
    let progressListener = null;

    if (window.electronAPI?.onDownloadProgress) {
      progressListener = (info) => {
        let percent = 0;
        if (typeof info.cumulativeBytes === 'number' && typeof info.totalBytes === 'number' && info.totalBytes > 0) {
          percent = Math.floor((info.cumulativeBytes / info.totalBytes) * 100);
        } else if (info.fileBytesDownloaded && info.fileTotalBytes) {
          percent = Math.floor((info.fileBytesDownloaded / info.fileTotalBytes) * 100);
        }
        setProgress(percent);
        setShowProgress(true);
        let msg = '';
        if (typeof info.cumulativeBytes === 'number' && typeof info.totalBytes === 'number' && info.totalBytes > 0) {
          if (info.type === 'client') {
            msg = `Client: ${percent}% (${formatBytes(info.cumulativeBytes)} / ${formatBytes(info.totalBytes)})`;
          } else if (info.type === 'library') {
            msg = `Libraries: ${percent}% (${formatBytes(info.cumulativeBytes)} / ${formatBytes(info.totalBytes)})`;
          } else if (info.type === 'asset') {
            msg = `Assets: ${percent}% (${formatBytes(info.cumulativeBytes)} / ${formatBytes(info.totalBytes)})`;
          } else if (info.type === 'server-files') {
            msg = `Mods: ${percent}% (${formatBytes(info.cumulativeBytes)} / ${formatBytes(info.totalBytes)})`;
          } else {
            msg = `Total Progress: ${percent}% (${formatBytes(info.cumulativeBytes)} / ${formatBytes(info.totalBytes)})`;
          }
        } else if (info.type === 'client') msg = `Downloading client: ${percent}%`;
        else if (info.type === 'library') msg = `Library ${info.index}/${info.total}: ${percent}%`;
        else if (info.type === 'asset') msg = `Asset ${info.index}/${info.total}: ${percent}%`;
        else if (info.type === 'assetIndex') msg = 'Downloading asset index...';
        else if (info.type === 'server-files') msg = `Downloading server files: ${percent}%`;
        else msg = info.type || '';
        setProgressText(msg);
      };
      // Remove previous listener if exists
      window.electronAPI.removeAllDownloadProgressListeners && window.electronAPI.removeAllDownloadProgressListeners();
      window.electronAPI.onDownloadProgress(progressListener);
    }
    if (window.electronAPI?.onGameLog) {
      logListener = (line) => {
        setLogLines(lines => [...lines, line]);
      };
      window.electronAPI.removeAllGameLogListeners && window.electronAPI.removeAllGameLogListeners();
      window.electronAPI.onGameLog(logListener);
    }
    // Cleanup listeners on unmount
    return () => {
      if (window.electronAPI?.removeAllDownloadProgressListeners) window.electronAPI.removeAllDownloadProgressListeners();
      if (window.electronAPI?.removeAllGameLogListeners) window.electronAPI.removeAllGameLogListeners();
    };
  }, [setLogLines]);

  useEffect(() => {
    // Auto-scroll log box
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [logLines]);

  return (
    <>
      <Card sx={theme => ({
        maxWidth: 600,
        mx: 'auto',
        borderRadius: 2,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        boxShadow: 4,
        mb: 3,
      })}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
          <Avatar
            src="https://cdn.discordapp.com/icons/1039640054395572314/dae3addb699559494daea0750a7ee837.webp"
            alt="Profile"
            sx={theme => ({ width: 90, height: 90, mb: 1.5, border: `3px solid ${theme.palette.primary.main}` })}
          />
          <Typography variant="h5" fontWeight={700} color="#fff" gutterBottom align="center" sx={{ fontSize: 22 }}>
            Luthien SMP
          </Typography>
          <Typography variant="subtitle2" color="#e0e0e0" align="center" sx={{ fontSize: 13 }}>
            Online Status: N/A
          </Typography>
        </CardContent>
      </Card>
      <Box sx={{ maxWidth: 600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 1.2 }}>
        <TextField
          variant="outlined"
          fullWidth
          placeholder={t.username}
          value={username}
          onChange={e => setUsername(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon sx={theme => ({ color: theme.palette.primary.main, fontSize: 18 })} />
              </InputAdornment>
            ),
            sx: {
              background: 'rgba(24,26,32,0.7)',
              borderRadius: 2,
              color: '#fff',
              fontSize: 13,
            },
          }}
          sx={{
            input: { color: '#fff', fontSize: 13 },
            mb: 0.5,
          }}
        />
        <TextField
          variant="outlined"
          fullWidth
          placeholder={t.password}
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={theme => ({ color: theme.palette.primary.main, fontSize: 18 })} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(v => !v)} edge="end" sx={theme => ({ color: theme.palette.primary.main, fontSize: 18 })}>
                  {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              background: 'rgba(24,26,32,0.7)',
              borderRadius: 2,
              color: '#fff',
              fontSize: 13,
            },
          }}
          sx={{
            input: { color: '#fff', fontSize: 13 },
            mb: 1.2,
          }}
        />
        <Button
          variant="contained"
          size="small"
          sx={theme => ({
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: '#fff',
            fontWeight: 700,
            borderRadius: 2,
            py: 1,
            fontSize: 14,
            boxShadow: 2,
            mb: 0.5,
            '&:hover': {
              background: `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
            },
          })}
          fullWidth
          onClick={async () => {
            // Only show progress when real download starts
            setProgress(0);
            setShowProgress(false);
            setProgressText('');
            setLogLines([]);
            if (window.electronAPI?.launchMinecraft) {
              window.electronAPI.launchMinecraft({ username, password });
            } else if (window.electronAPI) {
              window.electronAPI.send && window.electronAPI.send('launch-minecraft', { username, password });
            }
          }}
          disabled={showProgress && progress < 100}
        >
          {showProgress && progress < 100 ? t.launching : t.launch}
        </Button>
        {showProgress && (
          <Box sx={{ width: '100%', mt: 0.5 }}>
            <LinearProgress variant="determinate" value={progress} sx={theme => ({ height: 6, borderRadius: 2, background: '#23243a', '& .MuiLinearProgress-bar': { background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)` } })} />
            <Typography variant="caption" sx={{ color: '#fff', mt: 0.2, display: 'block', textAlign: 'center', fontSize: 11 }}>{progressText || `${progress}%`}</Typography>
          </Box>
        )}
        {/* Game logs removed from PlayTab. */}
      </Box>
    </>
  );
}
