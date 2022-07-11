import { computeCameraPositionByBearingAndPitch } from "./util.js";

const animatePath = async ({
  map,
  duration,
  path,
  startBearing,
  startAltitude,
}) => {
  return new Promise(async (resolve) => {
    const pathDistance = turf.lineDistance(path);
    let start;

    const frame = async (time) => {
      if (!start) start = time;
      const animationPhase = (time - start) / duration;

      // when the duration is complete, resolve the promise and stop iterating
      if (animationPhase > 1) {
        console.log('leaving animatePath')

        resolve();
        return;
      }

      // calculate the distance along the path based on the animationPhase
      const alongPath = turf.along(path, pathDistance * animationPhase).geometry
        .coordinates;

      const lngLat = {
        lng: alongPath[0],
        lat: alongPath[1],
      };

      // Reduce the visible length of the line by using a line-gradient to cutoff the line
      // animationPhase is a value between 0 and 1 that reprents the progress of the animation
      map.setPaintProperty("line", "line-gradient", [
        "step",
        ["line-progress"],
        "yellow",
        animationPhase,
        "rgba(0, 0, 0, 0)",
      ]);

      // slowly rotate the map at a constant rate
      const bearing = startBearing - animationPhase * 200.0;

      const PITCH = 70;

      // compute corrected camera ground position, so that he leading edge of the path is in view
      var correctedPosition = computeCameraPositionByBearingAndPitch(
        PITCH,
        bearing,
        lngLat,
        startAltitude,
        true // smooth
      );

      // set the pitch and bearing of the camera
      const camera = map.getFreeCameraOptions();
      camera.setPitchBearing(PITCH, bearing);

      // set the position and altitude of the camera
      camera.position = mapboxgl.MercatorCoordinate.fromLngLat(
        correctedPosition,
        startAltitude
      );

      // apply the new camera options
      map.setFreeCameraOptions(camera);

      // repeat!
      await window.requestAnimationFrame(frame);
    };

    await window.requestAnimationFrame(frame);
  });
};

export default animatePath;
