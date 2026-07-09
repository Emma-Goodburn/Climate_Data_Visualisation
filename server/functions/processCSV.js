import save from './save.js';
import fs from 'fs/promises';

export default async function processCSV(url, datasetName) {
  
  // Fetch CSV
  const csvRes = await fetch(url);
  if (!csvRes.ok) throw new Error(`Failed to fetch CSV: ${csvRes.status}`);
  const csvText = await csvRes.text();

  // Split rows and filter any empty values
  const rows = csvText.split(/\r?\n/).filter(Boolean);
  const series = [];

  // HadSST has year and month stored separately
  if (datasetName === "HadSST") {
    for (const row of rows) {
      // Split into individual column values
      const cols = row.split(',').map(s => s.replace(/^"|"$/g, '').trim());
      // Year, Month, Value1, Value2, ...
      const date = cols[0] + '-' + (cols[1].length < 2 ? '0' + cols[1] : cols[1]);
      // Only interested in Value1
      const val = cols[2];
      // Ignore if any NaN values have got here
      if (val === '' || isNaN(Number(val))) continue;
      series.push({ date: date, value: val });
    }
  }

  // CRUTEM5 and HadCRUT5 store full date
  else {
    for (const row of rows) {
      // Split into individual column values
      const cols = row.split(',').map(s => s.replace(/^"|"$/g, '').trim());
      // Date, Value, Value2, ...
      const date = cols[0];
      // Only interested in Value1
      const val = cols[1];
      // Ignore if any NaN values have got here
      if (val === '' || isNaN(Number(val))) continue;
      series.push({ date: date, value: val });
    }
  }
  
  // Save to json file including date of last update
  const data = { lastDate: new Date(), series };
  // Check data is different before saving to prevent delaying real data updates
  try {
    const fileData = await fs.readFile(`./server/datasets/${datasetName}.json`, 'utf8');
    const oldData = JSON.parse(fileData);
    // If data has changed, update
    if (JSON.stringify(data.series) !== JSON.stringify(oldData.series))
      await save(`./server/datasets/${datasetName}.json`, data);
  }
  // Dataset likely doesn't exist yet so save
  catch (error) {
    await save(`./server/datasets/${datasetName}.json`, data);
  }
  return data;
};