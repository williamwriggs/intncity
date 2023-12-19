import * as React from 'react';
import  {
  Avatar,
  AppBar,
  Grid,
  Link,
  Stack,
  Typography,
  Hidden,
} from '@mui/material';

import PlantingAvatar from '../assets/planting.jpeg';
import { useNavigate } from 'react-router-dom';
import { ForestOutlined } from '@mui/icons-material';

function TopbarContent() {
  let navigate = useNavigate();

  return (
    <AppBar 
      position="fixed" 
      color={"primary"} 
      sx={{ p:1, zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
        <Grid container alignItems="center" spacing={1}>
          <Grid item xs={9}>
            <Stack direction="row" alignItems="center">
              <Link href="/">
                {/* <Avatar variant="square" src="https://intn.city/wp-content/uploads/2022/05/intncityfav2.png" sx={{ width: 40, height: 40, mr: 2 }}/> */}
                <Avatar src={PlantingAvatar} sx={{ width: 40, height: 40, mr: 2 }}/>
              </Link>              
              <Typography color="inherit" noWrap>
                Planting Location Request
              </Typography>
            </Stack>
          </Grid>
          {/* <Hidden xsDown>
            <Grid item xs={3}>
              <Stack direction="row" alignItems="right" sx={{ mr: 1 }}>
                <ForestOutlined sx={{ ml: 2, mr: 2 }}/>
                <Typography sx={{display: { xs: "none", sm: "block" }}}>
                  app.intn.city
                </Typography>
              </Stack>   
            </Grid>
          </Hidden> */}
        </Grid>        
    </AppBar>
  );
}

export default function Topbar() {
  return <TopbarContent />;
}
