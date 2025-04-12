Data "Parcel Data Dataset" from City of St. Louis:
https://www.stlouis-mo.gov/data/datasets/distribution.cfm?id=189

Method:
Passed zip folder of shapefile data to mapshaper.org and converted to the WGS84 (EPSG 4326) projection schema. Exported data to GeoJSON. Ran `src/generateSample.js` with desired parameters to produce a sample dataset (not a random sample).

Live deployment status:
[![Netlify Status](https://api.netlify.com/api/v1/badges/275f4430-67f9-4d4d-9144-3b4a6e2014d0/deploy-status)](https://app.netlify.com/sites/friendly-ptolemy-7d0b59/deploys)
