import React from 'react';
import RepositoryList from './components/RepositoryList';
import './App.css';

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>GitHub Releases Tracker</h1>
      </header>
      <main>
        <RepositoryList />
      </main>
    </div>
  );
};

export default App;
