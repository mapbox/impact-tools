# Accessibility Tools

These scripts are designed to be used to complete an isochrone based accessibility analysis for site selection, coverage, catchment area or microplanning analysis.

Read more about why Mapbox built these tools and how to use them in this blog post

## Installation

With [conda][1] installed, set up an environment with the following

`% conda env create -f environment.yml`

`% conda activate geopandas`

## Usage

To view detailed usage of each script run `python analyze.py --help` or `python isochrone.py --help`

The first step is to run <code>[isochrones.py][2]</code>, a helper tool to generate one [isochrone][3] for each input point, and copy its attributes over to the output shape. Configure the script using the following parameters, which map to parameters [offered by the Isochrone API][4]:

- Input: A GeoJSON or CSV files containing points to (*required*)
- `token`: A Mapbox API token (*required*)
- `output`: The filename to use for saving the output geometry. Default is `{inputfilename}_{travelprofile}_{traveltime}.json`
- `minutes`: The travel time in minutes to travel from the point. Default is 30m
- `profile`: the mode of transport, driving, walking or cycling. Default is driving
- `generalize`: a tolerance to use for simplifying the output geometries using the Douglas-Peucker algorithm, in meters. Use 0 (the default) to return the full isochrones, and to avoid occasional self-intersecting geometry errors
- `limit`: If provided, the script will only read in the first *n* features of your input data. Useful for testing
- `force`: Overwrite any existing output files with the same name. Otherwise, script will error if a file exists

<code>
python isochrones.py --profile=driving --minutes=30 --generalize=0 --token=$MAPBOX_ACCESS_TOKEN sample_data/points.geojson</code>

The output is a GeoJSON collection of all the isochrones for all points in the data sets. The next step is to run <code>[analyze.py][5]</code> which takes those isochrones and the original points, and calculates the total population within that area. Configure the script using the following parameters:

- Input: A GeoJSON file containing the isochrones generated in the previous step
- `pop_tiff`: The path to a population raster file (*required*)
- `buffer_distance`: The distance in meters used to buffer the input isochrones to reduce their geometric complexity and account for walking time to communities along the road. Default: 1
- `limit`: If provided, only load a limited number of features, useful for testing small portions of a larger dataset
- `output`: File name to save output geometry, specify a name with .gpkg to save as [Geopackage][6] (useful for visualizing in a GIS, or transferring to a database) or .geojson for [GeoJSON][7] (useful for tiling or visualizing with Mapbox GL JS)
- `points`: Input facility points, used for buffering to incorporate those living within direct walking distance, and missing roads
- `points_buffer_distance`: The distance in meters to buffer the facility `points`. Default: 4000

Next run <code>[analyze.py][5]</code>

<code>python analyze.py --pop_tiff=sample_data/pop.tiff --points=sample_data/points.geojson --output=accessibility.geojson points_isochrone_driving_30.json</code>

[1]: https://docs.conda.io/en/latest/

[2]: https://github.com/mapbox/impact-tools/blob/accessibility/accessibility/isochrones.py

[3]: https://docs.mapbox.com/help/tutorials/get-started-isochrone-api/

[4]: https://docs.mapbox.com/api/navigation/isochrone/

[5]: https://github.com/mapbox/impact-tools/blob/accessibility/accessibility/analyze.py

[6]: https://www.geopackage.org/

[7]: https://geojson.org/
