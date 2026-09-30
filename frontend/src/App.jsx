import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import AllocationStepper from './components/AllocationStepper';
import CampusGraph from './components/CampusGraph';
import Timetable from './components/Timetable';
import RequestForm from './components/RequestForm';
import AdminPanel from './components/AdminPanel';
import { fetchGraph, fetchResources, fetchRequests, fetchConfig, runAllocation, resetData } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [resources, setResources] = useState([]);
  const [requests, setRequests] = useState([]);
  const [config, setConfig] = useState({});
  const [allocationData, setAllocationData] = useState(null);
  const [highlightedPath, setHighlightedPath] = useState([]);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [darkMode]);

  const loadAllData = async () => {
    try {
      const [gRes, rRes, reqRes, cRes, allocRes] = await Promise.all([
        fetchGraph(),
        fetchResources(),
        fetchRequests(),
        fetchConfig(),
        runAllocation()
      ]);
      setGraphData(gRes);
      setResources(rRes);
      setRequests(reqRes);
      setConfig(cRes);
      setAllocationData(allocRes);
    } catch (err) {
      console.error('Failed loading application data:', err);
    }
  };

  const handleReset = async () => {
    await resetData();
    await loadAllData();
  };

  const handleAllocationRun = (data) => {
    setAllocationData(data);
  };

  const handleHighlightPathOnly = (path) => {
    setHighlightedPath(path || []);
  };

  const handleNavigateToGraphWithPath = (path) => {
    setHighlightedPath(path || []);
    setActiveTab('graph');
  };

  return (
    <div className="min-h-screen pb-12">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onReset={handleReset}
      />

      <main className="max-w-7xl mx-auto px-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            allocationData={allocationData}
            onAllocationRun={handleAllocationRun}
            onSelectPath={handleNavigateToGraphWithPath}
          />
        )}

        {activeTab === 'stepper' && (
          <AllocationStepper
            stepLogs={allocationData?.step_logs || []}
            onHighlightPath={handleHighlightPathOnly}
            onNavigateToGraph={handleNavigateToGraphWithPath}
            config={config}
          />
        )}

        {activeTab === 'graph' && (
          <CampusGraph
            nodes={graphData.nodes}
            edges={graphData.edges}
            highlightedPath={highlightedPath}
          />
        )}

        {activeTab === 'timetable' && (
          <Timetable
            bookings={allocationData?.bookings || []}
            resources={resources}
          />
        )}

        {activeTab === 'request' && (
          <RequestForm
            nodes={graphData.nodes}
            onRequestSubmitted={loadAllData}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            nodes={graphData.nodes}
            resources={resources}
            onDataUpdated={loadAllData}
          />
        )}
      </main>
    </div>
  );
}
