import React, { useEffect, useState } from "react";
import StressPieChart from "./components/StressPieChart";
import SectorBarChart from "./components/SectorBarChart";
import BoxPlot from "./components/BoxPlot";
import MeetingsProductivityChart from "./components/MeetingsProductivityChart";
import { loadAndCleanCSV } from "./utils/dataParser";
import "./components/chartStyles.css";

function App() {
  const [data, setData] = useState([]);
  const [tab, setTab] = useState("pie");

  useEffect(() => {
    loadAndCleanCSV("/cleaned_data.csv")
      .then(parsed => setData(parsed))
      .catch(err => console.error("Error loading data:", err));
  }, []);

  const tabs = [
    { id: "pie", label: "Stress Level Pie" },
    { id: "bar", label: "Sector-Stress Bar" },
    { id: "box", label: "Hours Worked Box" },
    { id: "meetings", label: "Meetings vs Productivity" }
  ];

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>COVID-19 Impact on Working Professionals</h1>

      {/* Tabs */}
      <div style={{ marginBottom: 20 }}>
        {tabs.map(t => (
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
              cursor: "pointer"
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Conditional Chart Rendering */}
      {data.length > 0 && (
        <div>
          {tab === "pie" && <StressPieChart data={data} />}
          {tab === "bar" && <SectorBarChart data={data} />}
          {tab === "box" && <BoxPlot data={data} />}
          {tab === "meetings" && <MeetingsProductivityChart data={data} />}
        </div>
      )}
    </div>
  );
}

export default App;
