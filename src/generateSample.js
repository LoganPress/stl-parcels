const fs = require("fs");
const prcl = require("../data/prcl_geojson/prcl.json");

const csv = fs
  .readFileSync(__dirname + "/../data/prcl_data/PAR2022.csv", "utf8")
  .split("\n");

const header = csv.shift();

const sampleRows = csv.slice(0);
// .filter((r) => parseFloat(r.split(",")[18] ?? 0) > 0);

const handles = sampleRows.map((r) => r.split(",")[0]);

const samplePrcls = prcl.features.filter((f) =>
  handles.includes(f.properties.HANDLE)
);

const sampleParcelJson = {
  type: prcl.type,
  features: samplePrcls,
};

sampleRows.unshift(header);

const sampleCsv = sampleRows.join("\n");

fs.writeFileSync(
  __dirname + "/../data/prcl_data/PAR_SAMPLE.csv",
  sampleCsv,
  "utf8"
);

fs.writeFileSync(
  __dirname + "/../data/prcl_geojson/prcl_sample.json",
  JSON.stringify(sampleParcelJson),
  "utf8"
);

console.log(`Done, created ${handles.length} rows.`);
