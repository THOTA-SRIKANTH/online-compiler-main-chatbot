import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import AppContext from "./Context";

const socketContext = createContext(null);

export const useSocket = () => useContext(socketContext);

export const SocketProvider = ({ children }) => {
    const { apiUrl } = useContext(AppContext);
    const socketRef = useRef(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!apiUrl) return;

        // Create a single socket connection with auto-reconnect
        const newSocket = io(apiUrl, {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            autoConnect: true,
        });

        newSocket.on("connect", () => {
            console.log("Socket connected:", newSocket.id);
        });

        newSocket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
            // socket.io handles reconnection automatically
        });

        newSocket.on("reconnect", (attempt) => {
            console.log("Socket reconnected after", attempt, "attempts");
        });

        newSocket.on("connect_error", (err) => {
            console.error("Socket connection error:", err.message);
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [apiUrl]);

    return (
        <socketContext.Provider value={socket}>
            {children}
        </socketContext.Provider>
    );
};