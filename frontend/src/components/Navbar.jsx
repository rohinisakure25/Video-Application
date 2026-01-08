import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function Navbar() {
    const { logout, userData } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Hide Navbar on Landing and Auth pages
    if (!userData || location.pathname === '/' || location.pathname === '/auth') return null;

    return (
        <AppBar position="static" sx={{ background: 'rgba(18, 18, 18, 0.8)', backdropFilter: 'blur(10px)' }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate('/home')}>
                   VIDEO CALL
                </Typography>
                <Box>
                    <Button color="inherit" onClick={() => navigate('/home')}>Join Meeting</Button>
                    <Button color="inherit" onClick={() => navigate('/history')}>History</Button>
                    <Button variant="outlined" color="error" sx={{ ml: 2 }} onClick={logout}>Logout</Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}