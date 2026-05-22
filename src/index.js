document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    
    const playlistsContainer = document.getElementById('playlists-container');
    const totalPlaylistsEl = document.getElementById('total-playlists');
    
    fetch('src/playlist.json')
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
            
            if (totalPlaylistsEl) {
                totalPlaylistsEl.textContent = `${playlists.length} playlists`;
            }
            
            renderPlaylists(playlists);
        })
        .catch(error => {
            console.error('Error loading playlists:', error);
            playlistsContainer.innerHTML = `
                <div class="playlist-card">
                    <div class="playlist-name">Failed to load playlists</div>
                </div>`;
        });
});

function initParticles() {
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 100;
    
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height - canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedY = Math.random() * 0.5 + 0.2;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.fadeSpeed = Math.random() * 0.01 + 0.005;
            this.fadingIn = true;
        }
        
        update() {
            this.y += this.speedY;
            
            if (this.fadingIn) {
                this.opacity += this.fadeSpeed;
                if (this.opacity >= 0.7) {
                    this.fadingIn = false;
                }
            } else {
                this.opacity -= this.fadeSpeed;
                if (this.opacity <= 0.2) {
                    this.fadingIn = true;
                }
            }
            
            if (this.y > canvas.height) {
                this.reset();
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.fill();
        }
    }
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

function renderPlaylists(playlists) {
    const playlistsContainer = document.getElementById('playlists-container');
    
    if (!playlists || !Array.isArray(playlists) || playlists.length === 0) {
        playlistsContainer.innerHTML = `
            <div class="playlist-item">
                <div class="playlist-info">
                    <div class="playlist-name">No playlists found</div>
                </div>
            </div>`;
        return;
    }

    const groupedPlaylists = playlists.reduce((acc, playlist) => {
        const category = playlist.category || 'General';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(playlist);
        return acc;
    }, {});

    Object.keys(groupedPlaylists).forEach(category => {
        groupedPlaylists[category].sort((a, b) => a.name.localeCompare(b.name, undefined, {
            sensitivity: 'base',
            ignorePunctuation: true,
            numeric: true
        }));
    });

    const sortedCategories = Object.keys(groupedPlaylists).sort((a, b) => a.localeCompare(b));

    let html = '';
    sortedCategories.forEach((category, index) => {
        const categoryPlaylists = groupedPlaylists[category];
        const categoryId = `category-${index}`;
        
        html += `
            <div class="category-header" data-category="${categoryId}">
                <span class="category-name">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span class="category-count">${categoryPlaylists.length}</span>
                    <span class="category-arrow">▼</span>
                </div>
            </div>
            <div class="category-playlists" id="${categoryId}">
                ${categoryPlaylists.map(playlist => {
                    const playlistUrl = getPlaylistUrl(playlist.embed);
                    const typeLabel = playlist.type === 'spotify' ? 'Spotify' : 'Apple Music';
                    
                    return `
                        <a href="${playlistUrl}" target="_blank" rel="noopener noreferrer" class="playlist-item" style="text-decoration: none;">
                            <div class="playlist-info">
                                <div class="playlist-name">${playlist.name || 'Untitled Playlist'}</div>
                            </div>
                            <div class="playlist-meta">
                                <span class="playlist-type">${typeLabel}</span>
                                <span class="playlist-arrow">→</span>
                            </div>
                        </a>
                    `;
                }).join('')}
            </div>
        `;
    });

    playlistsContainer.innerHTML = html;

    document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', () => {
            const categoryId = header.dataset.category;
            const playlistSection = document.getElementById(categoryId);
            
            header.classList.toggle('active');
            playlistSection.classList.toggle('active');
        });
    });
}

function getPlaylistUrl(embed) {
    const urlMatch = embed.match(/src=["']([^"']+)["']/);
    return urlMatch ? urlMatch[1] : '#';
}