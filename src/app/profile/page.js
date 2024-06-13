"use client"
import { useAuth } from "@/auth/Hooks"
import sign from "@/auth/sign"
import recover from "@/auth/recover"
import Web3 from "web3"
import appTheme from '@/theme.js';
import { useState, useEffect } from 'react'
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import {
    Grid,
    Button,
    Box,
    Typography
} from '@mui/material'
import { useRouter } from "next/navigation";
import signedFetch from "@/auth/signedFetch"

export default function Profile() {
    const auth = useAuth();
    const [userInfo, setUserInfo] = useState()
    const redirect = useRouter().replace
    const navigate = useRouter().push

    const url = 'http://localhost:3000/api/test?test=test'

    const authTest = async () => {
        await signedFetch(url, {
            provider: auth,
            method: "POST",
            body: JSON.stringify({
                test: "test"
            })
        })
    }


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

        if(auth?.user?.connected === false) {
            redirect("/login")
        } else if(auth?.user?.connected === true) {
            getUserInfo()
            signTest()
        }

    }, [auth])

    return (
        <ThemeProvider theme={appTheme}>
            <Grid container sx={{ height: '100vh' }}>
    
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
            <Grid item sm={12} md={8}>
                <Grid item align="left" color="transparent">
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
                    flexDirection: 'column',
                    alignItems: 'center',
                    }}
                >
                    <Typography component="h1" variant="h4" color="primary" pb={4}>Hi {userInfo?.name}!</Typography>
                    <Button 
                        variant="contained" 
                        size="large" 
                        color="secondary"
                        onClick={authTest}
                    >
                        Test Auth
                    </Button>
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