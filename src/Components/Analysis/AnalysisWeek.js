import React from "react";
import { Link, Outlet } from "react-router-dom";
import Plot from "react-plotly.js";
import { Button } from "@mui/material";

export default class AnalysisWeek extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  dataPlot(data, day) {
    let cal = 0;
    let carbo = 0;
    let satFat = 0;
    let chol = 0;

    const colorMap = {
      monday: "rgba(255,0,50,0.6)",
      tuesday: "rgba(255,150,0,0.6)",
      wednesday: "rgba(255,255,50,0.6)",
      thursday: "rgba(0,255,50,0.6)",
      friday: "rgba(50,50,255,0.6)",
      saturday: "rgba(200,0,255,0.6)",
      sunday: "rgba(150,50,200,0.6)",
    };

    let color = colorMap[day] || "rgba(55,128,191,0.6)";
    for (let i = 0; i < data.length; i++) {
      cal += data[i].calories;
      carbo += data[i].carbohydrates_total_g;
      satFat += data[i].fat_saturated_g;
      chol += data[i].cholesterol_mg;
    }
    const nut = {
      x: ["calories", "carbohydrate", "saturated fat", "cholesterol"],
      y: [cal, carbo, satFat, chol],
      name: "Intake on " + day,
      orientation: "v",
      text: ["", "unit: g", "unit: g", "unit: mg"].map(String),
      textposition: "auto",
      marker: {
        color,
        width: 1,
      },
      type: "bar",
    };

    return nut;
  }

  render() {
    const { data } = this.props;
    const layout = {
      title: "Weekly nutrition intake",
      height: 700,
      width: 1000,
      barmode: "group",
    };
    const mondayNutrition = this.dataPlot(data[0], "monday");
    const tuesdayNutrition = this.dataPlot(data[1], "tuesday");
    const nutrition = [mondayNutrition, tuesdayNutrition];
    return (
      <div>
        <h1>Nutritional analysis by week</h1>
        <div className="Analysis-container">
          <div className="Analysis-sidebar">
            <Button
              variant="contained"
              // disabled={daily}
              // onClick={() => this.onClickDaily()}
            >
              <Link
                to="/analysis/weekly/cal+sodium"
                style={{ textDecoration: "none" }}
              >
                Calories+Sodium intake
              </Link>
            </Button>
            <Button
              variant="contained"
              // disabled={weekly}
              // onClick={() => this.onClickWeekly()}
            >
              <Link
                to="/analysis/weekly/others"
                style={{ textDecoration: "none" }}
              >
                Carbo, Fat and Cholesterol
              </Link>
            </Button>
          </div>
          <div className="Analysis-plot">
            <Plot layout={layout} />
          </div>
        </div>
        <Outlet />
      </div>
    );
  }
}
