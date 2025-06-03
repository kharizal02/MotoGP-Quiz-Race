const questions = [
  {
    "id": 1,
    "text": "Seorang pasien akan menjalani pemeriksaan Ct-Scan abdomen dengan penggunaan kontras oral dan intravena. Persiapan yang diperlukan meliputi:",
    "type": "text",
    "options": ["Berpuasa selama 4 jam sebelum pemeriksaan.", "Mengonsumsi makanan ringan sebelum pemeriksaan.", "Minum 500 mL tepat sebelum pemeriksaan.", "Tidak perlu persiapan Khusus."],
    "answer": 0
  },
  {
    "id": 2,
    "text": "Dalam prosedur Ct-Scan Brain non-kontras, posisi pasien yang benar selama pemeriksaan adalah:",
    "type": "text",
    "options": ["Duduk dengan kepala menunduk.", "Berbaring telentang dengan kepala tetap.", "Berbaring miring ke kanan.", "Berdiri dengan kepala menengadah."],
    "answer": 1
  },
  {
    "id": 3,
    "text": "Selama Ct-Scan abdomen dengan kontras, pasien diminta untuk menahan napas pada saat tertentu. Tujuan dari instruksi ini adalah:",
    "type": "text",
    "options": ["Mengurangi rasa mual selama pemeriksaan.", "Mencegah reaksi alergi terhadap kontras.", "Menghindari gerakan yang dapat mengaburkan gambar.", "Mempercepat waktu pemeriksaan."],
    "answer": 2
  },
  {
    "id": 4,
    "text": "Seorang pasien akan menjalani CT Scan thorax dengan kontras intravena. Persiapan yang tepat sebelum pemeriksaan ini adalah:",
    "type": "text",
    "options": ["Berpuasa minimal 2–4 jam sebelum pemeriksaan.", "Minum air sebanyak 1 liter 30 menit sebelum pemeriksaan.", "Menghindari konsumsi susu dan produk olahan susu selama 12 jam.", "Berolahraga ringan agar denyut jantung stabil saat diperiksa."],
    "answer": 0
  },
  {
    "id": 5,
    "text": "Seorang pasien dijadwalkan menjalani CT abdomen dengan kontras. Tindakan yang paling tepat untuk dilakukan dalam persiapan pasien adalah?",
    "type": "text",
    "options": ["Menganjurkan pasien makan makanan tinggi serat 1 jam sebelum pemeriksaan.", "Menyuntikkan kontras oral segera sebelum pasien memasuki ruang pemeriksaan.", "Memastikan pasien puasa minimal 4–6 jam sebelum pemeriksaan.", "Memberikan antibiotik profilaksis 1 hari sebelum pemeriksaan."],
    "answer": 2
  },
  {
    "id": 6,
    "text": "Berdasarkan citra axial CT Brain non-kontras diatas, huruf manakah yang menunjukkan letak struktur thalamus?",
    "type": "image", 
    "image": "assets/gambar1.png",
    "options": ["Struktur F", "Struktur E", "Struktur B", "Struktur C"],
    "answer": 1
  },
  {
    "id": 7,
    "text": "Pasien wanita usia produktif akan menjalani pemeriksaan ct scan, tindakan yang harus dilakukan radiografer adalah...",
    "type": "text",
    "options": ["Langsung melanjutkan pemeriksaan.", "Menanyakan apakah sedang hamil atau tidak.", "Meminta pasien berpuasa.", "Meminta pasien minum dalam jumlah banyak."],
    "answer": 1
  },
  {
    "id": 8,
    "text": "Struktur yang diberi huruf A adalah...",
    "type": "image", 
    "image": "assets/gambar2.png",
    "options": ["Superior vena cava", "Aortic arch", "Ascending aorta", "Descending aorta"],
    "answer": 2
  },
  {
    "id": 9,
    "text": "Dibawah ini yang bukan merupakan persiapan untuk pemeriksaan CT-Scan Kepala adalah...",
    "type": "text",
    "options": ["Melepas benda-benda logam dan aksesoris pada area kepala, seperti anting, jepit rambut, hair extensions.", "Ditanyakan kembali apakah pasien takut dengan ruang sempit atau tidak (claustrophobia).", "Pasien diberikan penjelasan tentang prosedur pemeriksaan.", "Memastikan pasien minum air putih 2-3 gelas sebelum pemeriksaan."],
    "answer": 3
  },
  {
    "id": 10,
    "text": "Urutan fase-fase kontras dalam CT Scan abdomen secara umum adalah...",
    "type": "text",
    "options": ["Fase arteri - non kontras - fase vena porta - fase delayed.", "Non kontras - fase arteri - fase vena porta - fase delayed.", "Non kontras - fase vena porta - fase arteri - fase delayed.", "Fase delayed - fase vena porta - fase arteri - non kontras."],
    "answer": 1
  },
  {
    "id": 11,
    "text": "Apa alasan utama dilakukannya tes fungsi ginjal saat persiapan sebelum pemberian zat kontras pada CT scan?",
    "type": "text",
    "options": ["Untuk menentukan dosis zat kontras yang tepat.", "Untuk menghindari risiko nefropati yang diinduksi oleh zat kontras pada pasien dengan gangguan fungsi ginjal.", "Untuk memastikan pasien tidak mengalami dehidrasi.", "Untuk menilai kemungkinan reaksi alergi terhadap zat kontras."],
    "answer": 1
  },
  {
    "id": 12,
    "text": "Untuk mengurangi artefak gerakan pada CT scan, tindakan yang dapat dilakukan adalah:",
    "type": "text",
    "options": ["Memperpanjang waktu pemindaian.", "Menginstruksikan pasien untuk menahan napas atau menggunakan teknik pemindaian cepat.", "Mengurangi dosis radiasi.", "Menggunakan kontras dengan konsentrasi tinggi."],
    "answer": 1
  },
  {
    "id": 13,
    "text": "Pemeriksaan lab apa saja yang menjadi pertimbangan untuk pemeriksaan ct-scan kontras, kecuali?",
    "type": "text",
    "options": ["Kreatinin.", "Ureum.", "Elektrolit.", "Pemeriksaan benda logam."],
    "answer": 3
  },
  {
    "id": 14,
    "text": "Pada pemeriksaan CT-Scan posisi kepala harus true AP, hal ini dapat ditandai dengan?",
    "type": "text",
    "options": ["OML tegak lurus dengan bidang coronal.", "Memastikan kepala tidak ada rotasi.", "MML tegak lurus bidang axial.", "IPL sejajar dengan bidang axial."],
    "answer": 2
  },
  {
    "id": 15,
    "text": "Manakah di antara pernyataan berikut yang paling tepat mengenai persiapan pasien untuk pemeriksaan CT scan non-kontras pada abdomen?",
    "type": "text",
    "options": ["Pasien diwajibkan untuk puasa minimal 6 jam sebelum pemeriksaan.", "Pasien perlu minum air yang banyak untuk mengisi kandung kemih.", "Pasien tidak memerlukan persiapan khusus, namun dianjurkan untuk melepaskan benda logam.", "Pasien harus mengonsumsi barium oral sebagai agen kontras positif."],
    "answer": 2
  },
  {
    "id": 16,
    "text": "Dari citra CT diatas, organ yg ditunjuk oleh nomor 56 yaitu...",
    "type": "image", 
    "image": "assets/gambar3.png",
    "options": ["Ileum", "Jejunum", "Renal", "Liver"],
    "answer": 1
  },
  {
    "id": 17,
    "text": "Pasien dijadwalkan menjalani CT urografi (evaluasi saluran kemih dengan kontras). Persiapan yang paling penting untuk diperiksa sebelum penyuntikan kontras adalah?",
    "type": "text",
    "options": ["Riwayat hipertensi.", "Kadar kreatinin dan fungsi ginjal.", "Jadwal konsumsi obat antihipertensi.", "Suhu tubuh."],
    "answer": 1
  },
  {
    "id": 18,
    "text": "Pemilihan slice thickness (ketebalan irisan) yang terlalu besar pada CT thoraks dapat menyebabkan:",
    "type": "text",
    "options": ["Meningkatnya resolusi spasial.", "Gagal mendeteksi nodul kecil paru.", "Penurunan noise citra.", "Lebih banyak gambar yang dihasilkan."],
    "answer": 1
  },
  {
    "id": 19,
    "text": "Wanita 45 tahun akan CT-Scan kepala dengan kontras. Ia punya riwayat alergi makanan laut dan pernah gatal setelah kontras sebelumnya. Apa tindakan terbaik sebelum pemeriksaan?",
    "type": "text",
    "options": ["Lanjutkan tanpa persiapan.", "Beri premedikasi antihistamin/steroid.", "Ganti ke MRI tanpa kontras.", "Gunakan air steril sebagai kontras."],
    "answer": 1
  },
  {
    "id": 20,
    "text": "Berdasarkan hasil citra axial CT Brain non-kontras di samping, anak panah menunjukkan terjadinya ?",
    "type": "image", 
    "image": "assets/gambar4.png",
    "options": ["Lesu subdural", "Lesi epidural", "Lesi intraserebral", "Lesi Kranium"],
    "answer": 1
  },
  {
    "id": 21,
    "text": "Pada pemeriksaan CT-Scan abdomen dengan kontras, posisi lengan pasien yang benar adalah?",
    "type": "text", 
    "options": ["Di samping badan", "Di atas kepala dan disanggah dengan bantal", "Ditekuk di depan dada", "Dibiarkan menggantung di samping meja pemeriksaan"],
    "answer": 1
  },
  {
    "id": 22,
    "text": "Saat melakukan injeksi kontras intravena pada CT-Scan, langkah penting sebelum injeksi adalah?",
    "type": "text", 
    "options": ["Memastikan pasien sudah makan", "Melakukan skin test untuk mendeteksi alergi", "Mengatur posisi kepala pasien", "Meminta pasien menahan napas"],
    "answer": 1
  },
  {
    "id": 23,
    "text": "Pemeriksaan CT scan dengan kontras intravena membutuhkan perhatian khusus pada kondisi berikut, kecuali?",
    "type": "text", 
    "options": ["Riwayat alergi terhadap kontras", "Fungsi ginjal pasien", "Kecepatan denyut jantung", "Puasa sebelum pemeriksaan"],
    "answer": 2
  },
  {
    "id": 24,
    "text": "Struktur apakah yang ditunjukkan oleh panah biru?",
    "type": "image", 
    "image": "assets/gambar5.png",
    "options": ["Hypothalamus", "Medulla", "Midbrain", "Pons"],
    "answer": 3
  },
  {
    "id": 25,
    "text": "Tujuan utama dari persiapan pasien sebelum dilakukan pemeriksaan CT scan adalah?",
    "type": "text", 
    "options": ["Mempercepat proses scanning", "Mengurangi biaya pemeriksaan", "Menjamin kenyamanan radiografer", "Menjamin keamanan dan keberhasilan pemeriksaan"],
    "answer": 3
  },
  {
    "id": 26,
    "text": "Arti dari istilah “hiperdens” pada citra CT scan adalah?",
    "type": "text", 
    "options": ["Wilayah yang tampak lebih gelap dari jaringan sekitarnya", "Semua jawaban benar", "Wilayah yang tampak lebih terang dari jaringan sekitarnya", "Semua jawaban salah"],
    "answer": 2
  },
  {
    "id": 27,
    "text": "Berdasarkan gambar diatas, struktur organ yang ditunjuk oleh nomor 14 adalah?",
    "type": "image", 
    "image": "assets/gambar6.png",
    "options": ["Hepar", "Renal", "Spleen", "Gallbladder"],
    "answer": 2
  },
  {
    "id": 28,
    "text": "Mengapa pasien yang mengkonsumsi metformin perlu menghentikan obat tersebut sebelum dan sesudah CT thorax dengan kontras?",
    "type": "text", 
    "options": ["Metformin dapat berinteraksi dengan kontras dan menyebabkan masalah ginjal", "Metformin dapat meningkatkan risiko alergi terhadap kontras", "Metformin dapat mempengaruhi kualitas gambar CT scan", "Metformin dapat menyebabkan efek samping yang serius"],
    "answer": 0
  },
  {
    "id": 29,
    "text": "Mengapa pada wanita hamil harus berhati-hati atau bahkan tidak diperbolehkan untuk menjalani pemeriksaan CT-Scan?",
    "type": "text", 
    "options": ["Karena CT-Scan dapat menyebabkan kontras pada uterus secara langsung", "Karena radiasi dari CT-Scan berpotensi menyebabkan kerusakan DNA dan gangguan perkembangan janin", "Karena CT-Scan menggunakan gelombang ultrasonik berfrekuensi tinggi yang dapat memengaruhi janin","Karena CT-Scan dapat menyebabkan gangguan hormonal pada ibu hamil"],
    "answer": 1
  },
  {
    "id": 30,
    "text": "Dalam pemeriksaan CT Scan kepala terdapat beberapa jenis windowing yang digunakan, kecuali?",
    "type": "text", 
    "options": ["Brain window", "Bone window", "Subdural window","Mediastinal window "],
    "answer": 3
  },
  {
    "id": 31,
    "text": "Pasien dengan riwayat alergi terhadap kontras iodin harus?",
    "type": "text", 
    "options": ["Diberi dosis radiasi lebih rendah", "Dibatasi minum air sebelum pemeriksaan", "Diberi premedikasi seperti steroid dan antihistamin sebelum CT scan","Tidak perlu menjalani persiapan khusus"],
    "answer": 2
  },
  {
    "id": 32,
    "text": "CT brain non-kontras dilakukan pada pasien penurunan kesadaran. Tampak hiperdensitas di sulkus parietal. Apa diagnosis kemungkinan?",
    "type": "text", 
    "options": ["Edema serebri", "Hematoma subaraknoid", "Iskemia serebral","Gliosis"],
    "answer": 1
  },
  {
    "id": 33,
    "text": "Seorang pasien laki-laki 55 tahun datang untuk menjalani pemeriksaan CT Scan abdomen tanpa kontras karena keluhan nyeri perut kanan atas. Dalam memberikan edukasi persiapan, radiografer harus memastikan bahwa?",
    "type": "text", 
    "options": ["Pasien berpuasa minimal 6 jam sebelum pemeriksaan dan tidak diperbolehkan minum air sama sekali", "Pasien harus mengonsumsi kontras oral satu jam sebelum pemeriksaan untuk memperjelas gambaran saluran cerna", "Pasien dapat makan dan minum seperti biasa, namun disarankan berkemih sebelum pemeriksaan","Pasien harus menjalani pemeriksaan laboratorium fungsi ginjal sebelum CT Scan dilakukan"],
    "answer": 2
  },
  {
    "id": 34,
    "text": "Apakah nama pemeriksaan pada gambar berikut?",
    "type": "image", 
    "image": "assets/gambar7.png",
    "options": ["CT-Scan Abdomen kontras potongan axial fase arteri", "CT-Scan Abdomen non kontras", "CT-Scan Abdomen kontras potongan axial fase vena", "CT-Scan Abdomen kontras potongan axial fase delay"],
    "answer": 3
  },
  {
    "id": 35,
    "text": "Tujuan utama dilakukan CT Scan adalah untuk?",
    "type": "text", 
    "options": ["Mengobati penyakit dalam", "Meningkatkan daya tahan tubuh", "Mendiagnosis kondisi medis secara detail dengan rekonstruksi 3D","Menyembuhkan luka dalam"],
    "answer": 2
  },
  {
    "id": 36,
    "text": "Kontraindikasi pada CT Scan tidak dianjurkan pada?",
    "type": "text", 
    "options": ["Pasien dengan diabetes", "Pasien lanjut usia","Wanita hamil", "Anak-anak yang sehat"],
    "answer": 2
  },
  {
    "id": 37,
    "text": "Sebelum pemeriksaan CT-Scan menggunakan kontras media, pasien akan dipastikan tidak memiliki riwayat alergi terhadap bahan kontras. Jika pasien memiliki riwayat alergi, maka upaya yang dilakukan adalah?",
    "type": "text", 
    "options": ["Memberi obat antikoagulan", "Memberi obat antihistamin","Memberi obat antiinflamasi", "Memberi obat metformin"],
    "answer": 1
  },
  {
    "id": 38,
    "text": "Area scanning pada CT abdomen mencakup?",
    "type": "text", 
    "options": ["Apex paru hingga krista illiaka", "Diafragma hingga krista illiaka","Diafragma hingga symphisis pubis", "Diafragma hingga symphisis pubis"],
    "answer": 2
  },
];

module.exports = questions;