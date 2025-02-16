Data "Parcel Data Dataset" from City of St. Louis:
https://www.stlouis-mo.gov/data/datasets/dataset.cfm?id=82

Method:
Passed zip folder of shapefile data to mapshaper.org and converted to the WGS84 (EPSG 4326) projection schema. Exported data to GeoJSON. Ran `src/generateSample.js` with desired parameters to produce a sample dataset (not a random sample).
