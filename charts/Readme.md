# Charts Impact Tool

This tool shows how to render a choropleth map styled in studio with accompanying charts, using data queried directly from the map tiles.
![demo](demo.gif)

## How to use

1. [Create your map style in Mapbox Studio](https://docs.mapbox.com/help/tutorials/choropleth-studio-gl-pt-1/). Be sure to set the initial map zoom to be far enough out to reveal all your data, so it will appear correctly in the initial charts (we read the data from the loaded map tiles).
2. Edit the `config` object at the top of `index.js`, following the instructions in the comments to reference your map style, data fields and labels.
3. To further customize the charts, see the [examples](https://c3js.org/examples.html) and documentation for [c3js](https://c3js.org/)

## Config

This template lets you easily build an interactive map with accompanying graph without writing any code. Make a copy of the code in this repository, then edit the following fields at the top of the file (under `const config = `):

- `accessToken`: Set this to your [Mapbox Access Token](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/)
- `mapStyle`: Set this to the url of your Mapbox Map Style
- `sourceLayer`: Every vector tileset has different layers, set this to the name of the layer you would like to chart
- `title`: The title text for both sidebar and the webpage itself (in the `<title>` tag)
- `description`: The sidebar description text (visible only on desktop)
- `fields`: Set this to the set of fields you would like to graph. The application will query data from each field, in order, to display on the chart.
- `labels`: The x-axis labels for the chart
- `placeNameField`: The field within your data that contains the name of the geographic place, used for labeling the chart when a place is clicked: `Total Votes in placeNameField, placeAdminField`
- `placeAdminField`: Used with `placeNameField`, this is the name of the administrative unit field to use in chart labeling
- `summaryType`: (_optional_) ['avg' | 'sum'] When creating the initial summary chart of the entire dataset, this value determines whether values are added together or averaged. Be sure to set to 'avg' when using ratios or other normalized data such as "Population per sq mile" or "Vote Turnout %".
- `dataSeriesLabel`: The text used to label the chart data
- `sourceId`: When loading in your map data via studio, your tiles will automatically be _composited_, combining them together. Change this to another value if you are loading other tilesets, outside the map style.

### Legends

This template includes a simple legend builder that allows you to automatically generate a legend from a basic choropleth map with stops. To configure set the following config parameters:

- `autoLegend`: Set to true to let the template try to build a legend for you. Requires `studioLayerName` to also be set to the name of the map layer in Mapbox Studio
- If the auto legend doesn't work (i.e. you have a linear interpolation or other fill type) you can set your own legend stops with `legendColors` and `legendValues`. Comment out or delete these to display no legend on the map.

### Requirements/Disclaimer

Note due to usage of modern JavaScript features including [arrow functions](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/Arrow_functions) this template will not work in IE11 or earlier without a transpiler such as [babel](https://babeljs.io/).

## Customization

This tool can be used as-is to launch a simple webmap with charts, or customized further. Here are a few ways to build on this template:

- If you'd like to edit your `index.html` file directly to style the sidebar, disable the `updateText` function
- To further customize the charts, see the [documentation](https://c3js.org/reference.html) and [examples](https://c3js.org/examples.html) for c3js. With just a few lines of code you can change the chart type, customize data formatting, colors, and more. For example, to make bar charts instead of line graphs, add `type:bar` to the chart data object.

If you have other feature requests or questions, reach to to us at `community@mapbox.com`.
