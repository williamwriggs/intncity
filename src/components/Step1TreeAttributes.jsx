import * as React from 'react';
import {
  Box,
  Card,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import TreeSelector from './TreeSelector';
import { useLocalStorage } from "./utilities/useLocalStorage";

export default function TreeAttributesForm(props) {
  const onCb1Changed = (event) => {
    if (props.handleAttributesChanged) {
      props.handleAttributesChanged("complyAppropriateSpecies", event.target.checked);
    }
  };

  const onCb2Changed = (event) => {
    if (props.handleAttributesChanged) {
      props.handleAttributesChanged("complyMinContainerSize", event.target.checked);
    }    
  };

  const onCb3Changed = (event) => {
    if (props.handleAttributesChanged) {
      props.handleAttributesChanged("complyWithStandard", event.target.checked);
    }    
  };

  function onPlantSelectionChanged(plant) {
    if (props.handleAttributesChanged) {
      props.handleAttributesChanged("tree", plant);
    }    
  }

  return (
    <React.Fragment>
      <Stack spacing={4}>
        <TreeSelector onPlantSelectionChanged={onPlantSelectionChanged}/>
        <Card sx={{p: 4}} color='info'>
          <FormGroup>
            <FormControlLabel control={<Checkbox checked={props.complyAppropriateSpecies} onChange={onCb1Changed}/>} label="The species must be appropriate for the planting site location (consider water needs, size at maturity, and maintenance needs when making your decision)" />
            <Divider sx={{my:3}}/>
            <FormControlLabel control={<Checkbox checked={props.complyMinContainerSize} onChange={onCb2Changed} />} label="Minimum container size for all new trees is 15 gallons" />
            <Divider sx={{my:3}}/>
            <FormControlLabel control={<Checkbox checked={props.complyWithStandard} onChange={onCb3Changed} />} label="Every tree planted must comply with the American Standard for Nursery Stock (ANSI Z160.1)" />
          </FormGroup>         
        </Card>
      </Stack>
    </React.Fragment>
  );
}