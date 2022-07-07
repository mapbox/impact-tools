// given a bearing, pitch, altitude, and a position on the ground to look at,
// calculate the camera's position as lngLat
const computeCameraPositionByBearingAndPitch = (
  pitch,
  bearing,
  position,
  altitude
) => {
  var bearingInRadian = bearing / 57.29;
  var pitchInRadian = pitch / 57.29;

  var lngDiff =
    ((altitude / Math.tan(pitchInRadian)) *
      Math.sin(-bearingInRadian)) /
    (0.2 * 70000); // ~70km/degree longitude
  var latDiff =
    ((altitude / Math.tan(pitchInRadian)) *
      Math.cos(-bearingInRadian)) /
    (0.2 * 100000); // ~100km/degree latitude -1.57 = pi/2


  const longitudeCamera = parseFloat(position.lng);
  const latitudeCamera = parseFloat(position.lat);


  var correctedLng = longitudeCamera + lngDiff;
  var correctedLat = latitudeCamera - latDiff;

  return {
    lng: correctedLng,
    lat: correctedLat
  };
};

export { computeCameraPositionByBearingAndPitch };
