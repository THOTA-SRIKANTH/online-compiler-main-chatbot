import { createContext, useEffect, useState } from "react";
import axios from "axios";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [ownedTeams, setOwnedTeams] = useState([]);
  const [memberOfTeams, setMemberOfTeams] = useState([]);
  // `teammates` kept as a flat alias for ShareWindow / meeting invite
  // It is derived from ownedTeams members deduplicated
  const [teammates, setTeammates] = useState([]);
  const [sharedRepos, setSharedRepos] = useState([]);
  const [repos, setRepos] = useState([]);
  const [open, setOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [loading, setLoading] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [mediaOptions, setMediaOptions] = useState(() => {
    try { const s = localStorage.getItem("meetMediaOptions"); return s ? JSON.parse(s) : { audio: true, video: true }; }
    catch { return { audio: true, video: true }; }
  });

  useEffect(() => { localStorage.setItem("meetMediaOptions", JSON.stringify(mediaOptions)); }, [mediaOptions]);

  const logout = () => {
    setUser(null); setOwnedTeams([]); setMemberOfTeams([]); setTeammates([]);
    setSharedRepos([]); setRepos([]);
    localStorage.removeItem("token");
  };

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Derive flat teammates list from owned teams (all unique members)
  const deriveTeammates = (owned) => {
    const seen = new Set();
    const flat = [];
    for (const team of owned) {
      for (const m of (team.members || [])) {
        const key = m.userId?.toString() || m.email;
        if (!seen.has(key)) { seen.add(key); flat.push(m); }
      }
    }
    return flat;
  };

  const fetchData = async (token) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [userRes, teamRes, sharedRes, repoRes] = await Promise.all([
        axios.get(`${apiUrl}/api/user/getUser`, { headers }),
        axios.get(`${apiUrl}/api/user/getTeammates`, { headers }),
        axios.get(`${apiUrl}/repo/getSharedRepos`, { headers }),
        axios.get(`${apiUrl}/repo`, { headers }),
      ]);

      setUser(userRes.data.user);

      const { ownedTeams = [], memberOfTeams = [] } = teamRes.data;
      setOwnedTeams(ownedTeams);
      setMemberOfTeams(memberOfTeams);
      setTeammates(deriveTeammates(ownedTeams));

      setSharedRepos(sharedRes.data.sharedRepos || []);
      setRepos(repoRes.data || []);
    } catch (err) { console.error("fetchData:", err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) { setLoading(true); fetchData(token); } else setLoading(false);
  }, []);

  return (
    <AppContext.Provider value={{
      user, setUser, apiUrl, logout,
      ownedTeams, setOwnedTeams,
      memberOfTeams, setMemberOfTeams,
      teammates, setTeammates,
      sharedRepos, setSharedRepos,
      repos, setRepos,
      mediaOptions, setMediaOptions,
      open, setOpen, alertMessage, setAlertMessage, alertType, setAlertType,
      loading, showDescription, setShowDescription,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;