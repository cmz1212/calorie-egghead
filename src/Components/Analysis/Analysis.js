import React from "react";
import "../App.css";
import { Button } from "@mui/material";
import { Link, Outlet } from "react-router-dom";
import Plot from "react-plotly.js";
import { ref, onValue } from "firebase/database";
import { database } from "../../firebase";
import { USER_CURRENT } from "../App";

const RECOMMENDED_CALORIE = 2500;
const RECOMMENDED_CARBO = 275;
const RECOMMENDED_SATURATED = 17;
const RECOMMENDED_CHOLESTROL = 250;

// Convert date to yyyy-mm-dd format
const date = new Date();
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed, so add 1
const day = String(date.getDate()).padStart(2, "0");
const formattedDate = `${year}-${month}-${day}`;

export default class Analysis extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      daily: true,
      weekly: false,
      datas: [],
    };
  }

  // Toggle selections to show user which analysis chart is being viewed
  onClickDaily() {
    const { daily } = this.state;
    if (!daily) {
      this.setState({ daily: true, weekly: false });
    }
  }
  onClickWeekly() {
    const { weekly } = this.state;
    if (!weekly) {
      this.setState({ daily: false, weekly: true });
    }
  }

  // Plotting of firebase logged data
  dataPlot(data) {
    // Calorie, carbohydrate, saturated fat, cholestrol amount and percentage of recommended daily limit
    let cal = 0;
    let carbo = 0;
    let satFat = 0;
    let chol = 0;
    let percentageCal = 0;
    let percentageCarbo = 0;
    let percentageSatFat = 0;
    let percentageChol = 0;

    // Adding up of all of the numbers in each of 4 categories for all items logged for that day
    for (let i = 0; i < data.length; i++) {
      cal += data[i].calories;
      carbo += data[i].carbohydrates_total_g;
      satFat += data[i].fat_saturated_g;
      chol += data[i].cholesterol_mg;
    }

    // Get percentage of daily maximum limit, capped at 100%
    if (cal >= RECOMMENDED_CALORIE) {
      percentageCal = 100;
    } else {
      percentageCal = (cal / RECOMMENDED_CALORIE) * 100;
    }
    if (carbo >= RECOMMENDED_CARBO) {
      percentageCarbo = 100;
    } else {
      percentageCarbo = (carbo / RECOMMENDED_CARBO) * 100;
    }
    if (satFat >= RECOMMENDED_SATURATED) {
      percentageSatFat = 100;
    } else {
      percentageSatFat = (satFat / RECOMMENDED_SATURATED) * 100;
    }
    if (chol >= RECOMMENDED_CHOLESTROL) {
      percentageChol = 100;
    } else {
      percentageChol = (chol / RECOMMENDED_CHOLESTROL) * 100;
    }

    // Details of donut chart, Plotly css
    const pieChartData = [
      {
        values: [percentageCal, 100 - percentageCal],
        labels: [
          "Calories consumed: " + cal,
          "Maximum daily recommendation: " + RECOMMENDED_CALORIE + "kcal",
        ],

        //position
        domain: {
          x: [0, 0.48],
          y: [0.52, 1],
        },

        // Title
        name: "Daily calories consumed",
        // Donut hole size
        hole: 0.4,
        type: "pie",
        marker: {
          colors: ["red", "blue"],
        },
      },
      {
        values: [percentageCarbo, 100 - percentageCarbo],
        labels: [
          "Carbohydrate consumed: " + carbo,
          "Maximum daily recommendation: " + RECOMMENDED_CARBO + "g",
        ],
        domain: {
          x: [0.52, 1],
          y: [0.52, 1],
        },

        name: "Daily carbohydrate consumed",
        hole: 0.4,
        type: "pie",
        marker: {
          colors: ["gold", "blue"],
        },
      },
      {
        values: [percentageSatFat, 100 - percentageSatFat],
        labels: [
          "Saturated fat consumed: " + satFat,
          "Maximum daily recommendation: " + RECOMMENDED_SATURATED + "g",
        ],
        domain: {
          x: [0, 0.48],
          y: [0, 0.48],
        },

        name: "Daily saturated fat consumed",
        hole: 0.4,
        type: "pie",
        marker: {
          colors: ["beige", "blue"],
        },
      },
      {
        values: [percentageChol, 100 - percentageChol],
        labels: [
          "Cholestrol consumed: " + chol,
          "Maximum daily recommendation: " + RECOMMENDED_CHOLESTROL + "mg",
        ],
        domain: {
          x: [0.52, 1],
          y: [0, 0.48],
        },

        name: "Daily cholestrol consumed",
        hole: 0.4,
        type: "pie",
        marker: {
          colors: ["purple", "blue"],
        },
      },
    ];

    return pieChartData;
  }

  // Hide daily graphs when weekly graph is selected
  shouldRender() {
    const { pathname } = window.location;
    return pathname === "/analysis";
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    try {
      const messagesRef = ref(database); // Reference to the desired location in the Realtime Database

      // Attach an event listener to listen for changes in the data
      onValue(messagesRef, (snapshot) => {
        const fetchedData = snapshot.val();
        const filteredData = Object.values(fetchedData.Logs).filter(
          // Retrieve items that are realted to the logged in user and is from today
          (item) =>
            item.authorEmail === USER_CURRENT.email &&
            item.date === formattedDate
        );

        // Convert filteredData to correct format and filter out unwanted parts and empty arrays
        let filteredData2 = [];
        for (let i = 0; i < filteredData.length; i++) {
          if (filteredData[i].data) {
            filteredData2.push(filteredData[i]);
          }
        }
        this.setState({ datas: filteredData2 });
      });
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  // Convert Firebase data into array format for graph plot
  convertData() {
    const data = this.state.datas;
    const fetchedData = data.map((item) => item.data);
    let newData = [];
    for (let i = 0; i < fetchedData.length; i++) {
      for (let j = 0; j < fetchedData[i].length; j++) {
        newData.push(fetchedData[i][j]);
      }
    }
    return newData;
  }

  render() {
    const { daily, weekly } = this.state;
    const shouldRender = this.shouldRender();

    const data = this.convertData();
    const chartData = this.dataPlot(data);

    // Layout for Plotly graph plots
    const layout = {
      title: "% of Recommended Consumed Today",
      paper_bgcolor: "#f5fbfd",
      annotations: [
        {
          font: {
            size: 20,
          },
          showarrow: false,
          text: "Calories",
          x: 0.19,
          y: 0.79,
        },

        {
          font: {
            size: 18,
          },
          showarrow: false,
          text: `Carbo-`,
          width: 80,
          x: 0.81,
          y: 0.8,
        },
        {
          font: {
            size: 18,
          },
          showarrow: false,
          text: `hydrates`,
          width: 80,
          x: 0.81,
          y: 0.77,
        },
        {
          font: {
            size: 19,
          },
          showarrow: false,
          text: "Saturated",
          x: 0.19,
          y: 0.23,
        },
        {
          font: {
            size: 19,
          },
          showarrow: false,
          text: "Fat",
          x: 0.22,
          y: 0.19,
        },
        {
          font: {
            size: 18,
          },
          showarrow: false,
          text: "Cholestrol",
          x: 0.81,
          y: 0.21,
        },
      ],
      height: 700,
      width: 1000,
      showlegend: false,
      grid: { rows: 1, columns: 2 },
    };
    return (
      <div>
        <div>
          {shouldRender && (<h1>Daily nutritional intake</h1>)}
          
          <Outlet />

          {shouldRender && (

            <div className="Analysis-container">
              <div className="Analysis-sidebar">
                <div>
                  <h3>Daily recommended maximum intake:</h3>
                  <br />
                  <br />
                  Calories: {RECOMMENDED_CALORIE}kcal
                  <br />
                  <br />
                  Carbohydrates: {RECOMMENDED_CARBO}g
                  <br />
                  <br />
                  Saturated Fat: {RECOMMENDED_SATURATED}g
                  <br />
                  <br />
                  Cholestrol: {RECOMMENDED_CHOLESTROL}mg
                </div>
                
              </div>
              <div>
                <Plot data={chartData} layout={layout} />
              </div>
            </div>
          )}
        </div>

        <div className="Analysis-content">
          <div className="Analysis-links">
            <Button
              variant="contained"
              disabled={daily}
              onClick={() => this.onClickDaily()}
            >
              <Link to="/analysis" style={{ textDecoration: "none" }}>
                Daily
              </Link>
            </Button>
            <Button
              variant="contained"
              disabled={weekly}
              onClick={() => this.onClickWeekly()}
            >
              <Link to="/analysis/weekly" style={{ textDecoration: "none" }}>
                Weekly
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
