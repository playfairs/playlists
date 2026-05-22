import { useState, useEffect } from 'react';

function Hero() {
  const [totalPlaylists, setTotalPlaylists] = useState('Loading...');

  useEffect(() => {
    fetch('/playlist.json')
      .then(response => response.json())
      .then(playlists => {
        setTotalPlaylists(`${playlists.length} playlists`);
      })
      .catch(error => {
        console.error('Error loading playlists:', error);
        setTotalPlaylists('Error');
      });
  }, []);

  return (
    <section className="hero">
      <div className="hero-content">
        <span className="tag">Publically listed Playlists</span>
        <h1 className="hero-title">playlists.playfairs.cc</h1>
        <p className="hero-description">A hand picked collection of my playlists which I deemed worthy enough to just plaster onto a website.</p>
        <div className="hero-stats">
          <span className="stat">{totalPlaylists}</span>
          <span className="stat">Spotify & Apple Music</span>
        </div>
      </div>
    </section>
  );
}

export default Hero;
