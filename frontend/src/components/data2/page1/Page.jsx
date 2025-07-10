import React from "react";
import TestsPerMillionLineChart from "./TestLineChart";
import "./page.css";
import DeathsPieChart from "./PieChart";
import GroupedBarChart from "./RegionWiseBarChart";

function Page({ data }) {
  return (
    <div className="page1-box">
      <div className="page1-up-box">
        <div className="region-pie-chart">
          <DeathsPieChart data={data} />
        </div>
        <div className="page1-other-graph">
             <GroupedBarChart data={data}/>
        </div>
      </div>

      <div className="test-line-graph">
        <TestsPerMillionLineChart data={data} />
      </div>
    </div>
  );
}

export default Page;
