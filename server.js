const express = require('express');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static('public'));

// Add this fallback route for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Index.html'));
});

const PORT = process.env.PORT || 3000;  
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['websocket'],  
  pingTimeout: 60000,         
  pingInterval: 25000
});

// Game State
const gameState = {
  players: {},
  questions: [
    {
      id: 1,
      text: "Siapa juara MotoGP 2023?",
      options: ["Marc Marquez", "Francesco Bagnaia", "Fabio Quartararo"],
      answer: 1
    },
    {
      id: 2,
      text: "Tim mana yang menjuarai konstruktor MotoGP 2023?",
      options: ["Yamaha", "Ducati", "Honda"],
      answer: 1
    },
    {
      id: 3,
      text: "Berapa jumlah seri balapan MotoGP dalam satu musim?",
      options: ["18", "20", "22"],
      answer: 1
    },
    {
      id: 4,
      text: "Siapa pembalap termuda yang pernah menang di MotoGP?",
      options: ["Fabio Quartararo", "Marc Marquez", "Maverick Vinales"],
      answer: 0
    },
    {
      id: 5,
      text: "Sirkuit mana yang dijuluki 'Cathedral of Speed'?",
      options: ["Silverstone", "Mugello", "Assen"],
      answer: 1
    }
  ],
  isRunning: false,
  playerTimers: {},
  playerProgress: {}, // Tracks each player's individual progress
  settings: {
    timePerQuestion: 15000, // 15 seconds per question
    questionTransitionDelay: 1000 // 1 second delay between questions
  }
};

// Voting System
let readyPlayers = new Set();
const MAX_PLAYERS = 50;
const MIN_PLAYERS = 1;

// Helper functions
function initPlayerProgress(playerId) {
  gameState.playerProgress[playerId] = {
    currentQuestion: 0,
    hasAnswered: false,
    score: 0,
    correctAnswers: 0
  };
}

function sendQuestionToPlayer(playerId) {
  const progress = gameState.playerProgress[playerId];
  if (progress.currentQuestion >= gameState.questions.length) return;

  const question = gameState.questions[progress.currentQuestion];
  
  io.to(playerId).emit('newQuestion', {
    id: question.id,
    text: question.text,
    options: question.options,
    current: progress.currentQuestion + 1,
    total: gameState.questions.length,
    startTime: Date.now()
  });

  // Start individual timer
  gameState.playerTimers[playerId] = setTimeout(() => {
    if (!progress.hasAnswered) {
      progress.hasAnswered = true;
      progress.currentQuestion++;
      if (progress.currentQuestion < gameState.questions.length) {
        sendQuestionToPlayer(playerId);
      } else {
        checkGameCompletion();
      }
    }
  }, gameState.settings.timePerQuestion);
}

function updateLobby() {
  const totalPlayers = Object.keys(gameState.players).length;
  io.emit('lobbyUpdate', {
    players: Object.values(gameState.players),
    readyCount: readyPlayers.size,
    totalPlayers: totalPlayers,
    maxPlayers: MAX_PLAYERS,
    isRunning: gameState.isRunning
  });
}

function updateLeaderboard() {
  const playersWithScores = Object.keys(gameState.players).map(playerId => {
    return {
      ...gameState.players[playerId],
      score: gameState.playerProgress[playerId]?.score || 0
    };
  });
  
  io.emit('leaderboardUpdate', playersWithScores.sort((a, b) => b.score - a.score));
}

function checkStartConditions() {
  const totalPlayers = Object.keys(gameState.players).length;
  if (totalPlayers >= MIN_PLAYERS && readyPlayers.size === totalPlayers && totalPlayers > 0) {
    startGame();
  }
}

function startGame() {
  console.log('Starting game...');
  gameState.isRunning = true;

  // Initialize progress for all players
  Object.keys(gameState.players).forEach(playerId => {
    initPlayerProgress(playerId);
    sendQuestionToPlayer(playerId);
  });

  io.emit('gameStarted');
}

function checkGameCompletion() {
  const allFinished = Object.keys(gameState.players).every(playerId => {
    const progress = gameState.playerProgress[playerId];
    return progress.currentQuestion >= gameState.questions.length;
  });

  if (allFinished) {
    endGame();
  }
}

function endGame() {
  console.log('Ending game...');
  gameState.isRunning = false;

  const playersWithScores = Object.keys(gameState.players).map(playerId => {
    return {
      ...gameState.players[playerId],
      score: gameState.playerProgress[playerId].score
    };
  });

  const sortedPlayers = playersWithScores.sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  io.emit('gameOver', {
    winner: {
      name: winner.name,
      score: winner.score
    },
    scores: sortedPlayers
  });

  // Reset after delay
  setTimeout(() => {
    gameState.playerProgress = {};
    readyPlayers.clear();
    updateLobby();
  }, 10000);
}

// Socket.io Connection Handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  socket.on('join', (playerData, callback) => {
    if (gameState.isRunning) {
      return callback({ success: false, message: "Game sudah berjalan!" });
    }

    const totalPlayers = Object.keys(gameState.players).length;
    if (totalPlayers >= MAX_PLAYERS) {
      return callback({ success: false, message: `Maksimal ${MAX_PLAYERS} pemain!` });
    }

    gameState.players[socket.id] = {
      ...playerData,
      id: socket.id,
      isReady: false
    };

    callback({ success: true });
    updateLobby();
  });

  socket.on('setReady', (isReady) => {
    const player = gameState.players[socket.id];
    if (!player) return;

    player.isReady = isReady;
    
    if (isReady) {
      readyPlayers.add(socket.id);
    } else {
      readyPlayers.delete(socket.id);
    }

    updateLobby();
    checkStartConditions();
  });

  socket.on('submitAnswer', (data) => {
    const playerId = socket.id;
    const progress = gameState.playerProgress[playerId];
    
    if (!progress || progress.hasAnswered || !gameState.isRunning) return;

    const question = gameState.questions[progress.currentQuestion];
    const isCorrect = data.answerIndex === question.answer;
    const responseTime = (Date.now() - data.questionStartTime) / 1000;

    // Clear the individual timer
    clearTimeout(gameState.playerTimers[playerId]);

    // Update player progress
    progress.hasAnswered = true;
    if (isCorrect) {
      const timeBonus = Math.max(0, 100 - (responseTime * 5));
      progress.score += Math.round(timeBonus);
      progress.correctAnswers += 1;
    }

    // Update leaderboard for all players
    updateLeaderboard();

    // Move to next question after delay
    setTimeout(() => {
      progress.currentQuestion++;
      progress.hasAnswered = false;
      
      if (progress.currentQuestion < gameState.questions.length) {
        sendQuestionToPlayer(playerId);
      } else {
        checkGameCompletion();
      }
    }, gameState.settings.questionTransitionDelay);
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    
    // Clean up player data
    delete gameState.players[socket.id];
    delete gameState.playerProgress[socket.id];
    readyPlayers.delete(socket.id);
    clearTimeout(gameState.playerTimers[socket.id]);
    delete gameState.playerTimers[socket.id];
    
    // Update remaining players
    updateLobby();
    if (gameState.isRunning) {
      updateLeaderboard();
      checkGameCompletion();
    }
  });
});