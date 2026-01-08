import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Paper, Typography, Box, Chip, IconButton, Container 
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetingHistory, setMeetingHistory] = useState([]); // Renamed from 'history' to avoid global conflict
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getHistoryOfUser();
                setMeetingHistory(data);
            } catch (err) {
                console.log("Failed to fetch history", err);
            }
        };
        fetchHistory();
    }, []);

    return (
        <Container maxWidth="md" sx={{ mt: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <IconButton onClick={() => navigate('/home')} sx={{ mr: 2 }}>
                    <HomeIcon />
                </IconButton>
                <Typography variant="h4">Meeting History</Typography>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ backgroundColor: '#f0f2f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Meeting Code</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Date</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {meetingHistory.length > 0 ? meetingHistory.map((row) => (
                            <TableRow 
                                key={row._id} 
                                sx={{ '&:hover': { backgroundColor: '#fafafa' }, transition: '0.3s' }}
                            >
                                <TableCell>
                                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#1976d2' }}>
                                        {row.meeting_code}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Chip label="Completed" color="success" size="small" variant="outlined" />
                                </TableCell>
                                <TableCell align="right">
                                    {new Date(row.date).toLocaleDateString(undefined, {
                                        day: 'numeric', month: 'short', year: 'numeric'
                                    })}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => navigator.clipboard.writeText(row.meeting_code)}>
                                        <ContentCopyIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                    No meetings found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
}