# Devon coast, 31 August 1940

Interactive map: **https://timdaw37.github.io/devon-coast-1940/**

On 31 Aug 1940 a Luftwaffe reconnaissance aircraft (sortie GX 10006 SD) photographed the North Devon coast. Each frame shows the camera's clock time. This site covers the four frames over Woolacombe, Croyde and Saunton (78, 80, 81, 82); it is a small side project that grew out of looking for the Ramson Cliff erratic on the 1940 photos. The site:

- places the frames on modern maps;
- works out the tide at the minute each frame was taken;
- draws, from Environment Agency LiDAR, where the same tide would reach today with 20 cm more sea level;
- compares the 1940 waterline with 40 years of Landsat and Sentinel-2 waterlines taken at the same tide.

Bottom line: the photos are consistent with the measured ~20 cm rise at Newlyn since 1940, but on their own they cannot prove it. On sand, beach change and the uncertainty in picking the water edge swamp the ~8 m shift; on rock, the shift is only 1–2 m.

## Method
- **Tides:** UTide harmonic fits to one year (2019) of hourly data from Ilfracombe (GESLA-4.1), converted to Ordnance Datum Newlyn. They are checked against Newlyn's real 1940 record (0.13 m rms), and its observed −0.17 m surge on the afternoon is applied. The German clocks ran on CEST (UTC+2), which is BST + 1 h.
- **Photos:** each frame is fitted with a tilted-camera model draped on the EA LiDAR plus a light correction on fixed features, tested on held-out blocks to about 3–5 m (about 10 m in the Saunton dunes). Frame times for 78, 80 and 82 are interpolated from neighbouring frames (marked ≈).
- **Contours:** EA LiDAR Composite DTM at 2 m. −2.49 / −2.29 / 0 m ODN.
- **Waterlines:** water/land (NDWI) edge on east–west transects 50 m apart. The value plotted is the LiDAR height at the edge minus the predicted tide.

## Sources and licences
- **1940 photographs:** U.S. National Archives, RG 373, series "German Flown Aerial Photographs", file unit [GX 10006 SD](https://catalog.archives.gov/id/214920619). Catalogue use status: *Unrestricted*. The images here are reprojected, downsampled derivatives.
- **Tide gauges:** GESLA-4.1 (via UHSLC ERDDAP); BODC / UK National Tide Gauge Network; PSMSL.
- **LiDAR:** © Environment Agency copyright and/or database right, Open Government Licence v3.0.
- **Satellites:** contains modified Copernicus Sentinel data 2016–2026; Landsat courtesy of USGS; accessed via Microsoft Planetary Computer.
- **Base maps:** Sentinel-2 cloudless 2016 by EOX IT Services GmbH (CC BY 4.0); © OpenStreetMap contributors (ODbL).
- **Software:** Leaflet 1.9.4 (BSD-2), vendored in `lib/`.

Tide values are model estimates (about ±0.15 m). Not for navigation.
