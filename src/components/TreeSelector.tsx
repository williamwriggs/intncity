import React, {useEffect, useState} from 'react';
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
} from '@mui/material';

import { useTreeList } from '../api/airtable';
import TreeIcon from '../assets/tree.svg';

export interface IPlantSelector {
    onPlantSelectionChanged: (plant: any) => void,
}

export default function PlantSelector({onPlantSelectionChanged: onPlantSelectionChanged}:IPlantSelector) {
    const { plants: plants, fetchTreeList: fetchTreeList } = useTreeList();
    const [ isLoaded, setIsLoaded ] = useState<boolean>(false);

    useEffect(() => {
       async function onInitialize () {
           await fetchTreeList();
           setIsLoaded(true);
        }
        onInitialize();
    }, []);
    
    function handlePlantSelectionChange(event:any, value:any, reason:any) {
        let selection = value;
        // let selections =  plants.filter(p => p.sku == value);
        // console.log("Product selection: " + JSON.stringify(selection[0]));

        onPlantSelectionChanged(selection);
    }

    return (
      <Paper sx={{ padding: 4 }}>
        <Grid container spacing={2}>
          <Grid xs={12} item>
            <Typography variant="h6">
              Tree species
            </Typography>
          </Grid>
        {isLoaded ? (
          <React.Fragment>
            <Grid xs={12} item>
              <Autocomplete
                  options={plants||[]}
                  autoHighlight
                  getOptionLabel={(option:any) => option.name}
                  renderOption={(props, option:any) => (
                      <li {...props} key={option.id} >
                          <Avatar variant="rounded" src={option.image ? option.image : TreeIcon} sx={{m: 1, width: 32, height: 32}}/>
                          {option.name}
                      </li>
                  )}
                  renderInput={(params) => (
                      <TextField
                          variant='outlined'
                          {...params}
                          inputProps={{
                              ...params.inputProps,
                          }}
                      />
                  )}
                  onChange={handlePlantSelectionChange}
              />
            </Grid>
          </React.Fragment>) : (
            <Grid item xs={12}>
              <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={!isLoaded}
              >
                <CircularProgress color="inherit" />
              </Backdrop>
            </Grid>
          )}
        </Grid>
      </Paper>
    )
}