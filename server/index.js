import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import processCSV from "./functions/processCSV.js";

const datasetURLs = new Map([
  ["CRUTEM5", "https://hadleyserver.metoffice.gov.uk/crutem5/data/CRUTEM.5.1.0.0/diagnostics/CRUTEM.5.1.0.0.summary_series.global.monthly.csv"],
  ["HadCRUT5", "https://www.metoffice.gov.uk/hadobs/hadcrut5/data/HadCRUT.5.1.0.0/analysis/diagnostics/HadCRUT.5.1.0.0.analysis.summary_series.global.monthly.csv"],
  ["HadSST", "https://www.metoffice.gov.uk/hadobs/hadsst4/data/data/HadSST.4.2.0.0_monthly_GLOBE.csv"]
]);

const app = express();
const PORT = process.env.PORT || 4000;

// Allow CORS from the React dev server and other origins (dev-friendly)
app.use(cors({ origin: true, credentials: true }));
// Ensure preflight requests are handled
app.options('*', cors({ origin: true, credentials: true }));
app.use(express.json());

export default async function getDataset(datasetName, res) {
  try {
    const path = `./server/datasets/${datasetName}.json`;
    // Assume  path exists
    try {
      // Fetch existing data
      const fileData = await fs.readFile(path, 'utf8');
      const cachedData = JSON.parse(fileData);
      const lastDate = new Date(cachedData.lastDate);
      // Check last update is within a month
      if (Date.now() < new Date(lastDate.setMonth(lastDate.getMonth() + 1))) {
        return res.send({ source: datasetName, ...cachedData });
      }
      else {
        throw new Error('Cache outdated');
      }
    }
    // Any errors found above
    catch (err) {
      // Fetch dataset from URL
      const url = datasetURLs.get(datasetName);
      const data = await processCSV(url, datasetName);
      res.send({ source: datasetName, ...data });
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
}

app.get('/api/crutem5', async (req, res) => {
  await getDataset("CRUTEM5", res);
});

app.get('/api/hadcrut5', async (req, res) => {
  await getDataset("HadCRUT5", res);
});

app.get('/api/hadsst', async (req, res) => {
  await getDataset("HadSST", res);
});

// start server
(async () => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
})();
