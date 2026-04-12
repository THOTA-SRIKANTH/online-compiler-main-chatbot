
import React, { useState, useContext } from "react";
import AppContext from "../context/Context";
import axios from "axios";

const InviteModal = ({ onClose, onSuccess }) => {
  const { apiUrl, setAlertMessage, setAlertType, setOpen } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post(
        `${apiUrl}/api/user/connect`,
        { email: email.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlertMessage(res.data.message || "Invitation sent!");
      setAlertType("success");
      setOpen(true);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setAlertMessage(err.response?.data?.message || "Failed to send invitation");
      setAlertType("error");
      setOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const inputSx = {
    width: "100%", boxSizing: "border-box", border: "1.5px solid #d1d5db",
    borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none"
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ backgroundColor: "#fff", borderRadius: 16, padding: 28, width: 420, boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px", color: "#111" }}>Send Invitation</h2>
        <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 18px" }}>Enter the email address of the person you want to connect with.</p>
        <form onSubmit={handleSubmit}>
          <input autoFocus required type="email" placeholder="peer@example.com" value={email} onChange={e => setEmail(e.target.value)} style={inputSx} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: 14, color: "#374151", fontWeight: 500 }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ padding: "8px 18px", borderRadius: 8, backgroundColor: "#1a73e8", color: "#fff", border: "none", cursor: submitting ? "default" : "pointer", fontSize: 14, fontWeight: 500, opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Sending…" : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default InviteModal;
