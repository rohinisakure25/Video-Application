import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function HomeComponent() {
    const [meetingCode, setMeetingCode] = useState("");
    const navigate = useNavigate();

    const handleJoin = () => {
        if (meetingCode.trim()) {
            navigate(`/${meetingCode}`);
        }
    };

    return (
        <Box sx={{ 
            height: '90vh', display: 'flex', alignItems: 'center', 
            background: 'linear-gradient(135deg, #121212 0%, #1a1a2e 100%)' 
        }}>
            <Container maxWidth="sm">
                <Paper elevation={10} sx={{ p: 5, textAlign: 'center', borderRadius: 4, background: 'rgba(255,255,255,0.05)', color: 'white', backdropFilter: 'blur(10px)' }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Ready to Connect?
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 4, opacity: 0.7 }}>
                        Enter a code to join a room or start a fresh meeting.
                    </Typography>
                    <TextField 
                        fullWidth 
                        variant="filled" 
                        placeholder="Meeting Code" 
                        value={meetingCode} 
                        onChange={(e) => setMeetingCode(e.target.value)}
                        sx={{ background: 'white', borderRadius: 1, mb: 3 }}
                    />
                    <Button fullWidth variant="contained" size="large" onClick={handleJoin} sx={{ py: 1.5, fontWeight: 'bold', fontSize: '1.1rem' }}>
                        Join Call
                    </Button>
                </Paper>
            </Container>
        </Box>
    );
}