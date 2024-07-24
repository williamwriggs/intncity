import React, {useRef, useState, useEffect} from "react";
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
import { useLocalStorage } from "@/utilities/useLocalStorage";
import { useAppContext } from "@/context/appContext";

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
  const [addressAutocompletes, setAddressAutocompletes] = useState([]);
  const [currentAddress, setCurrentAddress] = React.useState(props.currentAddress);
  const { currentTrees, setCurrentTrees} = useAppContext()
  const [mapMarkers, setMapMarkers] = useState([])
  let auto = []

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

  const onAutocompleteLoad = (index, autocomplete) => {
    autocomplete.setFields()
    auto.push(autocomplete)
    setAddressAutocompletes(auto)
  }

  const setTreeAddress = (index, address, loc) => {
    const newTrees = [...currentTrees]
    newTrees[index].address = address;
    newTrees[index].loc = loc || undefined
    newTrees[index].latitude = loc.lat()
    newTrees[index].longitude = loc.lng()
    console.log(loc)
    setCurrentTrees(newTrees)
  }

  useEffect(() => {
    const locs = currentTrees.map((tree) => {
      return tree?.loc || null
    })
    console.log(locs)
    setMapMarkers(locs)
  }, [currentTrees])

  const onPlaceChanged = (index) => {
    if (addressAutocompletes[index]) {
      const place = addressAutocompletes[index].getPlace();
      console.log(place)
      const loc = place?.geometry?.location
      if(mapInstance) {
        mapInstance.panTo(loc);
        mapInstance.setZoom(15);
      }
      if (place.formatted_address) {
        setTreeAddress(index, place.formatted_address, loc)
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
          {currentTrees.map((value, index) => {
          if(value.name) {
              return (
                <div style={{display: "grid", gridTemplateColumns: "1fr 25fr"}} key={index}>
                  <div style={{margin: "auto"}}>
                    {(index + 1) + "."} 
                  </div>
                  <Autocomplete 
                    default={value.address}
                    sx={{display:"inline", width:"70%"}}
                    onLoad={(autocomplete) => onAutocompleteLoad(index, autocomplete)}
                    onPlaceChanged={() => onPlaceChanged(index)} 
                  >
                    <Input type='text' defaultValue={value.address? value.address : undefined} placeholder={value.name + ' planting location address'} fullWidth></Input>
                  </Autocomplete>
                </div>
              )
            }
          })}
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            options={mapOptions}
            zoom={10}
            center={mapMarkers[0] || {lat: 37.8043514, lng: -122.2711639}}
            onLoad={onMapLoad}
          >
            {mapMarkers.map((marker, index, markers) => {
              return (
                <>
                  <MarkerF
                  label={"" + (index + 1)}
                  key={'marker' + index}
                  onLoad={onMarkerLoad} 
                  // onClick={() => onClickMarker(office.id)}
                  position={marker}
                  draggable={false}
                  clickable={false}
                  title={"Designated planting location, drag the marker to reposition"}
                  />
                </>
              )
            })}

          </GoogleMap>
        </React.Fragment>
      ) : null}      
    </Stack>
  );
}