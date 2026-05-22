import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';

function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [groupedPlaylists, setGroupedPlaylists] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    fetch('/src/playlist.json')
      .then(response => response.json())
      .then(data => {
        setPlaylists(data);
        
        const grouped = data.reduce((acc, playlist) => {
          const category = playlist.category || 'General';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(playlist);
          return acc;
        }, {});

        Object.keys(grouped).forEach(category => {
          grouped[category].sort((a, b) => a.name.localeCompare(b.name, undefined, {
            sensitivity: 'base',
            ignorePunctuation: true,
            numeric: true
          }));
        });

        setGroupedPlaylists(grouped);
        
        const initialExpanded = {};
        Object.keys(grouped).forEach((category, index) => {
          initialExpanded[`category-${index}`] = false;
        });
        setExpandedCategories(initialExpanded);
      })
      .catch(error => {
        console.error('Error loading playlists:', error);
      });
  }, []);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const getPlaylistUrl = (playlist) => {
    if (playlist.url) {
      return playlist.url;
    }
    const urlMatch = playlist.embed.match(/src=["']([^"']+)["']/);
    return urlMatch ? urlMatch[1] : '#';
  };

  const categoryOrder = ['all-of-{artist}', 'artist', 'genre', 'record-label', 'mixed', 'ost'];
  
  const sortedCategories = Object.keys(groupedPlaylists).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    return a.localeCompare(b, undefined, {
      sensitivity: 'base',
      ignorePunctuation: true
    });
  });

  return (
    <section className="playlists-section" id="playlists">
      <div className="container">
        <h2 className="section-title">All Playlists</h2>
        <div className="playlists-list">
          {sortedCategories.map((category, index) => {
            const categoryId = `category-${index}`;
            const categoryPlaylists = groupedPlaylists[category];
            const isExpanded = expandedCategories[categoryId];

            return (
              <div key={category}>
                <div 
                  className={`category-header ${isExpanded ? 'active' : ''}`}
                  onClick={() => toggleCategory(categoryId)}
                >
                  <span className="category-name">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="category-count">{categoryPlaylists.length}</span>
                    <ChevronDown size={16} className="category-arrow-icon" />
                  </div>
                </div>
                <div className={`category-playlists ${isExpanded ? 'active' : ''}`} id={categoryId}>
                  {categoryPlaylists.map(playlist => {
                    const playlistUrl = getPlaylistUrl(playlist);
                    const typeLabel = playlist.type === 'spotify' ? 'Spotify' : 'Apple Music';

                    return (
                      <a 
                        key={playlist.name}
                        href={playlistUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="playlist-item" 
                        style={{ textDecoration: 'none' }}
                      >
                        <div className="playlist-info">
                          <div className="playlist-name">{playlist.name || 'Untitled Playlist'}</div>
                        </div>
                        <div className="playlist-meta">
                          <span className="playlist-type">{typeLabel}</span>
                          <ChevronRight size={16} className="playlist-arrow-icon" />
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Playlists;
