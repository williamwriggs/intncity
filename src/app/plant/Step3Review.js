import * as React from 'react';
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
} from '@mui/material';
import { useLocalStorage } from "@/utilities/useLocalStorage";

// import StreetView from './StreetView';
import UppyUploadWidget from './ImageUploadUppy';

export default function Review() {
  const [email] = useLocalStorage("email", "");
  const [tree] = useLocalStorage("tree");
  const [address] = useLocalStorage("address", "");
  const [notes, setNotes] = useLocalStorage("notes", "");

  const plantingDetails = "Location: " + address;
  
  const handleChangeNotes = (event) => {
    setNotes(event.target.value);
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h6" gutterBottom>
        Your application summary
      </Typography>
      <Card sx={{ px: 4, py: 2 }} color='info'>
        <List disablePadding>
          <ListItem key={tree.id}>
            <ListItemText primary={tree.name} secondary={plantingDetails} primaryTypographyProps={{ fontSize: '18px', fontWeight: 'bold' }} />
            <Typography variant="h5">1</Typography>
          </ListItem>
        </List>
      </Card>
      <Typography variant="h6" gutterBottom>
        Please provide a photo of where you plan to plant your tree.
      </Typography>
      <Box>
        <Grid container>
          <Grid item xs={12}>
            <UppyUploadWidget />
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