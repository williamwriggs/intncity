import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Avatar,
  Backdrop,
  Button,
  CircularProgress,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import { useTreeListNew } from "./airtable";
import TreeIcon from "@/assets/tree.svg";

export default function PlantSelector({ onPlantSelectionChanged }) {
  const { plants, fetchTreeList } = useTreeListNew();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTrees, setCurrentTrees] = useState([]);
  
  useEffect(() => {
    async function onInitialize() {
      await fetchTreeList();
      setIsLoaded(true);
    }
    onInitialize();
  }, []);

  const handlePlantSelectionChange = (event, newValue, index) => {
    const updatedTrees = [...currentTrees];
    updatedTrees[index] = { ...updatedTrees[index], name: newValue.name, category: newValue.category };
    setCurrentTrees(updatedTrees);
    onPlantSelectionChanged(updatedTrees);
  };

  const AddTreeButton = () => {
    const newTree = {
      name: null,
      category: null,
      longitude: null,
      latitude: null,
      questions: null,
      images: null,
      address: null,
    };

    const handleAddTree = () => {
      setCurrentTrees([...currentTrees, newTree]);
    };

    console.log("CURRENT TREES", currentTrees);

    return (
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
    );
  };

  const TreeDropdowns = () => {
    return (
      <React.Fragment>
        {currentTrees.map((tree, index) => (
          <Grid xs={12} item key={index}>
            <Autocomplete
              options={plants || [{ name: "tree" }]}
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
              onChange={(event, newValue) => handlePlantSelectionChange(event, newValue, index)}
            />
          </Grid>
        ))}
      </React.Fragment>
    );
  };

  return (
    <Paper sx={{ padding: 4 }}>
      <Grid container spacing={2}>
        <Grid xs={12} item>
          <Typography variant="h6">Tree species</Typography>
          <AddTreeButton />
        </Grid>
        {isLoaded ? (
          <TreeDropdowns />
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
