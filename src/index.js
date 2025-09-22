document.addEventListener('DOMContentLoaded', () => {
    const playlistsContainer = document.getElementById('playlists-container');
    
    playlistsContainer.innerHTML = '<div class="loading">Loading playlists...</div>';

    fetch('./playlist.json')
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(playlists => {
            console.log('Playlists loaded successfully:', playlists);
            if (!Array.isArray(playlists)) {
                throw new Error('Invalid playlist data: expected an array');
            }
            renderPlaylists(playlists);
        })
        .catch(error => {
            console.error('Error loading playlists:', error);
            playlistsContainer.innerHTML = `
                <div class="error">
                    <p>Failed to load playlists. Please check the console for more details.</p>
                    <p>Error: ${error.message}</p>
                </div>`;
        });

    function renderPlaylists(playlists) {
        if (!playlists || !Array.isArray(playlists) || playlists.length === 0) {
            playlistsContainer.innerHTML = '<div class="no-playlists">No playlists found in the JSON file.</div>';
            return;
        }

        const playlistsByType = playlists.reduce((acc, playlist) => {
            try {
                const type = (playlist.type && typeof playlist.type === 'string') ? 
                    playlist.type.toLowerCase() : 'other';
                
                if (!acc[type]) {
                    acc[type] = [];
                }
                acc[type].push(playlist);
            } catch (error) {
                console.error('Error processing playlist:', playlist, error);
            }
            return acc;
        }, {});

        playlistsContainer.innerHTML = '';

        const getSectionTitle = (type) => {
            const titles = {
                'spotify': 'Spotify Playlists',
                'apple-music': 'Apple Music Playlists',
                'other': 'Other Playlists'
            };
            return titles[type] || `${type.charAt(0).toUpperCase() + type.slice(1)} Playlists`;
        };

        Object.entries(playlistsByType).forEach(([type, typePlaylists]) => {
            if (!typePlaylists || typePlaylists.length === 0) return;
            
            const sectionTitle = document.createElement('h2');
            sectionTitle.className = 'section-title';
            sectionTitle.textContent = getSectionTitle(type);
            sectionTitle.dataset.type = type;  
            playlistsContainer.appendChild(sectionTitle);
            
            const sectionContainer = document.createElement('div');
            sectionContainer.className = 'playlists-section';
            sectionContainer.dataset.type = type;
            
            sectionContainer.innerHTML = typePlaylists
                .filter(playlist => playlist.embed)
                .map(playlist => {
                    const urlMatch = playlist.embed.match(/src=["']([^"']+)["']/);
                    const url = urlMatch ? urlMatch[1] : '#';
                    const isSpotify = playlist.type === 'spotify';
                    const logoPath = isSpotify ? '../assets/spotify-button.png' : '../assets/apple-music.png';
                    const altText = isSpotify ? 'Open in Spotify' : 'Open in Apple Music';
                    
                    return `
                        <div class="playlist-card">
                            <div class="playlist-info">
                                <h3 class="playlist-name" title="${playlist.name}">
                                    ${playlist.name || 'Untitled Playlist'}
                                </h3>
                                <a href="${url}" target="_blank" rel="noopener noreferrer" class="playlist-link" data-type="${playlist.type}">
                                    <img src="${logoPath}" alt="${altText}" class="streaming-logo">
                                </a>
                            </div>
                            <div class="playlist-embed">
                                ${playlist.embed}
                            </div>
                        </div>
                    `;
                })
                .join('');
            
            if (sectionContainer.innerHTML.trim() !== '') {
                playlistsContainer.appendChild(sectionContainer);
            }
        });
        if (playlistsContainer.innerHTML.trim() === '') {
            playlistsContainer.innerHTML = '<div class="no-playlists">No valid playlists found.</div>';
            return;
        }

        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            if (!iframe.getAttribute('width') || !iframe.getAttribute('height')) {
                iframe.setAttribute('width', '100%');
                iframe.setAttribute('height', iframe.closest('[data-type="apple-music"]') ? '450' : '352');
            }
        });
    }
});