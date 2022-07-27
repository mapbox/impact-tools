// geojson for the various stages of the tour de france were encoded as GeoJSON objects in
// https://github.com/mapbox/emea-sales-pod/blob/main/stravaTourDeFrance/video_generator.html
// This script imports them as javascript, and saves a static geojson file for each.

// The source data has strings for all coordinates, so those are converted to numbers so they can be parsed

// The exports contain only a single Feature, not a FeatureCollection
import { promises } from 'fs'
const { writeFile } = promises
import { geojsonGPXMale, geojsonGPXFemale } from "./combined.js";

for (let i=0; i<geojsonGPXMale.length; i+=1) {
    const filename = `../data/male-stage-${i+1}.geojson`
    let FC = geojsonGPXMale[i]
    let feature = FC.features[0]
    feature.geometry.coordinates = feature.geometry.coordinates.map(d => [parseFloat(d[0]), parseFloat(d[1])])
    await writeFile(filename, JSON.stringify(feature, null, 2))
}

for (let i=0; i<geojsonGPXFemale.length; i+=1) {
    const filename = `../data/female-stage-${i+1}.geojson`
    let FC = geojsonGPXFemale[i]
    let feature = FC.features[0]
    feature.geometry.coordinates = feature.geometry.coordinates.map(d => [parseFloat(d[0]), parseFloat(d[1])])
    await writeFile(filename, JSON.stringify(feature, null, 2))
}

console.log(geojsonGPXMale.length)
console.log(geojsonGPXFemale.length)



