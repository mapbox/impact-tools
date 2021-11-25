#!/usr/bin/env python3

import argparse
import sys
import geopandas as gpd
import pandas as pd
from shapely.geometry import Point
from rasterstats import zonal_stats
from pyproj.aoi import AreaOfInterest
from pyproj.database import query_utm_crs_info
from pathlib import Path

parser = argparse.ArgumentParser(
    description="Run zonal stats on area defined by set of isochrone polygons")
parser.add_argument("input", help="geojson file containing polygon collection")
parser.add_argument("--pop_tiff", required=True,
                    help="path to population GeoTIFF")
parser.add_argument("--buffer_distance", type=int, default=1,
                    help="Buffer geometries to incorporate walking time to roads and fix invalid isochrones")
parser.add_argument("--limit", default=None, type=int,
                    help="If provided, load only some features for testing")
parser.add_argument("--output",
                    help="file path to save dissolved polygons")
parser.add_argument("--points", default=None,
                    help="geojson or csv (csv must have named lat/lon columns)")
parser.add_argument("--points_buffer_distance", type=int, default=4000,
                    help="buffer point geometries to account for walking")

# Pick the middle UTM zone


def set_utm_from_gdf(gdf):
    # DEFINE A PROJECTION HERE
    # Option 1: https://pyproj4.github.io/pyproj/stable/examples.html#find-utm-crs-by-latitude-and-longitude
    # Option 2: https://timothyrenner.github.io/talks/20171128-geo-pydata/#/transverse-mercator
    # print(box(*denmark.total_bounds))
    # https://pyproj4.github.io/pyproj/stable/api/aoi.html#pyproj.aoi.AreaOfInterest
    bounds = gdf.total_bounds
    aou = AreaOfInterest(west_lon_degree=bounds[0], south_lat_degree=bounds[1],
                         east_lon_degree=bounds[2], north_lat_degree=bounds[3])
    zones = query_utm_crs_info(area_of_interest=aou)
    middle = zones[int(len(zones)/2)]
    print("Central zone projection code: "+middle.code)
    return gdf.to_crs(epsg=middle.code)


def analyze(args):
    print("Reading input file "+args.input)
    isochrones_gdf = gpd.read_file(
        args.input)[:args.limit] if args.limit else gpd.read_file(args.input)
    isochrones_gdf = set_utm_from_gdf(isochrones_gdf)
    print(f'Buffering geometry by {args.buffer_distance} meters')
    isochrones_gdf.geometry = isochrones_gdf.geometry.buffer(
        args.buffer_distance)

    if args.points:
        points = args.points
        print("Reading input points "+points)
        is_json = "json" in Path(
            points).suffix or "geojson" in Path(points).suffix
        is_csv = ".csv" == Path(points).suffix
        if not is_json and not is_csv:
            print("Invalid points file format, json or csv required")
            return

        if is_csv:
            df = pd.read_csv(points)[
                :args.limit] if args.limit else pd.read_csv(points)
            if not ('lat' in df.columns and 'lon' in df.columns):
                print("Points file missing lat and lon columns")
                return
            points_gdf = gpd.GeoDataFrame(df.drop(['lon', 'lat'], axis=1),
                                          crs={'init': 'epsg:4326'},
                                          geometry=[Point(xy) for xy in zip(df.lon, df.lat)])
        elif is_json:
            points_gdf = gpd.read_file(
                points)[:args.limit] if args.limit else gpd.read_file(points)

        print("Total features: "+str(len(points_gdf)))
        # project to same crs as isochrones for projection
        points_buffer_gdf = points_gdf.to_crs(isochrones_gdf.crs)

        print(
            f'Buffering point gemetry by {args.points_buffer_distance} meters')
        points_buffer_gdf.geometry = points_buffer_gdf.buffer(
            args.points_buffer_distance)
        isochrones_gdf = pd.concat([isochrones_gdf, points_buffer_gdf])

    isochrones_pre_dissolved = isochrones_gdf.dissolve()
    # Project to equal area projection for accurate area calculation
    area = (isochrones_pre_dissolved.to_crs(
        {'proj': 'cea'}).geometry.area / 10**6).values[0]
    print(f'Total feature area: {area}')
    isochrones_dissolved = isochrones_pre_dissolved.explode().to_crs(epsg=4326)

    if args.output:
        output = args.output
        is_json = "json" in Path(
            output).suffix or "geojson" in Path(output).suffix
        is_gpkg = "gpkg" in Path(output).suffix
        print("Saving layers to file: "+output)
        if is_json:
            isochrones_dissolved.to_file(output, driver="GeoJSON")
        elif is_gpkg:
            isochrones_dissolved.to_file(output,
                                         layer='isochrones_dissolved', driver="GPKG")
        else:
            isochrones_dissolved.to_file(output+'.gpkg',
                                         layer='isochrones_dissolved', driver="GPKG")

    print('Processing zonal stats')
    pop_count = zonal_stats(isochrones_dissolved, args.pop_tiff, stats="sum")
    pop_sum = sum([item['sum'] for item in pop_count if item['sum']])
    print(
        f'Accessible population: {pop_sum}. Population density: {pop_sum/area}')


if __name__ == "__main__":
    args = parser.parse_args()
    analyze(args)
