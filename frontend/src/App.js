import React from 'react';
import { Routes, Route, HashRouter } from 'react-router-dom';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import Registration from './pages/Registration';

import './App.css';


const App = () => (
  <HashRouter>
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route path='/events' element={<EventsPage />} />
      <Route path='/registration' element={<Registration />} />
    </Routes>
  </HashRouter>
);

export default App;
