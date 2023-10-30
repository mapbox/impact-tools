This repository stores the template code files for Mapbox Impact Tools. 

# Mapbox Impact Tools

[https://www.mapbox.com/impact-tools/][1]

From storytelling, to mobilization, to disaster relief, location and maps are powerful tools for impact. But the people and organizations doing the work are facing limited capacity and high stakes. 
Mapbox Impact Tools are free templates and guides to get up and running with common, strategic use-cases — advanced technical skills not required. 

## Setting up a local testing server

To avoid CORS errors when testing, we recommend running a local [http-server for node][2] or a [SimpleHTTPServer for python][3].

### Node:

http-server -c-1

`$ cd path/to/index.html` <br>
`$ http-server`<br>
`Starting up http-server, serving ./`<br>
`Available on:`<br>
  `http://127.0.0.1:8080`<br>
  `http://192.168.0.127:8080`<br>
`Hit CTRL-C to stop the server`

### Python:

`$ cd path/to/index.html` <br>

If Python version returned above is 3.X <br>
`$ python3 -m http.server`

If Python version returned above is 2.X

`$ python -m SimpleHTTPServer`

## Need additional support?

This repo is not monitored for support requests. If you would like to connect with someone at Mapbox, please choose from the following options:

- Contact [Mapbox Support][4]
- Search [Stack Overflow][5]
- Contact the [Community team][6] to share your project or suggest a new Impact Tool

[1]: https://www.mapbox.com/impact-tools/

[2]: https://www.npmjs.com/package/http-server

[3]: https://docs.python.org/2/library/simplehttpserver.html

[4]: https://support.mapbox.com/hc/en-us

[5]: https://stackoverflow.com/questions/tagged/mapbox

[6]: https://www.mapbox.com/community/
