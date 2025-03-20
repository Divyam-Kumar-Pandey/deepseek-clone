"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import { createContext, useContext, useEffect, useState } from "react";

export const AppContext = createContext<any>(null);

export const useAppContext = ()=>{
    return useContext(AppContext)
}

export const AppContextProvider = ({children}: {children: React.ReactNode})=>{
    const {user} = useUser()

    const value = {
        user,
    }
    
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}