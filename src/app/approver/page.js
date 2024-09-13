"use client"
import { useAuth } from "@/auth/Hooks";
import sign from "@/auth/sign";
import recover from "@/auth/recover";
import Web3 from "web3";
import appTheme from '@/theme.js';
import { useState, useEffect, useMemo } from 'react'
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
    CircularProgress,
    Container,
    Tabs,
    Tab
} from '@mui/material';
import { useRouter } from "next/navigation";
import signedFetch from "@/auth/signedFetch";
import UserListDisplay from "@/app/admin/UserListDisplay";
import TreeListDisplay from "@/app/admin/TreeListDisplay";
import { Table } from "airtable";

export default function Profile() {
    const auth = useAuth();
    const [userInfo, setUserInfo] = useState()
    const [tabValue, setTabValue] = useState(0)
    const [users, setUsers] = useState([])
    const [appInfo, setAppInfo] = useState()
    const redirect = useRouter().replace
    const navigate = useRouter().push

    const [trees, setTrees] = useState([]);
    const [treesOffsets, setTreesOffsets] = useState([]);
    const [treesSearch, setTreesSearch] = useState(null);
    const [treesPage, setTreesPage] = useState(0)
    const [lastTreesPage, setLastTreesPage] = useState(undefined)
    const [treesError, setTreesError] = useState(null);
    const [treesLoading, setTreesLoading] = useState(false);

    useEffect(() => {
        if(appInfo && appInfo?.fields?.auth_level !== "verifier") {
            redirect("/")
        }
    }, [appInfo])


    useEffect(() => {

        const getUserInfo = async () => {
            const info = await auth.user?.getUserInfo()
            console.log(info)
            setUserInfo(info)
        }

        if(auth?.provider && auth?.user?.connected === false) {
            redirect("/")
        } else if(auth?.user?.connected === true) {
            getUserInfo()
        }

        if(auth.app) {
            setAppInfo(auth.app)
            console.log(auth.app)
        }

    }, [auth])

    function CustomTabPanel(props) {
        const { children, value, index, ...other } = props;
      
        return (
          <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
          >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
          </div>
        );
    }

    function a11yProps(index) {
        return {
          id: `simple-tab-${index}`,
          'aria-controls': `simple-tabpanel-${index}`,
        };
      }

    const tableRowStyle = {
        width: "100%",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
    }

    const tableCellStyle = {
        display: "inline-flex",
        maxWidth: "100%",
        padding: "20px",
    }

    const tableTextStyle = {
        overflow: "hidden",
        maxWidth: "100%"
    }

    const topTableCellStyle = {
        borderTop: "1px solid lightGray",
        ...tableCellStyle
    }

    const handleTabChange = (e, newValue) => {
        setTabValue(newValue)
    }

    return (
        <>


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
                    borderRadius: "50px 50px 0 0",
                    boxShadow: "5px 2px 10px gray"
                }}
            >   
            <Box sx={{margin: "30px"}}>
                <Typography variant="h4">Approve Trees</Typography>
            </Box>
            { !appInfo ? <Box sx={{display: "flex", height: "60vh", textAlign: "center", margin: "auto"}}>
                    <CircularProgress color="primary" />
                </Box> : <Box alignItems={"center"} width={"80%"}>
                    <TreeListDisplay     
                        trees={trees} 
                        setTrees={setTrees}
                        offsets={treesOffsets}
                        setOffsets={setTreesOffsets}
                        search={treesSearch}
                        setSearch={setTreesSearch}
                        page={treesPage}
                        setPage={setTreesPage}
                        lastPage={lastTreesPage}
                        setLastPage={setLastTreesPage}
                        setTreesError={setTreesError}
                        treesLoading={treesLoading}
                        setTreesLoading={setTreesLoading}
                    />
                </Box>
            }
            </Box>
            </Grid>
            
                </Grid>
            </ThemeProvider>
        </>
        
    )

}