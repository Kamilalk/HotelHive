import React, {useContext, useState, useEffect} from 'react'
import {auth} from '../firebase'

const AuthContext = React.createContext()

export function useAuth() {
    return useContext(AuthContext)
}
export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState()
    const [loading, setLoading] = useState(true)


    function register(email, password){
        return auth.createUserWithEmailAndPassword(email, password).then((userCredential) =>{
            return userCredential.user.uid
        })
        
    }

    function login(email, password) {
        return auth.signInWithEmailAndPassword(email, password).then((userCredential) => {
          return userCredential;
        });
    }

    function logout(){
       return auth.signOut()

    }

    function resetPassword(email){
        return auth.sendPasswordResetEmail(email)
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user)
            setLoading(false)
        })
        return unsubscribe
    }, [])


    const value = {
        currentUser,
        login,
        register,
        logout,
        resetPassword
    }


    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

