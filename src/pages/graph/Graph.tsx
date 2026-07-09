import { Line } from "react-chartjs-2"
import 'chartjs-adapter-date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  scales,
} from 'chart.js';
import DataProcessingTabs from "./components/DataProcessingTabs/DataProcessingTabs";
import { useState, useEffect } from "react";
import type { dataset } from "./types";
import useGraph from "./hooks";
import ErrorMessage from "./components/ErrorMessage/ErrorMessage";
import "./styles.css";

// Required ChartJS options
ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  scales,
);

const Graph = () => {

  const {
    getRandomColour
  } = useGraph();

  // Required variables
  const [datasets, setDatasets] = useState<dataset[] | null>(null);
  const [datasetColours, setDatasetColours] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const sources = [
    { source: 'CRUTEM5', type: 'Land temperature' },
    { source: 'HadSST', type: 'Sea surface temperature' },
    { source: 'HadCRUT5', type: 'Sea and land temperature' }
  ];

  // Fetch data for first dataset (will always be CRUTEM5 as default)
  useEffect(() => {
    const fetchData = async () => {
      if (datasets !== null) return;
      try {
        const response = await fetch(`http://localhost:4000/api/crutem5`);
        const data = await response.json();
        const newColour = getRandomColour(datasetColours);
        setDatasetColours([...datasetColours, newColour])
        setDatasets([{ source: data.source, data: data.series.map((item: any) => ({  x: item.date, y: item.value })), processingSteps: [{ step: '', value: '' }], show: true, colour: newColour + 'c' }]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, []);

  return (
    <>
      {/* When error, show error message */}
      {errorMessage !== null &&
        <ErrorMessage
          errorMessage={errorMessage} 
          setErrorMessage={setErrorMessage}
        />
      }
      {/* Loading message */}
      {datasets === null &&
        <p>Loading data...</p>
      }
      {datasets !== null &&
        <>
          {/* Filter datasets which aren't shown */}
          {datasets.filter((dataset) => dataset.show).length > 0 &&
            <div className="graph-container">
              {/* Plot line graph */}
              <Line
                data={{
                  datasets: datasets.filter((dataset) => {
                    if (dataset.show)
                      return dataset;
                  }).map(dataset => ({
                    data: dataset.data,
                    label: dataset.source,
                    borderColor: dataset.colour,
                    backgroundColor: dataset.colour,
                    tension: 0.1
                  }))
                }}
                options={{
                  scales: {
                    x: {
                      type: 'time',
                      time: {
                        unit: 'year',
                        displayFormats: {
                          year: 'yyyy'
                        }
                      },
                      title: {
                        display: true,
                        text: 'Year'
                      },
                      ticks: {
                        source: 'auto',
                        autoSkip: true,
                      }
                    },
                    y: {
                      type: 'linear',
                      title: {
                        display: true,
                        text: `Temperature anomaly (\u2103 from 1961-1990 mean)`
                      },
                    }
                  },
                  plugins: {
                    legend: {
                      display: true
                    }
                  }
                }}
              />
            </div>
          }
          {/* No datasets message */}
          {datasets.filter((dataset) => dataset.show).length === 0 &&
            <p>No datasets shown</p>
          }
          {/* Tab views */}
          <DataProcessingTabs
            sources={sources}
            datasets={datasets}
            setDatasets={setDatasets}
            getRandomColour={getRandomColour}
            setDatasetColours={setDatasetColours}
            datasetColours={datasetColours}
            setErrorMessage={setErrorMessage}
          />
        </>
      }
    </>
  );
}

export default Graph