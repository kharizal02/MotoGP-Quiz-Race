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
  
  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  
  // Update correct answer index
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
      options: ["a. Berpuasa selama 4 jam sebelum pemeriksaan.", "b. Mengonsumsi makanan ringan sebelum pemeriksaan.", "c. Minum 500 mL tepat sebelum pemeriksaan.", "d. Tidak perlu persiapan Khusus."],
      answer: 0
    },
    {
      id: 2,
      text: "Dalam prosedur Ct-Scan Brain non-kontras, posisi pasien yang benar selama pemeriksaan adalah:",
      type: "text",
      options: ["a. Duduk dengan kepala menunduk.", "b. Berbaring telentang dengan kepala tetap.", "c. Berbaring miring ke kanan.", "d. Berdiri dengan kepala menengadah."],
      answer: 1
    },
    {
      id: 3,
      text: "Selama Ct-Scan abdomen dengan kontras, pasien diminta untuk menahan napas pada saat tertentu. Tujuan dari instruksi ini adalah:",
      type: "text",
      options: ["a. Mengurangi rasa mual selama pemeriksaan.", "b. Mencegah reaksi alergi terhadap kontras.", "c. Menghindari gerakan yang dapat mengaburkan gambar.", "d. Mempercepat waktu pemeriksaan."],
      answer: 2
    },
    {
      id: 4,
      text: "Seorang pasien akan menjalani CT Scan thorax dengan kontras intravena. Persiapan yang tepat sebelum pemeriksaan ini adalah:",
      type: "text",
      options: ["a. Berpuasa minimal 2–4 jam sebelum pemeriksaan.", "b. Minum air sebanyak 1 liter 30 menit sebelum pemeriksaan.", "c. Menghindari konsumsi susu dan produk olahan susu selama 12 jam.", "d. Berolahraga ringan agar denyut jantung stabil saat diperiksa."],
      answer: 0
    },
    {
      id: 5,
      text: "Seorang pasien dijadwalkan menjalani CT abdomen dengan kontras. Tindakan yang paling tepat untuk dilakukan dalam persiapan pasien adalah?",
      type: "text",
      options: ["a. Menganjurkan pasien makan makanan tinggi serat 1 jam sebelum pemeriksaan.", "b. Menyuntikkan kontras oral segera sebelum pasien memasuki ruang pemeriksaan.", "c. Memastikan pasien puasa minimal 4–6 jam sebelum pemeriksaan.", "d. Memberikan antibiotik profilaksis 1 hari sebelum pemeriksaan."],
      answer: 2
    },
    {
      id: 6,
      text: "Berdasarkan citra axial CT Brain non-kontras diatas, huruf manakah yang menunjukkan letak struktur thalamus?",
      type: "image", 
      image: "assets/gambar1.png",
      options: ["a. Struktur F", "b. Struktur E", "c. Struktur B", "d. Struktur C"],
      answer: 1
    },
    {
      id: 7,
      text: "Pasien wanita usia produktif akan menjalani pemeriksaan ct scan, tindakan yang harus dilakukan radiografer adalah...",
      type: "text",
      options: ["a. Langsung melanjutkan pemeriksaan.", "b. Menanyakan apakah sedang hamil atau tidak.", "c. Meminta pasien berpuasa.", "d. Meminta pasien minum dalam jumlah banyak."],
      answer: 1
    },
    {
      id: 8,
      text: "Struktur yang diberi huruf A adalah...",
      type: "image", 
      image: "assets/gambar2.png",
      options: ["a. Superior vena cava", "b. Aortic arch", "c. Ascending aorta", "d. Descending aorta"],
      answer: 2
    },
    {
      id: 9,
      text: "Dibawah ini yang bukan merupakan persiapan untuk pemeriksaan CT-Scan Kepala adalah...",
      type: "text",
      options: ["a. Melepas benda-benda logam dan aksesoris pada area kepala, seperti anting, jepit rambut, hair extensions.", "b. Ditanyakan kembali apakah pasien takut dengan ruang sempit atau tidak (claustrophobia).", "c. Pasien diberikan penjelasan tentang prosedur pemeriksaan.", "d. Memastikan pasien minum air putih 2-3 gelas sebelum pemeriksaan."],
      answer: 3
    },
    {
      id: 10,
      text: "Urutan fase-fase kontras dalam CT Scan abdomen secara umum adalah...",
      type: "text",
      options: ["a. Fase arteri - non kontras - fase vena porta - fase delayed.", "b. Non kontras - fase arteri - fase vena porta - fase delayed.", "c. Non kontras - fase vena porta - fase arteri - fase delayed.", "d. Fase delayed - fase vena porta - fase arteri - non kontras."],
      answer: 1
    },
    {
      id: 11,
      text: "Apa alasan utama dilakukannya tes fungsi ginjal saat persiapan sebelum pemberian zat kontras pada CT scan?",
      type: "text",
      options: ["a. Untuk menentukan dosis zat kontras yang tepat.", "b. Untuk menghindari risiko nefropati yang diinduksi oleh zat kontras pada pasien dengan gangguan fungsi ginjal.", "c. Untuk memastikan pasien tidak mengalami dehidrasi.", "d. Untuk menilai kemungkinan reaksi alergi terhadap zat kontras."],
      answer: 1
    },
    {
      id: 12,
      text: "Untuk mengurangi artefak gerakan pada CT scan, tindakan yang dapat dilakukan adalah:",
      type: "text",
      options: ["a. Memperpanjang waktu pemindaian.", "b. Menginstruksikan pasien untuk menahan napas atau menggunakan teknik pemindaian cepat.", "c. Mengurangi dosis radiasi.", "d. Menggunakan kontras dengan konsentrasi tinggi."],
      answer: 1
    },
    {
      id: 13,
      text: "Pemeriksaan lab apa saja yang menjadi pertimbangan untuk pemeriksaan ct-scan kontras, kecuali?",
      type: "text",
      options: ["a. Kreatinin.", "b. Ureum.", "c. Elektrolit.", "d. Pemeriksaan benda logam."],
      answer: 3
    },
    {
      id: 14,
      text: "Pada pemeriksaan CT-Scan posisi kepala harus true AP, hal ini dapat ditandai dengan?",
      type: "text",
      options: ["a. OML tegak lurus dengan bidang coronal.", "b. Memastikan kepala tidak ada rotasi.", "c. MML tegak lurus bidang axial.", "d. IPL sejajar dengan bidang axial."],
      answer: 2
    },
    {
      id: 15,
      text: "Manakah di antara pernyataan berikut yang paling tepat mengenai persiapan pasien untuk pemeriksaan CT scan non-kontras pada abdomen?",
      type: "text",
      options: ["a. Pasien diwajibkan untuk puasa minimal 6 jam sebelum pemeriksaan.", "b. Pasien perlu minum air yang banyak untuk mengisi kandung kemih.", "c. Pasien tidak memerlukan persiapan khusus, namun dianjurkan untuk melepaskan benda logam.", "d. Pasien harus mengonsumsi barium oral sebagai agen kontras positif."],
      answer: 2
    },
    {
      id: 16,
      text: "Dari citra CT diatas, organ yg ditunjuk oleh nomor 56 yaitu...",
      type: "image", 
      image: "assets/gambar3.png",
      options: ["a. Ileum", "b. Jejunum", "c. Renal", "d. Liver"],
      answer: 1
    },
    {
      id: 17,
      text: "Pasien dijadwalkan menjalani CT urografi (evaluasi saluran kemih dengan kontras). Persiapan yang paling penting untuk diperiksa sebelum penyuntikan kontras adalah?",
      type: "text",
      options: ["a. Riwayat hipertensi.", "b. Kadar kreatinin dan fungsi ginjal.", "c. Jadwal konsumsi obat antihipertensi.", "d. Suhu tubuh."],
      answer: 1
    },
    {
      id: 18,
      text: "Pemilihan slice thickness (ketebalan irisan) yang terlalu besar pada CT thoraks dapat menyebabkan:",
      type: "text",
      options: ["a. Meningkatnya resolusi spasial.", "b. Gagal mendeteksi nodul kecil paru.", "c. Penurunan noise citra.", "d. Lebih banyak gambar yang dihasilkan."],
      answer: 1
    },
    {
      id: 19,
      text: "Wanita 45 tahun akan CT-Scan kepala dengan kontras. Ia punya riwayat alergi makanan laut dan pernah gatal setelah kontras sebelumnya. Apa tindakan terbaik sebelum pemeriksaan?",
      type: "text",
      options: ["a. Lanjutkan tanpa persiapan.", "b. Beri premedikasi antihistamin/steroid.", "c. Ganti ke MRI tanpa kontras.", "d. Gunakan air steril sebagai kontras."],
      answer: 1
    },
    {
      id: 20,
      text: "Berdasarkan hasil citra axial CT Brain non-kontras di samping, anak panah menunjukkan terjadinya ?",
      type: "image", 
      image: "assets/gambar4.png",
      options: ["a. Lesu subdural", "b. Lesi epidural", "c. Lesi intraserebral", "d. Lesi Kranium"],
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
  
  if (progress.currentQuestion >= playerQuestions.length) return;

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
  const progress = gameState.playerProgress[playerId];
  
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
  const allFinished = Object.keys(gameState.players).every(playerId => {
    const progress = gameState.playerProgress[playerId];
    return progress.currentQuestion >= gameState.playerQuestions[playerId].length;
  });

  if (allFinished) {
    setTimeout(endGame, 2000);
  }
}

function endGame() {
  gameState.isRunning = false;

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

    clearTimeout(gameState.playerTimers[playerId]);

    progress.hasAnswered = true;
    
    if (isCorrect) {
      progress.score += 4;
      progress.correctAnswers += 1;
    }

    updateLeaderboard();

    setTimeout(() => {
      progress.currentQuestion++;
      progress.hasAnswered = false;
      
      if (progress.currentQuestion < playerQuestions.length) {
        sendQuestionToPlayer(playerId);
      } else {
        handlePlayerFinish(playerId);
      }
    }, gameState.settings.questionTransitionDelay);
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
    
    delete gameState.players[socket.id];
    delete gameState.playerProgress[socket.id];
    delete gameState.playerQuestions[socket.id];
    readyPlayers.delete(socket.id);
    clearTimeout(gameState.playerTimers[socket.id]);
    delete gameState.playerTimers[socket.id];
    
    const finishIndex = gameState.finishOrder.indexOf(socket.id);
    if (finishIndex > -1) {
      gameState.finishOrder.splice(finishIndex, 1);
      gameState.finishOrder.forEach((playerId, index) => {
        if (gameState.playerProgress[playerId]) {
          gameState.playerProgress[playerId].finishPosition = index + 1;
        }
      });
    }
    
    updateLobby();
    if (gameState.isRunning) {
      updateLeaderboard();
      checkGameCompletion();
    }
  });
});