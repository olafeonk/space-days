import React from "react";
import { Routes, Route, HashRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import RegistrationPage from "./pages/RegistrationPage";
import TicketsPage from "./pages/TicketsPage";

import "./App.css";

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
        <Route path="/tickets" element={<TicketsPage />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
