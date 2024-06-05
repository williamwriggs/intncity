import { createTheme } from '@mui/material/styles'

export const appTheme = createTheme(
   {
      "palette":{
         primary: {
            main: '#004d40',
         },     
         secondary: {
            main: '#33691e',
         },
      },
      "shape": {
         borderRadius: 4
      }      
   }
);

export default appTheme;