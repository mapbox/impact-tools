import flyInAndRotate from "./fly-in-and-rotate.js";
import animatePath from "./animate-path.js";

mapboxgl.accessToken =
  "pk.eyJ1IjoiY2hyaXN3aG9uZ21hcGJveCIsImEiOiJjbDR5OTNyY2cxZGg1M2luejcxZmJpaG1yIn0.mUZ2xk8CLeBFotkPvPJHGg";

const map = new mapboxgl.Map({
  container: "map",
  projection: "globe",
  style: "mapbox://styles/chriswhongmapbox/cl52liisu000315mjaubhr972",
  zoom: 1.9466794621990684,
  center: { lng: 12.563530000000014, lat: 58.27372323078674 },
  pitch: 70,
  bearing: 0,
});

map.on("load", async () => {
  // add 3d, sky and fog
  add3D();

  // fetch the geojson for the linestring to be animated
  const trackGeojson = await fetch("./data/male-stage-1.geojson").then((d) =>
    d.json()
  );
  // kick off the animations
  playAnimations(trackGeojson);
});

const add3D = () => {
  // add map 3d terrain and sky layer and fog
  // Add some fog in the background
  map.setFog({
    range: [0.5, 10],
    color: "white",
    "horizon-blend": 0.2,
  });

  // Add a sky layer over the horizon
  map.addLayer({
    id: "sky",
    type: "sky",
    paint: {
      "sky-type": "atmosphere",
      "sky-atmosphere-color": "rgba(85, 151, 210, 0.5)",
    },
  });

  // Add terrain source, with slight exaggeration
  map.addSource("mapbox-dem", {
    type: "raster-dem",
    url: "mapbox://mapbox.terrain-rgb",
    tileSize: 512,
    maxzoom: 14,
  });
  map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
};

const playAnimations = async (trackGeojson) => {
  // add a geojson source and layer for the linestring to the map
  addPathSourceAndLayer(trackGeojson);

  // get the start of the linestring, to be used for animating a zoom-in from high altitude
  var targetLngLat = {
    lng: trackGeojson.geometry.coordinates[0][0],
    lat: trackGeojson.geometry.coordinates[0][1],
  };

  // animate zooming in to the start point, get the final bearing and altitude for use in the next animation
  const { bearing, altitude } = await flyInAndRotate({
    map,
    targetLngLat,
    duration: 5000,
    startAltitude: 2000000,
    endAltitude: 3000,
    startBearing: 0,
    endBearing: 90,
  });

  // follow the path while slowly rotating the camera, passing in the camera bearing and altitude from the previous animation
  await animatePath({
    map,
    duration: 10000,
    path: trackGeojson,
    startBearing: bearing,
    startAltitude: altitude,
  });

  // get the bounds of the linestring, use fitBounds() to animate to a final view
  const bounds = turf.bbox(trackGeojson);
  map.fitBounds(bounds, {
    duration: 2000,
  });
};

const addPathSourceAndLayer = (trackGeojson) => {
  // Add a line feature and layer. This feature will get updated as we progress the animation
  map.addSource("line", {
    type: "geojson",
    // Line metrics is required to use the 'line-progress' property
    lineMetrics: true,
    data: trackGeojson,
  });
  map.addLayer({
    type: "line",
    source: "line",
    id: "line",
    paint: {
      "line-color": "rgba(0,0,0,0)",
      "line-width": 5,
      "line-opacity": 0.9,
    },
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
  });
};
