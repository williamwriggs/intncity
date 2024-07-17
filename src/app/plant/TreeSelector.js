import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Avatar,
  Backdrop,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";

import { useTreeList, useTreeListNew } from "./airtable";
import TreeIcon from "@/assets/tree.svg";

export default function PlantSelector({ onPlantSelectionChanged }) {
  const { plants: plants, fetchTreeList: fetchTreeList } = useTreeListNew();
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    async function onInitialize() {
      await fetchTreeList();
      setIsLoaded(true);
    }
    onInitialize();
  }, []);

  function handlePlantSelectionChange(event, value, reason) {
    console.log(plants)
    let selection = value;
    console.log(selection)
    // console.log("Product selection: " + JSON.stringify(selection[0]));

    onPlantSelectionChanged(selection);
  }

  const AddTreeButton = () => {
    const [currentTrees, setCurrentTrees] = useState([]);
  
    const newTree = {
      name: null,
      category: null,
      longitude: null,
      latitude: null,
      questions: null,
      images: null,
      address: null
    };
  
    const handleAddTree = () => {
      setCurrentTrees([...currentTrees, newTree]);
    };
  
    return (
      <>
        <Button
          color="secondary"
          type="button"
          size="large"
          variant="contained"
          sx={{
            borderRadius: "0 0 0 5px",
          }}
          onClick={handleAddTree}
        >
          +
        </Button>
      </>
    );
  };

  return (
    <Paper sx={{ padding: 4 }}>
      <Grid container spacing={2}>
        <Grid xs={12} item>
          <Typography variant="h6">Tree species</Typography>
          <AddTreeButton/>
        </Grid>
        {isLoaded ? (
          <React.Fragment>
            <Grid xs={12} item>
              <Autocomplete
                options={plants || ["tree"]}
                autoHighlight
                getOptionLabel={(option) => option.name}
                renderOption={(props, option) => (
                  <li {...props} key={option.name} value={option}>
                    {option.name}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    variant="outlined"
                    {...params}
                    inputProps={{
                      ...params.inputProps,
                    }}
                  />
                )}
                onChange={handlePlantSelectionChange}
              />
            </Grid>
          </React.Fragment>
        ) : (
          <Grid item xs={12}>
            <Backdrop
              sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
              open={!isLoaded}
            >
              <CircularProgress color="inherit" />
            </Backdrop>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}
