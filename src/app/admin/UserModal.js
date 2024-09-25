import { useAuth } from "@/auth/Hooks"
import GenericModal from "./GenericModal"
import { Button, CircularProgress, Grid, MenuItem, Select, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import signedFetch from "@/auth/signedFetch"

export default function UserModal({ open, handleClose, user, approveFunction }) {
    const auth = useAuth()
    const [authLevel, setAuthLevel] = useState(user?.fields["auth_level"] || "none")
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(false)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        setAuthLevel(user?.fields["auth_level"])
    }, [user])

    const handleUpdateUser = async () => {
        setLoading(true)
        if(!auth?.provider) {
            return
        }

        const body = {
            id: user?.id,
            authLevel
        }

        const url = "/api/account"
        try {
            const res = await signedFetch(url, {
                provider: auth?.provider,
                method: "PATCH",
                body: JSON.stringify(body)
            })
            setError(false)
            setLoading(false)
            setSaved(true)
            setTimeout(approveFunction, 500)
        } catch(error) {
            setError(error)
            setLoading(false)
        }

    }

    return (
        <GenericModal open={open} handleClose={handleClose}>
            <Typography variant="h4" sx={{fontWeight: "bold", textAlign: "center", margin: "10px", marginTop: "10vh"}}>{user?.fields["name"]}</Typography>
            <Typography variant="h6" sx={{textAlign: "center", margin: "10px", marginBottom: "20px"}}>{user?.fields["email"]}</Typography>
            <Typography variant="h6" sx={{textAlign: "center", margin: "10px", marginBottom: "20px", overflow: "hidden"}}>{user?.fields["address"]}</Typography>
            {
                user?.fields["auth_level"] === "admin" ? <>
                    <Typography variant="h6" sx={{textAlign: "center", margin: "10px", marginBottom: "20px"}}>Admin</Typography>
                </>
                :
                <><div style={{textAlign: "center"}}>
                    <Select value={authLevel} onChange={(e) => {setAuthLevel(e.target.value)}}>
                        <MenuItem value={"admin"}>Admin</MenuItem>
                        <MenuItem value={"verifier"}>Verifier</MenuItem>
                        <MenuItem value={"planter"}>Planter</MenuItem>
                        <MenuItem value={"none"}>None</MenuItem>
                    </Select>
                </div>
                <div style={{textAlign: "center", margin: "20px"}}>
                { !loading ?
                <>
                    { !saved ? 
                        <Button onClick={handleUpdateUser} variant="contained" size="large" color="secondary">Save</Button> 
                        :
                        <Typography>Saved</Typography>
                    }
                </>
                : 
                <>
                    <Typography>Saving...</Typography>
                    <CircularProgress color="primary" size="sm" />
                </>
                }
            </div>
                </>
            }
        </GenericModal>
    )
}