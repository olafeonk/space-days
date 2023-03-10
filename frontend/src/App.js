import React from 'react';
import { Routes, Route, HashRouter } from 'react-router-dom';
import HomePage from './components/HomePage';
import EventsPage from './components/EventsPage';

import './App.css';


const App = () => (
  <HashRouter>
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route path='/events' element={<EventsPage />} />
    </Routes>
  </HashRouter>
);

export default App;
