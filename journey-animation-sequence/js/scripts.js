import loadEncoder from 'https://unpkg.com/mp4-h264@1.0.7/build/mp4-encoder.js';
//import { simd } from "https://unpkg.com/wasm-feature-detect?module";

// Used this per the UMD version described in https://www.npmjs.com/package/wasm-feature-detect
// The above method consistently returned 404 
import "https://unpkg.com/wasm-feature-detect/dist/umd/index.js"


import flyInAndRotate from "./fly-in-and-rotate.js";
import animatePath from "./animate-path.js";
import keys from "./key.js"


import { createGeoJSONCircle } from './util.js'

const urlSearchParams = new URLSearchParams(window.location.search);
//const { gender, stage, square: squareQueryParam, prod: prodQueryParam } = Object.fromEntries(urlSearchParams.entries());
const { gender, stage, square: False, prod: True } = Object.fromEntries(urlSearchParams.entries());

/*const prod = prodQueryParam === 'true'
const square = squareQueryParam === 'true'*/

const prod = true
const square = false

const file_name = "2023_Thru_Permitted"

if (square) {
  document.getElementById("map").style.height = '1080px';
  document.getElementById("map").style.width = '1080px';
}

mapboxgl.accessToken = keys.mapboxKey

const map = new mapboxgl.Map({
  container: "map",
  projection: "globe",
  style: "mapbox://styles/danielquiz1/clof94h55002i01rf3d16aes7",
  zoom: 1.9466794621990684,
  center: { lng: 12.563530000000014, lat: 58.27372323078674 },
  pitch: 70,
  bearing: 0,
});

window.map = map

map.on("load", async () => {
  // add 3d, sky and fog
  add3D();

  // don't forget to enable WebAssembly SIMD in chrome://flags for faster encoding
  const supportsSIMD = await wasmFeatureDetect.simd();

  // initialize H264 video encoder
  const Encoder = await loadEncoder({ simd: supportsSIMD });

  const gl = map.painter.context.gl;
  const width = gl.drawingBufferWidth;
  const height = gl.drawingBufferHeight;

  const encoder = Encoder.create({
    width,
    height,
    fps: 30,
    kbps: 64000,
    rgbFlipY: true
  });

  // stub performance.now for deterministic rendering per-frame (only available in dev build)
  let now = performance.now();
  mapboxgl.setNow(now);

  const ptr = encoder.getRGBPointer(); // keep a pointer to encoder WebAssembly heap memory

  function frame() {
    // increment stub time by 16.6ms (60 fps)
    now += 1000 / 60;
    mapboxgl.setNow(now);

    const pixels = encoder.memory().subarray(ptr); // get a view into encoder memory
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels); // read pixels into encoder
    encoder.encodeRGBPointer(); // encode the frame
  }

  map.on('render', frame); // set up frame-by-frame recording

  // fetch the geojson for the linestring to be animated
  //const trackGeojson = await fetch(`./data/${gender}-stage-${stage}.geojson`).then((d) =>
  //const trackGeojson = await fetch(`./data/male-stage-1.geojson`).then((d) =>
  const trackGeojson = await fetch(`./data/${file_name}.geojson`).then((d) =>
    d.json()
  );
  // kick off the animations
  await playAnimations(trackGeojson);
  // stop recording
  map.off('render', frame);
  mapboxgl.restoreNow();

  if (prod) {
    // download the encoded video file
    const mp4 = encoder.end();
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(new Blob([mp4], { type: "video/mp4" }));
    anchor.download = file_name;
    anchor.click();

    // make sure to run `ffmpeg -i mapbox-gl.mp4 mapbox-gl-optimized.mp4` to compress the video
  }

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
  // Changed to dem1 from dem. Something about id already taken
  map.addSource("mapbox-dem1", {
    type: "raster-dem",
    url: "mapbox://mapbox.terrain-rgb",
    tileSize: 512,
    maxzoom: 14,
  });
  map.setTerrain({ source: "mapbox-dem1", exaggeration: 1.5 });
};

const playAnimations = async (trackGeojson) => {
  return new Promise(async (resolve) => {
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
      duration: prod ? 7000 : 5000,
      startAltitude: 3000000,
      endAltitude: 12000,
      startBearing: 0,
      endBearing: -20,
      startPitch: 40,
      endPitch: 50,
      prod
    });

    // follow the path while slowly rotating the camera, passing in the camera bearing and altitude from the previous animation
    await animatePath({
      map,
      duration: prod ? 60000 : 20000,
      path: trackGeojson,
      startBearing: bearing,
      startAltitude: altitude,
      pitch: 50,
      prod
    });

    // get the bounds of the linestring, use fitBounds() to animate to a final view
    const bounds = turf.bbox(trackGeojson);
    map.fitBounds(bounds, {
      duration: 3000,
      pitch: 30,
      bearing: 0,
      padding: 120,
    });

    setTimeout(() => {
      resolve()
    }, 10000)
  })
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
    id: "line-layer",
    type: "line",
    source: "line",
    paint: {
      "line-color": "rgba(0,0,0,0)",
      "line-width": 9,
      "line-opacity": 0.8,
    },
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
  });

  /*map.addSource("start-pin-base", {
    type: "geojson",
    data: createGeoJSONCircle(trackGeojson.geometry.coordinates[0], 0.04)
  });

  map.addSource("start-pin-top", {
    type: "geojson",
    data: createGeoJSONCircle(trackGeojson.geometry.coordinates[0], 0.25)
  });

  map.addSource("end-pin-base", {
    type: "geojson",
    data: createGeoJSONCircle(trackGeojson.geometry.coordinates.slice(-1)[0], 0.04)
  });

  map.addSource("end-pin-top", {
    type: "geojson",
    data: createGeoJSONCircle(trackGeojson.geometry.coordinates.slice(-1)[0], 0.25)
  });

  map.addLayer({
    id: "start-fill-pin-base",
    type: "fill-extrusion",
    source: "start-pin-base",
    paint: {
      'fill-extrusion-color': '#0bfc03',
      'fill-extrusion-height': 1000
    }
  });
  map.addLayer({
    id: "start-fill-pin-top",
    type: "fill-extrusion",
    source: "start-pin-top",
    paint: {
      'fill-extrusion-color': '#0bfc03',
      'fill-extrusion-base': 1000,
      'fill-extrusion-height': 1200
    }
  });

  map.addLayer({
    id: "end-fill-pin-base",
    type: "fill-extrusion",
    source: "end-pin-base",
    paint: {
      'fill-extrusion-color': '#eb1c1c',
      'fill-extrusion-height': 1000
    }
  });
  map.addLayer({
    id: "end-fill-pin-top",
    type: "fill-extrusion",
    source: "end-pin-top",
    paint: {
      'fill-extrusion-color': '#eb1c1c',
      'fill-extrusion-base': 1000,
      'fill-extrusion-height': 1200
    }
  });
*/

};
