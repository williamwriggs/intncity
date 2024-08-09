"use client"
import { useAuth } from "@/auth/Hooks";
import sign from "@/auth/sign";
import recover from "@/auth/recover";
import Web3 from "web3";
import appTheme from '@/theme.js';
import { useState, useEffect } from 'react'
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import {
    Grid,
    Button,
    Box,
    Typography,
    List,
    ListItem,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
    TableBody,
    CircularProgress
} from '@mui/material';
import { useRouter } from "next/navigation";
import signedFetch from "@/auth/signedFetch";
import { Table } from "airtable";

export default function Profile() {
    const auth = useAuth();
    const [userInfo, setUserInfo] = useState()
    const [appInfo, setAppInfo] = useState()
    const redirect = useRouter().replace
    const navigate = useRouter().push


    useEffect(() => {

        const getUserInfo = async () => {
            const info = await auth.user?.getUserInfo()
            console.log(info)
            setUserInfo(info)
        }

        const signTest = async () => {
            const signature = await sign(auth.provider, "test")
            const web3 = new Web3(auth.provider)
            const address = (await web3.eth.getAccounts())[0]
            console.log("account: " + address)
            console.log("signature: " + signature)
            const recoveredAddress = await recover("test", signature)
            console.log("recovered address: " + recoveredAddress)
        }

        if(auth?.provider && auth?.user?.connected === false) {
            redirect("/")
        } else if(auth?.user?.connected === true) {
            getUserInfo()
            signTest()
        }

        if(auth.app) {
            setAppInfo(auth.app)
            console.log(auth.app)
        }

    }, [auth])

    const tableRowStyle = {
        width: "100%",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
    }

    const tableCellStyle = {
        display: "inline-flex",
        width: "50%",
        padding: "20px",

    }

    return (
        <ThemeProvider theme={appTheme}>
            <Grid container sx={{ height: '100vh', position: "fixed" }}>
    
            {/*  Left Column - Background Image */}
    
            <Grid
                item
                sm={false}
                md={4}
                sx={{
                    backgroundImage: 'url(http://intn.city/wp-content/uploads/2021/09/Intensity-cover.jpg)',  //url("http://intn.city/wp-content/uploads/2021/09/Intensity-cover.jpg")
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: (t) =>
                        t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    
                }}
            />
    
            {/*  Right Column - Text Field */}
    
            <CssBaseline />
            <Grid item sm={12} md={8} sx={{padding: "none", margin: "none", width: "100%", backgroundColor: "lightGray"}}>
                <Grid item align="left" color="transparent" sx={{position: "fixed"}}>
                    <Button 
                        color="secondary" 
                        size="large" 
                        type="button" 
                        variant="contained"
                        onClick={() => {
                            navigate("/")
                        }}
                        sx={{
                            borderRadius: "0 0 5px 0"
                        }}
                    >
                        Back
                    </Button>
                </Grid>
                <Box
                    sx={{
                        my: 8,
                        mx: 6,
                        display: 'flex',
                        position: "relative",
                        flexDirection: 'column',
                        alignItems: 'center',
                        backgroundColor: "white",
                        margin: "0",
                        padding: "0",
                        top: "15vh",
                        height: "100vh",
                        borderRadius: "50px 0 0 0",
                        boxShadow: "5px 2px 10px gray"
                    }}
                >   
                    <div style={{borderRadius: "50%", padding: "7px", paddingBottom: "3px", position: "relative", bottom: "7.5vh", backgroundColor: "white", boxShadow: "5px 5px 10px gray"}}>
                        {userInfo ? <img src={userInfo?.profileImage} style={{ position: "relative", borderRadius: "50%"}}/> : <div style={{height: "96px", width: "96px"}}/>}
                    </div>
                    <div style={{width: "70%", marginBottom: "40px", display: "grid", border: "1px solid lightGray", borderRadius: " 10px"}}>
                            <div sx={{display: "block", width: "100%"}}>
                                <div style={{...tableRowStyle, borderBottom: "1px solid lightGray"}}>
                                    <div style={tableCellStyle}>Name: </div>
                                    <div style={tableCellStyle} align="right">{userInfo?.name}</div>
                                </div>
                                <div style={{...tableRowStyle, borderBottom: "1px solid lightGray"}}>
                                    <div style={tableCellStyle}>Email: </div>
                                    <div align="right" style={tableCellStyle}>{userInfo?.email}</div>
                                </div>
                                <div style={tableRowStyle}>
                                    <div style={tableCellStyle}>Auth Level: </div>
                                    <div align="right" style={{...tableCellStyle, textTransform: "capitalize"}}>{appInfo?.fields.auth_level || <CircularProgress size="1rem" />}</div>
                                </div>
                            </div>
                    </div>
                    {/* <Button 
                        variant="contained" 
                        size="large" 
                        color="secondary"
                        onClick={authTest}
                    >
                        Test Auth
                    </Button> */}
                    <Button 
                        variant="contained" 
                        size="large" 
                        color="secondary"
                        onClick={async () => {
                            await auth.Logout()
                            navigate("/")
                        }}
                    >
                        Log Out
                    </Button>
                </Box>
                </Grid>
            </Grid>
        </ThemeProvider>
    )

}