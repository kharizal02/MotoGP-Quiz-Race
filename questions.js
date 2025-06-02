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
    "text": "Berdasarkan hasil citra axial CT Brain non-kontras di samping, anak panah menunjukkan terjadinya ?",
    "type": "image", 
    "image": "assets/gambar4.png",
    "options": ["Lesu subdural", "Lesi epidural", "Lesi intraserebral", "Lesi Kranium"],
    "answer": 1
  },
    {
    "id": 22,
    "text": "Berdasarkan hasil citra axial CT Brain non-kontras di samping, anak panah menunjukkan terjadinya ?",
    "type": "image", 
    "image": "assets/gambar4.png",
    "options": ["Lesu subdural", "Lesi epidural", "Lesi intraserebral", "Lesi Kranium"],
    "answer": 1
  },
];

module.exports = questions;