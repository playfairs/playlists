document.addEventListener('DOMContentLoaded', () => {
    const playlistsContainer = document.getElementById('playlists-container');
    const categoryNav = document.getElementById('categoryNav');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    let allPlaylists = [];
    let uniqueCategories = new Set(['all']);
    
    playlistsContainer.innerHTML = '<div class="loading">Loading playlists...</div>';
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            categoryNav.classList.toggle('active');
        });
    }

    fetch('./src/playlist.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(playlists => {
            if (!Array.isArray(playlists)) {
                throw new Error('Invalid playlist data: expected an array');
            }
            allPlaylists = playlists;
            
            playlists.forEach(playlist => {
                if (playlist.category) {
                    uniqueCategories.add(playlist.category.toLowerCase());
                }
            });
            
            createCategoryButtons();
            
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

    function countPlaylistsInCategory(category) {
        if (category === 'all') return allPlaylists.length;
        return allPlaylists.filter(playlist => 
            playlist.category && playlist.category.toLowerCase() === category
        ).length;
    }
    
    function createCategoryButtons() {
        categoryNav.innerHTML = '';
        
        const allButton = document.createElement('button');
        allButton.className = 'nav-btn active';
        allButton.innerHTML = `All <span class="category-count">${allPlaylists.length}</span>`;
        allButton.dataset.category = 'all';
        allButton.addEventListener('click', (e) => handleCategoryClick(e, 'all'));
        categoryNav.appendChild(allButton);
        
        const categories = Array.from(uniqueCategories).filter(cat => cat !== 'all');
        
        const categoryOrder = ['genre', 'artist', 'record-label'];
        categories.sort((a, b) => {
            const aIndex = categoryOrder.indexOf(a);
            const bIndex = categoryOrder.indexOf(b);
            
            if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
        });
        
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'nav-btn';
            
            const displayName = category
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            
            const count = countPlaylistsInCategory(category);
            button.innerHTML = `${displayName} <span class="category-count">${count}</span>`;
            button.dataset.category = category;
            button.addEventListener('click', (e) => handleCategoryClick(e, category));
            categoryNav.appendChild(button);
        });
    }
    
    function handleCategoryClick(event, category) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        filterPlaylists(category);
        
        categoryNav.classList.remove('active');
    }
    
    function filterPlaylists(category) {
        let filteredPlaylists = [...allPlaylists];
        
        if (category !== 'all') {
            filteredPlaylists = allPlaylists.filter(playlist => {
                if (playlist.category) {
                    return playlist.category.toLowerCase() === category;
                }
                const name = playlist.name.toLowerCase();
                return name.includes(category);
            });
        }
        
        if (filteredPlaylists.length === 0) {
            playlistsContainer.innerHTML = `
                <div class="no-playlists">
                    <p>No playlists found in the ${category} category.</p>
                </div>`;
        } else {
            renderPlaylists(filteredPlaylists);
        }
    }
    
    function renderPlaylists(playlists) {
        if (!playlists || !Array.isArray(playlists) || playlists.length === 0) {
            playlistsContainer.innerHTML = '<div class="no-playlists">No playlists found in the JSON file.</div>';
            return;
        }

        const playlistsByType = playlists.reduce((acc, playlist) => {
            try {
                const type = (playlist.type && typeof playlist.type === 'string') ? 
                    playlist.type.toLowerCase() : 'other';
                
                if (!acc[type]) acc[type] = [];
                acc[type].push(playlist);
            } catch (error) {
                console.error('Error processing playlist:', playlist, error);
            }
            return acc;
        }, {});

        Object.values(playlistsByType).forEach(typePlaylists => {
            typePlaylists.sort((a, b) => a.name.localeCompare(b.name, undefined, {
                sensitivity: 'base',
                ignorePunctuation: true,
                numeric: true
            }));
        });

        playlistsContainer.innerHTML = '';

        const getSectionTitle = (type) => {
            const titles = {
                'spotify': 'Spotify',
                'apple-music': 'Apple Music',
                'other': 'Other'
            };
            return titles[type] || `${type.charAt(0).toUpperCase() + type.slice(1)}`;
        };

        Object.entries(playlistsByType).forEach(([type, typePlaylists]) => {
            if (!typePlaylists || typePlaylists.length === 0) return;
            
            const sectionId = `section-${type}`;
            
            const sectionTitle = document.createElement('h2');
            sectionTitle.className = 'section-title';
            sectionTitle.textContent = getSectionTitle(type);
            sectionTitle.dataset.type = type;
            sectionTitle.role = 'button';
            sectionTitle.tabIndex = 0;
            sectionTitle.setAttribute('aria-expanded', 'true');
            sectionTitle.setAttribute('aria-controls', sectionId);
            
            sectionTitle.addEventListener('click', toggleSection);
            sectionTitle.addEventListener('keydown', (e) => {
                if (['Enter', ' '].includes(e.key)) {
                    e.preventDefault();
                    toggleSection.call(sectionTitle);
                }
            });
            
            playlistsContainer.appendChild(sectionTitle);
            
            const sectionContainer = document.createElement('div');
            sectionContainer.id = sectionId;
            sectionContainer.className = 'playlists-section';
            sectionContainer.dataset.type = type;
            
            sectionContainer.innerHTML = typePlaylists.map(playlist => `
                <div class="playlist-card" data-embed="${encodeURIComponent(playlist.embed)}">
                    <div class="playlist-info">
                        <h3 class="playlist-name" title="${playlist.name}">
                            ${playlist.name || 'Untitled Playlist'}
                        </h3>
                        <a href="${getPlaylistUrl(playlist.embed)}" target="_blank" 
                           rel="noopener noreferrer" class="playlist-link" data-type="${playlist.type}">
                            <img src="${getLogoPath(playlist.type)}" 
                                 alt="Open in ${playlist.type === 'spotify' ? 'Spotify' : 'Apple Music'}" 
                                 class="streaming-logo">
                        </a>
                    </div>
                    <div class="playlist-embed-placeholder"></div>
                </div>
            `).join('');
            
            playlistsContainer.appendChild(sectionContainer);

            setTimeout(() => {
                loadVisibleEmbeds(sectionContainer);
            }, 0);
        });
        setupIntersectionObserver();
    }

    function getLogoPath(type) {
        return type === 'spotify' ? 
            '../assets/spotify-button.png' : 
            '../assets/apple-music.png';
    }

    function getPlaylistUrl(embed) {
        const urlMatch = embed.match(/src=["']([^"']+)["']/);
        return urlMatch ? urlMatch[1] : '#';
    }

    function setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const placeholder = entry.target;
                    const playlistCard = placeholder.closest('.playlist-card');
                    const embedHtml = decodeURIComponent(playlistCard.dataset.embed);
                    placeholder.outerHTML = `<div class="playlist-embed">${embedHtml}</div>`;
                    observer.unobserve(placeholder);
                }
            });
        }, {
            rootMargin: '200px',
            threshold: 0.1
        });

        document.querySelectorAll('.playlist-embed-placeholder').forEach(placeholder => {
            observer.observe(placeholder);
        });
    }

    function loadVisibleEmbeds(container) {
        const placeholders = container ? 
            container.querySelectorAll('.playlist-embed-placeholder') : 
            document.querySelectorAll('.playlist-embed-placeholder');
        
        placeholders.forEach(placeholder => {
            const rect = placeholder.getBoundingClientRect();
            if (rect.top < window.innerHeight + 200 && rect.bottom > -200) {
                const playlistCard = placeholder.closest('.playlist-card');
                const embedHtml = decodeURIComponent(playlistCard.dataset.embed);
                placeholder.outerHTML = `<div class="playlist-embed">${embedHtml}</div>`;
            }
        });
    }

    function toggleSection() {
        const sectionId = this.getAttribute('aria-controls');
        const section = document.getElementById(sectionId);
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        
        this.setAttribute('aria-expanded', !isExpanded);
        this.classList.toggle('collapsed');
        
        if (section) {
            section.classList.toggle('collapsed');
            
            if (!isExpanded) {
                section.style.visibility = 'visible';
                setTimeout(() => loadVisibleEmbeds(section), 50);
            } else {
                section.addEventListener('transitionend', function handler() {
                    if (section.classList.contains('collapsed')) {
                        section.style.visibility = 'hidden';
                    }
                    section.removeEventListener('transitionend', handler);
                });
            }
            
            if (!isExpanded) {
                setTimeout(() => {
                    this.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 10);
            }
        }
    }
});