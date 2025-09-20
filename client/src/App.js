import React from 'react';
import './App.css';
import DocumentList from './components/DocumentList';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>AI OCR Document Management</h1>
      </header>
      <DocumentList />
    </div>
  );
}

export default App;
