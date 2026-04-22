const API_BASE_URL = 'http://localhost:3000';

// DOM Elements
const playersList = document.getElementById('players-list');
const statTotalPlayers = document.getElementById('stat-total-players');
const statCombinedScore = document.getElementById('stat-combined-score');

// Modal Elements
const modalInfo = document.getElementById('player-modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const playerForm = document.getElementById('player-form');
const modalTitle = document.getElementById('modal-title');
const submitBtn = document.getElementById('submit-btn');

// Form Inputs
const inputId = document.getElementById('player-id');
const inputName = document.getElementById('player-name');
const inputAge = document.getElementById('player-age');
const inputScore = document.getElementById('player-score');

// Initialize
document.addEventListener('DOMContentLoaded', fetchDashboardData);

// Modal Logic
openModalBtn.addEventListener('click', () => {
    resetForm();
    modalTitle.textContent = 'Add New Player';
    submitBtn.textContent = 'Save Player';
    modalInfo.classList.add('active');
});

closeModalBtn.addEventListener('click', () => {
    modalInfo.classList.remove('active');
});

modalInfo.addEventListener('click', (e) => {
    if (e.target === modalInfo) {
        modalInfo.classList.remove('active');
    }
});

function resetForm() {
    inputId.value = '';
    inputName.value = '';
    inputAge.value = '';
    inputScore.value = '';
}

// Fetch Data (Combined)
async function fetchDashboardData() {
    try {
        // Fetch stats
        const statsRes = await fetch(`${API_BASE_URL}/team/stats`);
        const statsData = await statsRes.json();
        
        statTotalPlayers.textContent = statsData.totalPlayers || 0;
        statCombinedScore.textContent = (statsData.combinedTotalScore || 0).toLocaleString();

        // Fetch players
        const playersRes = await fetch(`${API_BASE_URL}/players`);
        const playersData = await playersRes.json();
        renderPlayers(playersData.players);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        playersList.innerHTML = `<div class="empty-state" style="color: #ef4444;">Failed to load data. Is the backend running?</div>`;
    }
}

// Render Players Grid
function renderPlayers(players) {
    if (!players || players.length === 0) {
        playersList.innerHTML = `<div class="empty-state">No players found. Add your first SBIT player!</div>`;
        return;
    }

    playersList.innerHTML = players.map(player => `
        <div class="player-card">
            <div class="card-header">
                <div class="player-profile">
                    <div class="avatar">${player.name.charAt(0).toUpperCase()}</div>
                    <div>
                        <div class="player-name">${player.name}</div>
                        <div class="player-age">${player.age} Years Old</div>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="action-btn edit-btn" onclick="editPlayer(${player.id})">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deletePlayer(${player.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="card-stats">
                <i class="fa-solid fa-star"></i>
                <div class="score-value">${player.totalScore.toLocaleString()}</div>
                <div style="color: var(--text-muted); font-size: 13px; margin-left: 5px;">Total Score</div>
            </div>
        </div>
    `).join('');
}

// Form Submit (Create or Update)
playerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const playerData = {
        name: inputName.value,
        age: Number(inputAge.value),
        totalScore: Number(inputScore.value)
    };

    const id = inputId.value;

    try {
        if (id) {
            // Update
            await fetch(`${API_BASE_URL}/players/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(playerData)
            });
        } else {
            // Create
            await fetch(`${API_BASE_URL}/players`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(playerData)
            });
        }

        modalInfo.classList.remove('active');
        fetchDashboardData(); // Refresh UI
    } catch (error) {
        console.error('Error saving player:', error);
        alert('Failed to save player. Check console for details.');
    }
});

// Edit Player (Open Modal with data)
window.editPlayer = async (id) => {
    try {
        const res = await fetch(`${API_BASE_URL}/players/${id}`);
        const player = await res.json();

        inputId.value = player.id;
        inputName.value = player.name;
        inputAge.value = player.age;
        inputScore.value = player.totalScore;

        modalTitle.textContent = 'Edit Player';
        submitBtn.textContent = 'Update Player';
        modalInfo.classList.add('active');
    } catch (error) {
        console.error('Error fetching player details:', error);
    }
};

// Delete Player
window.deletePlayer = async (id) => {
    if (confirm('Are you sure you want to remove this player from the team?')) {
        try {
            await fetch(`${API_BASE_URL}/players/${id}`, { method: 'DELETE' });
            fetchDashboardData(); // Refresh UI
        } catch (error) {
            console.error('Error deleting player:', error);
        }
    }
};
