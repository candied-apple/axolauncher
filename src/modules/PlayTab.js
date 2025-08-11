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
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';


import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function PlayTab({ t, username, setUsername, password, setPassword, showPassword, setShowPassword, logLines, setLogLines, ram, minRam, javaArgs, gameState, setGameState }) {
  const [progressText, setProgressText] = useState('');
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState('Checking...');
  const [playerCount, setPlayerCount] = useState(null);
  const [maxPlayers, setMaxPlayers] = useState(null);
  const [onlinePlayers, setOnlinePlayers] = useState([]); // NEW: usernames
  const logBoxRef = useRef(null);
  // Fetch server status
  useEffect(() => {
    let cancelled = false;
    async function fetchStatus() {
      try {
        const res = await fetch('https://api.mcstatus.io/v2/status/java/nested.candiedapple.me');
        const data = await res.json();
        if (cancelled) return;
        if (data.online) {
          setOnlineStatus('Online');
          if (data.players && typeof data.players.online === 'number') {
            setPlayerCount(data.players.online);
            setMaxPlayers(typeof data.players.max === 'number' ? data.players.max : null);
            // Set online player usernames if available
            if (Array.isArray(data.players.list)) {
              setOnlinePlayers(data.players.list.map(p => typeof p === 'string' ? p : (p.name_clean || p.name || p.username || 'Unknown')));
            } else {
              setOnlinePlayers([]);
            }
          } else {
            setPlayerCount(null);
            setMaxPlayers(null);
            setOnlinePlayers([]);
          }
        } else {
          setOnlineStatus('Offline');
          setPlayerCount(null);
          setMaxPlayers(null);
          setOnlinePlayers([]);
        }
      } catch (e) {
        if (!cancelled) {
          setOnlineStatus('Error');
          setPlayerCount(null);
          setMaxPlayers(null);
          setOnlinePlayers([]);
        }
      }
    }
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000); // refresh every 15s
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

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
        // Hide progress bar if finished
        if (percent >= 100) {
          setShowProgress(false);
        } else {
          setShowProgress(true);
        }
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
      window.electronAPI.removeAllDownloadProgressListeners && window.electronAPI.removeAllDownloadProgressListeners();
      window.electronAPI.onDownloadProgress(progressListener);
    }
    if (window.electronAPI?.onGameLog) {
      logListener = (line) => {
        setLogLines(lines => [...lines, line]);
        // Detect game started log
        if (typeof line === 'string' && line.includes('Game took') && line.includes('seconds to start')) {
          setGameState('running');
        }
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
        maxWidth: 800,
        mx: 'auto',
        borderRadius: 2,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        boxShadow: 4,
        mb: 3,
      })}>
        <CardContent sx={{
          display: 'flex', flexDirection: 'row', alignItems: 'flex-start', py: 3, gap: 0, justifyContent: 'space-between',
        }}>
          {/* Left: Avatar and server info */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 220, maxWidth: 240, width: 240, pl: 1, pr: 2 }}>
            <Avatar
              src="https://cdn.discordapp.com/icons/1039640054395572314/dae3addb699559494daea0750a7ee837.webp"
              alt="Profile"
              sx={theme => ({ width: 110, height: 110, mb: 1.5, border: `3px solid ${theme.palette.primary.main}` })}
            />
            <Typography variant="h5" fontWeight={700} color="#fff" gutterBottom align="left" sx={{ fontSize: 22 }}>
              Luthien SMP
            </Typography>
            <Typography variant="subtitle2" color="#e0e0e0" align="left" sx={{ fontSize: 13 }}>
              {onlineStatus}
              {playerCount !== null && onlineStatus === 'Online' ?
                ` (${playerCount}${maxPlayers !== null ? '/' + maxPlayers : ''})`
                : ''}
            </Typography>
          </Box>
          {/* Center: Empty spacer for symmetry */}
          <Box sx={{ minWidth: 220, maxWidth: 240, width: 240 }} />
          {/* Right: Online Users Vertical Box */}
          <Box sx={{
            minWidth: 180,
            maxWidth: 220,
            borderRadius: 2,
            background: 'rgba(0, 0, 0, 0.2)',
            boxShadow: 2,
            px: 2,
            py: 2,
            minHeight: 180,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
          }}>
            <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, fontSize: 15, mb: 1, ml: 0, mt: 0, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              {t.onlineUsers || 'Online Users'}
            </Typography>
            {onlinePlayers.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%' }}>
                {onlinePlayers.map((name, idx) => (
                  <Box key={name + idx} sx={{
                    px: 1, py: 0.5, borderRadius: 1, background: 'rgba(0,0,0,0.18)', color: '#fff', fontWeight: 500, fontSize: 13, boxShadow: 1,
                    width: '100%',
                    m: 0,
                  }}>{name}</Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: '#fff', fontSize: 12, opacity: 0.7, ml: 0, mt: 0.5 }}>
                {onlineStatus === 'Online' ? (t.noUsersOnline || 'No users online') : ''}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
  <Box sx={{ maxWidth: 800, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 1.2 }}>
        <TextField
          variant="outlined"
          fullWidth
          label={t.username}
          value={username}
          onChange={e => setUsername(e.target.value)}
          sx={{ fontSize: 13, mb: 0.5 }}
        />
        <TextField
          variant="outlined"
          fullWidth
          label={t.password}
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(v => !v)} edge="end" sx={theme => ({ color: theme.palette.primary.main, fontSize: 18 })}>
                  {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ fontSize: 13, mb: 1.2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', gap: 1 }}>
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
              minWidth: 120,
              px: 3,
              '&:hover': {
                background: `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
              },
            })}
            startIcon={
              gameState === 'running' ? <CheckCircleIcon sx={{ color: '#00e676' }} /> :
              <PlayArrowIcon />
            }
            onClick={async () => {
              setProgress(0);
              setShowProgress(false);
              setProgressText('');
              setLogLines([]);
              setGameState('idle');
              if (window.electronAPI?.launchMinecraft) {
                window.electronAPI.launchMinecraft({ username, password, ram, minRam, javaArgs });
              } else if (window.electronAPI) {
                window.electronAPI.send && window.electronAPI.send('launch-minecraft', { username, password, ram, minRam, javaArgs });
              }
            }}
            disabled={gameState === 'running'}
          >
            {gameState === 'running' ? t.running || 'Running' : t.launch}
          </Button>
          {gameState === 'running' && (
            <Button
              variant="outlined"
              size="small"
              color="error"
              sx={{ minWidth: 36, px: 1.2, mb: 0.5, fontSize: 13, fontWeight: 700 }}
              onClick={() => {
                if (window.electronAPI?.killGame) {
                  window.electronAPI.killGame();
                } else if (window.electron && window.electron.send) {
                  window.electron.send('kill-game');
                }
              }}
            >
              {t.kill || 'Kill'}
            </Button>
          )}
        </Box>
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
