import React from "react";
import { Routes, Route, HashRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import RegistrationPage from "./pages/RegistrationPage";

import "./App1.css";

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route
          path="/registration"
          element={
            <RegistrationPage />
          }
        />
      </Routes>
    </HashRouter>
  );
};

export default App;
