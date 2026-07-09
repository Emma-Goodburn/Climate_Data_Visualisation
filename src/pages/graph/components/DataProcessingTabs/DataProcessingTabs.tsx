import { useEffect, useState } from "react";
import type { dataset } from "../../types";
import DataProcessingContent from "../DataProcessingContent/DataProcessingContent";
import "./styles.css";
import type { DataProcessingTabsProps } from "./types";

const dataProcessingTabs = ({ sources, datasets, setDatasets, getRandomColour, setDatasetColours, datasetColours, setErrorMessage } : DataProcessingTabsProps) => {

  // Run when new dataset is added
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch last dataset in the array
        const response = await fetch(`http://localhost:4000/api/${datasets?.[datasets.length - 1].source.toLowerCase()}`);
        const data = await response.json();
        // Set data, colour and empty processing steps
        setDatasets(datasets?.map((dataset, index) => {
          if (index === datasets.length - 1) {
            const newColour = getRandomColour(datasetColours);
            setDatasetColours([...datasetColours, newColour])
            return {
              source: dataset.source,
              data: data.series.map((item: any) => ({  x: item.date, y: item.value })),
              processingSteps: dataset.processingSteps,
              show: true,
              colour: newColour + 'c',
            }
          }
          else {
            return dataset;
          }
        }) || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    if (datasets?.[datasets.length - 1].data.length === 0) {
      fetchData()
    }
  }, [datasets]);

  // Currrent tab index
  const [activeTab, setActiveTab] = useState<number>(0);

  // Change current tab index
  const handleTabClick = (index: number) => {
    setActiveTab(index);
  }

  return (
    <div className="tabs-container">
      <ul className="tabs-list">
        {/* Tab for each index */}
        {datasets?.map((_dataset, index) => {
          return (
            <li className={`tabs-list-item ${activeTab === index ? 'selected' : ''}`} onClick={() => handleTabClick(index)}>
              <a className="tab-button">
                {`Dataset ${index + 1}`}
              </a>
            </li>
          )
        })}
        {/* New dataset button */}
        <li className={`tabs-list-item`} onClick={() => setDatasets([...datasets || [], {
            source: sources[0].source,
            data: [],
            processingSteps: [{ step: '', value: '' }],
            show: true,
            colour: '',
          }])}>
          <a className="tab-button">
            New dataset
          </a>
        </li>
      </ul>
      {/* All dataset contents with only the selected one shown */}
      {datasets?.map((dataset, index) => {
        return (
          <div className={`tab-panel ${activeTab === index ? '' : 'hidden'}`}>
            <DataProcessingContent
              dataset={dataset}
              setDataset={(newDataset: dataset) => setDatasets([...datasets.slice(0, index), newDataset, ...datasets.slice(index + 1)])}
              sources={sources}
              setErrorMessage={setErrorMessage}
            />
          </div>
        )
      })}
    </div>
  )

}

export default dataProcessingTabs;