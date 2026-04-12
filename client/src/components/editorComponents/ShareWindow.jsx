import React, { useContext, useState, useEffect, useCallback } from "react";
import AppContext from "../../context/Context";
import axios from "axios";
import { CircularProgress, Box } from '@mui/material';

const ShareWindow = ({ props }) => {
  const { toggleShareWindow, id } = props;
  const { apiUrl } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState("teams"); // "teams" or "connections"
  
  const [teamsData, setTeamsData] = useState([]);
  const [connectionsData, setConnectionsData] = useState([]);
  
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedConnections, setSelectedConnections] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const token = localStorage.getItem("token");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tmRes, connRes] = await Promise.all([
        axios.get(`${apiUrl}/api/user/getTeammates`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiUrl}/api/user/connections`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setTeamsData(tmRes.data.ownedTeams || []);
      setConnectionsData(connRes.data.connections || []);
    } catch (e) {
      console.error("Failed fetching share data", e);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleTeam = (teamId) =>
    setSelectedTeams(prev => prev.includes(teamId) ? prev.filter(t => t !== teamId) : [...prev, teamId]);

  const toggleConnection = (email) =>
    setSelectedConnections(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]);

  const handleShare = async () => {
    const flatEmails = new Set();
    
    // Extract team member emails
    for (const teamId of selectedTeams) {
        const team = teamsData.find(t => t._id === teamId);
        if (team && team.members) {
            team.members.forEach(m => flatEmails.add(m.email));
        }
    }
    
    // Extract connection emails
    for (const email of selectedConnections) {
        flatEmails.add(email);
    }
    
    const finalEmailsList = Array.from(flatEmails);
    if (finalEmailsList.length === 0 || sharing) return;
    
    setSharing(true);
    try {
      // Backend automatically checks `recipient.sharedRepos` and ignores duplicate insertions
      await axios.post(`${apiUrl}/repo/share/${id}`,
        { team: finalEmailsList },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (e) { console.error("Share error:", e); }
    finally { setSharing(false); toggleShareWindow(); }
  };

  const totalSelections = selectedTeams.length + selectedConnections.length;

  return (
    <div className="p-4">
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm z-[1000] transition-all duration-300">
        <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-800 transform transition-all duration-300 scale-100">
          <h3 className="text-white font-semibold text-lg mb-1">Share Repository</h3>
          <p className="text-gray-400 text-xs mb-4">Select teams or individuals to share with</p>

          <div className="flex gap-2 mb-4">
            <button 
              onClick={() => setActiveTab("teams")}
              className={`flex-1 py-1 text-sm font-medium border-b-2 transition-colors ${activeTab === "teams" ? "border-blue-500 text-blue-400" : "border-gray-700 text-gray-500 hover:text-gray-300"}`}
            >
              Teams
            </button>
            <button 
              onClick={() => setActiveTab("connections")}
              className={`flex-1 py-1 text-sm font-medium border-b-2 transition-colors ${activeTab === "connections" ? "border-blue-500 text-blue-400" : "border-gray-700 text-gray-500 hover:text-gray-300"}`}
            >
              Individuals
            </button>
          </div>

          {loading ? (
            <Box className="flex justify-center py-6">
              <CircularProgress size={30} sx={{ color: '#3b82f6' }} />
            </Box>
          ) : (
            <div className="mb-4 max-h-64 overflow-y-auto pr-1">
              {activeTab === "teams" ? (
                teamsData.length === 0 ? (
                  <div className="p-4 rounded-lg bg-gray-800 text-center">
                    <p className="text-gray-400 text-sm">No teams found.</p>
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {teamsData.map(team => {
                      const isChecked = selectedTeams.includes(team._id);
                      return (
                        <li key={team._id}>
                          <label className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-800 hover:shadow-md hover:-translate-y-0.5">
                            <input type="checkbox" checked={isChecked} onChange={() => toggleTeam(team._id)}
                              className="w-4 h-4 accent-blue-500" />
                            <div style={{
                              width: 32, height: 32, borderRadius: "25%", flexShrink: 0,
                              backgroundColor: isChecked ? "#1a73e8" : "#374151",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "#fff", fontWeight: 700, fontSize: 13, transition: "background 0.15s",
                            }}>
                              {team.teamName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-white text-sm font-medium truncate">{team.teamName}</p>
                              <p className="text-gray-400 text-xs truncate">{team.members.length} member(s)</p>
                            </div>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )
              ) : (
                connectionsData.length === 0 ? (
                  <div className="p-4 rounded-lg bg-gray-800 text-center">
                    <p className="text-gray-400 text-sm">No connections yet.</p>
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {connectionsData.map(c => {
                      const isChecked = selectedConnections.includes(c.email);
                      return (
                        <li key={c.email}>
                          <label className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-800 hover:shadow-md hover:-translate-y-0.5">
                            <input type="checkbox" checked={isChecked} onChange={() => toggleConnection(c.email)}
                              className="w-4 h-4 accent-blue-500" />
                            <div style={{
                              width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                              backgroundColor: isChecked ? "#1a73e8" : "#374151",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "#fff", fontWeight: 700, fontSize: 13, transition: "background 0.15s",
                            }}>
                              {(c.name || c.email)?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              {c.name && <p className="text-white text-sm font-medium truncate">{c.name}</p>}
                              <p className="text-gray-400 text-xs truncate">{c.email}</p>
                            </div>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )
              )}
            </div>
          )}

          {totalSelections > 0 && (
            <p className="text-blue-400 text-xs mb-3">
              Selected {selectedTeams.length} team(s) and {selectedConnections.length} individual(s)
            </p>
          )}

          <div className="flex justify-end gap-2 mt-2">
            <button onClick={toggleShareWindow}
              className="bg-gray-800 text-gray-300 border border-gray-700 text-sm px-4 py-2 rounded-lg transition-all duration-200 hover:bg-gray-700 hover:text-white">
              Cancel
            </button>
            <button onClick={handleShare} disabled={totalSelections === 0 || loading || sharing}
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500 hover:shadow-lg hover:-translate-y-0.5">
              {sharing ? "Sharing…" : "Share"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareWindow;