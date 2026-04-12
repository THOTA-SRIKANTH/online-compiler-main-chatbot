import React, { useCallback, useContext, useState, useEffect } from "react";
import AppContext from "../context/Context";
import axios from "axios";
import { CircularProgress, Box } from '@mui/material';
import InviteModal from "./InviteModal";

const Connections = () => {
  const { apiUrl, setAlertMessage, setAlertType, setOpen } = useContext(AppContext);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const token = localStorage.getItem("token");

  const fetchConnections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/api/user/connections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConnections(res.data.connections || []);
    } catch (err) {
      console.error("fetchConnections:", err);
      setAlertMessage("Failed to fetch connections");
      setAlertType("error");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token, setAlertMessage, setAlertType, setOpen]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const removeConnection = async (conn) => {
    if (!window.confirm(`Are you sure you want to remove the connection with ${conn.name || conn.email}?`)) return;
    
    setProcessing(conn._id);
    try {
      await axios.delete(
        `${apiUrl}/api/user/connections/${conn._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConnections(prev => prev.filter(c => c._id !== conn._id));
      setAlertMessage("Connection removed");
      setAlertType("success");
      setOpen(true);
    } catch (err) {
      setAlertMessage(err.response?.data?.message || "Failed to remove connection");
      setAlertType("error");
      setOpen(true);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div style={{ padding: "24px 32px", maxWidth: 680, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111", margin: 0 }}>Connections</h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "4px 0 0" }}>Manage your connected peers</p>
        </div>
        <button onClick={() => setShowInviteModal(true)} className="px-4 py-2 rounded-lg bg-blue-600 text-white border-none cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg">
          + Send Invitation
        </button>
      </div>

      {/* ── CONTENT ── */}
      {loading ? (
        <Box className="w-full flex justify-center py-10">
          <CircularProgress size={40} sx={{ color: '#16a34a' }} />
        </Box>
      ) : connections.length === 0 ? (
        <div style={{ textAlign: "center", padding: "52px 24px", backgroundColor: "#f9fafb", borderRadius: 12, border: "1.5px dashed #e5e7eb" }}>
          <span style={{ fontSize: 40 }}>👥</span>
          <p style={{ color: "#9ca3af", marginTop: 12, fontSize: 15 }}>
            You don't have any connections yet. Send invitations to connect with peers!
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {connections.map(conn => {
            const isRemoving = processing === conn._id;
            return (
              <div key={conn._id} className="flex items-center justify-between gap-3 p-4 bg-white border border-gray-200 border-l-[3.5px] border-l-green-600 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    backgroundColor: "#16a34a",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 700, fontSize: 18, flexShrink: 0,
                  }}>{(conn.name || conn.email)?.charAt(0)?.toUpperCase() || "?"}</div>
                  <div style={{ minWidth: 0 }}>
                    {conn.name && <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#111" }}>{conn.name}</p>}
                    <p style={{ margin: 0, fontSize: 13, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conn.email}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, color: "#16a34a",
                        backgroundColor: "rgba(22,163,74,0.1)", padding: "1px 8px", borderRadius: 8, textTransform: "capitalize",
                      }}>Connected</span>
                      {conn.connectedAt && <span style={{ fontSize: 11, color: "#9ca3af" }}>{new Date(conn.connectedAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button onClick={() => removeConnection(conn)} disabled={isRemoving} className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${isRemoving ? "bg-red-300 border-red-300 text-red-600 cursor-default opacity-70" : "bg-red-50 border-red-200 text-red-600 cursor-pointer hover:bg-red-100 hover:-translate-y-0.5"}`}>
                    {isRemoving ? "Removing…" : "Remove Connection"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} onSuccess={fetchConnections} />}
    </div>
  );
};

export default Connections;
