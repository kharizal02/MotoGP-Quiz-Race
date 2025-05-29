const express = require('express');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

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
  questions: [
    {
      id: 1,
      text: "Seorang pasien akan menjalani pemeriksaan Ct-Scan abdomen dengan penggunaan kontras oral dan intravena. Persiapan yang diperlukan meliputi:",
      type: "text",
      options: ["Berpuasa selama 4 jam sebelum pemeriksaan.", "Mengonsumsi makanan ringan sebelum pemeriksaan.", "Minum 500 mL tepat sebelum pemeriksaan.", "Tidak perlu persiapan Khusus."],
      answer: 0
    },
    {
      id: 2,
      text: "Dalam prosedur Ct-Scan Brain non-kontras, posisi pasien yang benar selama pemeriksaan adalah:",
      type: "text",
      options: ["Duduk dengan kepala menunduk.", "Berbaring telentang dengan kepala tetap.", "Berbaring miring ke kanan.", "Berdiri dengan kepala menengadah."],
      answer: 1
    },
    {
      id: 3,
      text: "Selama Ct-Scan abdomen dengan kontras, pasien diminta untuk menahan napas pada saat tertentu. Tujuan dari instruksi ini adalah:",
      type: "text",
      options: ["Mengurangi rasa mual selama pemeriksaan.", "Mencegah reaksi alergi terhadap kontras.", "Menghindari gerakan yang dapat mengaburkan gambar.", "Mempercepat waktu pemeriksaan."],
      answer: 2
    },
    {
      id: 4,
      text: "Seorang pasien akan menjalani CT Scan thorax dengan kontras intravena. Persiapan yang tepat sebelum pemeriksaan ini adalah:",
      type: "text",
      options: ["Berpuasa minimal 2–4 jam sebelum pemeriksaan.", "Minum air sebanyak 1 liter 30 menit sebelum pemeriksaan.", "Menghindari konsumsi susu dan produk olahan susu selama 12 jam.", "Berolahraga ringan agar denyut jantung stabil saat diperiksa."],
      answer: 0
    },
    {
      id: 5,
      text: "Seorang pasien dijadwalkan menjalani CT abdomen dengan kontras. Tindakan yang paling tepat untuk dilakukan dalam persiapan pasien adalah?",
      type: "text",
      options: ["Menganjurkan pasien makan makanan tinggi serat 1 jam sebelum pemeriksaan.", "Menyuntikkan kontras oral segera sebelum pasien memasuki ruang pemeriksaan.", "Memastikan pasien puasa minimal 4–6 jam sebelum pemeriksaan.", "Memberikan antibiotik profilaksis 1 hari sebelum pemeriksaan."],
      answer: 2
    },
    {
      id: 6,
      text: "Berdasarkan citra axial CT Brain non-kontras diatas, huruf manakah yang menunjukkan letak struktur thalamus?",
      type: "image", 
      image: "assets/gambar1.png",
      options: ["Struktur F", "Struktur E", "Struktur B", "Struktur C"],
      answer: 1
    },
    {
      id: 7,
      text: "Pasien wanita usia produktif akan menjalani pemeriksaan ct scan, tindakan yang harus dilakukan radiografer adalah...",
      type: "text",
      options: ["Langsung melanjutkan pemeriksaan.", "Menanyakan apakah sedang hamil atau tidak.", "Meminta pasien berpuasa.", "Meminta pasien minum dalam jumlah banyak."],
      answer: 1
    },
    {
      id: 8,
      text: "Struktur yang diberi huruf A adalah...",
      type: "image", 
      image: "assets/gambar2.png",
      options: ["Superior vena cava", "Aortic arch", "Ascending aorta", "Descending aorta"],
      answer: 2
    },
    {
      id: 9,
      text: "Dibawah ini yang bukan merupakan persiapan untuk pemeriksaan CT-Scan Kepala adalah...",
      type: "text",
      options: ["Melepas benda-benda logam dan aksesoris pada area kepala, seperti anting, jepit rambut, hair extensions.", "Ditanyakan kembali apakah pasien takut dengan ruang sempit atau tidak (claustrophobia).", "Pasien diberikan penjelasan tentang prosedur pemeriksaan.", "Memastikan pasien minum air putih 2-3 gelas sebelum pemeriksaan."],
      answer: 3
    },
    {
      id: 10,
      text: "Urutan fase-fase kontras dalam CT Scan abdomen secara umum adalah...",
      type: "text",
      options: ["Fase arteri - non kontras - fase vena porta - fase delayed.", "Non kontras - fase arteri - fase vena porta - fase delayed.", "Non kontras - fase vena porta - fase arteri - fase delayed.", "Fase delayed - fase vena porta - fase arteri - non kontras."],
      answer: 1
    },
    {
      id: 11,
      text: "Apa alasan utama dilakukannya tes fungsi ginjal saat persiapan sebelum pemberian zat kontras pada CT scan?",
      type: "text",
      options: ["Untuk menentukan dosis zat kontras yang tepat.", "Untuk menghindari risiko nefropati yang diinduksi oleh zat kontras pada pasien dengan gangguan fungsi ginjal.", "Untuk memastikan pasien tidak mengalami dehidrasi.", "Untuk menilai kemungkinan reaksi alergi terhadap zat kontras."],
      answer: 1
    },
    {
      id: 12,
      text: "Untuk mengurangi artefak gerakan pada CT scan, tindakan yang dapat dilakukan adalah:",
      type: "text",
      options: ["Memperpanjang waktu pemindaian.", "Menginstruksikan pasien untuk menahan napas atau menggunakan teknik pemindaian cepat.", "Mengurangi dosis radiasi.", "Menggunakan kontras dengan konsentrasi tinggi."],
      answer: 1
    },
    {
      id: 13,
      text: "Pemeriksaan lab apa saja yang menjadi pertimbangan untuk pemeriksaan ct-scan kontras, kecuali?",
      type: "text",
      options: ["Kreatinin.", "Ureum.", "Elektrolit.", "Pemeriksaan benda logam."],
      answer: 3
    },
    {
      id: 14,
      text: "Pada pemeriksaan CT-Scan posisi kepala harus true AP, hal ini dapat ditandai dengan?",
      type: "text",
      options: ["OML tegak lurus dengan bidang coronal.", "Memastikan kepala tidak ada rotasi.", "MML tegak lurus bidang axial.", "IPL sejajar dengan bidang axial."],
      answer: 2
    },
    {
      id: 15,
      text: "Manakah di antara pernyataan berikut yang paling tepat mengenai persiapan pasien untuk pemeriksaan CT scan non-kontras pada abdomen?",
      type: "text",
      options: ["Pasien diwajibkan untuk puasa minimal 6 jam sebelum pemeriksaan.", "Pasien perlu minum air yang banyak untuk mengisi kandung kemih.", "Pasien tidak memerlukan persiapan khusus, namun dianjurkan untuk melepaskan benda logam.", "Pasien harus mengonsumsi barium oral sebagai agen kontras positif."],
      answer: 2
    },
    {
      id: 16,
      text: "Dari citra CT diatas, organ yg ditunjuk oleh nomor 56 yaitu...",
      type: "image", 
      image: "assets/gambar3.png",
      options: ["Ileum", "Jejunum", "Renal", "Liver"],
      answer: 1
    },
    {
      id: 17,
      text: "Pasien dijadwalkan menjalani CT urografi (evaluasi saluran kemih dengan kontras). Persiapan yang paling penting untuk diperiksa sebelum penyuntikan kontras adalah?",
      type: "text",
      options: ["Riwayat hipertensi.", "Kadar kreatinin dan fungsi ginjal.", "Jadwal konsumsi obat antihipertensi.", "Suhu tubuh."],
      answer: 1
    },
    {
      id: 18,
      text: "Pemilihan slice thickness (ketebalan irisan) yang terlalu besar pada CT thoraks dapat menyebabkan:",
      type: "text",
      options: ["Meningkatnya resolusi spasial.", "Gagal mendeteksi nodul kecil paru.", "Penurunan noise citra.", "Lebih banyak gambar yang dihasilkan."],
      answer: 1
    },
    {
      id: 19,
      text: "Wanita 45 tahun akan CT-Scan kepala dengan kontras. Ia punya riwayat alergi makanan laut dan pernah gatal setelah kontras sebelumnya. Apa tindakan terbaik sebelum pemeriksaan?",
      type: "text",
      options: ["Lanjutkan tanpa persiapan.", "Beri premedikasi antihistamin/steroid.", "Ganti ke MRI tanpa kontras.", "Gunakan air steril sebagai kontras."],
      answer: 1
    },
    {
      id: 20,
      text: "Berdasarkan hasil citra axial CT Brain non-kontras di samping, anak panah menunjukkan terjadinya ?",
      type: "image", 
      image: "assets/gambar4.png",
      options: ["Lesu subdural", "Lesi epidural", "Lesi intraserebral", "Lesi Kranium"],
      answer: 1
    }
  ],
  playerQuestions: {},
  isRunning: false,
  playerTimers: {},
  playerProgress: {},
  finishOrder: [],
  settings: {
    timeForImageQuestions: 30000,
    timeForTextQuestions: 20000,
    questionTransitionDelay: 1500
  }
};

// Game Management
let readyPlayers = new Set();
const MAX_PLAYERS = 50;
const MIN_PLAYERS = 1;
const COUNTDOWN_TIME = 10;

function initPlayerProgress(playerId) {
  gameState.playerQuestions[playerId] = shuffleArray(gameState.questions).map(shuffleQuestion);
  
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
  
  io.to(playerId).emit('newQuestion', questionData);

  const timeLimit = question.type === 'image' ? 
    gameState.settings.timeForImageQuestions : 
    gameState.settings.timeForTextQuestions;

  // Set timer baru
  gameState.playerTimers[playerId] = setTimeout(() => {
    if (!progress.hasAnswered) {
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

  progress.finishTime = Date.now();
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
  
  io.emit('gameUpdate', { 
    topPlayers: topPlayers,
    finishedPlayers: sortedPlayers.filter(p => p.isFinished),
    gameFinished: false
  });
}

function checkStartConditions() {
  const totalPlayers = Object.keys(gameState.players).length;
  if (totalPlayers >= MIN_PLAYERS && readyPlayers.size === totalPlayers && totalPlayers > 0) {
    startGame();
  }
}

function startGame() {
  gameState.isRunning = true;
  gameState.finishOrder = [];
  
  io.emit('countdownStart');
  
  let count = COUNTDOWN_TIME;
  const countdownInterval = setInterval(() => {
    io.emit('countdownTick', count);
    
    if (count <= 0) {
      clearInterval(countdownInterval);
      
      Object.keys(gameState.players).forEach(playerId => {
        initPlayerProgress(playerId);
      });
      
      io.emit('gameActuallyStarted');
      
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
    return {
      id: playerId,
      name: gameState.players[playerId].name,
      motor: gameState.players[playerId].motor,
      score: progress.score,
      finishPosition: progress.finishPosition
    };
  });

  const sortedPlayers = playersWithScores.sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  io.emit('gameUpdate', {
    topPlayers: sortedPlayers.slice(0, 3),
    finishedPlayers: sortedPlayers,
    gameFinished: true
  });

  io.emit('gameOver', {
    winner: winner,
    scores: sortedPlayers
  });
}

// Socket.io Connection Handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

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

    gameState.players[socket.id] = {
      id: socket.id,
      name: playerData.name,
      motor: playerData.motor || 'motor2',
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

    const playerQuestions = gameState.playerQuestions[playerId];
    const question = playerQuestions[progress.currentQuestion];
    const isCorrect = data.answerIndex === question.answer;

    // Clear timer sebelum pindah pertanyaan
    clearTimeout(gameState.playerTimers[playerId]);

    progress.hasAnswered = true;
    
    if (isCorrect) {
      progress.score += 4;
      progress.correctAnswers += 1;
    }

    updateLeaderboard();

    // Gunakan try-catch untuk antisipasi error
    try {
      setTimeout(() => {
        progress.currentQuestion++;
        progress.hasAnswered = false;
        
        if (progress.currentQuestion < playerQuestions.length) {
          sendQuestionToPlayer(playerId);
        } else {
          handlePlayerFinish(playerId);
        }
      }, gameState.settings.questionTransitionDelay);
    } catch (error) {
      console.error("Error saat pindah pertanyaan:", error);
    }
  });

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
    console.log(`Player disconnected: ${socket.id}`);
    clearInterval(socket.interval); // Hentikan ping

    const wasInGame = gameState.players[socket.id] && gameState.isRunning;
    const hadFinished = gameState.playerProgress[socket.id]?.isFinished;

    // Hapus data pemain
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

// Endpoint untuk reset manual (opsional)
app.get('/force-reset', (req, res) => {
  gameState.isRunning = false;
  gameState.players = {};
  gameState.finishOrder = [];
  res.send("Game direset paksa!");
});