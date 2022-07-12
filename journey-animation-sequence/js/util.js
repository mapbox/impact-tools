// given a bearing, pitch, altitude, and a position on the ground to look at,
// calculate the camera's position as lngLat
let previousPosition

// amazingly simple, via https://codepen.io/ma77os/pen/OJPVrP
function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end
}

const computeCameraPositionByBearingAndPitch = (
  pitch,
  bearing,
  position,
  altitude,
  smooth = false
) => {
  var bearingInRadian = bearing / 57.29;
  var pitchInRadian = (90 - pitch) / 57.29;

  var lngDiff =
    ((altitude / Math.tan(pitchInRadian)) *
      Math.sin(-bearingInRadian)) /
    70000; // ~70km/degree longitude
  var latDiff =
    ((altitude / Math.tan(pitchInRadian)) *
      Math.cos(-bearingInRadian)) /
    110000 // 110km/degree latitude

  const longitudeCamera = parseFloat(position.lng);
  const latitudeCamera = parseFloat(position.lat);

  var correctedLng = longitudeCamera + lngDiff;
  var correctedLat = latitudeCamera - latDiff;


  const nextPosition = {
    lng: correctedLng,
    lat: correctedLat
  };

  if (smooth) {
    if (previousPosition) {
      const SMOOTH_FACTOR = 0.96
      nextPosition.lng = lerp(nextPosition.lng, previousPosition.lng, SMOOTH_FACTOR);
      nextPosition.lat = lerp(nextPosition.lat, previousPosition.lat, SMOOTH_FACTOR);
    }
  }

  previousPosition = nextPosition

  return nextPosition
};

const createGeoJSONCircle = (center, radiusInKm, points = 64) => {
  const coords = {
    latitude: center[1],
    longitude: center[0],
  };
  const km = radiusInKm;
  const ret = [];
  const distanceX = km / (111.320 * Math.cos((coords.latitude * Math.PI) / 180));
  const distanceY = km / 110.574;
  let theta;
  let x;
  let y;
  for (let i = 0; i < points; i += 1) {
    theta = (i / points) * (2 * Math.PI);
    x = distanceX * Math.cos(theta);
    y = distanceY * Math.sin(theta);
    ret.push([coords.longitude + x, coords.latitude + y]);
  }
  ret.push(ret[0]);
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [ret],
    }
  };
}

export { computeCameraPositionByBearingAndPitch, createGeoJSONCircle };
