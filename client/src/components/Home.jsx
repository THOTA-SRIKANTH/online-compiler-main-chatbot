import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { CircularProgress, Box } from '@mui/material';
import { Link, Outlet, Routes, useNavigate,Route } from 'react-router-dom';
import AppContext from "../context/Context";
import Sidebar from './editorComponents/Sidebar';
import WelcomePage from "./WelcomePage.jsx";
import RepositoriesPage from "./RepositoriesPage.jsx";
import TeammatesPage from "./TeammatesPage.jsx";
import Invitations from "./Invitations.jsx";
import Connections from "./Connections.jsx";
import ProtectedRoute from './ProtectedRoute.jsx';
import LoginRequired from './LoginRequired.jsx';
import Chatbot from './Chatbot.jsx';
const Home = () => {
  const navigate = useNavigate();
  const { user, apiUrl,repos,setRepos,loading } = useContext(AppContext);
  const [repoName, setRepoName] = useState('');
  const [newRepoWindow, setNewRepoWindow] = useState(false);
  const token = localStorage.getItem('token');
 

  const handleCreateNewRepo = async (e) => {
    e.preventDefault();
    console.log(repoName);
    
    const response = await axios.post(`${apiUrl}/repo/new`, { name:repoName }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log(response);
    if (response.status === 200) {
      setRepos([...repos,response.data.repo]);
      setNewRepoWindow(false);
      setRepoName('');
    }

  };
 
  return (
    <div className='flex h-[91.3vh] z-10 w-[98vw]'>
      <Sidebar/>
      {loading ? (
        <Box className="w-full flex items-center justify-center">
          <CircularProgress size={50} sx={{ color: '#1a73e8' }} />
        </Box>
      ) :
      <>
      <div className='w-full'>
      <Routes>
        <Route path='/' element={<WelcomePage />}/>
        <Route path='/repos' element={<ProtectedRoute><RepositoriesPage props={{setNewRepoWindow}}/></ProtectedRoute>}/>
        <Route path='/teammates' element={<ProtectedRoute><TeammatesPage/></ProtectedRoute> }/>
        <Route path='/connections' element={<ProtectedRoute><Connections /></ProtectedRoute>} />
        <Route path='/invitations' element={<ProtectedRoute><Invitations /></ProtectedRoute>} />
      </Routes>
      </div>
      <Outlet />

      {newRepoWindow && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-60 backdrop-blur-sm z-50 transition-all duration-300">
          <div className="bg-white p-6 rounded-xl shadow-2xl transform transition-all duration-300 w-full max-w-sm">
            <h2 className="text-xl mb-4">Create New Repository</h2>
            <form onSubmit={handleCreateNewRepo}>
              <input
                type="text"
                placeholder="Repository Name"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                className="border p-2 mb-4 w-full"
                required
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setNewRepoWindow(false)}
                  className="border border-gray-300 text-gray-700 px-4 py-2 mr-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 border border-transparent text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Chatbot />
    </>
    }
    </div>
  );
};

export default Home;