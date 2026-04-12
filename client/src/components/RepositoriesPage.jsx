import React, { useState, useContext, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Paper,
  Fab,
  Chip,
  Divider,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import PeopleIcon from '@mui/icons-material/People';
import AppContext from '../context/Context';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RepositoriesPage = ({ props }) => {
  const { setNewRepoWindow } = props;
  const { user, apiUrl, sharedRepos, repos, setRepos, setSharedRepos } = useContext(AppContext);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (user) {
      // Fetch both owned and shared repos to ensure the UI is fresh
      axios
        .get(`${apiUrl}/repo`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setRepos(res.data))
        .catch(e => console.error('Fetch repos error:', e));

      axios
        .get(`${apiUrl}/repo/getSharedRepos`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setSharedRepos(res.data.sharedRepos || []))
        .catch(e => console.error('Fetch shared repos error:', e));
    }
  }, [user]);

  const repoCardStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 18px',
    borderRadius: 10,
    border: '1px solid #e5e7eb',
    backgroundColor: '#fff',
    cursor: 'pointer',
    transition: 'box-shadow 0.15s, border-color 0.15s',
    width: '100%',
    textAlign: 'left',
  };

  const RepoCard = ({ repo, shared }) => {
    // createdBy is populated by the server: { _id, name, email }
    const ownerName = repo.createdBy?.name || repo.createdBy?.email || null;
    const ownerEmail = repo.createdBy?.email || null;

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate(`/repos/${repo._id}`)}
        onKeyDown={e => e.key === 'Enter' && navigate(`/repos/${repo._id}`)}
        style={repoCardStyle}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
          e.currentTarget.style.borderColor = '#1a73e8';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = '#e5e7eb';
        }}
      >
        {/* Icon */}
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          backgroundColor: shared ? '#e8f0fe' : '#f0fdf4',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {shared
            ? <PeopleIcon style={{ fontSize: 18, color: '#1a73e8' }} />
            : <FolderOpenIcon style={{ fontSize: 18, color: '#16a34a' }} />}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0, fontWeight: 600, fontSize: 14, color: '#111',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {repo.name}
          </p>
          {shared && ownerEmail ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: '#00000094' }}>Shared by</span>
              <Tooltip title={`${ownerName || 'User'} (${ownerEmail})`} arrow placement="top">
                <div
                  style={{
                    width: 22, height: 22, borderRadius: '50%', backgroundColor: '#300fe9ff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#ffffffff', fontSize: 10, fontWeight: 700, cursor: 'help'
                  }}
                >
                  {(ownerName || ownerEmail).charAt(0).toUpperCase()}
                </div>
              </Tooltip>
            </div>
          ) : shared ? (
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>Shared with you</p>
          ) : !shared && repo.sharedBy && repo.sharedBy.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: '#00000094' }}>Shared with</span>
              <div style={{ display: 'flex', marginLeft: 2 }}>
                {repo.sharedBy.slice(0, 3).map((email, index) => (
                  <Tooltip key={email} title={email} arrow placement="top">
                    <div
                      style={{
                        width: 22, height: 22, borderRadius: '50%', backgroundColor: '#10b981',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 10, fontWeight: 700, cursor: 'help',
                        marginLeft: index > 0 ? -6 : 0, border: '1.5px solid #fff',
                        zIndex: 10 - index
                      }}
                    >
                      {email.charAt(0).toUpperCase()}
                    </div>
                  </Tooltip>
                ))}
                {repo.sharedBy.length > 3 && (
                  <div
                    style={{
                      width: 22, height: 22, borderRadius: '50%', backgroundColor: '#6b7280',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 10, fontWeight: 700,
                      marginLeft: -6, border: '1.5px solid #fff', zIndex: 1
                    }}
                  >
                    +{repo.sharedBy.length - 3}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Badge */}
        {shared && (
          <Chip
            label="Shared"
            size="small"
            sx={{ fontSize: 11, height: 22, flexShrink: 0 }}
          />
        )}
      </div>
    );
  };

  return (
    <Container sx={{ mt: 3, mb: 10, maxWidth: 800 }}>
      {/* ── YOUR REPOS ── */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Your Repositories
        </Typography>
        {repos.length > 0 ? (
          <Grid container spacing={1.5}>
            {repos.map(repo => (
              <Grid item xs={12} sm={6} key={repo._id}>
                <RepoCard repo={repo} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper variant="outlined" sx={{
            p: 4, textAlign: 'center',
            borderStyle: 'dashed', borderRadius: 3,
          }}>
            <FolderOpenIcon sx={{ fontSize: 40, color: '#d1d5db', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No repositories yet. Create your first one!
            </Typography>
          </Paper>
        )}
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* ── SHARED REPOS ── */}
      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Shared Repositories
        </Typography>
        {sharedRepos.length > 0 ? (
          <Grid container spacing={1.5}>
            {sharedRepos.map(repo => (
              <Grid item xs={12} sm={6} key={repo._id}>
                <RepoCard repo={repo} shared />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper variant="outlined" sx={{
            p: 4, textAlign: 'center',
            borderStyle: 'dashed', borderRadius: 3,
          }}>
            <PeopleIcon sx={{ fontSize: 40, color: '#d1d5db', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No shared repositories available.
            </Typography>
          </Paper>
        )}
      </Box>

      {/*
        Floating create button.
        IMPORTANT: bottom:90px so it sits above the Chatbot bubble (which is at ~bottom:16-24px).
        Previously it was at bottom:24 and overlapped the chat icon.
      */}
      <Fab
        color="primary"
        aria-label="Create new repository"
        title="Create new repository"
        sx={{
          position: 'fixed',
          bottom: 90,   // ← moved up to avoid clashing with the chatbot FAB
          right: 24,
          boxShadow: '0 4px 14px rgba(26,115,232,0.4)',
          '&:hover': {
            transform: 'scale(1.06)',
            boxShadow: '0 6px 20px rgba(26,115,232,0.5)',
          },
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onClick={() => setNewRepoWindow(true)}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default RepositoriesPage;