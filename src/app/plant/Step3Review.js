import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  List,
  ListItem,
  ListItemText,
  Grid,
  Stack,
  TextField,
  Typography,
  ListItemIcon
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAppContext } from "@/context/appContext";

import { useLocalStorage, getStorageValue } from "@/utilities/useLocalStorage";

// import StreetView from './StreetView';
import UppyUploadWidget from './ImageUploadUppy';

export default function Review({ prError }) {
  const { currentTrees, setCurrentTrees } = useAppContext()
  const [currentTreeName, setCurrentTreeName] = useState();
  const [selectedTree, setSelectedTree] = useState(0)

  useEffect(() => {
    setCurrentTrees(getStorageValue("currentTrees", []))
    let capitalize = (w) => {
      let n = w.split(" ")
      let name = "";
      for(let word of n) {
        if(word.length) {
          name = name + " " + word[0].toUpperCase() + word.substring(1)
        }
      }
      name = name.substring(1)
      return name
    }
    setCurrentTreeName(capitalize(currentTrees[selectedTree].name))
  }, [selectedTree])
  
  const handleChangeNotes = (event) => {
    const trees = [...currentTrees]
    trees[selectedTree].questions = event.target.value
    setCurrentTrees(trees)
  }

  const handleSelectTree = (index) => {
    setSelectedTree(index)
  }

  const treeSelectorStyle = {
    cursor: "pointer", 
    "&:hover": {
      backgroundColor: "whitesmoke"
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="error" sx={{color: "red"}}>
        { prError }
      </Typography>
      <Typography variant="h6" gutterBottom>
        Your application summary
      </Typography>
      <Card sx={{ px: 4, py: 2 }} color='info'>
        <List disablePadding key={selectedTree}>
          {currentTrees.map((tree, index) => {
            const plantingDetails = "Location: " + tree.address;
            // TODO: fix tree selector style & image uploading
            return (
              <ListItem key={tree.name + "_" + index} onClick={() => handleSelectTree(index)} sx={treeSelectorStyle}>
                <ListItemIcon>
                  { (selectedTree === index) && <CheckCircleIcon color="primary"/> }
                  { (tree?.images?.length > 0 && selectedTree !== index) && <CheckCircleIcon color="success"/> }
                </ListItemIcon>
                <ListItemText primary={tree.name} secondary={plantingDetails} primaryTypographyProps={{ fontSize: '18px', fontWeight: 'bold' }} />
              </ListItem>
            )  
        })}
        </List>
      </Card>
      <Typography variant="h6" gutterBottom>
        Please provide a photo of each planted tree.
      </Typography>
      <Box>
        <Grid container>
          <Grid item xs={12}>
            <UppyUploadWidget treeIndex={selectedTree} />
          </Grid>
      </Grid>
    </Box>
    <Typography variant="h6" gutterBottom>
        Questions & Notes
    </Typography>
    <TextField
        label={"Do you have any questions or notes about the " + currentTreeName + "?"}
        multiline
        rows={5}
        variant="standard"
        onChange={handleChangeNotes}
        value={currentTrees[selectedTree].questions || ""} />
    </Stack>
  );
}