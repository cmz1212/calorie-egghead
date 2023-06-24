import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./Home";
import About from "./About";
import FAQ from "./FAQ";
import ErrorPage from "./ErrorPage";
import UserAuth from "./UserAuth";
import Analysis from "./Analysis/Analysis";
import LogMeal from "./LogMeal";
import AnalysisDay from "./Analysis/AnalysisDay";
import AnalysisWeek from "./Analysis/AnalysisWeek";
import * as Items from "./Data/DummyData";

export default function Routing({ loggedInUser }) {
  const dummyData = Items.foodItem1.items;
  const dummyData2 = Items.foodItem2.items;
  const weekData = [dummyData, dummyData2];
  return (
    <Routes>
      <Route path="/" element={<Home logInUser={loggedInUser} />} />
      <Route path="/about" element={<About />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/analysis" element={<Analysis />}>
        <Route path="daily" element={<AnalysisDay data={dummyData} />} />
        <Route path="weekly" element={<AnalysisWeek data={weekData} />} />
      </Route>
      <Route path="/login" element={<UserAuth />} />
      <Route path="/logmeal" element={<LogMeal logInUser={loggedInUser} />} />
      <Route path="/*" element={<ErrorPage />} />
    </Routes>
  );
}
