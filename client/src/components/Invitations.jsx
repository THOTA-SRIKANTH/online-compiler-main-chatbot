import React, { useCallback, useContext, useState, useEffect } from "react";
import AppContext from "../context/Context";
import axios from "axios";
import { CircularProgress, Box } from '@mui/material';
import InviteModal from "./InviteModal";

const STATUS_TABS = ["pending", "accepted", "rejected"];
const TAB_LABELS = { pending: "Pending", accepted: "Accepted", rejected: "Declined" };
const TAB_COLORS = { pending: "#1a73e8", accepted: "#16a34a", rejected: "#dc2626" };
const TAB_BG = { pending: "rgba(26,115,232,0.1)", accepted: "rgba(22,163,74,0.1)", rejected: "rgba(220,38,38,0.1)" };

const Invitations = () => {
  const { apiUrl, setOwnedTeams, setMemberOfTeams, setTeammates, setAlertMessage, setAlertType, setOpen } = useContext(AppContext);
  const [allInvitations, setAllInvitations] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const token = localStorage.getItem("token");

  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/api/user/getInvitations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllInvitations(res.data.invitations || []);
    } catch (err) { console.error("getInvitations:", err); }
    finally { setLoading(false); }
  }, [apiUrl, token]);

  useEffect(() => { fetchInvitations(); }, [fetchInvitations]);

  const filtered = allInvitations.filter(inv => inv.status === activeTab);
  const counts = STATUS_TABS.reduce((acc, s) => ({ ...acc, [s]: allInvitations.filter(i => i.status === s).length }), {});

  const updateStatus = (invId, newStatus) =>
    setAllInvitations(prev => prev.map(inv => inv._id === invId ? { ...inv, status: newStatus } : inv));

  const handleAccept = async (inv) => {
    setProcessing(inv._id);
    try {
      const res = await axios.post(
        `${apiUrl}/api/user/invitations/accept`,
        { invitationId: inv._id, email: inv.senderEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateStatus(inv._id, "accepted");
      setAlertMessage(res.data.message || "Invitation accepted!");
      setAlertType("success"); setOpen(true);
      // Refresh global team state
      const tmRes = await axios.get(`${apiUrl}/api/user/getTeammates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { ownedTeams = [], memberOfTeams = [] } = tmRes.data;
      setOwnedTeams(ownedTeams);
      setMemberOfTeams(memberOfTeams);
      // Derive flat teammates list from all owned team members
      const seen = new Set(); const flat = [];
      for (const team of ownedTeams) {
        for (const m of (team.members || [])) {
          const key = m.userId?.toString() || m.email;
          if (!seen.has(key)) { seen.add(key); flat.push(m); }
        }
      }
      setTeammates(flat);
    } catch (err) {
      setAlertMessage(err.response?.data?.message || "Failed to accept");
      setAlertType("error"); setOpen(true);
    } finally { setProcessing(null); }
  };

  const handleDecline = async (inv) => {
    setProcessing(inv._id + "__decline");
    try {
      await axios.post(
        `${apiUrl}/api/user/invitations/decline`,
        { invitationId: inv._id, email: inv.senderEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateStatus(inv._id, "rejected");
      setAlertMessage("Invitation declined"); setAlertType("info"); setOpen(true);
    } catch (err) {
      setAlertMessage(err.response?.data?.message || "Failed to decline");
      setAlertType("error"); setOpen(true);
    } finally { setProcessing(null); }
  };

  return (
    <div style={{ padding: "24px 32px", maxWidth: 680, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111", margin: 0 }}>Invitations</h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "4px 0 0" }}>Manage your teammate requests</p>
        </div>
        <button onClick={() => setShowInviteModal(true)} className="px-4 py-2 rounded-lg bg-blue-600 text-white border-none cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg">
          + Send Invitation
        </button>
      </div>

      {/* ── STATUS TABS ── */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1.5px solid #e5e7eb" }}>
        {STATUS_TABS.map(tab => {
          const active = activeTab === tab;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "8px 16px", border: "none", background: "none", cursor: "pointer",
              fontWeight: active ? 600 : 400, fontSize: 14,
              color: active ? TAB_COLORS[tab] : "#6b7280",
              borderBottom: active ? `2.5px solid ${TAB_COLORS[tab]}` : "2.5px solid transparent",
              marginBottom: -1.5, transition: "all 0.15s",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {TAB_LABELS[tab]}
              {counts[tab] > 0 && (
                <span style={{
                  backgroundColor: active ? TAB_BG[tab] : "#f3f4f6",
                  color: active ? TAB_COLORS[tab] : "#6b7280",
                  borderRadius: 12, padding: "1px 7px", fontSize: 11, fontWeight: 600,
                }}>{counts[tab]}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── CONTENT ── */}
      {loading ? (
        <Box className="w-full flex justify-center py-10">
          <CircularProgress size={40} sx={{ color: '#1a73e8' }} />
        </Box>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "52px 24px", backgroundColor: "#f9fafb", borderRadius: 12, border: "1.5px dashed #e5e7eb" }}>
          <span style={{ fontSize: 40 }}>{activeTab === "pending" ? "📭" : activeTab === "accepted" ? "🤝" : "🚫"}</span>
          <p style={{ color: "#9ca3af", marginTop: 12, fontSize: 15 }}>
            {activeTab === "pending" ? "No pending invitations" : activeTab === "accepted" ? "No accepted invitations" : "No declined invitations"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(inv => {
            const accepting = processing === inv._id;
            const declining = processing === inv._id + "__decline";
            const busy = accepting || declining;
            const isPending = inv.status === "pending";
            return (
              <div key={inv._id} className="flex items-center justify-between gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5" style={{ borderLeft: `3.5px solid ${TAB_COLORS[inv.status] || "#e5e7eb"}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    backgroundColor: TAB_COLORS[inv.status] || "#1a73e8",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 700, fontSize: 18, flexShrink: 0,
                  }}>{(inv.senderName || inv.senderEmail)?.charAt(0)?.toUpperCase() || "?"}</div>
                  <div style={{ minWidth: 0 }}>
                    {inv.senderName && <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#111" }}>{inv.senderName}</p>}
                    <p style={{ margin: 0, fontSize: 13, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inv.senderEmail}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, color: TAB_COLORS[inv.status],
                        backgroundColor: TAB_BG[inv.status], padding: "1px 8px", borderRadius: 8, textTransform: "capitalize",
                      }}>{inv.status === "rejected" ? "Declined" : inv.status}</span>
                      {inv.createdAt && <span style={{ fontSize: 11, color: "#9ca3af" }}>{new Date(inv.createdAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
                {isPending && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleDecline(inv)} disabled={busy} className={`px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 transition-all duration-200 ${declining ? "opacity-50 cursor-default" : "cursor-pointer hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-sm"}`}>
                      {declining ? "…" : "Decline"}
                    </button>
                    <button onClick={() => handleAccept(inv)} disabled={busy} className={`px-4 py-2 rounded-lg text-white border-none text-sm font-medium transition-all duration-200 ${accepting ? "bg-blue-300 cursor-default opacity-70" : "bg-blue-600 cursor-pointer hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-md"}`}>
                      {accepting ? "Accepting…" : "Accept"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} onSuccess={fetchInvitations} />}
    </div>
  );
};

export default Invitations;