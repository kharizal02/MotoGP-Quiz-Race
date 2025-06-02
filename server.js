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
  }
});

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

// Game State
const gameState = {
  players: {},
  connectedSockets: {}, // Track semua socket yang terhubung tapi belum join
  questions: questions,
  playerQuestions: {},
  isRunning: false,
  playerTimers: {},
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
const MAX_PLAYERS = 50;
const MIN_PLAYERS = 1;
const COUNTDOWN_TIME = 10;

function initPlayerProgress(playerId) {
  const shuffledQuestions = shuffleArray(gameState.questions);
  const selectedQuestions = shuffledQuestions.slice(0, 20);
  
  gameState.playerQuestions[playerId] = selectedQuestions.map(shuffleQuestion);
  
  gameState.playerProgress[playerId] = {
    currentQuestion: 0,
    hasAnswered: false,
    score: 0,
    correctAnswers: 0,
    finishTime: null,
    finishPosition: null
  };
}

function sendQuestionToPlayer(playerId) {
  const progress = gameState.playerProgress[playerId];
  const playerQuestions = gameState.playerQuestions[playerId];
  
  if (!progress || progress.currentQuestion >= playerQuestions.length) return;

  clearTimeout(gameState.playerTimers[playerId]);

  progress.hasAnswered = false;

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
  
  // Initialize response times tracking for this player if not exists
  gameState.playerResponseTimes[playerId] = gameState.playerResponseTimes[playerId] || [];
  
  // Record start time for this question
  gameState.playerResponseTimes[playerId][progress.currentQuestion] = {
    startTime: Date.now(),
    endTime: null,
    timeSpent: null
  };
  
  io.to(playerId).emit('newQuestion', questionData);

  const timeLimit = question.type === 'image' ? 
    gameState.settings.timeForImageQuestions : 
    gameState.settings.timeForTextQuestions;

  // Set timer baru
  gameState.playerTimers[playerId] = setTimeout(() => {
    if (!progress.hasAnswered) {
      // Record timeout as end time
      if (gameState.playerResponseTimes[playerId] && 
          gameState.playerResponseTimes[playerId][progress.currentQuestion]) {
        gameState.playerResponseTimes[playerId][progress.currentQuestion].endTime = Date.now();
        gameState.playerResponseTimes[playerId][progress.currentQuestion].timeSpent = 
          gameState.playerResponseTimes[playerId][progress.currentQuestion].endTime - 
          gameState.playerResponseTimes[playerId][progress.currentQuestion].startTime;
      }
      
      progress.hasAnswered = true;
      progress.currentQuestion++;
      if (progress.currentQuestion < playerQuestions.length) {
        sendQuestionToPlayer(playerId);
      } else {
        handlePlayerFinish(playerId);
      }
    }
  }, timeLimit);
}

function handlePlayerFinish(playerId) {
  if (!gameState.players[playerId]) return;

  const progress = gameState.playerProgress[playerId];
  const playerQuestions = gameState.playerQuestions[playerId];

  if (progress.currentQuestion < playerQuestions.length) return;

  // Hitung total waktu pengerjaan semua soal
  let totalTime = 0;
  if (gameState.playerResponseTimes[playerId]) {
    gameState.playerResponseTimes[playerId].forEach(response => {
      if (response.timeSpent) {
        totalTime += response.timeSpent;
      } else if (response.endTime && response.startTime) {
        totalTime += (response.endTime - response.startTime);
      }
    });
  }

  progress.finishTime = totalTime; // Total waktu dalam milidetik
  gameState.finishOrder.push(playerId);
  progress.finishPosition = gameState.finishOrder.length;
  
  const finishBonus = calculateFinishBonus(progress.finishPosition);
  progress.score += finishBonus;
  progress.isFinished = true;
  
  updateLeaderboard();
  checkGameCompletion();
}

function calculateFinishBonus(position) {
  if (position === 1) return 20;
  if (position >= 2 && position <= 20) return 21 - position;
  return 0;
}

function updateLobby() {
  const totalConnected = Object.keys(gameState.connectedSockets).length;
  const totalPlayers = Object.keys(gameState.players).length;
  
  const baseLobbyData = {
    players: Object.values(gameState.players), 
    readyCount: readyPlayers.size,
    totalPlayers: totalPlayers,
    totalConnected: totalConnected,
    maxPlayers: MAX_PLAYERS,
    isRunning: gameState.isRunning,
    canStartGame: totalPlayers >= MIN_PLAYERS && readyPlayers.size === totalPlayers && totalPlayers > 0
  };

  // Kirim ke semua socket dengan informasi berbeda
  Object.keys(gameState.connectedSockets).forEach(socketId => {
    const isPlayer = gameState.players[socketId] ? true : false;
    
    io.to(socketId).emit('lobbyUpdate', {
      ...baseLobbyData,
      isCurrentSocketPlayer: isPlayer,
      currentPlayerData: isPlayer ? gameState.players[socketId] : null
    });
  });
}

function emitToPlayers(eventName, data) {
  Object.keys(gameState.players).forEach(playerId => {
    io.to(playerId).emit(eventName, data);
  });
}

function updateLeaderboard() {
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
}

function checkStartConditions() {
  const totalPlayers = Object.keys(gameState.players).length;
  
  // Game hanya bisa dimulai jika:
  // 1. Ada minimal MIN_PLAYERS yang sudah terdaftar sebagai player (bukan hanya socket connect)
  // 2. Semua player yang terdaftar sudah ready
  // 3. Ada setidaknya 1 player yang terdaftar
  if (totalPlayers >= MIN_PLAYERS && 
      readyPlayers.size === totalPlayers && 
      totalPlayers > 0) {
    console.log(`Starting game with ${totalPlayers} registered players`);
    startGame();
  } else {
    console.log(`Cannot start game: ${totalPlayers} players, ${readyPlayers.size} ready`);
  }
}

function startGame() {
  const totalPlayers = Object.keys(gameState.players).length;
  
  if (totalPlayers === 0) {
    console.log("Cannot start game: No registered players");
    return;
  }
  
  gameState.isRunning = true;
  gameState.finishOrder = [];
  
  console.log(`Game started with ${totalPlayers} players`);
  
  // Kirim countdownStart hanya ke pemain yang terdaftar
  Object.keys(gameState.players).forEach(playerId => {
    io.to(playerId).emit('countdownStart');
  });
  
  let count = COUNTDOWN_TIME;
  const countdownInterval = setInterval(() => {
    // Kirim countdown tick hanya ke pemain yang terdaftar
    Object.keys(gameState.players).forEach(playerId => {
      io.to(playerId).emit('countdownTick', count);
    });
    
    if (count <= 0) {
      clearInterval(countdownInterval);
      
      Object.keys(gameState.players).forEach(playerId => {
        initPlayerProgress(playerId);
        console.log(`Initialized progress for player: ${gameState.players[playerId].name}`);
      });
      
      // Kirim gameActuallyStarted hanya ke pemain yang terdaftar
      Object.keys(gameState.players).forEach(playerId => {
        io.to(playerId).emit('gameActuallyStarted');
      });
      
      Object.keys(gameState.players).forEach(playerId => {
        sendQuestionToPlayer(playerId);
      });
    }
    count--;
  }, 1000);
}

function checkGameCompletion() {
  const activePlayers = Object.keys(gameState.players);
  const allFinished = activePlayers.every(playerId => {
    const progress = gameState.playerProgress[playerId];
    const playerQuestions = gameState.playerQuestions[playerId];
    return progress && playerQuestions && progress.currentQuestion >= playerQuestions.length;
  });

  if (allFinished && activePlayers.length > 0) {
    setTimeout(endGame, 2000);
  }
}

function endGame() {
  gameState.isRunning = false;

  // Hentikan semua timer yang aktif
  Object.keys(gameState.playerTimers).forEach(playerId => {
    clearTimeout(gameState.playerTimers[playerId]);
  });
  gameState.playerTimers = {};

  const playersWithScores = Object.keys(gameState.players).map(playerId => {
    const progress = gameState.playerProgress[playerId];
    const player = gameState.players[playerId];
    const playerQuestions = gameState.playerQuestions[playerId]; // Soal yang dikerjakan player ini
    
    // Hitung total waktu jika belum dihitung di handlePlayerFinish
    let totalTime = progress.finishTime;
    if (!totalTime && gameState.playerResponseTimes[playerId]) {
      totalTime = gameState.playerResponseTimes[playerId].reduce((sum, response) => {
        return sum + (response.timeSpent || 0);
      }, 0);
    }

    return {
      id: playerId,
      name: player.name,
      motor: player.motor,
      score: progress.score,
      correct: progress.correctAnswers,
      wrong: playerQuestions.length - progress.correctAnswers, // Gunakan jumlah soal yang dikerjakan, bukan total
      totalQuestions: playerQuestions.length, // Jumlah soal yang dikerjakan
      finishPosition: progress.finishPosition,
      finishTime: totalTime,
      detailResponses: gameState.playerResponseTimes[playerId]
    };
  });
  
  // Urutkan berdasarkan: 1. Score tertinggi, 2. Waktu tercepat
  const sortedPlayers = playersWithScores.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.finishTime - b.finishTime;
  });

  const winner = sortedPlayers[0];

  // Update finish position berdasarkan sorting terakhir
  sortedPlayers.forEach((player, index) => {
    player.finishPosition = index + 1;
    if (gameState.playerProgress[player.id]) {
      gameState.playerProgress[player.id].finishPosition = index + 1;
    }
  });

  emitToPlayers('gameUpdate', { 
    topPlayers: sortedPlayers.slice(0, 3),
    finishedPlayers: sortedPlayers,
    gameFinished: true
  });

  emitToPlayers('gameOver', {
    winner: winner,
    scores: sortedPlayers.map(player => ({
      ...player,
      detailResponses: undefined 
    }))
  });

  // Untuk keperluan debugging
  console.log('Final Results:', {
    players: sortedPlayers.map(p => ({
      name: p.name,
      score: p.score,
      correct: p.correct,
      totalQuestions: p.totalQuestions,
      time: p.finishTime,
      position: p.finishPosition
    })),
    totalQuestionsInDatabase: gameState.questions.length
  });
}

// Socket.io Connection Handling
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  // Track socket yang terhubung tapi belum join sebagai player
  gameState.connectedSockets[socket.id] = {
    id: socket.id,
    connectedAt: Date.now(),
    isPlayer: false
  };
  
  // Update lobby untuk menampilkan total koneksi
  updateLobby();

  // Deteksi koneksi aktif dengan ping-pong
  socket.interval = setInterval(() => {
    socket.emit('ping');
  }, 5000);

  socket.on('pong', () => {
    // Koneksi masih aktif
  });

socket.on('join', (playerData, callback) => {
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

  // Pastikan socket sudah terhubung sebelum bisa menjadi player
  if (!gameState.connectedSockets[socket.id]) {
    return callback({ success: false, message: "Koneksi tidak valid!" });
  }

  // Pindahkan dari connectedSockets ke players
  gameState.connectedSockets[socket.id].isPlayer = true;

  gameState.players[socket.id] = {
    id: socket.id,
    name: playerData.name,
    motor: playerData.motor || 'motor2',
    isReady: false,
    connectedAt: gameState.connectedSockets[socket.id]?.connectedAt || Date.now()
  };

  console.log(`Player joined: ${playerData.name} (${socket.id}) - Motor: ${playerData.motor}`);
  console.log(`Total players registered: ${Object.keys(gameState.players).length}`);
  
  callback({ success: true });
  updateLobby();
});

  socket.on('setReady', (isReady) => {
    const player = gameState.players[socket.id];
    if (!player) {
      console.log(`Socket ${socket.id} tried to set ready but is not a registered player`);
      return;
    }

    player.isReady = isReady;
    
    if (isReady) {
      readyPlayers.add(socket.id);
      console.log(`Player ${player.name} is ready`);
    } else {
      readyPlayers.delete(socket.id);
      console.log(`Player ${player.name} is not ready`);
    }

    console.log(`Ready players: ${readyPlayers.size}/${Object.keys(gameState.players).length}`);
    updateLobby();
    checkStartConditions();
  });

socket.on('submitAnswer', (data) => {
  const playerId = socket.id;
  const progress = gameState.playerProgress[playerId];
  
  if (!progress || progress.hasAnswered || !gameState.isRunning) return;

  const playerQuestions = gameState.playerQuestions[playerId];
  const question = playerQuestions[progress.currentQuestion];
  const isCorrect = data.answerIndex === question.answer;

  // Clear timer sebelum pindah pertanyaan
  clearTimeout(gameState.playerTimers[playerId]);

  // Record end time and time spent for this question
  if (gameState.playerResponseTimes[playerId] && 
      gameState.playerResponseTimes[playerId][progress.currentQuestion]) {
    gameState.playerResponseTimes[playerId][progress.currentQuestion].endTime = Date.now();
    gameState.playerResponseTimes[playerId][progress.currentQuestion].timeSpent = 
      gameState.playerResponseTimes[playerId][progress.currentQuestion].endTime - 
      gameState.playerResponseTimes[playerId][progress.currentQuestion].startTime;
  }

  progress.hasAnswered = true;
  
  if (isCorrect) {
    progress.score += 4;
    progress.correctAnswers += 1;
  }

  // TAMBAHAN: Kirim feedback jawaban ke client (hanya warna)
  io.to(playerId).emit('answerFeedback', {
    selectedAnswer: data.answerIndex,
    isCorrect: isCorrect
  });

  updateLeaderboard();

  try {
    // Tambahkan delay lebih lama untuk menunjukkan feedback
    setTimeout(() => {
      progress.currentQuestion++;
      progress.hasAnswered = false;
      
      if (progress.currentQuestion < playerQuestions.length) {
        sendQuestionToPlayer(playerId);
      } else {
        handlePlayerFinish(playerId);
      }
    }, gameState.settings.questionTransitionDelay + 1000); // Tambah 1 detik untuk melihat feedback warna
  } catch (error) {
    console.error("Error saat pindah pertanyaan:", error);
  }
});

function sendQuestionToPlayer(playerId) {
  const progress = gameState.playerProgress[playerId];
  const playerQuestions = gameState.playerQuestions[playerId];
  
  if (!progress || progress.currentQuestion >= playerQuestions.length) return;

  clearTimeout(gameState.playerTimers[playerId]);

  progress.hasAnswered = false;

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
  
  // Initialize response times tracking for this player if not exists
  gameState.playerResponseTimes[playerId] = gameState.playerResponseTimes[playerId] || [];
  
  // Record start time for this question
  gameState.playerResponseTimes[playerId][progress.currentQuestion] = {
    startTime: Date.now(),
    endTime: null,
    timeSpent: null
  };
  
  io.to(playerId).emit('newQuestion', questionData);

  const timeLimit = question.type === 'image' ? 
    gameState.settings.timeForImageQuestions : 
    gameState.settings.timeForTextQuestions;

  // Set timer baru
  gameState.playerTimers[playerId] = setTimeout(() => {
    if (!progress.hasAnswered) {
      // Record timeout as end time
      if (gameState.playerResponseTimes[playerId] && 
          gameState.playerResponseTimes[playerId][progress.currentQuestion]) {
        gameState.playerResponseTimes[playerId][progress.currentQuestion].endTime = Date.now();
        gameState.playerResponseTimes[playerId][progress.currentQuestion].timeSpent = 
          gameState.playerResponseTimes[playerId][progress.currentQuestion].endTime - 
          gameState.playerResponseTimes[playerId][progress.currentQuestion].startTime;
      }
      
      // Tidak perlu feedback untuk timeout, langsung lanjut ke pertanyaan berikutnya
      
      progress.hasAnswered = true;
      progress.currentQuestion++;
      if (progress.currentQuestion < playerQuestions.length) {
        sendQuestionToPlayer(playerId);
      } else {
        handlePlayerFinish(playerId);
      }
    }
  }, timeLimit);
}

  socket.on('playAgain', () => {
    const player = gameState.players[socket.id];
    if (player) {
      player.isReady = false;
      readyPlayers.delete(socket.id);
      io.to(socket.id).emit('resetToWaiting');
      updateLobby();
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    clearInterval(socket.interval); // Hentikan ping

    const wasInGame = gameState.players[socket.id] && gameState.isRunning;
    const hadFinished = gameState.playerProgress[socket.id]?.isFinished;

    // Hapus dari connectedSockets
    delete gameState.connectedSockets[socket.id];

    // Hapus data pemain jika ada
    delete gameState.players[socket.id];
    delete gameState.playerProgress[socket.id];
    delete gameState.playerQuestions[socket.id];
    readyPlayers.delete(socket.id);
    clearTimeout(gameState.playerTimers[socket.id]);
    delete gameState.playerTimers[socket.id];
    
    // Update finish order
    const finishIndex = gameState.finishOrder.indexOf(socket.id);
    if (finishIndex > -1) {
      gameState.finishOrder.splice(finishIndex, 1);
      gameState.finishOrder.forEach((playerId, index) => {
        if (gameState.playerProgress[playerId]) {
          gameState.playerProgress[playerId].finishPosition = index + 1;
        }
      });
    }
    
    // Reset game jika tidak ada pemain tersisa
    if (Object.keys(gameState.players).length === 0) {
      gameState.isRunning = false;
      gameState.finishOrder = [];
    } else if (wasInGame && !hadFinished) {
      updateLeaderboard();
    }

    updateLobby();
  });
});

// Endpoint untuk melihat status koneksi
app.get('/status', (req, res) => {
  const connectedSockets = Object.keys(gameState.connectedSockets).length;
  const connectedPlayers = Object.keys(gameState.players).length;
  const readyPlayers = Array.from(readyPlayers).length;
  
  res.json({
    totalConnected: connectedSockets,
    totalPlayers: connectedPlayers,
    readyPlayers: readyPlayers,
    isGameRunning: gameState.isRunning,
    players: Object.values(gameState.players).map(p => ({
      name: p.name,
      motor: p.motor,
      isReady: p.isReady
    }))
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

// Endpoint untuk reset manual (opsional)
app.get('/force-reset', (req, res) => {
  gameState.isRunning = false;
  gameState.players = {};
  gameState.connectedSockets = {};
  gameState.finishOrder = [];
  res.send("Game direset paksa!");
});