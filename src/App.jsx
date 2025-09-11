import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">BizGro KPI 2.0</h1>
          <p className="text-sm mt-2">Financial Dashboard</p>
        </div>
      </header>
      
      <main className="container mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">Revenue</h2>
            <p className="text-3xl font-bold text-green-600">$125,000</p>
            <p className="text-sm text-gray-600 mt-2">+12% from last month</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">Expenses</h2>
            <p className="text-3xl font-bold text-red-600">$45,000</p>
            <p className="text-sm text-gray-600 mt-2">+5% from last month</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">Profit</h2>
            <p className="text-3xl font-bold text-blue-600">$80,000</p>
            <p className="text-sm text-gray-600 mt-2">+18% from last month</p>
          </div>
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Dashboard Status</h2>
          <p className="text-gray-700">
            Welcome to BizGro KPI 2.0. Your financial dashboard is ready.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
