// src/components/data2/page1/Page.jsx
import React from "react";
import TestsPerMillionLineChart from "./TestLineChart";
import "./page.css"; // Keep this for existing styles not covered by Tailwind
import DeathsPieChart from "./PieChart";
import GroupedBarChart from "./RegionWiseBarChart";

function Page({ data }) {
    return (
        <div className="flex flex-col gap-8"> {/* Adjusted for better overall layout */}
            <div className="flex flex-col lg:flex-row gap-8"> {/* Charts side-by-side on large screens */}
                {/* Deaths Pie Chart Container */}
                <div className="flex-1 min-w-0 bg-white dark:bg-gray-700 rounded-lg shadow-md p-4 flex flex-col items-center justify-center">
                    <DeathsPieChart data={data} />
                </div>
                {/* Region Wise Bar Chart Container */}
                <div className="flex-1 min-w-0 bg-white dark:bg-gray-700 rounded-lg shadow-md p-4 flex flex-col items-center justify-center">
                    <GroupedBarChart data={data}/>
                </div>
            </div>

            {/* Tests Per Million Line Chart Container */}
            <div className="w-full bg-white dark:bg-gray-700 rounded-lg shadow-md p-4 flex flex-col items-center justify-center">
                <TestsPerMillionLineChart data={data} />
            </div>
        </div>
    );
}

export default Page;