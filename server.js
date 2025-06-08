const express = require('express');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const questions = require('./questions');

const app = express();
app.use(cors());
app.use(express.static('public'));
app.use(express.static('assets')); 

const PORT = 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  // Tambahan konfigurasi untuk stabilitas
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  allowUpgrades: true
});

// Rate limiting per IP
const connectionCounts = new Map();
const MAX_CONNECTIONS_PER_IP = 5;
const CONNECTION_RESET_INTERVAL = 60000; // 1 menit

// Reset connection counts setiap menit
setInterval(() => {
  connectionCounts.clear();
}, CONNECTION_RESET_INTERVAL);

// Utility Functions
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function shuffleQuestion(question) {
  const shuffledQuestion = { ...question };
  const options = [...shuffledQuestion.options];
  const correctAnswer = options[shuffledQuestion.answer];
  
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  
  shuffledQuestion.answer = options.indexOf(correctAnswer);
  shuffledQuestion.options = options;
  
  return shuffledQuestion;
}

// Game State - Simplified
const gameState = {
  players: {}, // Hanya satu struktur data untuk players
  questions: questions,
  playerQuestions: {},
  isRunning: false,
  playerTimers: new Map(), // Gunakan Map untuk better performance
  playerProgress: {},
  finishOrder: [],
  playerResponseTimes: {},
  settings: {
    timeForImageQuestions: 30000,
    timeForTextQuestions: 20000,
    questionTransitionDelay: 1500,
    totalQuestionsPerGame: 20
  }
};

// Game Management
let readyPlayers = new Set();
const MAX_PLAYERS = 70;
const MIN_PLAYERS = 1;
const COUNTDOWN_TIME = 10;

// Utility function untuk membersihkan timer
function clearPlayerTimer(playerId) {
  if (gameState.playerTimers.has(playerId)) {
    clearTimeout(gameState.playerTimers.get(playerId));
    gameState.playerTimers.delete(playerId);
    console.log(`Timer cleared for player ${playerId}`);
  }
}

// Utility function untuk membersihkan semua data player
function cleanupPlayerData(playerId) {
  try {
    clearPlayerTimer(playerId);
    delete gameState.players[playerId];
    delete gameState.playerProgress[playerId];
    delete gameState.playerQuestions[playerId];
    delete gameState.playerResponseTimes[playerId];
    readyPlayers.delete(playerId);
    
    // Update finish order
    const finishIndex = gameState.finishOrder.indexOf(playerId);
    if (finishIndex > -1) {
      gameState.finishOrder.splice(finishIndex, 1);
      // Reorder positions
      gameState.finishOrder.forEach((pId, index) => {
        if (gameState.playerProgress[pId]) {
          gameState.playerProgress[pId].finishPosition = index + 1;
        }
      });
    }
    
    console.log(`Cleanup completed for player ${playerId}`);
  } catch (error) {
    console.error(`Error cleaning up player ${playerId}:`, error);
  }
}

function initPlayerProgress(playerId) {
  try {
    const shuffledQuestions = shuffleArray(gameState.questions);
    const selectedQuestions = shuffledQuestions.slice(0, gameState.settings.totalQuestionsPerGame);
    
    gameState.playerQuestions[playerId] = selectedQuestions.map(shuffleQuestion);
    
    gameState.playerProgress[playerId] = {
      currentQuestion: 0,
      hasAnswered: false,
      score: 0,
      correctAnswers: 0,
      finishTime: null,
      finishPosition: null,
      isProcessingAnswer: false,
      isFinished: false
    };
    
    gameState.playerResponseTimes[playerId] = [];
    
    console.log(`Progress initialized for player: ${gameState.players[playerId]?.name}`);
  } catch (error) {
    console.error(`Error initializing progress for player ${playerId}:`, error);
  }
}

function sendQuestionToPlayer(playerId) {
  try {
    const progress = gameState.playerProgress[playerId];
    const playerQuestions = gameState.playerQuestions[playerId];
    
    if (!progress || !playerQuestions || progress.currentQuestion >= playerQuestions.length) {
      console.log(`Cannot send question to player ${playerId}: invalid state`);
      return;
    }

    // Clear existing timer
    clearPlayerTimer(playerId);

    // Reset status
    progress.hasAnswered = false;
    progress.isProcessingAnswer = false;

    const question = playerQuestions[progress.currentQuestion];
    
    const questionData = {
      id: question.id,
      text: question.text,
      type: question.type || 'text',
      options: question.options,
      current: progress.currentQuestion + 1,
      total: playerQuestions.length,
      startTime: Date.now()
    };

    if (question.type === 'image' && question.image) {
      questionData.image = question.image;
    }
    
    // Initialize response time tracking
    gameState.playerResponseTimes[playerId][progress.currentQuestion] = {
      startTime: Date.now(),
      endTime: null,
      timeSpent: null
    };
    
    console.log(`Sending question ${progress.currentQuestion + 1} to player ${gameState.players[playerId]?.name}`);
    
    // Emit dengan error handling
    const socket = io.sockets.sockets.get(playerId);
    if (socket && socket.connected) {
      socket.emit('newQuestion', questionData);
    } else {
      console.log(`Socket ${playerId} not connected, skipping question send`);
      return;
    }

    const timeLimit = question.type === 'image' ? 
      gameState.settings.timeForImageQuestions : 
      gameState.settings.timeForTextQuestions;

    // Set new timer with better error handling
    const timer = setTimeout(() => {
      handleTimeoutForPlayer(playerId);
    }, timeLimit);
    
    gameState.playerTimers.set(playerId, timer);
  } catch (error) {
    console.error(`Error sending question to player ${playerId}:`, error);
  }
}

function handleTimeoutForPlayer(playerId) {
  try {
    const progress = gameState.playerProgress[playerId];
    
    if (!progress || progress.hasAnswered || progress.isProcessingAnswer) {
      return;
    }
    
    console.log(`Timeout for player ${gameState.players[playerId]?.name} on question ${progress.currentQuestion + 1}`);
    
    progress.isProcessingAnswer = true;
    progress.hasAnswered = true;
    
    // Record timeout
    if (gameState.playerResponseTimes[playerId] && 
        gameState.playerResponseTimes[playerId][progress.currentQuestion]) {
      const responseTime = gameState.playerResponseTimes[playerId][progress.currentQuestion];
      responseTime.endTime = Date.now();
      responseTime.timeSpent = responseTime.endTime - responseTime.startTime;
    }
    
    clearPlayerTimer(playerId);
    
    progress.currentQuestion++;
    
    setTimeout(() => {
      if (gameState.players[playerId]) { // Pastikan player masih ada
        progress.isProcessingAnswer = false;
        
        if (progress.currentQuestion < gameState.playerQuestions[playerId].length) {
          sendQuestionToPlayer(playerId);
        } else {
          handlePlayerFinish(playerId);
        }
      }
    }, 500);
  } catch (error) {
    console.error(`Error handling timeout for player ${playerId}:`, error);
  }
}

function handlePlayerFinish(playerId) {
  try {
    if (!gameState.players[playerId]) return;

    const progress = gameState.playerProgress[playerId];
    const playerQuestions = gameState.playerQuestions[playerId];

    if (!progress || !playerQuestions || progress.currentQuestion < playerQuestions.length) return;

    // Calculate total time
    let totalTime = 0;
    if (gameState.playerResponseTimes[playerId]) {
      gameState.playerResponseTimes[playerId].forEach(response => {
        if (response && response.timeSpent) {
          totalTime += response.timeSpent;
        }
      });
    }

    progress.finishTime = totalTime;
    gameState.finishOrder.push(playerId);
    progress.finishPosition = gameState.finishOrder.length;
    
    const finishBonus = calculateFinishBonus(progress.finishPosition);
    progress.score += finishBonus;
    progress.isFinished = true;
    
    console.log(`Player ${gameState.players[playerId]?.name} finished with score ${progress.score}`);
    
    updateLeaderboard();
    checkGameCompletion();
  } catch (error) {
    console.error(`Error handling player finish for ${playerId}:`, error);
  }
}

function calculateFinishBonus(position) {
  if (position === 1) return 20;
  if (position >= 2 && position <= 20) return 21 - position;
  return 0;
}

function updateLobby() {
  try {
    const totalPlayers = Object.keys(gameState.players).length;
    
    const lobbyData = {
      players: Object.values(gameState.players), 
      readyCount: readyPlayers.size,
      totalPlayers: totalPlayers,
      maxPlayers: MAX_PLAYERS,
      isRunning: gameState.isRunning,
      canStartGame: totalPlayers >= MIN_PLAYERS && readyPlayers.size === totalPlayers && totalPlayers > 0
    };

    io.emit('lobbyUpdate', lobbyData);
  } catch (error) {
    console.error('Error updating lobby:', error);
  }
}

function emitToPlayers(eventName, data) {
  try {
    Object.keys(gameState.players).forEach(playerId => {
      const socket = io.sockets.sockets.get(playerId);
      if (socket && socket.connected) {
        socket.emit(eventName, data);
      }
    });
  } catch (error) {
    console.error(`Error emitting ${eventName}:`, error);
  }
}

function updateLeaderboard() {
  try {
    const playersWithScores = Object.keys(gameState.players).map(playerId => {
      const progress = gameState.playerProgress[playerId] || {};
      return {
        id: playerId,
        name: gameState.players[playerId].name,
        motor: gameState.players[playerId].motor,
        score: progress.score || 0,
        isFinished: progress.isFinished || false
      };
    });
    
    const sortedPlayers = playersWithScores.sort((a, b) => b.score - a.score);
    const topPlayers = sortedPlayers.slice(0, 3);
    
    emitToPlayers('gameUpdate', { 
      topPlayers: topPlayers,
      finishedPlayers: sortedPlayers.filter(p => p.isFinished),
      gameFinished: false
    });
  } catch (error) {
    console.error('Error updating leaderboard:', error);
  }
}

function checkStartConditions() {
  try {
    const totalPlayers = Object.keys(gameState.players).length;
    
    if (totalPlayers >= MIN_PLAYERS && 
        readyPlayers.size === totalPlayers && 
        totalPlayers > 0 && 
        !gameState.isRunning) {
      console.log(`Starting game with ${totalPlayers} registered players`);
      startGame();
    }
  } catch (error) {
    console.error('Error checking start conditions:', error);
  }
}

function startGame() {
  try {
    const totalPlayers = Object.keys(gameState.players).length;
    
    if (totalPlayers === 0 || gameState.isRunning) {
      console.log("Cannot start game: No players or already running");
      return;
    }
    
    gameState.isRunning = true;
    gameState.finishOrder = [];
    
    console.log(`Game started with ${totalPlayers} players`);
    
    emitToPlayers('countdownStart', {});
    
    let count = COUNTDOWN_TIME;
    const countdownInterval = setInterval(() => {
      emitToPlayers('countdownTick', count);
      
      if (count <= 0) {
        clearInterval(countdownInterval);
        
        // Initialize all players
        Object.keys(gameState.players).forEach(playerId => {
          initPlayerProgress(playerId);
        });
        
        emitToPlayers('gameActuallyStarted', {});
        
        // Start sending questions
        setTimeout(() => {
          Object.keys(gameState.players).forEach(playerId => {
            sendQuestionToPlayer(playerId);
          });
        }, 1000);
      }
      count--;
    }, 1000);
  } catch (error) {
    console.error('Error starting game:', error);
    gameState.isRunning = false;
  }
}

function checkGameCompletion() {
  try {
    const activePlayers = Object.keys(gameState.players);
    const allFinished = activePlayers.every(playerId => {
      const progress = gameState.playerProgress[playerId];
      const playerQuestions = gameState.playerQuestions[playerId];
      return progress && playerQuestions && progress.currentQuestion >= playerQuestions.length;
    });

    if (allFinished && activePlayers.length > 0) {
      setTimeout(endGame, 2000);
    }
  } catch (error) {
    console.error('Error checking game completion:', error);
  }
}

function endGame() {
  try {
    gameState.isRunning = false;

    // Clear all timers
    gameState.playerTimers.forEach((timer, playerId) => {
      clearTimeout(timer);
    });
    gameState.playerTimers.clear();

    const playersWithScores = Object.keys(gameState.players).map(playerId => {
      const progress = gameState.playerProgress[playerId];
      const player = gameState.players[playerId];
      const playerQuestions = gameState.playerQuestions[playerId];
      
      let totalTime = progress.finishTime || 0;

      return {
        id: playerId,
        name: player.name,
        motor: player.motor,
        score: progress.score,
        correct: progress.correctAnswers,
        wrong: playerQuestions.length - progress.correctAnswers,
        totalQuestions: playerQuestions.length,
        finishPosition: progress.finishPosition,
        finishTime: totalTime
      };
    });
    
    const sortedPlayers = playersWithScores.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.finishTime - b.finishTime;
    });

    const winner = sortedPlayers[0];

    emitToPlayers('gameUpdate', { 
      topPlayers: sortedPlayers.slice(0, 3),
      finishedPlayers: sortedPlayers,
      gameFinished: true
    });

    emitToPlayers('gameOver', {
      winner: winner,
      scores: sortedPlayers
    });

    console.log('Game ended successfully');
  } catch (error) {
    console.error('Error ending game:', error);
  }
}

// Socket.io Connection Handling
io.on('connection', (socket) => {
  try {
    console.log(`Socket connected: ${socket.id}`);
    
    // Rate limiting by IP
    const clientIp = socket.request.connection.remoteAddress;
    const currentConnections = connectionCounts.get(clientIp) || 0;
    
    if (currentConnections >= MAX_CONNECTIONS_PER_IP) {
      console.log(`Too many connections from IP: ${clientIp}`);
      socket.emit('error', 'Terlalu banyak koneksi dari IP ini');
      socket.disconnect(true);
      return;
    }
    
    connectionCounts.set(clientIp, currentConnections + 1);
    
    // Simplified ping-pong with cleanup
    let pingInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('ping');
      } else {
        clearInterval(pingInterval);
      }
    }, 30000); // 30 detik sekali

    socket.on('pong', () => {
      // Connection still alive
    });

    socket.on('join', (playerData, callback) => {
      try {
        if (gameState.isRunning) {
          return callback({ success: false, message: "Game sudah berjalan!" });
        }

        const totalPlayers = Object.keys(gameState.players).length;
        if (totalPlayers >= MAX_PLAYERS) {
          return callback({ success: false, message: `Maksimal ${MAX_PLAYERS} pemain!` });
        }

        if (!playerData.name || !playerData.motor) {
          return callback({ success: false, message: "Nama dan motor harus dipilih!" });
        }

        gameState.players[socket.id] = {
          id: socket.id,
          name: playerData.name,
          motor: playerData.motor || 'motor2',
          isReady: false,
          connectedAt: Date.now()
        };

        console.log(`Player joined: ${playerData.name} (${socket.id})`);
        console.log(`Total players: ${Object.keys(gameState.players).length}`);
        
        callback({ success: true });
        updateLobby();
      } catch (error) {
        console.error('Error in join:', error);
        callback({ success: false, message: "Terjadi kesalahan server" });
      }
    });

    socket.on('setReady', (isReady) => {
      try {
        const player = gameState.players[socket.id];
        if (!player) return;

        player.isReady = isReady;
        
        if (isReady) {
          readyPlayers.add(socket.id);
        } else {
          readyPlayers.delete(socket.id);
        }

        console.log(`Player ${player.name} ready status: ${isReady}`);
        updateLobby();
        checkStartConditions();
      } catch (error) {
        console.error('Error in setReady:', error);
      }
    });

    socket.on('submitAnswer', (data) => {
      try {
        const playerId = socket.id;
        const progress = gameState.playerProgress[playerId];
        
        if (!progress || progress.hasAnswered || progress.isProcessingAnswer || !gameState.isRunning) {
          return;
        }

        const playerQuestions = gameState.playerQuestions[playerId];
        const question = playerQuestions[progress.currentQuestion];
        const isCorrect = data.answerIndex === question.answer;

        progress.hasAnswered = true;
        progress.isProcessingAnswer = true;

        clearPlayerTimer(playerId);

        // Record response time
        if (gameState.playerResponseTimes[playerId] && 
            gameState.playerResponseTimes[playerId][progress.currentQuestion]) {
          const responseTime = gameState.playerResponseTimes[playerId][progress.currentQuestion];
          responseTime.endTime = Date.now();
          responseTime.timeSpent = responseTime.endTime - responseTime.startTime;
        }
        
        if (isCorrect) {
          progress.score += 4;
          progress.correctAnswers += 1;
        }

        socket.emit('answerFeedback', {
          selectedAnswer: data.answerIndex,
          isCorrect: isCorrect
        });

        updateLeaderboard();

        setTimeout(() => {
          if (gameState.players[playerId]) { // Check if player still exists
            progress.currentQuestion++;
            progress.isProcessingAnswer = false;
            
            if (progress.currentQuestion < playerQuestions.length) {
              sendQuestionToPlayer(playerId);
            } else {
              handlePlayerFinish(playerId);
            }
          }
        }, gameState.settings.questionTransitionDelay + 1000);
      } catch (error) {
        console.error('Error in submitAnswer:', error);
      }
    });

    socket.on('playAgain', () => {
      try {
        const player = gameState.players[socket.id];
        if (player) {
          player.isReady = false;
          readyPlayers.delete(socket.id);
          socket.emit('resetToWaiting');
          updateLobby();
        }
      } catch (error) {
        console.error('Error in playAgain:', error);
      }
    });

    socket.on('disconnect', (reason) => {
      try {
        console.log(`Socket disconnected: ${socket.id}, reason: ${reason}`);
        
        // Cleanup ping interval
        if (pingInterval) {
          clearInterval(pingInterval);
        }
        
        // Decrease connection count for this IP
        const clientIp = socket.request.connection.remoteAddress;
        const currentConnections = connectionCounts.get(clientIp) || 0;
        if (currentConnections > 0) {
          connectionCounts.set(clientIp, currentConnections - 1);
        }
        
        // Cleanup player data
        cleanupPlayerData(socket.id);
        
        // Reset game if no players left
        if (Object.keys(gameState.players).length === 0) {
          gameState.isRunning = false;
          gameState.finishOrder = [];
        }

        updateLobby();
      } catch (error) {
        console.error('Error in disconnect:', error);
      }
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });

    updateLobby();
  } catch (error) {
    console.error('Error in connection handler:', error);
    socket.disconnect(true);
  }
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Cleanup function untuk shutdown
function gracefulShutdown() {
  console.log('Shutting down gracefully...');
  
  // Clear all timers
  gameState.playerTimers.forEach((timer) => {
    clearTimeout(timer);
  });
  gameState.playerTimers.clear();
  
  // Close server
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Status endpoints
app.get('/status', (req, res) => {
  const connectedSockets = io.sockets.sockets.size;
  const connectedPlayers = Object.keys(gameState.players).length;
  const readyPlayersCount = readyPlayers.size;
  
  res.json({
    totalConnected: connectedSockets,
    totalPlayers: connectedPlayers,
    readyPlayers: readyPlayersCount,
    isGameRunning: gameState.isRunning,
    activeTimers: gameState.playerTimers.size,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  });
});

app.get('/questions-info', (req, res) => {
  res.json({
    totalQuestionsInDatabase: gameState.questions.length,
    questionsPerGame: gameState.settings.totalQuestionsPerGame || 20,
    questionTypes: {
      text: gameState.questions.filter(q => !q.type || q.type === 'text').length,
      image: gameState.questions.filter(q => q.type === 'image').length
    }
  });
});

app.get('/set-questions/:count', (req, res) => {
  const count = parseInt(req.params.count);
  if (count > 0 && count <= gameState.questions.length) {
    gameState.settings.totalQuestionsPerGame = count;
    res.json({ 
      success: true, 
      message: `Jumlah soal per game diubah menjadi ${count}`,
      totalAvailable: gameState.questions.length
    });
  } else {
    res.json({ 
      success: false, 
      message: `Jumlah soal harus antara 1-${gameState.questions.length}` 
    });
  }
});

app.get('/force-reset', (req, res) => {
  try {
    gameState.isRunning = false;
    gameState.players = {};
    gameState.finishOrder = [];
    readyPlayers.clear();
    
    // Clear all timers
    gameState.playerTimers.forEach((timer) => {
      clearTimeout(timer);
    });
    gameState.playerTimers.clear();
    
    res.json({ success: true, message: "Game direset paksa!" });
  } catch (error) {
    res.json({ success: false, message: "Error resetting game" });
  }
});