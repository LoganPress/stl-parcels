const fs = require("fs");
const prcl = require(__dirname + "/data/prcl_geojson/prcl.json");

(async () => {
  const d3 = await import("/path/to/d3-dsv");
  const csv = fs.readFileSync(
    __dirname + "/data/prcl_data/PAR_2023.csv",
    "utf8"
  );

  const csvRows = d3.csvParse(csv);
  const sampleRows = csvRows.filter(
    (row) => parseFloat(row["LANDAREA"] ?? 0) > 0
  );

  console.log(`Sampled ${sampleRows.length} parcels with land area > 0`);

  const handles = sampleRows.map((r) => {
    // Something spooky is going on with the CSV parsing for the HANDLE column
    const handleKey = Object.keys(r).find((key) => key.trim() === "HANDLE");
    return r[handleKey];
  });

  // Filter the geojson parcels to only include those in the sample
  const samplePrcls = prcl.features.filter((f) =>
    handles.includes(f.properties.HANDLE)
  );

  const sampleParcelJson = {
    type: prcl.type,
    features: samplePrcls,
  };

  const sampleCsv = d3.csvFormat(sampleRows);

  fs.writeFileSync(
    __dirname + "/data/prcl_data/PAR_SAMPLE.csv",
    sampleCsv,
    "utf8"
  );

  fs.writeFileSync(
    __dirname + "/data/prcl_geojson/prcl_sample.json",
    JSON.stringify(sampleParcelJson),
    "utf8"
  );

  console.log(`Done, created ${handles.length} rows.`);
})();
