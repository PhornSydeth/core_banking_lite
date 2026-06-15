//1 define the shape of our User
import React, {createContext, useContext, useEffect, useState} from "react";
import {AuthService} from "../service/authService.ts";
import { extractErrorMessage } from "../utils/errorHandler.ts";

interface AUthUser{
    userId: string;
    username:string,
    email:string,
    verified:boolean
}
//2. Define what the context provider to componets
interface  AuthContextType{
    user:AUthUser | null;
    login:(userData:AUthUser) =>void;
    logout:()=>void;
    loading:boolean;
    refreshUser: () => Promise<void>;
}
const AuthContext=createContext<AuthContextType | undefined>(undefined);
export const AuthProvider:React.FC<{children:React.ReactNode}>=({children})=>{
    const  [user,setUser]=useState<AUthUser | null>(null);
    const [loading,setLoading]=useState(true);
    //3 on initial load verify the session with the backend
    useEffect(()=>{
        const verifyUser=async  ()=>{
            try{
                const data=await AuthService.getCurrentUser();
                setUser(data);
            }catch(err){
                setUser(null);
            }finally {
                setLoading(false);
            }
        }
        verifyUser();
    },[])
    const login=(userData:AUthUser)=>setUser(userData);
    const logout=()=>{
        setUser(null);
    }
    const refreshUser = async () => {
        try {
            const data = await AuthService.getCurrentUser();
            setUser(data);
        } catch (err) {
            console.error("Failed to refresh user:", extractErrorMessage(err));
        }
    }
    return(
        <AuthContext.Provider value={{user,login,logout,loading,refreshUser}}>
            {!loading&&children}
        </AuthContext.Provider>
    )

}
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth=()=>useContext(AuthContext);