import './App.css';
import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom';
import LandingPage from './pages/landing';
import Authentication from './pages/authentication';
import { AuthProvider } from './contexts/AuthContext';
import VideoMeetComponent from './pages/VideoMeet';
import HomeComponent from './pages/home';
import History from './pages/history';
import Navbar from './components/Navbar'; 

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    if (!token) {
        return <Navigate to="/auth" replace />;
    }
    return children;
};

function App() {
    return (
        <div className="App">
            <Router>
                <AuthProvider>
                    <Navbar /> 
                    <Routes>
                        <Route path='/' element={<LandingPage />} />
                        <Route path='/auth' element={<Authentication />} />
                        <Route path='/home' element={<ProtectedRoute><HomeComponent /></ProtectedRoute>} />
                        <Route path='/history' element={<ProtectedRoute><History /></ProtectedRoute>} />
                        <Route path='/:url' element={<ProtectedRoute><VideoMeetComponent /></ProtectedRoute>} />
                    </Routes>
                </AuthProvider>
            </Router>
        </div>
    );
}

export default App;