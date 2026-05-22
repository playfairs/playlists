import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import InfoSection from './components/InfoSection';
import Playlists from './components/Playlists';
import MyTaste from './components/MyTaste';
import Particles from './components/Particles';

function App() {
  return (
    <Router>
      <div className="app">
        <Particles />
        <Header />
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <InfoSection />
              <Playlists />
            </>
          } />
          <Route path="/my-taste" element={<MyTaste />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
