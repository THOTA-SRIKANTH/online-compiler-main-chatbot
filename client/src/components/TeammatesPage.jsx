import React, { useContext, useState, useCallback } from "react";
import AppContext from "../context/Context";
import axios from "axios";

/**
 * TeammatesPage
 *
 * Teams work like WhatsApp groups:
 *  - You can add ANYONE with a registered account by email — no prior
 *    connection/invitation needed.
 *  - A user can own unlimited teams.
 *  - You can also be a member of teams owned by others.
 *
 * No "Connections" tab — that concept is removed.
 */
const TeammatesPage = () => {
  const {
    apiUrl,
    ownedTeams, setOwnedTeams,
    memberOfTeams, setMemberOfTeams,
    setAlertMessage, setAlertType, setOpen,
  } = useContext(AppContext);

  const [showCreate, setShowCreate] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [editingTeam, setEditingTeam] = useState(null);
  const [addingTo, setAddingTo] = useState(null);   // team to add member to
  const [addEmail, setAddEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const token = localStorage.getItem("token");

  const toast = (msg, type = "success") => {
    setAlertMessage(msg); setAlertType(type); setOpen(true);
  };

  // ── RELOAD ───────────────────────────────────────────────────────────────
  const reloadTeams = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/user/getTeammates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOwnedTeams(res.data.ownedTeams || []);
      setMemberOfTeams(res.data.memberOfTeams || []);
    } catch (err) { console.error("reloadTeams:", err); }
  }, [apiUrl, token, setOwnedTeams, setMemberOfTeams]);

  // ── CREATE TEAM ──────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`${apiUrl}/api/user/team/create`,
        { teamName: newTeamName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOwnedTeams(prev => [...prev, res.data.team]);
      toast("Team created!");
      setNewTeamName(""); setShowCreate(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create team";
      const fix = err.response?.data?.fix;
      toast(fix ? `${msg} — ${fix}` : msg, "error");
    } finally { setSubmitting(false); }
  };

  // ── RENAME TEAM ──────────────────────────────────────────────────────────
  const handleRename = async (e) => {
    e.preventDefault();
    if (!editingTeam || !newTeamName.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.put(`${apiUrl}/api/user/team/${editingTeam._id}/rename`,
        { teamName: newTeamName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOwnedTeams(prev => prev.map(t => t._id === editingTeam._id ? res.data.team : t));
      toast("Team renamed!"); setEditingTeam(null); setNewTeamName("");
    } catch (err) { toast(err.response?.data?.message || "Failed to rename", "error"); }
    finally { setSubmitting(false); }
  };

  // ── DELETE TEAM ──────────────────────────────────────────────────────────
  const handleDelete = async (teamId) => {
    if (!window.confirm("Delete this team? Members won't be notified.")) return;
    try {
      await axios.delete(`${apiUrl}/api/user/team/${teamId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOwnedTeams(prev => prev.filter(t => t._id !== teamId));
      toast("Team deleted");
    } catch (err) { toast(err.response?.data?.message || "Failed to delete", "error"); }
  };

  // ── ADD MEMBER ───────────────────────────────────────────────────────────
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!addingTo || !addEmail.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`${apiUrl}/api/user/team/${addingTo._id}/add-member`,
        { email: addEmail.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOwnedTeams(prev => prev.map(t => t._id === addingTo._id ? res.data.team : t));
      toast(res.data.message || "Member added!");
      setAddEmail(""); setAddingTo(null);
    } catch (err) { toast(err.response?.data?.message || "Failed to add member", "error"); }
    finally { setSubmitting(false); }
  };

  // ── REMOVE MEMBER ────────────────────────────────────────────────────────
  const handleRemoveMember = async (teamId, memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName || "this person"} from the team?`)) return;
    try {
      const res = await axios.delete(`${apiUrl}/api/user/team/${teamId}/member`,
        { data: { memberId }, headers: { Authorization: `Bearer ${token}` } }
      );
      setOwnedTeams(prev => prev.map(t => t._id === teamId ? res.data.team : t));
      toast("Member removed");
    } catch (err) { toast(err.response?.data?.message || "Failed to remove", "error"); }
  };

  // ── LEAVE TEAM ───────────────────────────────────────────────────────────
  const handleLeave = async (teamId, teamName) => {
    if (!window.confirm(`Leave "${teamName}"?`)) return;
    try {
      await axios.post(`${apiUrl}/api/user/team/${teamId}/leave`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMemberOfTeams(prev => prev.filter(t => t._id !== teamId));
      toast("Left team");
    } catch (err) { toast(err.response?.data?.message || "Failed to leave", "error"); }
  };

  // ── SHARED UI ────────────────────────────────────────────────────────────
  const Avatar = ({ name, email, size = 36 }) => (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      backgroundColor: "#1a73e8",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 700, fontSize: size * 0.38,
    }}>
      {(name || email)?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );

  const inputSx = {
    width: "100%", boxSizing: "border-box",
    border: "1.5px solid #d1d5db", borderRadius: 8,
    padding: "10px 14px", fontSize: 14, outline: "none",
    transition: "border-color 0.15s",
  };

  const Modal = ({ title, subtitle, onClose, onSubmit, children }) => (
    <div className="fixed inset-0 flex items-center justify-center z-[1000] bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white rounded-2xl p-7 w-[420px] shadow-2xl transform transition-all duration-300">
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>{title}</h2>
        {subtitle && <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 18px" }}>{subtitle}</p>}
        <form onSubmit={onSubmit}>
          {children}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition-colors duration-200 text-sm cursor-pointer">Cancel</button>
            <button type="submit" disabled={submitting} className={`px-4 py-2 rounded-lg bg-blue-600 text-white border-none text-sm font-medium transition-all duration-200 ${submitting ? "opacity-70 cursor-default" : "cursor-pointer hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-md"}`}>
              {submitting ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "24px 32px", maxWidth: 760, margin: "0 auto" }}>

      {/* ── HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111", margin: 0 }}>Teams</h1>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "4px 0 0" }}>
            {ownedTeams.length} team{ownedTeams.length !== 1 ? "s" : ""} you lead
            {memberOfTeams.length > 0 && ` · ${memberOfTeams.length} team${memberOfTeams.length !== 1 ? "s" : ""} you're in`}
          </p>
        </div>
        <button onClick={() => { setShowCreate(true); setNewTeamName(""); }}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white border-none cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg">
          + New team
        </button>
      </div>

      {/* ── TEAMS I OWN ── */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 14px" }}>
          Teams you lead — {ownedTeams.length}
        </h2>

        {ownedTeams.length === 0 ? (
          <div style={{ padding: "40px 24px", borderRadius: 12, border: "1.5px dashed #e5e7eb", textAlign: "center" }}>
            <div style={{ fontSize: 36 }}>👥</div>
            <p style={{ color: "#9ca3af", fontSize: 14, margin: "12px 0 0" }}>You haven't created any teams yet.</p>
            <button onClick={() => { setShowCreate(true); setNewTeamName(""); }}
              className="mt-4 px-5 py-2 rounded-lg bg-blue-600 text-white border-none cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg">
              Create your first team
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {ownedTeams.map(team => (
              <div key={team._id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">

                {/* Team header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#1a73e8" }} />
                    <span style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>{team.teamName}</span>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>{team.members.length} member{team.members.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => { setAddingTo(team); setAddEmail(""); }}
                      className="px-3 py-1 rounded-md border border-gray-300 bg-white cursor-pointer text-xs font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-sm">
                      + Add member
                    </button>
                    <button onClick={() => { setEditingTeam(team); setNewTeamName(team.teamName); }}
                      className="px-3 py-1 rounded-md border border-gray-300 bg-white cursor-pointer text-xs text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-sm">
                      Rename
                    </button>
                    <button onClick={() => handleDelete(team._id)}
                      className="px-2 py-1 rounded-md border border-red-300 bg-white cursor-pointer text-xs text-red-600 transition-all duration-200 hover:bg-red-50 hover:-translate-y-0.5 hover:shadow-sm">
                      🗑
                    </button>
                  </div>
                </div>

                {/* Members list */}
                {team.members.length === 0 ? (
                  <div style={{ padding: "16px 20px", color: "#9ca3af", fontSize: 13, fontStyle: "italic" }}>
                    No members yet — add anyone by email.
                  </div>
                ) : (
                  team.members.map((m, i) => (
                    <div key={m.userId || i} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 18px",
                      borderBottom: i < team.members.length - 1 ? "1px solid #f3f4f6" : "none",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={m.name} email={m.email} />
                        <div>
                          {m.name && <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#111" }}>{m.name}</p>}
                          <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{m.email}</p>
                        </div>
                      </div>
                      <button onClick={() => handleRemoveMember(team._id, m.userId, m.name)}
                        title="Remove from team"
                        className="bg-transparent border-none cursor-pointer text-red-600 text-lg px-2 rounded-md transition-all duration-200 hover:bg-red-50 hover:scale-110">
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── TEAMS I'M A MEMBER OF ── */}
      {memberOfTeams.length > 0 && (
        <section>
          <h2 style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 14px" }}>
            Teams you're in — {memberOfTeams.length}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {memberOfTeams.map(team => (
              <div key={team._id} className="flex items-center justify-between p-4 border border-gray-200 border-l-[4px] border-l-gray-500 rounded-lg bg-white transition-all duration-300 hover:shadow-md hover:border-l-blue-500 hover:-translate-y-0.5">
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#111" }}>{team.teamName}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                    {team.members.length} member{team.members.length !== 1 ? "s" : ""} · added by team lead
                  </p>
                </div>
                <button onClick={() => handleLeave(team._id, team.teamName)}
                  className="px-4 py-1.5 rounded-md border border-red-300 bg-white cursor-pointer text-xs text-red-600 transition-all duration-200 hover:bg-red-50 hover:-translate-y-0.5 hover:shadow-sm">
                  Leave
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── MODALS ── */}
      {showCreate && (
        <Modal title="Create a new team" subtitle="Give your team a name. You can add members by email right after." onClose={() => setShowCreate(false)} onSubmit={handleCreate}>
          <input autoFocus required type="text" placeholder="e.g. CodeMeet Squad" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} style={inputSx} />
        </Modal>
      )}

      {editingTeam && (
        <Modal title="Rename team" onClose={() => setEditingTeam(null)} onSubmit={handleRename}>
          <input autoFocus required type="text" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} style={inputSx} />
        </Modal>
      )}

      {addingTo && (
        <Modal
          title={`Add member to "${addingTo.teamName}"`}
          subtitle="Enter any registered email — no prior connection needed."
          onClose={() => setAddingTo(null)}
          onSubmit={handleAddMember}
        >
          <input autoFocus required type="email" placeholder="colleague@example.com" value={addEmail} onChange={e => setAddEmail(e.target.value)} style={inputSx} />
        </Modal>
      )}
    </div>
  );
};

export default TeammatesPage;