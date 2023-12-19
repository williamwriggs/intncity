import React, { Component } from "react";
import ReactStreetview from "react-streetview";

class StreetView extends React.Component {
  render() {
    const googleMapsApiKey = "AIzaSyByT6Sov6C1_WUCU0HtUiYrEuuaDxL5VFs";

    const streetViewPanoramaOptions = {
      position: { lat: 37.807, lng: -122.2848728602752 },
      pov: { heading: 100, pitch: 0 },
      zoom: 1,
      addressControl: false,
      showRoadLabels: false,
      zoomControl: false
    };

    return (
      <div
        style={{
          width: "100%",
          height: "450px",
          backgroundColor: "#eeeeee"
        }}
      >
        <ReactStreetview
          apiKey={googleMapsApiKey}
          streetViewPanoramaOptions={streetViewPanoramaOptions}
        />
      </div>
    );
  }
}

export default StreetView;