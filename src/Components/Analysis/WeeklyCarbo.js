import React from "react";
import Plot from "react-plotly.js";
import { ref, get } from "firebase/database";
import { database } from "../../firebase";
import { USER_CURRENT } from "../App";

const date = new Date();
const YEAR = date.getFullYear();
const MONTH = date.getMonth() + 1; // Months are zero-indexed, so add 1
const DAY = date.getDate();
const DAYOFWEEK = date.getDay();
const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default class WeeklyCarbo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      datas: [[], [], [], [], [], [], []],
    };
  }
  dataPlot(data, day) {
    let carbo = 0;
    let satFat = 0;
    let chol = 0;

    const colorMap = {
      Sunday: "rgba(255,0,50,0.6)",
      Monday: "rgba(255,150,0,0.6)",
      Tuesday: "rgba(255,255,50,0.6)",
      Wednesday: "rgba(0,255,50,0.6)",
      Thursday: "rgba(50,50,255,0.6)",
      Friday: "rgba(200,0,255,0.6)",
      Saturday: "rgba(150,50,200,0.6)",
    };

    let color = colorMap[day] || "rgba(55,128,191,0.6)";
    for (let i = 0; i < data.length; i++) {
      carbo += data[i].carbohydrates_total_g;
      satFat += data[i].fat_saturated_g;
      chol += data[i].cholesterol_mg;
    }
    const nut = {
      x: ["carbohydrate", "saturated fat", "cholesterol"],
      y: [carbo, satFat, chol],
      name: "Intake on " + day,
      orientation: "v",
      text: ["unit: g", "unit: g", "unit: mg"].map(String),
      textposition: "auto",
      marker: {
        color,
        width: 1,
      },
      type: "bar",
    };

    return nut;
  }

  componentDidMount() {
    let year = YEAR;
    let month = MONTH;
    let day = DAY;
    let i = 0;
  
    const fetchDataAndUpdateState = async (date, index) => {
      try {
        const messagesRef = ref(database); // Reference to the desired location in the Realtime Database
  
        const snapshot = await get(messagesRef); // Retrieve the data from the database
  
        const fetchedData = snapshot.val();
        const filteredData = Object.values(fetchedData.Logs).filter(
          // Retrieve items that are related to the logged-in user and are from today
          (item) =>
            item.authorEmail === USER_CURRENT.email && item.date === date
        );
  
        let filteredData2 = [];
        for (let j = 0; j < filteredData.length; j++) {
          if (filteredData[j].data) {
            filteredData2.push(filteredData[j]);
          }
        }
  
        // Create a copy of the datas array
        const updatedDatas = [...this.state.datas];
  
        // Assign the filtered data to the updatedDatas array
        updatedDatas[index] = filteredData2;
  
        // Update the state with the modified array
        await new Promise((resolve) => {
          this.setState({ datas: updatedDatas }, resolve);
        });
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
  
    const processNextIteration = async () => {
      if (i <= DAYOFWEEK) {
        if (DAYOFWEEK - i >= DAY) {
          let j = DAYOFWEEK - i - DAY;
          if (
            MONTH === 2 ||
            MONTH === 4 ||
            MONTH === 6 ||
            MONTH === 8 ||
            MONTH === 9 ||
            MONTH === 11 ||
            MONTH === 1
          ) {
            day = 31 - j;
          } else if (MONTH === 5 || MONTH === 7 || MONTH === 10 || MONTH === 12) {
            day = 30 - j;
          } else {
            if (YEAR % 4 === 0 && YEAR !== 2100) {
              day = 29 - j;
            } else {
              day = 28 - j;
            }
          }
          if (MONTH === 1) {
            year = YEAR - 1;
            month = 12;
          } else {
            month = MONTH - 1;
          }
        } else {
          month = MONTH;
          day = DAY - (DAYOFWEEK - i);
        }
        const Month = month.toString().padStart(2, "0");
        const Day = day.toString().padStart(2, "0");
        let formattedDate = `${year}-${Month}-${Day}`;
        
        await fetchDataAndUpdateState(formattedDate, i);
        i++;
        processNextIteration();
      }
    };
  
    processNextIteration();
  }

  // Convert Firebase data into array format for graph plot
  convertData(day) {
    const data = this.state.datas[day];
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
    const data = [
      this.convertData(0),
      this.convertData(1),
      this.convertData(2),
      this.convertData(3),
      this.convertData(4),
      this.convertData(5),
      this.convertData(6),
    ];
    const layout = {
      title: "Weekly Nutrition Intake",
      height: 700,
      width: 1000,
      barmode: "group",
      paper_bgcolor: "#f5fbfd",
      plot_bgcolor: "#e1f4fa",
    };
    const sundayNutrition = this.dataPlot(data[0], daysOfWeek[0]);
    const mondayNutrition = this.dataPlot(data[1], daysOfWeek[1]);
    const tuesdayNutrition = this.dataPlot(data[2], daysOfWeek[2]);
    const wednesdayNutrition = this.dataPlot(data[3], daysOfWeek[3]);
    const thursdayNutrition = this.dataPlot(data[4], daysOfWeek[4]);
    const fridayNutrition = this.dataPlot(data[5], daysOfWeek[5]);
    const saturdayNutrition = this.dataPlot(data[6], daysOfWeek[6]);
    const nutrition = [
      sundayNutrition,
      mondayNutrition,
      tuesdayNutrition,
      wednesdayNutrition,
      thursdayNutrition,
      fridayNutrition,
      saturdayNutrition,
    ];
    return (
      <div>
        <Plot data={nutrition} layout={layout} />
      </div>
    );
  }
}
