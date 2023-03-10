import { useEffect, useState, RefObject, Dispatch, SetStateAction, useRef } from 'react';
import Map, { ViewState, ViewStateChangeEvent, MapLayerMouseEvent, Source, Layer, MapRef, PointLike, MapboxGeoJSONFeature, MapProvider } from 'react-map-gl'  
import { FeatureCollection } from 'geojson';

import { myKey } from './private/key'
import {overlayData, geoLayer, fetchRedLineData} from './overlays' 
import mapboxgl from 'mapbox-gl';

/**
 * Creates the mapBox and users the overlays class to layer the redlining overlay data
 */

const initLon: number =  -74.0060;//-71.4128;
const initLat: number =40.7128;//41.8240; 
const initZoom: number = 10;


/**
 * interface to get city,state, and name of location -- used for S_DIST
 */

interface AreaInformation {
  city: string,
  state: string, 
  name: string
}

/**
 * Function setting the city, state, and name of location when the user clicks on 
 * a specific spot on the map
 * @param e  -- mouse event
 * @param mapRef -- reference property of map
 * @param setAreaData -- sets the area data of current location if valid data
 */

const onClickFunc = (e: MapLayerMouseEvent, mapRef: RefObject<MapRef>, setAreaData: Dispatch<SetStateAction<AreaInformation>> ): void => {
  const bbox: [PointLike, PointLike] = [
    [e.point.x, e.point.y],
    [e.point.x, e.point.y]
  ]
  
  const choosenFeatures = mapRef.current?.queryRenderedFeatures(bbox, {
    layers: ["geo_data"],
  });

  
  if (choosenFeatures !== undefined){
    const feature: MapboxGeoJSONFeature | undefined = choosenFeatures[0]; // bbox
    if (feature !== undefined){
    //  const featureProperties: any = feature.properties;
    console.log("before if" );
    //necessary in case the location doesn't have a name
   // const locationName: string = Object.hasOwn(featureProperties, 'name') ? feature.properties?.name : "No data";
    const locationName: string = feature.properties?.name !== undefined ? feature.properties?.name : "No data"
    console.log("name: " + feature.properties?.name)
    console.log("city is " + feature.properties?.city );//+ feature.properties?.city);
    setAreaData({
      city: feature.properties?.city,
      state: feature.properties?.state,
      name: locationName,
    })
    } else{
      setAreaData({
        city: "No data",
        state: "No data",
        name: "No data"
      })
    }
    
  }
}

/**
 * Sets the overlay on the map and creates positioning of map
 * @returns -- map set up amnd display of current city, state, and name
 */

export default function MapBox() {
  // Attributes of Mapbox
  const [viewState, setViewState] = useState<ViewState>({
    longitude: initLon,
    latitude: initLat,
    zoom: initZoom,
    bearing: 0,
    pitch: 0,
    padding: {top: 1, bottom: 20, left: 1, right: 1}
  });  

  const mapRef: React.RefObject<MapRef> = useRef<MapRef>(null);
  const [overlay, setOverlay] = useState<GeoJSON.FeatureCollection | undefined>(undefined)

  const [areaData, setAreaData] = useState({
    city: "No selection",
    state: "No selection", 
    name: "No selection"
  })

  const locationLabel: string = `City: ${areaData.city}, State: ${areaData.state}, Name: ${areaData.name}`;
  const currentMapPosition: string = `Current latitude: ${viewState.latitude.toFixed(4)} | Current longitude: ${viewState.longitude.toFixed(4)} | Current zoom: ${viewState.zoom.toFixed(4)}`;

    // Run this _once_, and never refresh (empty dependency list)
    useEffect(() => {
      setOverlay(overlayData)
    }, [])

  return (
    <div className="mapbox">

      <Map 
        ref= {mapRef}
        mapboxAccessToken={myKey}
        latitude={viewState.latitude}
        longitude={viewState.longitude}
        zoom={viewState.zoom}
        pitch={viewState.pitch}
        bearing={viewState.bearing}
        padding={viewState.padding}
        onMove={(ev: ViewStateChangeEvent) => setViewState(ev.viewState)} 
        onClick={(ev: MapLayerMouseEvent) => {
          console.log(mapRef.current);
          onClickFunc(ev, mapRef, setAreaData)}} //console.log(ev)}
        style={{width:window.innerWidth, height:window.innerHeight*0.9}} 
        mapStyle={'mapbox://styles/mapbox/outdoors-v11'}>
          <Source id="geo_data" type="geojson" data={overlay}>
                    <Layer {...geoLayer} />
                  </Source>
      </Map>       
          <p aria-label = {locationLabel} aria-roledescription = "Location data">
            City: {areaData.city}, State: {areaData.state}, Name:  {areaData.name}
          </p>
          <p aria-label={currentMapPosition} aria-roledescription = "These are the given latitude, longitude, and zoom">
            Current latitude: {viewState.latitude.toFixed(4)} | Current longitude: {viewState.longitude.toFixed(4)} | Current zoom: {viewState.zoom.toFixed(4)}
          </p>
    </div>
    
  );
}

export{MapBox}
