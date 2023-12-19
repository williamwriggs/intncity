import React, { useEffect } from "react";
import { useLocalStorage } from "./utilities/useLocalStorage";
import {
  Box,
  Fab,
  ImageList,
  ImageListItem,
  Grid,
} from '@mui/material';
import CameraIcon from '@mui/icons-material/CameraEnhance';

export default function CloudinaryUploadWidget() {
  const [images, setImages] = useLocalStorage("images");

  useEffect(() => {
    var myWidget = window.cloudinary.createUploadWidget(
      {
        cloudName: "dtppbtuut",
        uploadPreset: "zqtshoie",
        sources: ["local", "url", "camera", "unsplash"],
        maxFiles: 3
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          let attachments = [
            {
              url: result.info.secure_url,
            },
          ];

          if (images && images != "undefined") {
            attachments = [].concat(attachments, images);
          }

          console.log("Image attachments: ", JSON.stringify(attachments));
          setImages(attachments);
        }
      }
    );
  
    document.getElementById("upload_widget").addEventListener(
      "click",
      function () {
        myWidget.open();
      },
      false
    );
  });
  
  return (
    <React.Fragment>
      <Box m={1} display="flex" justifyContent="center" alignItems="center">
        <Fab id="upload_widget" variant="extended" color="info" aria-label="upload image" sx={{width: 340}}>
          <CameraIcon sx={{ mr: 2 }} />
          Upload Image | Take Photo
        </Fab>        
      </Box>
      {images &&
        <Grid item xs={12}>
          <ImageList cols={3} rowHeight={250}>
            {images.map((item) => (
              <ImageListItem key={item.url}>
                <img
                  src={`${item.url}?w=164&h=164&fit=crop&auto=format`}
                  srcSet={`${item.url}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                  loading="lazy"
                />
              </ImageListItem>
            ))}
          </ImageList>
        </Grid>
      }    
    </React.Fragment>
  );
}