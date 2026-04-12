import React, { useContext } from 'react'
import AppContext from '../context/Context'
import LoginRequired from './LoginRequired';

const ProtectedRoute = ({children}) => {
    const {user,loading} = useContext(AppContext);
    if(!user){
        console.log(loading);
        return <LoginRequired />
    }
    return children;
}

export default ProtectedRoute