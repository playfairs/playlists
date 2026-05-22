import { FaLastfm, FaSpotify, FaGithub, FaCode } from 'react-icons/fa';

function Header() {
  return (
    <header className="header floating">
      <div className="header-left">
        <nav className="nav">
          <a href="https://playfairs.cc" target="_blank" rel="noopener noreferrer" className="nav-link breadcrumb">playfairs.cc</a>
          <span className="breadcrumb-separator">/</span>
          <a href="/" className="nav-link breadcrumb-current">playlists</a>
        </nav>
      </div>
      <div className="header-right">
        <a href="/playlist.json" target="_blank" rel="noopener noreferrer" className="btn btn-secondary icon-only-mobile" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaCode size={14} />
          <span>JSON</span>
        </a>
        <a href="https://last.fm/user/pdwk" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaLastfm size={14} />
          <span>Last.fm</span>
        </a>
        <a href="https://open.spotify.com/user/darklore4201" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaSpotify size={14} />
          <span>Spotify</span>
        </a>
        <a href="https://github.com/playfairs/playlists" target="_blank" rel="noopener noreferrer" className="btn btn-secondary icon-only-mobile" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaGithub size={14} />
          <span>Source</span>
        </a>
      </div>
    </header>
  );
}

export default Header;
