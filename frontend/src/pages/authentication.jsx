import * as React from 'react';
import { 
    Avatar, Button, CssBaseline, TextField, Paper, Box, Grid, 
    Typography, Snackbar, ThemeProvider, createTheme, CircularProgress 
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { AuthContext } from '../contexts/AuthContext';

const defaultTheme = createTheme();

export default function Authentication() {
    // State management
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const [formState, setFormState] = React.useState(0); // 0 = Login, 1 = Register
    const [open, setOpen] = React.useState(false);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    // ✅ FIXED: Clear all inputs when toggling between Login and Register
    const handleStateChange = (state) => {
        setFormState(state);
        setUsername("");
        setPassword("");
        setName("");
        setError("");
    };

    const handleAuth = async (e) => {
        e.preventDefault(); // Prevents page refresh
        setLoading(true);
        setError("");

        try {
            if (formState === 0) {
                // Login Logic
                await handleLogin(username, password);
            } else {
                // Register Logic
                const result = await handleRegister(name, username, password);
                setMessage(result || "Registration Successful! Please login.");
                setOpen(true);
                
                // ✅ Smooth transition back to login after successful registration
                setFormState(0);
                setName(""); 
                // Keep username for convenience, or clear it:
                setPassword("");
            }
        } catch (err) {
            console.log(err);
            const msg = err?.response?.data?.message || "Something went wrong. Please try again.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />

                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        backgroundImage: 'url(https://source.unsplash.com/random?wallpapers)',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />

                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box
                        sx={{
                            my: 8, mx: 4,
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>

                        <Typography component="h1" variant="h5">
                            {formState === 0 ? "Sign In" : "Create Account"}
                        </Typography>

                        <Box sx={{ mt: 2 }}>
                            <Button
                                variant={formState === 0 ? "contained" : "outlined"}
                                onClick={() => handleStateChange(0)}
                                sx={{ mr: 1 }}
                            >
                                Login
                            </Button>
                            <Button
                                variant={formState === 1 ? "contained" : "outlined"}
                                onClick={() => handleStateChange(1)}
                            >
                                Register
                            </Button>
                        </Box>

                        {/* ✅ Form component with onSubmit for "Enter" key support */}
                        <Box component="form" onSubmit={handleAuth} noValidate sx={{ mt: 1, width: '100%' }}>
                            {formState === 1 && (
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="name"
                                    label="Full Name"
                                    name="name"
                                    autoFocus
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            )}

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            {error && (
                                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                                    {error}
                                </Typography>
                            )}

                            <Button
                                type="submit" // ✅ Trigger onSubmit
                                fullWidth
                                variant="contained"
                                disabled={loading}
                                sx={{ mt: 3, mb: 2 }}
                            >
                                {loading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    formState === 0 ? "Sign In" : "Sign Up"
                                )}
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={() => setOpen(false)}
                message={message}
            />
        </ThemeProvider>
    );
}