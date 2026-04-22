kruthika
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON bodies

// In-memory data store for the SBIT team
let players = [];
let currentId = 1;

// --- API Endpoints ---

// 1. Create: Add a new player
app.post('/players', (req, res) => {
    const { name, age, totalScore } = req.body;

    if (!name || age === undefined || totalScore === undefined) {
        return res.status(400).json({ error: 'Name, age, and totalScore are required.' });
    }

    const newPlayer = {
        id: currentId++,
        name,
        age: Number(age),
        totalScore: Number(totalScore)
    };

    players.push(newPlayer);
    res.status(201).json({ message: 'Player added successfully', player: newPlayer });
});

// 2. Read All: Get all players
app.get('/players', (req, res) => {
    res.json({
        totalPlayers: players.length,
        players: players
    });
});

// 3. Read One: Get a specific player by ID
app.get('/players/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const player = players.find(p => p.id === id);

    if (!player) {
        return res.status(404).json({ error: 'Player not found' });
    }

    res.json(player);
});

// 4. Update: Update a player's details
app.put('/players/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { name, age, totalScore } = req.body;

    const playerIndex = players.findIndex(p => p.id === id);

    if (playerIndex === -1) {
        return res.status(404).json({ error: 'Player not found' });
    }

    // Update fields if provided, otherwise keep existing
    players[playerIndex] = {
        ...players[playerIndex],
        name: name !== undefined ? name : players[playerIndex].name,
        age: age !== undefined ? Number(age) : players[playerIndex].age,
        totalScore: totalScore !== undefined ? Number(totalScore) : players[playerIndex].totalScore
    };

    res.json({ message: 'Player updated successfully', player: players[playerIndex] });
});

// 5. Delete: Remove a player
app.delete('/players/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const playerIndex = players.findIndex(p => p.id === id);

    if (playerIndex === -1) {
        return res.status(404).json({ error: 'Player not found' });
    }

    const deletedPlayer = players.splice(playerIndex, 1);
    res.json({ message: 'Player removed successfully', player: deletedPlayer[0] });
});

// 6. Stats: Get total players and sum of all scores
app.get('/team/stats', (req, res) => {
    const totalPlayers = players.length;
    const combinedScore = players.reduce((sum, player) => sum + player.totalScore, 0);

    res.json({
        teamName: 'SBIT',
        totalPlayers: totalPlayers,
        combinedTotalScore: combinedScore
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 SBIT Team Backend is running on http://localhost:${PORT}`);
});
