"use client"
import { useLocalStorage } from "@/utilities/useLocalStorage"
import { createContext, useContext, useMemo, useState } from "react"

const AppContext = createContext(null)

export const AppContextProvider = ({ children }) => {
    const [treeList, setTreeList] = useState([])
    const [currentTrees, setCurrentTrees] = useLocalStorage("currentTrees", [])

    const value = useMemo(() => {
        return {
            treeList,
            setTreeList,
            currentTrees,
            setCurrentTrees
        }
    }, [treeList, currentTrees])

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = () => {
    return useContext(AppContext)
}

// Tree Structure: