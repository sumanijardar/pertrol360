import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import AppRoutes from './routes/AppRoutes';

function App() {
  const [stationFilter, setStationFilter] = useState('ALL');

  return (
    <BrowserRouter>
      <Layout
        currentStation={stationFilter}
        onStationChange={setStationFilter}
      >
        <AppRoutes stationFilter={stationFilter} />
      </Layout>
    </BrowserRouter>
  );
}

export default App;
