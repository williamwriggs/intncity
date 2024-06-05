import * as React from 'react';
import TreeMap from './TreeMap';


export default function LocationForm(props) {
  return (
    <React.Fragment>
      <TreeMap  
        currentLocation={props.currentLocation}
        currentAddress={props.currentAddress}
        handleLocationChanged={props.handleLocationChanged} />
    </React.Fragment>
  );
}