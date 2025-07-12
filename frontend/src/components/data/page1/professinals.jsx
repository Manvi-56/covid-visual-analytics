import React from "react";
import "./pro.css";
import StressPieChart from "./StressPieChart";
import SectorBarChart from "./SectorBarChart";
import HoursStressHeatmap from "./CorrelationHeatmap";
import SectorHoursBarChart from "./BoxPlot";

function Professinals({ data }) {
  return (
    <div className="pro-outer">
      <div className="pro-box pro-box-1">
        <div className="pro-pie">
            <p>Stress-Pie Chart</p>
            <StressPieChart data={data} />
            </div>
        <SectorBarChart data={data} />
      </div>
      <div className="pro-box pro-box-2">
        <HoursStressHeatmap data={data} />
        <SectorHoursBarChart data={data}/>
      </div>
    </div>
  );
}

export default Professinals;
