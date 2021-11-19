#!/usr/bin/python3

from pathlib import Path
import requests
import backoff
import geojson
import geopandas as gpd
import pandas as pd
from shapely.geometry import Point
import argparse

parser = argparse.ArgumentParser(
    description="This tool creates isochrones from a set of points")
parser.add_argument(
    "input", help="geojson or csv (csv must have named lat/lon columns)")
parser.add_argument("--output", default=None,
                    help="Output filename, if ommitted input file name will be used")
parser.add_argument("--token", required=True, help="Mapbox API token")
parser.add_argument("--profile", default="driving",
                    help="Mapbox directions profile to use, must be one of 'walking' 'cycling' 'driving'")
parser.add_argument("--minutes", default=30,
                    help="The time size of the isochrone to generate in minutes, defaults to 30")
parser.add_argument("--limit", default=None, type=int,
                    help="If provided, the script will only generate this many isochrones despite the input file size, useful for testing")
parser.add_argument("--generalize", default=0,
                    help="Tolerance for Douglas-Peucker generalization in meters. use 0 if self-intersecting isochrone issue arises")
parser.add_argument("--force", default=False, action="store_true",
                    help="Overwrite any existing file without warning, otherwise script will exit")

base_url = "https://api.mapbox.com/isochrone/v1/mapbox/"


def isochrone(x, y, profile, minutes, generalize, token, base_url):
    if not x or not y:
        print("Missing coordinates, skipping")
        return
    url = f'{base_url}{profile}/{x},{y}?contours_minutes={minutes}&generalize={generalize}&polygons=true&access_token={token}'
    response = request_isochrone(url).json()
    if 'features' in response:
        return response['features'][0]
    else:
        print("Issue creating isochrone, skipping", response)
        return


@backoff.on_exception(backoff.expo,
                      requests.exceptions.RequestException)
def request_isochrone(url):
    print(f'Getting isochrone {url}')
    r = requests.get(url)
    r.raise_for_status()
    return r


def create_isochrones(args):

    input = args.input
    is_json = "json" in Path(input).suffix or "geojson" in Path(input).suffix
    is_csv = ".csv" == Path(input).suffix
    if not is_json and not is_csv:
        print("Invalid input file format, json or csv required")
        return

    output = args.output
    if not output:
        # if no output_name is defined use the input file as a base name
        output = f'{ Path(args.input).stem }_isochrone_{args.profile}_{args.minutes}.json'

    print("Output: "+output)
    if (Path(output).exists()):
        if args.force:
            print("File already exists, overwriting!")
        else:
            print("File already exists, exiting. To overwrite, run with --force.")
            return

    with open(output, 'w') as output_file:
        features = []
        skipped = 0

        if is_csv:
            df = pd.read_csv(input)
            # Fix for NAN error when serializing to JSON
            df = df.fillna('')
            # TODO Support more default column names, or use args to define column name for each a la ogr2ogr
            if not ('lat' in df.columns and 'lon' in df.columns):
                print("Missing lat and lon columns")
                return
            gdf = gpd.GeoDataFrame(df.drop(['lon', 'lat'], axis=1),
                                   crs={'init': 'epsg:4326'},
                                   geometry=[Point(xy) for xy in zip(df.lon, df.lat)])
        elif is_json:
            gdf = gpd.read_file(input)

        for i, row in gdf.iterrows():
            if args.limit == None or i < args.limit:
                iso = isochrone(row.geometry.x, row.geometry.y, args.profile,
                                args.minutes, args.generalize, args.token, base_url)
                if iso:
                    iso['properties'] = row.drop('geometry').to_dict()
                    features.append(iso)
                else:
                    skipped = skipped + 1

        print(f'{len(features)} isochrones completed. {skipped} rows skipped')
        feature_collection = geojson.FeatureCollection(features)
        output_file.write(geojson.dumps(feature_collection, sort_keys=True))
        return feature_collection


if __name__ == "__main__":
    args = parser.parse_args()
    create_isochrones(args)
