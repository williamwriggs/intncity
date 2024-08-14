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

import DeleteIcon from "@mui/icons-material/Delete"

import { useTreeListNew } from "./airtable";
import TreeIcon from "@/assets/tree.svg";
import { useAppContext } from "@/context/appContext";

export default function PlantSelector({ onPlantSelectionChanged }) {
  const { plants, fetchTreeList } = useTreeListNew();
  const [isLoaded, setIsLoaded] = useState(false);
  const {currentTrees, setCurrentTrees} = useAppContext();
  
  useEffect(() => {
    async function onInitialize() {
      await fetchTreeList();
      setIsLoaded(true);
    }
    onInitialize();
  }, []);

  const handlePlantSelectionChange = (event, newValue, index) => {
    console.log(index)
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
          borderRadius: "5px",
          display: "inline",
          marginLeft: "auto",
          width: "10px",
          textAlign: "center",
          padding: "5px"
        }}
        onClick={handleAddTree}
      >
        <Typography fontSize="medium" sx={{margin: "auto"}}>Add</Typography>
      </Button>
    );
  };

  const RemoveTreeButton = ({index}) => {

    const handleRemoveTree = () => {
      const updatedTrees = [...currentTrees]
      updatedTrees.splice(index, 1)
      setCurrentTrees(updatedTrees);
      onPlantSelectionChanged(updatedTrees);
    };

    console.log("CURRENT TREES", currentTrees);

    return (
      <Button
        color="primary"
        type="button"
        size="large"
        variant="contained"
        sx={{
          border: "none",
          marginLeft: "auto",
          marginTop: "auto",
          marginBottom: "auto",
          width: "30px",
          height: "40px",
          background: "none",
          color: "red",
          fontSize: "30px",
          "&:hover": {
            backgroundColor: "whitesmoke"
          }
        }}
        disableElevation={true}
        onClick={handleRemoveTree}
      >
        <DeleteIcon></DeleteIcon>
      </Button>
    );
  };

  const TreeDropdowns = () => {
    return (
      <React.Fragment>
        {currentTrees.map((tree, index) => (
          <div style={{display: "grid", gridTemplateColumns: "5fr 1fr", width: "100%", margin: "20px"}} key={index}>
            <Autocomplete
              value={tree.name ? tree : undefined}
              options={plants || [{ name: "No plants found" }]}
              autoHighlight
              getOptionLabel={(option) => {
                let n = option.name.split(" ")
                let name = "";
                for(let word of n) {
                  if(word.length) {
                    name = name + " " + word[0].toUpperCase() + word.substring(1)
                  }
                }
                name = name.substring(1)
                return name
              }
            }
              renderOption={(props, option) => (
                <li {...props} key={option.name} value={option} style={{textTransform: "capitalize"}}>
                  {option.name}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  variant="outlined"
                  label="Choose Plant"
                  {...params}
                  inputProps={{
                    ...params.inputProps,
                  }}
                />
              )}
              onChange={(event, newValue) => handlePlantSelectionChange(event, newValue, index)}
            />
            <RemoveTreeButton index={index} />
          </div>
        ))}
      </React.Fragment>
    );
  };

  return (
    <Paper sx={{ padding: 4 }}>
      <Grid container spacing={2}>
        <Grid xs={12} item>
          <div style={{display: "grid", gridTemplateColumns: "4fr 1.5fr", marginBottom: "10px"}}>
            <Typography variant="h6" sx={{display: "inline"}}>Tree Species</Typography>
            <div style={{textAlign: "right", marginRight: "20px"}}>
              <AddTreeButton />
            </div>
          </div>
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
