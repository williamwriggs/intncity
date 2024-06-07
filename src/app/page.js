"use client"
import React, { useState, useEffect } from 'react';
import { useLocalStorage } from "@/utilities/useLocalStorage";
import CssBaseline from '@mui/material/CssBaseline';
import { 
  Box,
  Button,
  Grid,
  Link,
  Paper,
  TextField,
  Typography,
  AppBar
 } from '@mui/material';
import appTheme from '@/theme.js';
import { ThemeProvider } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/auth/Hooks';

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://intn.city/">
      INTNCITY
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const AuthButton = () => {
  const auth = useAuth()
  const navigate = useRouter().push;
  const [user, setUser] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    console.log(connected)
  }, [connected])

  useEffect(() => {
    if (auth) {
      console.log(auth)
    }
    if (auth.user) {
      console.log(auth.user)
      setUser(auth.user)
      console.log(auth.connected)
      setConnected(auth.connected)
    }
  }, [auth])


  // useEffect(() => {
  //   console.log(auth)
  //   console.log(connected)
  // }, [connected])


  return (
    <>
    { !connected ?
      <Button 
        color="secondary" 
        type="button" 
        size="large"
        variant="contained"
        sx={{
          borderRadius: "0 0 0 5px",
        }}
        onClick={() => {
          navigate("/login")
        }}
      >
        Sign In
      </Button>
      :
      <Button 
        color="secondary" 
        type="button" 
        size="large"
        variant="contained"
        sx={{
          borderRadius: "0 0 0 5px",
        }}
        onClick={() => {
          navigate("/profile")
        }}
      >
        My Account
      </Button>
    }
    </>
  )
}

export default function StartTreePlantingRequest() {
  let navigate = useRouter().push;  
  const [email, setEmail] = useLocalStorage("email", "");
  const [emailValid, setEmailValid] = useState(false)

  useEffect(() => {
    setEmail("")
  }, [])

  useEffect(() => {
    const emailChecker = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    setEmailValid(emailChecker.test(email))
  }, [email])

  const handleSubmit = (event) => {
    event.preventDefault();

    // Force application state reset
    localStorage.setItem("appStep", 0);
    
    navigate('/plant');
  }

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
          <Grid item align="right" color="transparent">
            <AuthButton />
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
              <Typography component="h1" variant="h4" color="primary" pb={4}>Better Neighborhoods.  Same Neighbors.</Typography>
              <Typography component="h2" variant="h6" color="secondary">
                We’re trying to make planting trees more efficient through the power of community—starting in the City of Oakland. Tell us where you plan to put your tree let us and we will help make sure the location is right and you’ll be sure you're making our neighborhoods greener and better.
              </Typography>
              <Box component="form" onSubmit={handleSubmit} noValidate 
                 display="flex" flexDirection="column" justifyContent="flex-start" alignItems="center" mt={10}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  onChange={(event) => {
                    setEmail(event.target.value);
                  }}
                  variant="standard" 
                  sx={{width: 400}}
                  value={email}
                />
                <Button 
                  type='submit'
                  size="large" 
                  variant="contained" 
                  color="secondary"
                  disabled={!emailValid}
                  sx={{width: 200, mt: 2, mb: 2}}>
                    Plant a Tree
                </Button>
              </Box>
            </Box>
            <Copyright />
        </Grid>
      </Grid>
    </ThemeProvider>

  );
}