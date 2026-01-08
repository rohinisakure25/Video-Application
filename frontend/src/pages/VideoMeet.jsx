import React, { useEffect, useRef, useState, useContext } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField, Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import CallEndIcon from '@mui/icons-material/CallEnd'
import ChatIcon from '@mui/icons-material/Chat'
import styles from "../styles/videoComponent.module.css";
import server from '../environment';
import { AuthContext } from '../contexts/AuthContext';

const server_url = server;
var connections = {};
const peerConfigConnections = {
    "iceServers": [{ "urls": "stun:stun.l.google.com:19302" }]
}

export default function VideoMeetComponent() {
    const socketRef = useRef();
    const socketIdRef = useRef();
    const localVideoref = useRef();
    const videoRef = useRef([]);

    const { addToUserHistory } = useContext(AuthContext);

    const [videoAvailable, setVideoAvailable] = useState(true);
    const [audioAvailable, setAudioAvailable] = useState(true);
    const [video, setVideo] = useState(true);
    const [audio, setAudio] = useState(true);
    const [screen, setScreen] = useState(false);
    const [showModal, setModal] = useState(false);
    const [screenAvailable, setScreenAvailable] = useState(false);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [newMessages, setNewMessages] = useState(0);
    const [askForUsername, setAskForUsername] = useState(true);
    const [username, setUsername] = useState("");
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        getPermissions();
    }, []);

    const getPermissions = async () => {
        try {
            const userMediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            window.localStream = userMediaStream;
            if (localVideoref.current) {
                localVideoref.current.srcObject = userMediaStream;
            }
            setVideoAvailable(true);
            setAudioAvailable(true);
            if (navigator.mediaDevices.getDisplayMedia) setScreenAvailable(true);
        } catch (error) {
            console.log("Permission Error:", error);
        }
    };

    const getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop());
        } catch (e) { }

        window.localStream = stream;
        if (localVideoref.current) {
            localVideoref.current.srcObject = stream;
        }

        for (let id in connections) {
            if (id === socketIdRef.current) continue;
            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    });
            });
        }
    };

    const getUserMedia = () => {
        navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
            .then(getUserMediaSuccess)
            .catch((e) => console.log(e))
    };

    const connect = async () => {
        setAskForUsername(false);
        getMedia();

        const meetingCode = window.location.pathname.split("/").pop();
        try {
            await addToUserHistory(meetingCode);
        } catch (e) {
            console.error("History Error:", e);
        }
    };

    const getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    };

    const handleVideo = () => {
        const newState = !video;
        setVideo(newState);
        if (window.localStream) {
            window.localStream.getVideoTracks().forEach(track => track.enabled = newState);
        }
    };

    const handleAudio = () => {
        const newState = !audio;
        setAudio(newState);
        if (window.localStream) {
            window.localStream.getAudioTracks().forEach(track => track.enabled = newState);
        }
    };

    const handleScreen = () => {
        if (!screen) {
            navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                .then((stream) => {
                    setScreen(true);
                    getUserMediaSuccess(stream);
                    stream.getVideoTracks()[0].onended = () => {
                        setScreen(false);
                        getUserMedia();
                    };
                }).catch((e) => console.log(e));
        } else {
            setScreen(false);
            getUserMedia();
        }
    };

    const handleEndCall = () => {
        try {
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop());
            }
        } catch (e) { }
        window.location.href = "/home";
    };

    const connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false });
        socketRef.current.on('signal', gotMessageFromServer);
        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href);
            socketIdRef.current = socketRef.current.id;
            socketRef.current.on('chat-message', addMessage);
            socketRef.current.on('user-left', (id) => {
                setVideos((prev) => prev.filter((v) => v.socketId !== id));
            });
            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);
                    connections[socketListId].onicecandidate = (event) => {
                        if (event.candidate) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }));
                        }
                    };
                    connections[socketListId].onaddstream = (event) => {
                        setVideos(prev => {
                            const exists = prev.find(v => v.socketId === socketListId);
                            if (exists) return prev.map(v => v.socketId === socketListId ? { ...v, stream: event.stream } : v);
                            return [...prev, { socketId: socketListId, stream: event.stream }];
                        });
                    };
                    if (window.localStream) connections[socketListId].addStream(window.localStream);
                });
            });
        });
    };

    const gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message);
        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }));
                            });
                        });
                    }
                });
            }
            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice));
            }
        }
    };

    const addMessage = (data, sender, socketIdSender) => {
    // ✅ Check if the sender is NOT us before adding
        if (socketIdSender !== socketIdRef.current) {
            setMessages((prev) => [...prev, { 
                sender: sender || "Anonymous", 
                data: data 
            }]);

        // Increment notification badge only for messages from others
            setNewMessages((prev) => prev + 1);
        }
    };

    const sendMessage = () => {
    // Check if socket is ready before emitting
        if (socketRef.current) {
            socketRef.current.emit('chat-message', message, username);
            setMessages((prev) => [...prev, { sender: "You", data: message }]);
            setMessage("");
        }
    };
    

    // ✅ ADDED: This Effect ensures the video is attached whenever the view switches
    // This runs after the render, ensuring the ref is available.
    useEffect(() => {
        if (localVideoref.current && window.localStream) {
            localVideoref.current.srcObject = window.localStream;
        }
    }, [askForUsername, video]); 

    return (
        <div className={styles.mainWrapper}>
            {askForUsername ? (
                <div className={styles.lobbyContainer}>
                    <h2>Enter into Lobby</h2>
                    <TextField label="Username" value={username} onChange={e => setUsername(e.target.value)} variant="outlined" />
                    <Button variant="contained" onClick={connect} sx={{ mt: 2 }}>Connect</Button>
                    <div className={styles.previewBox}>
                        <video ref={localVideoref} autoPlay muted playsInline></video>
                    </div>
                </div>
            ) : (
                <div className={styles.meetVideoContainer}>
                    {showModal && (
                        <div className={styles.chatRoom}>
                            <div className={styles.chatContainer}>
                                <h1>Chat</h1>
                                <div className={styles.chattingDisplay}>
                                    {messages.map((item, index) => (
                                        <div key={index} style={{ marginBottom: "15px" }}>
                                            <p style={{ fontWeight: "bold", margin: 0 }}>{item.sender}</p>
                                            <p style={{ margin: 0 }}>{item.data}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className={styles.chattingArea}>
                                    <TextField fullWidth value={message} onChange={(e) => setMessage(e.target.value)} label="Enter chat" />
                                    <Button onClick={sendMessage}>Send</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={styles.buttonContainers}>
                        <IconButton onClick={handleVideo} style={{ color: "white" }}>
                            {video ? <VideocamIcon /> : <VideocamOffIcon color="error" />}
                        </IconButton>
                        <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                            <CallEndIcon />
                        </IconButton>
                        <IconButton onClick={handleAudio} style={{ color: "white" }}>
                            {audio ? <MicIcon /> : <MicOffIcon color="error" />}
                        </IconButton>
                        {screenAvailable && (
                            <IconButton onClick={handleScreen} style={{ color: "white" }}>
                                {screen ? <ScreenShareIcon color="primary" /> : <StopScreenShareIcon />}
                            </IconButton>
                        )}
                        <Badge badgeContent={newMessages} color='primary'>
                            <IconButton onClick={() => { setModal(!showModal); setNewMessages(0); }} style={{ color: "white" }}>
                                <ChatIcon />
                            </IconButton>
                        </Badge>
                    </div>

                    {/* ✅ Local Video with Force Play logic via onLoadedMetadata */}
                    <video 
                        className={styles.meetUserVideo} 
                        ref={localVideoref} 
                        autoPlay 
                        muted 
                        playsInline 
                        onLoadedMetadata={(e) => e.target.play()}
                    ></video>

                    <div className={styles.conferenceView}>
                        {videos.map((v) => (
                            <div key={v.socketId} className={styles.remoteVideoContainer}>
                                <video
                                    ref={ref => { if (ref && v.stream) ref.srcObject = v.stream; }}
                                    autoPlay
                                    playsInline
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}