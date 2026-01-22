/**
 * Avatar System - Anime & Ghibli Style SVG Avatars
 */

const AvatarSystem = {
    // Anime Style Avatars (vibrant colors, big eyes)
    anime: [
        {
            id: 'anime-girl-1',
            name: 'Sakura',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="hair1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#FF6B9D"/>
                        <stop offset="100%" style="stop-color:#C44569"/>
                    </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="48" fill="#FFE4C4"/>
                <ellipse cx="50" cy="25" rx="40" ry="25" fill="url(#hair1)"/>
                <path d="M15 30 Q10 60 25 75" fill="url(#hair1)"/>
                <path d="M85 30 Q90 60 75 75" fill="url(#hair1)"/>
                <ellipse cx="35" cy="50" rx="8" ry="10" fill="white"/>
                <ellipse cx="65" cy="50" rx="8" ry="10" fill="white"/>
                <circle cx="35" cy="52" r="5" fill="#4A4A4A"/>
                <circle cx="65" cy="52" r="5" fill="#4A4A4A"/>
                <circle cx="37" cy="50" r="2" fill="white"/>
                <circle cx="67" cy="50" r="2" fill="white"/>
                <ellipse cx="28" cy="58" rx="6" ry="3" fill="#FFB6C1" opacity="0.6"/>
                <ellipse cx="72" cy="58" rx="6" ry="3" fill="#FFB6C1" opacity="0.6"/>
                <path d="M45 68 Q50 73 55 68" stroke="#E8A0A0" stroke-width="2" fill="none"/>
            </svg>`
        },
        {
            id: 'anime-boy-1',
            name: 'Ryu',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="hair2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#5352ED"/>
                        <stop offset="100%" style="stop-color:#3742FA"/>
                    </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="48" fill="#FFE4C4"/>
                <ellipse cx="50" cy="22" rx="38" ry="22" fill="url(#hair2)"/>
                <path d="M20 25 L15 45 L30 35 Z" fill="url(#hair2)"/>
                <path d="M80 25 L85 45 L70 35 Z" fill="url(#hair2)"/>
                <ellipse cx="35" cy="50" rx="7" ry="9" fill="white"/>
                <ellipse cx="65" cy="50" rx="7" ry="9" fill="white"/>
                <circle cx="35" cy="52" r="4" fill="#2C3E50"/>
                <circle cx="65" cy="52" r="4" fill="#2C3E50"/>
                <circle cx="37" cy="50" r="1.5" fill="white"/>
                <circle cx="67" cy="50" r="1.5" fill="white"/>
                <path d="M43 70 Q50 74 57 70" stroke="#D4A574" stroke-width="2" fill="none"/>
            </svg>`
        },
        {
            id: 'anime-girl-2',
            name: 'Yuki',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="hair3" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#00D2D3"/>
                        <stop offset="100%" style="stop-color:#0097A7"/>
                    </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="48" fill="#FFF0E6"/>
                <ellipse cx="50" cy="20" rx="42" ry="20" fill="url(#hair3)"/>
                <path d="M10 35 Q5 65 20 80" fill="url(#hair3)"/>
                <path d="M90 35 Q95 65 80 80" fill="url(#hair3)"/>
                <ellipse cx="35" cy="48" rx="9" ry="11" fill="white"/>
                <ellipse cx="65" cy="48" rx="9" ry="11" fill="white"/>
                <circle cx="35" cy="50" r="5" fill="#1ABC9C"/>
                <circle cx="65" cy="50" r="5" fill="#1ABC9C"/>
                <circle cx="37" cy="48" r="2" fill="white"/>
                <circle cx="67" cy="48" r="2" fill="white"/>
                <ellipse cx="30" cy="58" rx="5" ry="2.5" fill="#FFDAB9" opacity="0.7"/>
                <ellipse cx="70" cy="58" rx="5" ry="2.5" fill="#FFDAB9" opacity="0.7"/>
                <path d="M44 68 Q50 72 56 68" stroke="#E8A0A0" stroke-width="2" fill="none"/>
            </svg>`
        },
        {
            id: 'anime-boy-2',
            name: 'Kai',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="hair4" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#FFA502"/>
                        <stop offset="100%" style="stop-color:#E67E22"/>
                    </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="48" fill="#FFE4C4"/>
                <ellipse cx="50" cy="23" rx="36" ry="23" fill="url(#hair4)"/>
                <path d="M25 20 L18 40 L35 30 Z" fill="url(#hair4)"/>
                <path d="M75 20 L82 40 L65 30 Z" fill="url(#hair4)"/>
                <path d="M50 15 L45 35 L55 35 Z" fill="url(#hair4)"/>
                <ellipse cx="35" cy="50" rx="7" ry="8" fill="white"/>
                <ellipse cx="65" cy="50" rx="7" ry="8" fill="white"/>
                <circle cx="35" cy="51" r="4" fill="#8B4513"/>
                <circle cx="65" cy="51" r="4" fill="#8B4513"/>
                <circle cx="37" cy="49" r="1.5" fill="white"/>
                <circle cx="67" cy="49" r="1.5" fill="white"/>
                <path d="M42 70 Q50 75 58 70" stroke="#D4A574" stroke-width="2.5" fill="none"/>
            </svg>`
        },
        {
            id: 'anime-girl-3',
            name: 'Hana',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="hair5" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#9B59B6"/>
                        <stop offset="100%" style="stop-color:#8E44AD"/>
                    </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="48" fill="#FFF5EE"/>
                <ellipse cx="50" cy="18" rx="44" ry="20" fill="url(#hair5)"/>
                <ellipse cx="20" cy="50" rx="12" ry="30" fill="url(#hair5)"/>
                <ellipse cx="80" cy="50" rx="12" ry="30" fill="url(#hair5)"/>
                <ellipse cx="35" cy="48" rx="8" ry="10" fill="white"/>
                <ellipse cx="65" cy="48" rx="8" ry="10" fill="white"/>
                <circle cx="35" cy="50" r="5" fill="#9B59B6"/>
                <circle cx="65" cy="50" r="5" fill="#9B59B6"/>
                <circle cx="37" cy="48" r="2" fill="white"/>
                <circle cx="67" cy="48" r="2" fill="white"/>
                <ellipse cx="28" cy="56" rx="5" ry="2.5" fill="#FFB6C1" opacity="0.6"/>
                <ellipse cx="72" cy="56" rx="5" ry="2.5" fill="#FFB6C1" opacity="0.6"/>
                <path d="M45 66 Q50 70 55 66" stroke="#E8A0A0" stroke-width="2" fill="none"/>
                <circle cx="25" cy="25" r="4" fill="#FFD700"/>
                <circle cx="75" cy="25" r="4" fill="#FFD700"/>
            </svg>`
        },
        {
            id: 'anime-boy-3',
            name: 'Sora',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="hair6" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#2ED573"/>
                        <stop offset="100%" style="stop-color:#16A085"/>
                    </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="48" fill="#FFE4C4"/>
                <ellipse cx="50" cy="22" rx="35" ry="22" fill="url(#hair6)"/>
                <path d="M22 28 Q15 20 25 15 L35 30 Z" fill="url(#hair6)"/>
                <path d="M78 28 Q85 20 75 15 L65 30 Z" fill="url(#hair6)"/>
                <ellipse cx="35" cy="50" rx="6" ry="8" fill="white"/>
                <ellipse cx="65" cy="50" rx="6" ry="8" fill="white"/>
                <circle cx="35" cy="51" r="4" fill="#27AE60"/>
                <circle cx="65" cy="51" r="4" fill="#27AE60"/>
                <circle cx="37" cy="49" r="1.5" fill="white"/>
                <circle cx="67" cy="49" r="1.5" fill="white"/>
                <path d="M43 68 Q50 73 57 68" stroke="#D4A574" stroke-width="2" fill="none"/>
            </svg>`
        },
        {
            id: 'anime-girl-4',
            name: 'Miku',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="hair7" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#00CED1"/>
                        <stop offset="100%" style="stop-color:#20B2AA"/>
                    </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="48" fill="#FFF0E6"/>
                <ellipse cx="50" cy="15" rx="40" ry="18" fill="url(#hair7)"/>
                <path d="M12 25 Q0 70 15 95" fill="url(#hair7)"/>
                <path d="M88 25 Q100 70 85 95" fill="url(#hair7)"/>
                <ellipse cx="35" cy="48" rx="9" ry="11" fill="white"/>
                <ellipse cx="65" cy="48" rx="9" ry="11" fill="white"/>
                <circle cx="35" cy="50" r="6" fill="#00CED1"/>
                <circle cx="65" cy="50" r="6" fill="#00CED1"/>
                <circle cx="38" cy="47" r="2.5" fill="white"/>
                <circle cx="68" cy="47" r="2.5" fill="white"/>
                <ellipse cx="28" cy="56" rx="5" ry="2" fill="#FFB6C1" opacity="0.5"/>
                <ellipse cx="72" cy="56" rx="5" ry="2" fill="#FFB6C1" opacity="0.5"/>
                <path d="M44 66 Q50 71 56 66" stroke="#E8A0A0" stroke-width="2" fill="none"/>
            </svg>`
        },
        {
            id: 'anime-boy-4',
            name: 'Takeshi',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="hair8" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#FF4757"/>
                        <stop offset="100%" style="stop-color:#C0392B"/>
                    </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="48" fill="#FFE4C4"/>
                <ellipse cx="50" cy="20" rx="38" ry="22" fill="url(#hair8)"/>
                <path d="M18 30 L10 20 L30 28 Z" fill="url(#hair8)"/>
                <path d="M82 30 L90 20 L70 28 Z" fill="url(#hair8)"/>
                <ellipse cx="35" cy="50" rx="7" ry="9" fill="white"/>
                <ellipse cx="65" cy="50" rx="7" ry="9" fill="white"/>
                <circle cx="35" cy="51" r="4.5" fill="#C0392B"/>
                <circle cx="65" cy="51" r="4.5" fill="#C0392B"/>
                <circle cx="37" cy="49" r="1.5" fill="white"/>
                <circle cx="67" cy="49" r="1.5" fill="white"/>
                <path d="M42 70 Q50 74 58 70" stroke="#D4A574" stroke-width="2" fill="none"/>
            </svg>`
        }
    ],

    // Ghibli Style Avatars (soft, pastel, whimsical)
    ghibli: [
        {
            id: 'ghibli-girl-1',
            name: 'Chihiro',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="ghair1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#8B6F47"/>
                        <stop offset="100%" style="stop-color:#6B4423"/>
                    </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="48" fill="#FFECD2"/>
                <ellipse cx="50" cy="20" rx="38" ry="22" fill="url(#ghair1)"/>
                <path d="M15 35 Q10 55 18 70" fill="url(#ghair1)"/>
                <path d="M85 35 Q90 55 82 70" fill="url(#ghair1)"/>
                <ellipse cx="35" cy="50" rx="5" ry="6" fill="#4A4A4A"/>
                <ellipse cx="65" cy="50" rx="5" ry="6" fill="#4A4A4A"/>
                <circle cx="36" cy="49" r="1.5" fill="white"/>
                <circle cx="66" cy="49" r="1.5" fill="white"/>
                <ellipse cx="30" cy="56" rx="6" ry="3" fill="#FFCCCB" opacity="0.5"/>
                <ellipse cx="70" cy="56" rx="6" ry="3" fill="#FFCCCB" opacity="0.5"/>
                <path d="M45 66 Q50 70 55 66" stroke="#D4A574" stroke-width="1.5" fill="none"/>
                <circle cx="70" cy="25" r="5" fill="#E74C3C"/>
            </svg>`
        },
        {
            id: 'ghibli-boy-1',
            name: 'Haku',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="ghair2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#2C3E50"/>
                        <stop offset="100%" style="stop-color:#1A252F"/>
                    </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="48" fill="#F5E6D3"/>
                <ellipse cx="50" cy="18" rx="42" ry="22" fill="url(#ghair2)"/>
                <path d="M10 30 Q5 60 15 85" fill="url(#ghair2)"/>
                <path d="M90 30 Q95 60 85 85" fill="url(#ghair2)"/>
                <ellipse cx="35" cy="50" rx="5" ry="6" fill="#2ECC71"/>
                <ellipse cx="65" cy="50" rx="5" ry="6" fill="#2ECC71"/>
                <circle cx="36" cy="48" r="1.5" fill="white"/>
                <circle cx="66" cy="48" r="1.5" fill="white"/>
                <path d="M44 68 Q50 72 56 68" stroke="#D4A574" stroke-width="1.5" fill="none"/>
            </svg>`
        },
        {
            id: 'ghibli-girl-2',
            name: 'Ponyo',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="ghair3" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#E74C3C"/>
                        <stop offset="100%" style="stop-color:#C0392B"/>
                    </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="48" fill="#FFEAA7"/>
                <circle cx="50" cy="30" r="30" fill="url(#ghair3)"/>
                <ellipse cx="35" cy="52" rx="6" ry="7" fill="#4A4A4A"/>
                <ellipse cx="65" cy="52" rx="6" ry="7" fill="#4A4A4A"/>
                <circle cx="37" cy="50" r="2" fill="white"/>
                <circle cx="67" cy="50" r="2" fill="white"/>
                <ellipse cx="30" cy="60" rx="7" ry="4" fill="#FFCCCB" opacity="0.6"/>
                <ellipse cx="70" cy="60" rx="7" ry="4" fill="#FFCCCB" opacity="0.6"/>
                <ellipse cx="50" cy="70" rx="8" ry="5" fill="#E74C3C"/>
            </svg>`
        },
        {
            id: 'ghibli-creature-1',
            name: 'Totoro',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="50" cy="55" rx="45" ry="40" fill="#7D7D7D"/>
                <ellipse cx="50" cy="70" rx="30" ry="20" fill="#F5F5DC"/>
                <ellipse cx="30" cy="15" rx="12" ry="18" fill="#7D7D7D"/>
                <ellipse cx="70" cy="15" rx="12" ry="18" fill="#7D7D7D"/>
                <ellipse cx="35" cy="45" rx="10" ry="12" fill="white"/>
                <ellipse cx="65" cy="45" rx="10" ry="12" fill="white"/>
                <circle cx="35" cy="47" r="5" fill="#2C3E50"/>
                <circle cx="65" cy="47" r="5" fill="#2C3E50"/>
                <ellipse cx="50" cy="55" rx="5" ry="3" fill="#2C3E50"/>
                <path d="M30 65 Q50 80 70 65" stroke="#7D7D7D" stroke-width="3" fill="none"/>
                <line x1="20" y1="55" x2="5" y2="50" stroke="#4A4A4A" stroke-width="2"/>
                <line x1="80" y1="55" x2="95" y2="50" stroke="#4A4A4A" stroke-width="2"/>
            </svg>`
        },
        {
            id: 'ghibli-girl-3',
            name: 'Kiki',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="ghair4" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#1A1A2E"/>
                        <stop offset="100%" style="stop-color:#16213E"/>
                    </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="48" fill="#FFECD2"/>
                <ellipse cx="50" cy="22" rx="35" ry="22" fill="url(#ghair4)"/>
                <path d="M18 35 Q15 50 20 65" fill="url(#ghair4)"/>
                <path d="M82 35 Q85 50 80 65" fill="url(#ghair4)"/>
                <ellipse cx="50" cy="8" rx="25" ry="8" fill="#E74C3C"/>
                <path d="M25 8 Q50 -5 75 8" fill="#E74C3C"/>
                <ellipse cx="35" cy="50" rx="5" ry="6" fill="#2C3E50"/>
                <ellipse cx="65" cy="50" rx="5" ry="6" fill="#2C3E50"/>
                <circle cx="36" cy="48" r="1.5" fill="white"/>
                <circle cx="66" cy="48" r="1.5" fill="white"/>
                <path d="M45 68 Q50 72 55 68" stroke="#D4A574" stroke-width="1.5" fill="none"/>
            </svg>`
        },
        {
            id: 'ghibli-boy-2',
            name: 'Ashitaka',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="ghair5" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#5D4E37"/>
                        <stop offset="100%" style="stop-color:#3E3226"/>
                    </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="48" fill="#F5E6D3"/>
                <ellipse cx="50" cy="20" rx="35" ry="20" fill="url(#ghair5)"/>
                <path d="M20 25 L15 45 L32 35 Z" fill="url(#ghair5)"/>
                <path d="M80 25 L85 45 L68 35 Z" fill="url(#ghair5)"/>
                <rect x="35" y="5" width="30" height="15" rx="5" fill="#E74C3C"/>
                <ellipse cx="35" cy="50" rx="5" ry="6" fill="#4A4A4A"/>
                <ellipse cx="65" cy="50" rx="5" ry="6" fill="#4A4A4A"/>
                <circle cx="36" cy="48" r="1.5" fill="white"/>
                <circle cx="66" cy="48" r="1.5" fill="white"/>
                <path d="M44 68 Q50 72 56 68" stroke="#D4A574" stroke-width="1.5" fill="none"/>
            </svg>`
        },
        {
            id: 'ghibli-creature-2',
            name: 'No-Face',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="50" cy="50" rx="35" ry="45" fill="#1A1A2E"/>
                <ellipse cx="50" cy="50" rx="25" ry="35" fill="white" opacity="0.9"/>
                <ellipse cx="38" cy="40" rx="6" ry="8" fill="#1A1A2E"/>
                <ellipse cx="62" cy="40" rx="6" ry="8" fill="#1A1A2E"/>
                <ellipse cx="50" cy="60" rx="10" ry="5" fill="#1A1A2E"/>
                <line x1="30" y1="55" x2="38" y2="55" stroke="#9B59B6" stroke-width="3"/>
                <line x1="62" y1="55" x2="70" y2="55" stroke="#9B59B6" stroke-width="3"/>
            </svg>`
        },
        {
            id: 'ghibli-girl-4',
            name: 'San',
            svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="ghair6" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#2C3E50"/>
                        <stop offset="100%" style="stop-color:#1A252F"/>
                    </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="48" fill="#F5E6D3"/>
                <ellipse cx="50" cy="18" rx="40" ry="20" fill="url(#ghair6)"/>
                <path d="M12 30 Q8 55 15 75" fill="url(#ghair6)"/>
                <path d="M88 30 Q92 55 85 75" fill="url(#ghair6)"/>
                <ellipse cx="35" cy="50" rx="5" ry="6" fill="#4A4A4A"/>
                <ellipse cx="65" cy="50" rx="5" ry="6" fill="#4A4A4A"/>
                <circle cx="36" cy="48" r="1.5" fill="white"/>
                <circle cx="66" cy="48" r="1.5" fill="white"/>
                <path d="M35 65 L40 60 L45 65" stroke="#E74C3C" stroke-width="2" fill="none"/>
                <path d="M55 65 L60 60 L65 65" stroke="#E74C3C" stroke-width="2" fill="none"/>
                <path d="M45 70 Q50 73 55 70" stroke="#D4A574" stroke-width="1.5" fill="none"/>
                <circle cx="25" cy="15" rx="8" ry="10" fill="white" stroke="#E74C3C" stroke-width="2"/>
                <circle cx="75" cy="15" rx="8" ry="10" fill="white" stroke="#E74C3C" stroke-width="2"/>
            </svg>`
        }
    ],

    // Get all avatars
    getAll() {
        return [...this.anime, ...this.ghibli];
    },

    // Get avatars by style
    getByStyle(style) {
        return this[style] || [];
    },

    // Get avatar by ID
    getById(id) {
        return this.getAll().find(a => a.id === id);
    },

    // Get random avatar
    getRandom(style = null) {
        const avatars = style ? this.getByStyle(style) : this.getAll();
        return avatars[Math.floor(Math.random() * avatars.length)];
    },

    // Render avatar HTML
    render(avatarId, size = 'md', extraClass = '') {
        const avatar = this.getById(avatarId);
        if (!avatar) {
            return `<div class="avatar avatar-${size} ${extraClass}" style="background: linear-gradient(135deg, var(--primary-400), var(--secondary-400));">
                <span class="avatar-fallback">?</span>
            </div>`;
        }
        return `<div class="avatar avatar-${size} ${extraClass}" title="${avatar.name}">
            ${avatar.svg}
        </div>`;
    },

    // Render avatar with fallback (letter)
    renderWithFallback(avatarId, name, size = 'md', extraClass = '') {
        const avatar = this.getById(avatarId);
        if (!avatar) {
            const initial = name ? name.charAt(0).toUpperCase() : '?';
            const colorIndex = name ? name.charCodeAt(0) % 8 + 1 : 1;
            return `<div class="avatar avatar-${size} avatar-anime-${colorIndex} ${extraClass}">
                <span class="avatar-fallback">${initial}</span>
            </div>`;
        }
        return this.render(avatarId, size, extraClass);
    },

    // Initialize avatar picker
    initPicker(containerId, onSelect, selectedId = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = `
            <div class="mb-3">
                <h6 class="mb-2"><i class="fas fa-palette me-2"></i>Anime Style</h6>
                <div class="avatar-picker">
                    ${this.anime.map(a => `
                        <div class="avatar-picker-item avatar avatar-lg ${selectedId === a.id ? 'selected' : ''}"
                             data-avatar-id="${a.id}" title="${a.name}">
                            ${a.svg}
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="mb-3">
                <h6 class="mb-2"><i class="fas fa-leaf me-2"></i>Ghibli Style</h6>
                <div class="avatar-picker">
                    ${this.ghibli.map(a => `
                        <div class="avatar-picker-item avatar avatar-lg ${selectedId === a.id ? 'selected' : ''}"
                             data-avatar-id="${a.id}" title="${a.name}">
                            ${a.svg}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Add click handlers
        container.querySelectorAll('.avatar-picker-item').forEach(item => {
            item.addEventListener('click', function() {
                container.querySelectorAll('.avatar-picker-item').forEach(i => i.classList.remove('selected'));
                this.classList.add('selected');
                if (onSelect) onSelect(this.dataset.avatarId);
            });
        });
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AvatarSystem;
}
