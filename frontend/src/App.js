import React, { useEffect, useState } from "react";
import StressPieChart from "./components/data/page1/StressPieChart";
import SectorBarChart from "./components/data/page1/SectorBarChart";
import BoxPlot from "./components/data/page1/BoxPlot";
import MeetingsProductivityChart from "./components/MeetingsProductivityChart";
import { loadAndCleanCSV } from "./utils/dataParser";
import "./components/chartStyles.css";
import HoursStressHeatmap from "./components/data/page1/CorrelationHeatmap";
import TestsVsCasesScatter from "./components/TestVsScatter";
import loadAndCleanCSV2 from "./utils/data2Parser";
import RegionWiseBarChart from "./components/data2/page1/RegionWiseBarChart";
import Page from "./components/data2/page1/Page";
import CasesVsPopulationScatter from "./components/CasePopulationScatter";
import MortalityRecoveryScatter from "./components/Scatter";
import IndiaCovidMap from "./components/data3/page1/india";
import loadAndCleanIndiaCovid from "./utils/data3Parser";
import Professinals from "./components/data/page1/professinals";

function App() {
  const [data, setData] = useState([]);
  const [data2, setData2] = useState([]);
  const [data3, setData3] = useState([]);
  const [tab, setTab] = useState("page1");

  useEffect(() => {
    loadAndCleanCSV("/data/cleaned_data.csv")
      .then((parsed) => setData(parsed))
      .catch((err) => console.error("Error loading data:", err));
  }, []);

  useEffect(() => {
    loadAndCleanCSV2("/data/worldometer_data.csv")
      .then((parsed) => setData2(parsed))
      .catch((err) => console.error("Error loading data2:", err));
  }, []);
  useEffect(() => {
    loadAndCleanIndiaCovid("/data/state_data.csv")
      .then((parsed) => setData3(parsed))
      .catch((err) => console.error("Error loading data2:", err));
  }, []);

  const tabs = [
    { id: "page1", label: "Globally" },
    { id: "working", label: "Working Professional" },
    { id: "india", label: "India State Wise" },
    { id: "scatter", label: "scatter" },
    { id: "sc", label: "sc" },
    { id: "sc2", label: "sc2" },
    { id: "meetings", label: "Meetings vs Productivity" },
  ];

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>COVID-19 Data Visualization and Analysis</h1>

      {/* Tabs */}
      <div style={{ marginBottom: 20 }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              marginRight: 10,
              padding: "8px 12px",
              backgroundColor: tab === t.id ? "#007bff" : "#f0f0f0",
              color: tab === t.id ? "white" : "black",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Conditional Chart Rendering */}
      {data.length > 0 && (
        <div>
          {tab === "working" && <Professinals data={data} />}
          {tab === "meetings" && <MeetingsProductivityChart data={data} />}
          {tab == "scatter" && <TestsVsCasesScatter data={data2} />}
          {tab == "page1" && <Page data={data2} />}
          {tab == "sc" && <CasesVsPopulationScatter data={data2} />}
          {tab == "sc2" && <MortalityRecoveryScatter data={data2} />}
          {tab == "india" && <IndiaCovidMap data={data3} />}
        </div>
      )}
    </div>
  );
}

export default App;
