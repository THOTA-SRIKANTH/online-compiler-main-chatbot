import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="h-full w-[20vw] bg-gray-800 text-white">
      <ul className="space-y-4 p-4">
        <Link to="/home">
          <li className="hover:bg-gray-700 p-2 rounded">Home</li>
        </Link>
        <Link to="/home/repos">
          <li className="hover:bg-gray-700 p-2 rounded">Repos</li>
        </Link>
        <Link to="/home/connections">
          <li className="hover:bg-gray-700 p-2 rounded">Connections</li>
        </Link>
        <Link to="/home/teammates">
          <li className="hover:bg-gray-700 p-2 rounded">Teammates</li>
        </Link>
        <Link to="/home/invitations">
          <li className="hover:bg-gray-700 p-2 rounded">Invitations</li>
        </Link>
      </ul>
    </div>
  );
};

export default Sidebar;