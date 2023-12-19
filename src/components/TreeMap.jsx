import React, {useRef, useState} from "react";
import  {
  Input,
  Typography,
  Stack,
} from '@mui/material';
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  Autocomplete,
  InfoWindow
} from '@react-google-maps/api';
import { useLocalStorage } from "./utilities/useLocalStorage";

const mapContainerStyle = {
  height: "450px",
  width: "100%"
};

const mapOptions = {
  streetViewControl: false,
  zoomControl: true,
  fullscreenControl: false,
  // mapTypeControl: false,
  mapTypeId: "satellite",
  styles: [
    {
      "featureType": "administrative",
      "elementType": "geometry",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "transit",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    }
  ],
}

export default function TreeMap(props) {  
  const [Libraries] = useState(['places']);
  const [mapInstance, setMapInstance] = useState();
  const [mapMarker, setMapMarker] = React.useState(props.currentLocation);
  const [addressAutocomplete, setAddressAutocomplete] = useState();
  const [currentAddress, setCurrentAddress] = React.useState(props.currentAddress);

  // Initialize Google map instance
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyByT6Sov6C1_WUCU0HtUiYrEuuaDxL5VFs",
    libraries: Libraries
  });

  const onMapLoad = React.useCallback(
    function onLoad (mapInstance) {
      setMapInstance(mapInstance);
      console.log("Map script loaded");
    }
  )

  const onAutocompleteLoad = (autocomplete) => {
    setAddressAutocomplete(autocomplete);
  }

  const onPlaceChanged = () => {
    if (addressAutocomplete) {
      const place = addressAutocomplete.getPlace();
      if (place.formatted_address) {
        setCurrentAddress(place.formatted_address);
      }
      const loc = place.geometry.location;
  
      if (mapInstance) {
        console.log("New map marker on: " + JSON.stringify(loc));
        setMapMarker(loc);
        mapInstance.panTo(loc);
        mapInstance.setZoom(19);
      }      

      if (props.handleLocationChanged) {
        props.handleLocationChanged(place.formatted_address, loc);
      }
    }
  };

  const onMarkerLoad = (marker) => {
    console.log("Marker Position: ", JSON.stringify(marker.position));
  };

  return (
    <Stack spacing={4}>
      <Typography variant="h6" gutterBottom>Planned location</Typography>
      {isLoaded ? (
        <React.Fragment>
          <Autocomplete 
            onLoad={onAutocompleteLoad}
            onPlaceChanged={onPlaceChanged} 
          >
            <Input type='text' placeholder='Planting location address' fullWidth></Input>
          </Autocomplete>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            options={mapOptions}
            zoom={13}
            center={mapMarker}
            onLoad={onMapLoad}
          >
            <MarkerF
              key={'marker1'}
              onLoad={onMarkerLoad} 
              // onClick={() => onClickMarker(office.id)}
              position={mapMarker}
              draggable={true}
              clickable={true}
              title={"Designated planting location, drag the marker to reposition"}
            />
          </GoogleMap>
        </React.Fragment>
      ) : null}      
    </Stack>
  );
}