import axios from "axios";
import httpStatus from "http-status";
import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment";

export const AuthContext = createContext(null);

const client = axios.create({
    baseURL: `${server}/api/v1/users`,
});

export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true); // Prevents premature redirect
    const navigate = useNavigate();

    // ✅ SESSION PERSISTENCE: Runs once when the app starts
    useEffect(() => {
        const checkSession = () => {
            const token = localStorage.getItem("token");
            if (token) {
                // In a production app, you might call /api/v1/users/me 
                // here to verify the token with the backend.
                setUserData({ token }); 
            }
            setLoading(false);
        };
        checkSession();
    }, []);

    const handleRegister = async (name, username, password) => {
        try {
            const response = await client.post("/register", {
                name,
                username,
                password,
            });

            if (response.status === httpStatus.CREATED) {
                return response.data.message;
            }
        } catch (err) {
            throw err;
        }
    };

    const handleLogin = async (username, password) => {
        try {
            const response = await client.post("/login", {
                username,
                password,
            });

            if (response.status === httpStatus.OK) {
                localStorage.setItem("token", response.data.token);
                setUserData(response.data.user || { token: response.data.token });
                navigate("/home");
            }
        } catch (err) {
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUserData(null);
        navigate("/auth");
    };

    const getHistoryOfUser = async () => {
        try {
            const response = await client.get("/get_all_activity", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const addToUserHistory = async (meetingCode) => {
        try {
            const response = await client.post(
                "/add_to_activity",
                { meeting_code: meetingCode },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const value = {
        userData,
        setUserData,
        loading,
        handleRegister,
        handleLogin,
        logout,
        getHistoryOfUser,
        addToUserHistory,
    };

    return (
        <AuthContext.Provider value={value}>
            {/* ✅ Only show the app once we've checked for a token */}
            {!loading && children}
        </AuthContext.Provider>
    );
};