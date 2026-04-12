import React from 'react';
import { Link } from 'react-router-dom';

const LoginRequired = () => {
    return (
        <div className="flex items-center justify-center min-h-screen w-full ">
            <div className="text-center p-6 bg-white rounded">
                <p className="mb-4 text-lg font-semibold text-gray-700">Please login to continue...</p>
                <Link to="/login" className="text-blue-500 hover:text-blue-700">Login</Link>
            </div>
        </div>
    );
}

export default LoginRequired;
