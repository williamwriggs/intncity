import { useAuth } from "@/auth/Hooks"
import GenericModal from "./GenericModal"
import { Button, CircularProgress, Grid, Typography } from "@mui/material"
import sign from "@/auth/sign"
import { useState } from "react"
import signedFetch from "@/auth/signedFetch"

export default function TreeModal({ open, handleClose, tree, approveFunction }) {
    const auth = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [approved, setApproved] = useState(false)

    const handleApproveTree = async () => {
        setLoading(true)
        if(!auth.provider) {
            return
        }

        try {
            let signature = await sign(auth?.provider, tree?.fields["Raw Data"])

            let body = {
                "Tree ID": tree?.id,
                "Approver Signature": signature,
            }

            let url = "/api/request"
            const res = await signedFetch(url, { 
                provider: auth.provider, 
                method: "PATCH",
                body: JSON.stringify(body)
            })
            setError(false)
            setApproved(true)
            setTimeout(approveFunction, 2000)
        } catch(error) {
            console.log(error)
            setError(true)
            setLoading(false)
        }

        
        setLoading(false)
        console.log("approve")
    }

    return (
        <GenericModal open={open} handleClose={handleClose}>
            <Typography variant="h4" sx={{fontWeight: "bold", textAlign: "center", margin: "10px"}}>{tree?.fields["Tree Name"]}</Typography>
            <Typography variant="h6" sx={{textAlign: "center", margin: "10px", marginBottom: "20px"}}>{tree?.fields["Tree Category"]}</Typography>
            <Grid container direction="row" sx={{ flexGrow: 1 }} columnSpacing={{md: 2, lg: 2}}>
                <Grid item sm={12} md={6} lg={6} sx={{overflow: "hidden", maxWidth: "100%", maxHeight: "45vh", gap: "20px"}}>
                    <img style={{maxWidth: "100%", maxHeight: "45vh", borderRadius: "10px"}} src={tree?.fields["Images"][0]?.url} alt="Unable to load image"/>
                </Grid>
                <Grid item sm={12} md={6} lg={6}  sx={{width: "100%"}}>
                    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", width: "100%", margin: "auto", gap: "1px", marginTop: "20px", backgroundColor: "lightgray"}}>
                        <Typography sx={{backgroundColor: "white", padding: "7px"}}>Email:</Typography>
                        <Typography sx={{backgroundColor: "white", padding: "7px"}}>{tree?.fields["Requestor Email"][0]}</Typography>
                        <Typography sx={{backgroundColor: "white", padding: "7px"}}>Address:</Typography>
                        <Typography sx={{backgroundColor: "white", padding: "7px"}}>{tree?.fields["Location Address"]}</Typography>
                        <Typography sx={{backgroundColor: "white", padding: "7px"}}>Latitude:</Typography>
                        <Typography sx={{backgroundColor: "white", padding: "7px"}}>{tree?.fields["Location Latitude"]}</Typography>
                        <Typography sx={{backgroundColor: "white", padding: "7px"}}>Longitude:</Typography>
                        <Typography sx={{backgroundColor: "white", padding: "7px"}}>{tree?.fields["Location Longitude"]}</Typography>
                        <Typography sx={{backgroundColor: "white", padding: "7px"}}>Location Method:</Typography>
                        <Typography sx={{backgroundColor: "white", padding: "7px"}}>{
                            tree?.fields["Manual Location"] ? "Manual ✅" : 
                                tree?.fields["Parsed Location"] ? "Auto ✅" : "Address Only ⚠️"
                        }</Typography>
                        <Typography sx={{backgroundColor: "white", padding: "7px"}}>Questions & Notes:</Typography>
                        <Typography sx={{backgroundColor: "white", padding: "7px"}}>{tree?.fields["Questions"]}</Typography>
                    </div>
                </Grid>
            </Grid>
            <div style={{textAlign: "center", margin: "20px"}}>
                { !loading ?
                <>
                    { !approved ? 
                        <Button onClick={handleApproveTree} variant="contained" size="large" color="secondary">Approve</Button> 
                        :
                        <Typography>Approved</Typography>
                    }
                </>
                : 
                <>
                    <Typography>Sending Approval...</Typography>
                    <CircularProgress color="primary" size="sm" />
                </>
                }
            </div>
        </GenericModal>
    )
}