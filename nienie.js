// DOM Elements
const envelope = document.getElementById('envelope');
const stamp1 = document.getElementById('stamp1');
const stamp2 = document.getElementById('stamp2');
const petButton = document.getElementById('petButton');
const petButtonPepper = document.getElementById('petButtonPepper');
const musicToggle = document.getElementById('musicToggle');
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleBtn');
const navLinks = document.querySelectorAll('.nav-link');
const pageContents = document.querySelectorAll('.page-content');

// State Variables
let isOpen = false;
let backgroundAudio = null;
let isMusicPlaying = false;
let currentPage = 'home';
let currentTrackIndex = 0;
let currentPlaylistIndex = 0;

// ===== PLAYLISTS =====
// Para magdagdag ng bagong playlist: kopyahin ang isa sa mga object sa ibaba,
// palitan ang name, cover emoji, at tracks array.
// Para magdagdag ng track: { title, artist, emoji, src } — src ay path sa mp3 file.
const playlists = [
    {
        name: "site og",
        cover: "🏠",
        tracks: [
            { title: "Adorable Home OST",   artist: "Adorable Home",  emoji: "🏠", src: "mp3/adorable.mp3"  },
            { title: "Track 2",             artist: "Artist",          emoji: "🌸", src: "mp3/track2.mp3"    },
            { title: "Track 3",             artist: "Artist",          emoji: "🌙", src: "mp3/track3.mp3"    },
        ]
    },
    {
        name: "chupa chups sour belt",
        cover: "💌",
        tracks: [
            { title: "Song Title",          artist: "Artist",          emoji: "💌", src: "mp3/song1.mp3"     },
            { title: "Song Title 2",        artist: "Artist",          emoji: "🌷", src: "mp3/song2.mp3"     },
        ]
    },
    {
        name: "...",
        cover: ☁️",
        tracks: [
            { title: "Chill Song",          artist: "Artist",          emoji: "☁️", src: "mp3/chill1.mp3"   },
            { title: "Another One",         artist: "Artist",          emoji: "🍵", src: "mp3/chill2.mp3"   },
        ]
    },
];

// ===== HELPERS =====
function fmtTime(s) {
    if (!s || isNaN(s)) return '0:00';
    return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
}

function currentTracks() {
    return playlists[currentPlaylistIndex].tracks;
}

// ===== INITIALIZE BACKGROUND MUSIC =====
function initializeBackgroundMusic() {
    backgroundAudio = new Audio(currentTracks()[0].src);
    backgroundAudio.loop = false;
    backgroundAudio.volume = 0.3;

    backgroundAudio.addEventListener('playing', () => {
        isMusicPlaying = true;
        updateMusicToggle();
        updatePlayPauseBtn();
    });

    backgroundAudio.addEventListener('pause', () => {
        isMusicPlaying = false;
        updateMusicToggle();
        updatePlayPauseBtn();
    });

    backgroundAudio.addEventListener('ended', () => {
        const tracks = currentTracks();
        loadTrack((currentTrackIndex + 1) % tracks.length, true);
    });

    backgroundAudio.addEventListener('timeupdate', updateProgress);

    const playPromise = backgroundAudio.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            isMusicPlaying = true;
            updateMusicToggle();
            updatePlayPauseBtn();
        }).catch(() => {
            isMusicPlaying = false;
            updateMusicToggle();
            updatePlayPauseBtn();
            musicToggle.style.animation = 'pulse 1s infinite';
        });
    }

    renderPlaylists();
    renderTracklist();
    updateNowPlaying();
}

// ===== RENDER PLAYLISTS (left sidebar) =====
function renderPlaylists() {
    const list = document.getElementById('playlistList');
    if (!list) return;
    list.innerHTML = playlists.map((pl, i) => `
        <div class="sp-pl-item ${i === currentPlaylistIndex ? 'active' : ''}" onclick="switchPlaylist(${i})">
            <div class="sp-pl-icon">${pl.cover}</div>
            <div class="sp-pl-info">
                <div class="sp-pl-name">${pl.name}</div>
                <div class="sp-pl-tracks">${pl.tracks.length} songs</div>
            </div>
        </div>
    `).join('');
}

// ===== SWITCH PLAYLIST =====
function switchPlaylist(index) {
    currentPlaylistIndex = index;
    currentTrackIndex = 0;
    renderPlaylists();
    renderTracklist();
    loadTrack(0, true);
}

// ===== RENDER TRACKLIST (center) =====
function renderTracklist() {
    const list = document.getElementById('tracklist');
    if (!list) return;
    const tracks = currentTracks();
    list.innerHTML = tracks.map((t, i) => `
        <div class="sp-track-item ${i === currentTrackIndex ? 'active' : ''}" onclick="loadTrack(${i}, true)">
            <span class="sp-track-num">${i === currentTrackIndex ? '' : i + 1}</span>
            ${i === currentTrackIndex ? `
                <div class="sp-playing-anim">
                    <span></span><span></span><span></span>
                </div>` : `<span class="sp-track-emoji">${t.emoji}</span>`
            }
            <div class="sp-track-info">
                <div class="sp-track-name">${t.title}</div>
                <div class="sp-track-artist-name">${t.artist}</div>
            </div>
        </div>
    `).join('');

    const pl = playlists[currentPlaylistIndex];
    const nameEl  = document.getElementById('playlistName');
    const countEl = document.getElementById('playlistCount');
    const coverEl = document.getElementById('playlistCover');
    if (nameEl)  nameEl.textContent  = pl.name;
    if (countEl) countEl.textContent = pl.tracks.length + ' songs';
    if (coverEl) coverEl.textContent = pl.cover;
}

// ===== UPDATE NOW PLAYING (right panel) =====
function updateNowPlaying() {
    const t = currentTracks()[currentTrackIndex];
    const npArt    = document.getElementById('npArt');
    const npTitle  = document.getElementById('npTitle');
    const npArtist = document.getElementById('npArtist');
    if (npArt)    npArt.textContent    = t.emoji;
    if (npTitle)  npTitle.textContent  = t.title;
    if (npArtist) npArtist.textContent = t.artist;
}

// ===== LOAD TRACK =====
function loadTrack(index, autoplay = true) {
    currentTrackIndex = index;
    const t = currentTracks()[index];
    backgroundAudio.src = t.src;
    updateNowPlaying();
    renderTracklist();
    if (autoplay) {
        backgroundAudio.play().catch(e => console.log(e));
        isMusicPlaying = true;
        updateMusicToggle();
        updatePlayPauseBtn();
    }
}

// ===== PROGRESS BAR =====
function updateProgress() {
    const fill  = document.getElementById('progressFill');
    const thumb = document.getElementById('progressThumb');
    const curr  = document.getElementById('currentTime');
    const total = document.getElementById('totalTime');
    if (!fill) return;
    const pct = (backgroundAudio.currentTime / backgroundAudio.duration) * 100 || 0;
    fill.style.width = pct + '%';
    if (thumb) thumb.style.left = pct + '%';
    if (curr)  curr.textContent  = fmtTime(backgroundAudio.currentTime);
    if (total) total.textContent = fmtTime(backgroundAudio.duration);
}

// ===== PLAY/PAUSE BUTTON ICON =====
function updatePlayPauseBtn() {
    const btn = document.getElementById('playPauseBtn');
    if (btn) btn.textContent = isMusicPlaying ? '⏸' : '▶';
}

// ===== UPDATE MUSIC TOGGLE =====
function updateMusicToggle() {
    musicToggle.textContent = isMusicPlaying ? '🔊' : '🔇';
}

// ===== MUSIC TOGGLE BUTTON =====
musicToggle.addEventListener('click', () => {
    if (!backgroundAudio) return;
    musicToggle.style.animation = 'none';
    if (isMusicPlaying) {
        backgroundAudio.pause();
        isMusicPlaying = false;
    } else {
        backgroundAudio.play().catch(e => console.log('Play failed:', e));
        isMusicPlaying = true;
    }
    updateMusicToggle();
    updatePlayPauseBtn();
});

// ===== PLAYER CONTROLS =====
document.addEventListener('click', (e) => {
    if (e.target.id === 'playPauseBtn') {
        if (isMusicPlaying) {
            backgroundAudio.pause();
        } else {
            backgroundAudio.play().catch(err => console.log(err));
        }
    }
    const tracks = currentTracks();
    if (e.target.id === 'nextBtn') loadTrack((currentTrackIndex + 1) % tracks.length, true);
    if (e.target.id === 'prevBtn') loadTrack((currentTrackIndex - 1 + tracks.length) % tracks.length, true);
});

document.addEventListener('input', (e) => {
    if (e.target.id === 'volumeSlider' && backgroundAudio) {
        backgroundAudio.volume = e.target.value;
    }
});

document.addEventListener('click', (e) => {
    const bar = document.getElementById('progressBar');
    if (bar && (e.target === bar || e.target === document.getElementById('progressFill'))) {
        const rect = bar.getBoundingClientRect();
        backgroundAudio.currentTime = ((e.clientX - rect.left) / rect.width) * backgroundAudio.duration;
    }
});

// ===== SIDEBAR TOGGLE =====
toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('expanded');
    toggleBtn.textContent = sidebar.classList.contains('expanded') ? '✕' : '☰';
});

// ===== NAVIGATION =====
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');

        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        pageContents.forEach(content => content.classList.remove('active'));
        document.getElementById(page).classList.add('active');

        currentPage = page;

        if (window.innerWidth <= 768) {
            sidebar.classList.remove('expanded');
            toggleBtn.textContent = '☰';
        }
    });
});

// ===== STAMP SOUND =====
function playStampSound() {
    const stampAudio = new Audio('mp3/meow.mp3');
    stampAudio.volume = 0.5;
    stampAudio.play().catch(e => console.log('Stamp sound not available:', e));
}

// ===== STAMPS =====
stamp1.addEventListener('click', (e) => {
    e.stopPropagation();
    playStampSound();
    petButtonPepper.classList.add('show');
    setTimeout(() => petButtonPepper.classList.remove('show'), 3000);
});

stamp2.addEventListener('click', (e) => {
    e.stopPropagation();
    playStampSound();
    petButton.classList.add('show');
    setTimeout(() => petButton.classList.remove('show'), 3000);
});

// ===== PET BUTTONS =====
petButton.addEventListener('click', (e) => {
    e.stopPropagation();
    playStampSound();
    petButton.textContent = '😻 Pipper purrs! 😻';
    setTimeout(() => { petButton.textContent = 'dont touch cosmo!'; }, 1000);
});

petButtonPepper.addEventListener('click', (e) => {
    e.stopPropagation();
    playStampSound();
    petButtonPepper.textContent = '😻 Pepper purrs! 😻';
    setTimeout(() => { petButtonPepper.textContent = 'pet pipper!'; }, 1000);
});

// ===== ENVELOPE =====
envelope.addEventListener('click', (e) => {
    if (e.target === stamp1 || e.target === stamp2 ||
        e.target.closest('.stamp') || e.target === petButton || e.target === petButtonPepper) {
        return;
    }

    if (backgroundAudio && !isMusicPlaying) {
        backgroundAudio.play().then(() => {
            isMusicPlaying = true;
            updateMusicToggle();
            updatePlayPauseBtn();
            musicToggle.style.animation = 'none';
        }).catch(e => console.log('Play failed:', e));
    }

    if (!isOpen) {
        envelope.classList.add('open');
        isOpen = true;
    } else {
        envelope.classList.remove('open');
        isOpen = false;
    }
});

// ===== GREETING + CLOCK =====
function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');

    const clockEl = document.getElementById('clockDisplay');
    const greetEl = document.getElementById('greetingText');
    const subEl   = document.getElementById('greetingSub');
    const dateEl  = document.getElementById('dateDisplay');
    if (!clockEl) return;

    clockEl.textContent = `${h}:${m}`;

    const hour = now.getHours();
    let greeting, sub;
    if (hour >= 5 && hour < 12) {
        greeting = 'good morning, cutie!';
        sub = 'huwag mo sana malimutan ang nyt streaks :DD ';
    } else if (hour >= 12 && hour < 18) {
        greeting = 'good afternoon, dani! ';
        sub = 'kumain ka na sana ng tanghalian :DD';
    } else if (hour >= 18 && hour < 22) {
        greeting = 'good evening, dani!';
        sub = 'kumain ka na ng dinner? ';
    } else {
        greeting = 'good night, baby! ';
        sub = 'i 3> u ';
    }

    greetEl.textContent = greeting;
    subEl.textContent   = sub;

    const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    dateEl.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
}

// ===== FLOATING CATS =====
function spawnFloatingCats() {
    const layer = document.getElementById('catFloatLayer');
    if (!layer) return;
    const emojis = ['🐱','🐾','🐈','😺','😸','🐟','🧶'];
    for (let i = 0; i < 10; i++) {
        const cat = document.createElement('div');
        cat.className = 'float-cat';
        cat.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        cat.style.left     = Math.random() * 100 + 'vw';
        cat.style.fontSize = (16 + Math.random() * 20) + 'px';
        const dur = 12 + Math.random() * 16;
        cat.style.animationDuration = dur + 's';
        cat.style.animationDelay    = -(Math.random() * dur) + 's';
        layer.appendChild(cat);
    }
}

// ===== CALENDAR =====
let calYear  = new Date().getFullYear();
let calMonth = new Date().getMonth();
let selectedDay = new Date().getDate();
// reminders stored as: { 'YYYY-MM-DD': [ {label, time, emoji}, ... ] }
let reminders = JSON.parse(localStorage.getItem('dani_reminders') || '{}');

function saveReminders() {
    localStorage.setItem('dani_reminders', JSON.stringify(reminders));
}

function calKey(year, month, day) {
    return `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

function renderCalendar() {
    const grid      = document.getElementById('calGrid');
    const monthYear = document.getElementById('calMonthYear');
    if (!grid) return;

    const months = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    monthYear.textContent = `${months[calMonth]} ${calYear}`;

    const today      = new Date();
    const firstDay   = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

    let html = '';
    for (let i = 0; i < firstDay; i++) {
        html += `<div class="cal-day empty"></div>`;
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const isToday    = d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
        const isSelected = d === selectedDay && calMonth === new Date().getMonth() && calYear === new Date().getFullYear()
                           || (d === selectedDay && !(calMonth === today.getMonth() && calYear === today.getFullYear()));
        const key        = calKey(calYear, calMonth, d);
        const hasEvents  = reminders[key] && reminders[key].length > 0;
        let cls = 'cal-day';
        if (isToday)    cls += ' today';
        if (d === selectedDay) cls += ' selected';
        if (hasEvents)  cls += ' has-events';
        html += `<div class="${cls}" onclick="selectDay(${d})">${d}</div>`;
    }
    grid.innerHTML = html;
    renderReminders();
}

function selectDay(d) {
    selectedDay = d;
    renderCalendar();
}

function renderReminders() {
    const list  = document.getElementById('remindersList');
    const title = document.getElementById('remindersTitle');
    if (!list) return;

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    title.textContent = `📌 ${months[calMonth]} ${selectedDay}`;

    const key   = calKey(calYear, calMonth, selectedDay);
    const items = reminders[key] || [];

    if (items.length === 0) {
        list.innerHTML = `<div class="no-reminders">FOR ACTIVITIES/REMINDERS</div>`;
        return;
    }

    // Sort by time
    const sorted = [...items].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    list.innerHTML = sorted.map((item, i) => `
        <div class="reminder-item">
            <span class="reminder-emoji">${item.emoji || '📌'}</span>
            <div class="reminder-info">
                <div class="reminder-label">${item.label}</div>
                ${item.time ? `<div class="reminder-time">${fmtReminderTime(item.time)}</div>` : ''}
            </div>
            <button class="reminder-delete" onclick="deleteReminder('${key}', ${i})">✕</button>
        </div>
    `).join('');
}

function fmtReminderTime(t) {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12  = h % 12 || 12;
    return `${h12}:${String(m).padStart(2,'0')} ${ampm}`;
}

function deleteReminder(key, index) {
    reminders[key].splice(index, 1);
    if (reminders[key].length === 0) delete reminders[key];
    saveReminders();
    renderCalendar();
}

// ===== MODAL =====
const EMOJI_OPTIONS = ['📌','📚','✏️','🎓','📝','💻','🏃','🍱','😴','🐱','💌','🎵','🌸','⭐','🔥','💪'];
let selectedEmoji = '📌';

function openModal() {
    selectedEmoji = '📌';
    document.getElementById('reminderInput').value = '';
    document.getElementById('reminderTime').value  = '';
    document.getElementById('emojiChoices').innerHTML = EMOJI_OPTIONS.map(e => `
        <span class="emoji-choice ${e === selectedEmoji ? 'selected' : ''}"
              onclick="selectEmoji('${e}')">${e}</span>
    `).join('');
    document.getElementById('modalOverlay').classList.add('open');
    setTimeout(() => document.getElementById('reminderInput').focus(), 100);
}

function selectEmoji(e) {
    selectedEmoji = e;
    document.querySelectorAll('.emoji-choice').forEach(el => {
        el.classList.toggle('selected', el.textContent === e);
    });
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('open');
}

function saveReminder() {
    const label = document.getElementById('reminderInput').value.trim();
    if (!label) {
        document.getElementById('reminderInput').focus();
        return;
    }
    const time = document.getElementById('reminderTime').value;
    const key  = calKey(calYear, calMonth, selectedDay);
    if (!reminders[key]) reminders[key] = [];
    reminders[key].push({ label, time, emoji: selectedEmoji });
    saveReminders();
    closeModal();
    renderCalendar();
}

function initHomeDashboard() {
    // Clock
    updateClock();
    setInterval(updateClock, 1000);

    // Floating cats
    spawnFloatingCats();

    // Calendar nav
    document.getElementById('calPrev')?.addEventListener('click', () => {
        calMonth--;
        if (calMonth < 0) { calMonth = 11; calYear--; }
        selectedDay = 1;
        renderCalendar();
    });
    document.getElementById('calNext')?.addEventListener('click', () => {
        calMonth++;
        if (calMonth > 11) { calMonth = 0; calYear++; }
        selectedDay = 1;
        renderCalendar();
    });

    // Modal
    document.getElementById('addReminderBtn')?.addEventListener('click', openModal);
    document.getElementById('modalCancel')?.addEventListener('click', closeModal);
    document.getElementById('modalSave')?.addEventListener('click', saveReminder);
    document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('modalOverlay')) closeModal();
    });

    // Enter to save
    document.getElementById('reminderInput')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveReminder();
    });

    renderCalendar();
}


// ===== INIT =====
window.addEventListener('load', () => {
    initializeBackgroundMusic();
    initHomeDashboard(); 
});