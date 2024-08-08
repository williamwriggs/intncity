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

export default function Review() {
  const [notes, setNotes] = useLocalStorage("notes", "");
  const { currentTrees, setCurrentTrees} = useAppContext()
  const [selectedTree, setSelectedTree] = useState(0)

  useEffect(() => {
    setCurrentTrees(getStorageValue("currentTrees", []))
  }, [selectedTree])
  
  const handleChangeNotes = (event) => {
    setNotes(event.target.value);
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
      <Typography variant="h6" gutterBottom>
        Your application summary
      </Typography>
      <Card sx={{ px: 4, py: 2 }} color='info'>
        <List disablePadding key={selectedTree}>
          {currentTrees.map((tree, index) => {
            const plantingDetails = "Location: " + tree.address;
            console.log("length check " + index, tree?.images?.length > 0)
            console.log(tree)
            console.log("selected check " + index, selectedTree !== index)
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
        Questions
    </Typography>
    <TextField
        label="Do you have any questions or is there anything else you want to relay?"
        multiline
        rows={5}
        variant="standard"
        onChange={handleChangeNotes}
        value={notes} />
    </Stack>
  );
}