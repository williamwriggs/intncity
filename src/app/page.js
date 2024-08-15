"use client";
import React, { useState, useEffect } from "react";
import { useLocalStorage } from "@/utilities/useLocalStorage";
import CssBaseline from "@mui/material/CssBaseline";
import {
  Box,
  Button,
  Grid,
  Link,
  Paper,
  TextField,
  Typography,
  AppBar,
} from "@mui/material";
import appTheme from "@/theme.js";
import { ThemeProvider } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { useAuth } from "@/auth/Hooks";
import { useAppContext } from "@/context/appContext";


function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://intn.city/">
        INTNCITY
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const AdminPanelButton = ({ auth }) => {
  let navigate = useRouter().push;

  return (
    <Button
      color="secondary"
      type="button"
      size="large"
      variant="contained"
      sx={{
        borderRadius: "5px",
      }}
      onClick={() => {
        if(auth.app) {
          navigate("/admin");
        }
      }}
    >
    Admin Panel
  </Button>
  )
}

const AuthButton = () => {
  const { currentTrees, setCurrentTrees} = useAppContext()
  const [activeStep, setActiveStep] = useLocalStorage("appStep", 0);
  const auth = useAuth();
  const navigate = useRouter().push;
  const [user, setUser] = useState(null);
  const [connected, setConnected] = useState(null);

  useEffect(() => {
    if(connected != null && !connected) {
      const t = {
        name: null,
        category: null,
        longitude: null,
        latitude: null,
        questions: null,
        images: null,
        address: null,
      };
      setActiveStep(0)
      setCurrentTrees([t])
    }
    console.log(connected);
  }, [connected]);

  useEffect(() => {
    if (auth) {
      console.log(auth);
      setConnected(auth.connected);
    }
    if (auth.user) {
      console.log(auth.user);
      setUser(auth.user);
      console.log(auth.connected);
      setConnected(auth.connected);
    }
  }, [auth]);

  // useEffect(() => {
  //   console.log(auth)
  //   console.log(connected)
  // }, [connected])

  return (
    <>
      {!connected ? (
        <Button
          color="secondary"
          type="button"
          size="large"
          variant="contained"
          sx={{
            borderRadius: "5px",
          }}
          onClick={() => {
            auth.Login("google")
          }}
        >
          Sign In
        </Button>
      ) : (
        <Button
          color="secondary"
          type="button"
          size="large"
          variant="contained"
          sx={{
            borderRadius: "0 0 0 5px",
          }}
          onClick={() => {
            navigate("/profile");
          }}
        >
          My Account
        </Button>
      )}
    </>
  );
};

export default function StartTreePlantingRequest() {  
  let navigate = useRouter().push;
  const auth = useAuth();


  const handleSubmit = (event) => {
    event.preventDefault();

    // Force application state reset
    localStorage.setItem("appStep", 0);

    navigate("/plant");
  };

  return (
    <ThemeProvider theme={appTheme}>
      <Grid container sx={{ height: "100vh" }}>
        {/*  Left Column - Background Image */}

        <Grid
          item
          sm={false}
          md={4}
          sx={{
            backgroundImage:
              "url(http://intn.city/wp-content/uploads/2021/09/Intensity-cover.jpg)", //url("http://intn.city/wp-content/uploads/2021/09/Intensity-cover.jpg")
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/*  Right Column - Text Field */}

        <CssBaseline />
        <Grid item sm={12} md={8}>
          {auth.connected && (
            <Grid item align="right" color="transparent">
              <AuthButton />
            </Grid>
          )}
          <Box
            sx={{
              my: 8,
              mx: 6,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography component="h1" variant="h4" color="primary" pb={4}>
              Better Neighborhoods. Same Neighbors.
            </Typography>
            <Typography component="h2" variant="h6" color="secondary">
              {`We're trying to make planting trees more efficient through the
              power of community—starting in the City of Oakland. Tell us where
              you plan to put your tree let us and we will help make sure the
              location is right and you'll be sure you're making our
              neighborhoods greener and better.`}
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              display="flex"
              flexDirection="column"
              justifyContent="flex-start"
              alignItems="center"
              mt={10}
            >
              {auth.connected && (
                <Button
                  type="submit"
                  size="large"
                  variant="contained"
                  color="secondary"
                  sx={{ width: 200, mt: 2, mb: 2 }}
                >
                  Plant a Tree
                </Button>
              )}
              {!auth.connected && (
                <Grid item align="right" color="transparent">
                  <AuthButton />
                </Grid>
              )}
              {auth.app && (
                <Grid item align="right" color="transparent">
                  <AdminPanelButton auth={auth}/>
                </Grid>
              )}
            </Box>
          </Box>
          <Copyright />
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
