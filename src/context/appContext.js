"use client"
import { createContext, useContext, useMemo, useState } from "react"

const AppContext = createContext(null)

export const AppContextProvider = ({ children }) => {
    const [treeList, setTreeList] = useState([])

    const value = useMemo(() => {
        return {
            treeList,
            setTreeList
        }
    })

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = () => {
    return useContext(AppContext)
}