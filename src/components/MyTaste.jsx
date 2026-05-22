import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

function MyTaste() {
  const [taste, setTaste] = useState([]);
  const [groupedTaste, setGroupedTaste] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedItems, setExpandedItems] = useState({});
  const [stats, setStats] = useState({ artists: 0, genres: 0, subgenres: 0 });

  useEffect(() => {
    fetch('/taste.json')
      .then(response => response.json())
      .then(data => {
        setTaste(data);
        
        const grouped = data.reduce((acc, item) => {
          const type = item.type || 'Other';
          if (!acc[type]) {
            acc[type] = [];
          }
          acc[type].push(item);
          return acc;
        }, {});

        Object.keys(grouped).forEach(type => {
          grouped[type].sort((a, b) => a.name.localeCompare(b.name, undefined, {
            sensitivity: 'base',
            ignorePunctuation: true,
            numeric: true
          }));
        });

        setGroupedTaste(grouped);
        
        const initialExpanded = {};
        Object.keys(grouped).forEach((type, index) => {
          initialExpanded[`category-${index}`] = false;
        });
        setExpandedCategories(initialExpanded);

        const artistCount = data.filter(item => item.type === 'artist').length;
        const genreCount = data.filter(item => item.type === 'genre').length;
        const subgenreCount = data.reduce((acc, item) => {
          if (item.subgenres) {
            return acc + item.subgenres.length;
          }
          return acc;
        }, 0);

        setStats({ artists: artistCount, genres: genreCount, subgenres: subgenreCount });
      })
      .catch(error => {
        console.error('Error loading taste data:', error);
      });
  }, []);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const toggleItem = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const categoryOrder = ['artist', 'genre'];
  
  const sortedCategories = Object.keys(groupedTaste).sort((a, b) => {
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
    <section className="taste-section">
      <div className="container">
        <h1 className="taste-title">My Taste</h1>
        <p className="taste-description">A collection of my favorite artists, genres, and musical preferences.</p>
        
        <div className="taste-stats">
          <div className="taste-stat">
            <span className="taste-stat-number">{stats.artists}</span>
            <span className="taste-stat-label">Artists</span>
          </div>
          <div className="taste-stat">
            <span className="taste-stat-number">{stats.genres}</span>
            <span className="taste-stat-label">Genres</span>
          </div>
          <div className="taste-stat">
            <span className="taste-stat-number">{stats.subgenres}</span>
            <span className="taste-stat-label">Subgenres</span>
          </div>
        </div>
        
        <div className="taste-list">
          {sortedCategories.map((category, index) => {
            const categoryId = `category-${index}`;
            const categoryItems = groupedTaste[category];
            const isExpanded = expandedCategories[categoryId];

            return (
              <div key={category}>
                <div 
                  className={`category-header ${isExpanded ? 'active' : ''}`}
                  onClick={() => toggleCategory(categoryId)}
                >
                  <span className="category-name">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="category-count">{categoryItems.length}</span>
                    <ChevronDown size={16} className="category-arrow-icon" />
                  </div>
                </div>
                <div className={`category-playlists ${isExpanded ? 'active' : ''}`} id={categoryId}>
                  {categoryItems.map((item, itemIndex) => {
                    const itemId = `item-${index}-${itemIndex}`;
                    const isItemExpanded = expandedItems[itemId];

                    return (
                      <div key={itemIndex}>
                        <div 
                          className={`taste-item-header ${isItemExpanded ? 'active' : ''}`}
                          onClick={() => toggleItem(itemId)}
                        >
                          <span className="taste-item-name">{item.name}</span>
                          <ChevronRight size={16} className="taste-arrow-icon" />
                        </div>
                        <div className={`taste-item-details ${isItemExpanded ? 'active' : ''}`}>
                          {item.genres && (
                            <div className="taste-detail-row">
                              <span className="taste-detail-label">Genres:</span>
                              <div className="taste-detail-list">
                                {item.genres.map((genre, genreIndex) => (
                                  <span key={genreIndex} className="taste-detail-tag">{genre}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {item.subgenres && (
                            <div className="taste-detail-row">
                              <span className="taste-detail-label">Subgenres:</span>
                              <div className="taste-detail-list">
                                {item.subgenres.map((subgenre, subgenreIndex) => (
                                  <span key={subgenreIndex} className="taste-detail-tag">{subgenre}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {item.favorite_albums && (
                            <div className="taste-detail-row">
                              <span className="taste-detail-label">Favorite Albums:</span>
                              <div className="taste-detail-list">
                                {item.favorite_albums.map((album, albumIndex) => (
                                  <span key={albumIndex} className="taste-detail-tag">{album}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {item.favorite_artists && (
                            <div className="taste-detail-row">
                              <span className="taste-detail-label">Favorite Artists:</span>
                              <div className="taste-detail-list">
                                {item.favorite_artists.map((artist, artistIndex) => (
                                  <span key={artistIndex} className="taste-detail-tag">{artist}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
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

export default MyTaste;
