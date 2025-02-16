const PARCEL_DATA_FILE = "/data/prcl_data/PAR_SAMPLE.csv";
const PARCEL_SHAPE_FILE = "/data/prcl_geojson/prcl_sample.json";
// const PARCEL_DATA_FILE = "/data/prcl_data/PAR_2022.csv";
// const PARCEL_SHAPE_FILE = "/data/prcl_geojson/prcl.json";
const defaultX = 38.6468;
const defaultY = -90.2528;

function roundToTwoDecimals(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function formatNumber(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const map = L.map("map", { zoomControl: true }).setView(
  [defaultX, defaultY],
  12,
  { animate: false }
);

const colorScale = [
  "#002f61",
  "#004d78",
  "#00688b",
  "#008396",
  "#009c9b",
  "#00b599",
  "#00cd8e",
  "#2ee379",
  "#81f15e",
  "#c2fa3d",
  "#ffff00",
];

// L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
//   minZoom: 11,
//   maxZoom: 20,
//   attribution:
//     'Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
// }).addTo(map);

L.tileLayer(
  "https://api.maptiler.com/maps/backdrop/{z}/{x}/{y}.png?key=pdFHr4meye2YHVGXw5sv",
  {
    minZoom: 11,
    maxZoom: 18,
    attribution:
      'Map data &copy; <a href="https://www.maptiler.com/copyright">MapTiler</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> | &copy; Logan Press 2024',
    crossOrigin: true,
  }
).addTo(map);

map.setMaxBounds(map.getBounds());

const parcels = {};
let landAreasZero = 0;

d3.csv(PARCEL_DATA_FILE)
  .then(async (data) => {
    data.map((row) => {
      const assessmentLand = parseFloat(row["ASMTLAND"]) ?? 0;
      const assessmentImprovement = parseFloat(row["ASMTIMPROV"]) ?? 0;
      const assessmentTotal = parseFloat(row["ASMTTOTAL"]) ?? 0;
      const landArea = parseFloat(row["LANDAREA"]) ?? 0;
      if (landArea > 0) {
        parcels[row["HANDLE"]] = {
          address: row["SITEADDR"],
          assessmentLand: roundToTwoDecimals(assessmentLand),
          assessmentImprovement: roundToTwoDecimals(assessmentImprovement),
          assessmentTotal: roundToTwoDecimals(assessmentTotal),
          landArea: roundToTwoDecimals(landArea),
          ivd: 0,
          logIvd: NaN,
          lvd: 0,
          logLvd: NaN,
          tvd: 0,
          logTvd: NaN,
          lir: 0,
          logLir: NaN,
          shape: {},
        };
      }
      if (landArea === 0) {
        landAreasZero++;
      }
    });
    console.log(`Parcels with land area = 0: ${landAreasZero}`);
    console.log(`Loaded in ${Object.keys(parcels).length} parcels`);
    await fetch(PARCEL_SHAPE_FILE).then(async (resp) => {
      await resp.json().then((shapes) => {
        shapes.features.map((feature) => {
          const parcel = parcels[feature.properties.HANDLE];
          if (parcel) {
            parcel.shape = feature;
            const ivd =
              parcel.landArea === 0
                ? 0
                : parcel.assessmentImprovement / parcel.landArea;
            const logIvd = ivd === 0 ? null : Math.log(ivd);
            const lvd =
              parcel.landArea === 0
                ? 0
                : parcel.assessmentLand / parcel.landArea;
            const logLvd = lvd === 0 ? null : Math.log(lvd);
            const tvd =
              parcel.landArea === 0
                ? 0
                : parcel.assessmentTotal / parcel.landArea;
            const logTvd = tvd === 0 ? null : Math.log(tvd);
            const lir =
              parcel.assessmentLand === 0
                ? 0
                : parcel.assessmentImprovement / parcel.assessmentLand;
            const logLir = lir === 0 ? null : Math.log(lir);
            parcel.ivd = roundToTwoDecimals(ivd);
            parcel.logIvd = logIvd === null ? null : roundToTwoDecimals(logIvd);
            parcel.lvd = roundToTwoDecimals(lvd);
            parcel.logLvd = logLvd === null ? null : roundToTwoDecimals(logLvd);
            parcel.tvd = roundToTwoDecimals(tvd);
            parcel.logTvd = logTvd === null ? null : roundToTwoDecimals(logTvd);
            parcel.lir = lir === null ? null : roundToTwoDecimals(lir);
            parcel.logLir = logLir === null ? null : roundToTwoDecimals(logLir);
          }
        });
      });
    });
  })
  .then(() => {
    const parcelValues = Object.values(parcels);

    const ivds = parcelValues.map((p) => p.ivd);
    const minIvd = Math.min(...ivds);
    const maxIvd = Math.max(...ivds);

    const logIvds = parcelValues.map((p) => p.logIvd);
    const minLogIvd = Math.min(...logIvds.filter((l) => !Number.isNaN(l)));
    const maxLogIvd = Math.max(...logIvds.filter((l) => !Number.isNaN(l)));
    Object.keys(parcels).map((k) => {
      if (
        parcels[k].logIvd === null ||
        parcels[k].logIvd === undefined ||
        Number.isNaN(parcels[k].logIvd)
      ) {
        parcels[k].logIvd = minLogIvd;
      }
    });

    const lvds = parcelValues.map((p) => p.lvd);
    const minLvd = Math.min(...lvds);
    const maxLvd = Math.max(...lvds);

    const logLvds = parcelValues.map((p) => p.logLvd);
    const minLogLvd = Math.min(...logLvds.filter((l) => !Number.isNaN(l)));
    const maxLogLvd = Math.max(...logLvds.filter((l) => !Number.isNaN(l)));
    Object.keys(parcels).map((k) => {
      if (
        parcels[k].logLvd === null ||
        parcels[k].logLvd === undefined ||
        Number.isNaN(parcels[k].logLvd)
      ) {
        parcels[k].logLvd = minLogLvd;
      }
    });

    const tvds = parcelValues.map((p) => p.tvd);
    const minTvd = Math.min(...tvds);
    const maxTvd = Math.max(...tvds);

    const logTvds = parcelValues.map((p) => p.logTvd);
    const minLogTvd = Math.min(...logTvds.filter((l) => !Number.isNaN(l)));
    const maxLogTvd = Math.max(...logTvds.filter((l) => !Number.isNaN(l)));
    Object.keys(parcels).map((k) => {
      if (
        parcels[k].logTvd === null ||
        parcels[k].logTvd === undefined ||
        Number.isNaN(parcels[k].logTvd)
      ) {
        parcels[k].logTvd = minLogTvd;
      }
    });

    const lirs = parcelValues
      .map((p) => p.lir)
      .filter((p) => p !== null && !Number.isNaN(p));
    const minLir = Math.min(...lirs);
    const maxLir = Math.max(...lirs);

    const logLirs = parcelValues
      .map((p) => p.logLir)
      .filter((p) => p !== null && !Number.isNaN(p));
    const minLogLir = Math.min(...logLirs);
    const maxLogLir = Math.max(...logLirs);
    Object.keys(parcels).map((k) => {
      if (
        parcels[k].logLir === null ||
        parcels[k].logLir === undefined ||
        Number.isNaN(parcels[k].logLir)
      ) {
        parcels[k].logLir = minLogLir;
      }
    });

    const parcelLayer = L.geoJSON(
      parcelValues.map((p) => p.shape),
      {
        weight: 2,
        style: (feature) => {
          const parcel = parcels[feature.properties.HANDLE];

          // LOG LAND IMPROVEMENT RATIO
          // const colorIndex = Math.floor(
          //   (((parcel.logLir ?? minLogLir) - minLogLir) /
          //     (maxLogLir - minLogLir)) *
          //     colorScale.length
          // );
          // if (parcel.assessmentLand > 0 && parcel.assessmentImprovement > 0) {
          //   return {
          //     fillColor: colorScale[colorIndex],
          //     fillOpacity: 0.5,
          //     color: colorScale[colorIndex],
          //     opacity: 1,
          //   };
          // }
          // return { opacity: 0, fillOpacity: 0 };

          // LAND IMPROVEMENT RATIO
          // const colorIndex = Math.floor(
          //   ((parcel.lir - minLir) / (maxLir - minLir)) * colorScale.length
          // );
          // if (parcel.assessmentLand > 0 && parcel.assessmentImprovement > 0) {
          //   return {
          //     fillColor: colorScale[colorIndex],
          //     fillOpacity: 0.5,
          //     color: colorScale[colorIndex],
          //     opacity: 1,
          //   };
          // }
          // return { opacity: 0, fillOpacity: 0 };

          // LOG IMPROVEMENT VALUE DENSITY
          // const colorIndex = Math.floor(
          //   (((parcel.logIvd ?? minLogIvd) - minLogIvd) /
          //     (maxLogIvd - minLogIvd)) *
          //     colorScale.length
          // );
          // if (parcel.assessmentImprovement > 0) {
          //   return {
          //     fillColor: colorScale[colorIndex],
          //     fillOpacity: 0.5,
          //     color: colorScale[colorIndex],
          //     opacity: 1,
          //   };
          // }
          // return { opacity: 0, fillOpacity: 0 };

          // IMPROVEMENT VALUE DENSITY
          // const colorIndex = Math.floor(
          //   ((parcel.ivd - minIvd) / (maxIvd - minIvd)) * colorScale.length
          // );
          // if (parcel.assessmentImprovement > 0) {
          //   return {
          //     fillColor: colorScale[colorIndex],
          //     fillOpacity: 0.5,
          //     color: colorScale[colorIndex],
          //     opacity: 1,
          //   };
          // }
          // return { opacity: 0, fillOpacity: 0 };

          // LOG LAND VALUE DENSITY
          // const colorIndex = Math.floor(
          //   (((parcel.logLvd ?? minLogLvd) - minLogLvd) /
          //     (maxLogLvd - minLogLvd)) *
          //     colorScale.length
          // );
          // if (parcel.assessmentLand > 0) {
          //   return {
          //     fillColor: colorScale[colorIndex],
          //     fillOpacity: 0.5,
          //     color: colorScale[colorIndex],
          //     opacity: 1,
          //   };
          // }
          // return { opacity: 0, fillOpacity: 0 };

          // LAND VALUE DENSITY
          // const colorIndex = Math.floor(
          //   ((parcel.lvd - minLvd) / (maxLvd - minLvd)) * colorScale.length
          // );
          // if (parcel.assessmentLand > 0) {
          //   return {
          //     fillColor: colorScale[colorIndex],
          //     fillOpacity: 0.5,
          //     color: colorScale[colorIndex],
          //     opacity: 1,
          //   };
          // }
          // return { opacity: 0, fillOpacity: 0 };

          // LOG TOTAL VALUE DENSITY
          const colorIndex = Math.floor(
            (((parcel.logTvd ?? minLogTvd) - minLogTvd) /
              (maxLogTvd - minLogTvd)) *
              colorScale.length
          );
          if (parcel.assessmentTotal > 0) {
            return {
              fillColor: colorScale[colorIndex],
              fillOpacity: 0.5,
              color: colorScale[colorIndex],
              opacity: 1,
            };
          }
          return { opacity: 0, fillOpacity: 0 };

          // TOTAL VALUE DENSITY
          // const colorIndex = Math.floor(
          //   ((parcel.tvd - minTvd) / (maxTvd - minTvd)) * colorScale.length
          // );
          // if (parcel.assessmentTotal > 0) {
          //   return {
          //     fillColor: colorScale[colorIndex],
          //     fillOpacity: 0.5,
          //     color: colorScale[colorIndex],
          //     opacity: 1,
          //   };
          // }
          // return { opacity: 0, fillOpacity: 0 };
        },
        onEachFeature: (feature, layer) => {
          const parcel = parcels[feature.properties.HANDLE];
          if (parcel.assessmentTotal > 0) {
          layer.bindTooltip(
            `
            <h4>${parcel.address}</h4>
            <p>Assessed Land Value: $${formatNumber(parcel.assessmentLand)}</p>
            <p>Assessed Improvement Value: $${formatNumber(
              parcel.assessmentImprovement
            )}</p>
            <p>Assessed Total Value: $${formatNumber(
              parcel.assessmentTotal
            )}</p>
            <p>Land Area: ${formatNumber(parcel.landArea)} sqft</p>
            <p>Total Value Density: $${formatNumber(
              roundToTwoDecimals(parcel.tvd * 43560)
            )}/acre</p>
            <p>Improvement Value to Land Value Ratio: ${parcel.lir}</p>
            `,
            { sticky: true }
          );
          layer.on("click", () => {
            window
              .open(
                `https://www.google.com/maps/place/${parcel.address.replace(
                  " ",
                  "+"
                )}+St.+Louis,+MO`,
                "_blank"
              )
              .focus();
          });
          }
        },
      }
    ).addTo(map);
  });
