import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RepositoryList from './components/RepositoryList';
import Search from './components/Search';
import RepositoryDetail from './components/RepositoryDetail';
import CategoryDetail from './components/CategoryDetail';
import { fetchPopularRepositories } from './services/githubService';
import './App.css';


const App = () => {
  const [repositories, setRepositories] = useState([]);

  
  const handleFetchedRepositories = (repos) => {
    setRepositories(repos);
  };

  useEffect(() => {
    const fetchData = async () => {
      const repos = await fetchPopularRepositories();
      handleFetchedRepositories(repos);
    };

    fetchData();
  }, []);

    /*return (
    <div className="App">
      <header className="App-header">
        <h1>GitHub Releases Tracker</h1>
      </header>
      <main>
        <RepositoryList />
      </main>
    </div>
  );
  
  <Route path="/" element={<RepositoryList repositories={repositories} />} />
  */


  useEffect(() => {
    // Fetch repositories and set state here
    // setRepositories(fetchedRepositories);
  }, []);
  
  
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>GitHub Releases Tracker</h1>
          <Search repositories={repositories} />
        </header>
        <main>
          <Routes>
            <Route path="/repository/:owner/:repo" element={<RepositoryDetail />} />
            <Route path="/category/:category" element={<CategoryDetail repositories={repositories} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;