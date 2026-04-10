const admin = require("firebase-admin");
const crypto = require("crypto");
const daftarUser = require("./users.js"); // Pastikan file users.js sudah lo buat

// 1. Inisialisasi Firebase
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(require("./serviceAccountKey.json")),
      databaseURL: "https://winzshop-e91e0-default-rtdb.asia-southeast1.firebasedatabase.app"
    });
  }
  console.log(">> [FIREBASE] Connected to WinzShop Database.");
} catch (error) {
  console.error(">> [FATAL ERROR] Gagal konek Firebase:", error.message);
  process.exit(1);
}

const db = admin.database();

// --- FUNGSI CORE ---

/**
 * 1. Sinkronisasi User dari users.js ke Firebase
 * Otomatis daftarin user baru kalau belum ada di database.
 */
async function sinkronUser() {
  console.log(">> [SYSTEM] Checking users synchronization...");
  for (let u of daftarUser) {
    const userRef = db.ref("users/" + u.username);
    const snapshot = await userRef.once("value");

    if (!snapshot.exists()) {
      const apiKey = "WINZ-" + crypto.randomBytes(12).toString("hex").toUpperCase();
      await userRef.set({
        username: u.username,
        password: u.password,
        apikey: apiKey,
        saldo: u.saldo || 0,
        role: u.role || "user",
        created_at: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
      });
      // Simpan mapping API Key biar akses cepet
      await db.ref("api_keys/" + apiKey).set({ username: u.username });
      console.log(`>> [NEW USER] ${u.username} terdaftar. API Key: ${apiKey}`);
    }
  }
  console.log(">> [SYSTEM] Sinkronisasi Selesai.");
}

/**
 * 2. Fungsi Validasi API Key (Untuk Bot/API)
 */
async function cekApiKey(key) {
  if (!key) return { valid: false, pesan: "API Key kosong!" };
  
  try {
    const keyRef = db.ref("api_keys/" + key);
    const snapshot = await keyRef.once("value");
    
    if (snapshot.exists()) {
      const dataKey = snapshot.val();
      const userSnapshot = await db.ref("users/" + dataKey.username).once("value");
      return { valid: true, user: userSnapshot.val() };
    }
    return { valid: false, pesan: "API Key tidak terdaftar!" };
  } catch (err) {
    return { valid: false, pesan: "Database Error." };
  }
}

/**
 * 3. Fungsi Cek Login (Untuk Web login.html)
 */
async function cekLogin(username, password) {
  try {
    const userRef = db.ref("users/" + username);
    const snapshot = await userRef.once("value");
    const data = snapshot.val();

    if (data && data.password === password) {
      return { status: true, data: data };
    }
    return { status: false, pesan: "Username atau Password salah!" };
  } catch (err) {
    return { status: false, pesan: "Gagal verifikasi login." };
  }
}

// --- OTOMATISASI & MONITORING ---

// Kirim status online ke Vercel/Web tiap 10 detik
setInterval(() => {
  db.ref("status_panel").update({ 
    last_update: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
    unix_time: Date.now(),
    status: "Online"
  }).catch(() => {}); // Abaikan error silent
}, 10000);

// Jalankan sinkronisasi saat script dimulai
sinkronUser();

console.log(">> [WINZ XTR] SYSTEM READY & RUNNING...");

// Export agar bisa digunakan di bot Telegram/WhatsApp lo
module.exports = { cekApiKey, cekLogin, db };
