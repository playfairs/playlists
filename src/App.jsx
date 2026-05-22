import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import InfoSection from './components/InfoSection';
import Playlists from './components/Playlists';
import Particles from './components/Particles';

function App() {
  return (
    <Router>
      <div className="app">
        <Particles />
        <Header />
        <Hero />
        <InfoSection />
        <Playlists />
      </div>
    </Router>
  );
}

export default App;
