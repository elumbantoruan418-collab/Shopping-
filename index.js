const admin = require("firebase-admin");
const crypto = require("crypto");

// 1. Inisialisasi Firebase
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require("./serviceAccountKey.json")),
    databaseURL: "https://winzshop-e91e0-default-rtdb.asia-southeast1.firebasedatabase.app"
  });
}

const db = admin.database();

// --- FUNGSI CORE DASHBOARD ---

/**
 * 1. Fungsi Buat User & API Key
 * Dipanggil kalau mau nambah user baru lewat terminal/logic.
 */
async function buatUser(username, password) {
  const apiKey = "WINZ-" + crypto.randomBytes(12).toString("hex").toUpperCase();
  const userData = {
    username: username,
    password: password,
    apikey: apiKey,
    saldo: 0,
    role: "user",
    created_at: new Date().toLocaleString()
  };

  await db.ref("users/" + username).set(userData);
  // Simpan index API Key biar nyarinya cepet pas validasi
  await db.ref("api_keys/" + apiKey).set({ username: username });
  
  console.log(`\n==============================`);
  console.log(`>> USER BARU BERHASIL DIBUAT`);
  console.log(`>> Username: ${username}`);
  console.log(`>> API Key : ${apiKey}`);
  console.log(`==============================\n`);
}

/**
 * 2. Fungsi Validasi API Key
 * Gunakan fungsi ini di bot lo buat ngecek user boleh akses atau nggak.
 */
async function cekApiKey(key) {
  if (!key) return { valid: false, pesan: "API Key kosong!" };

  const keyRef = db.ref("api_keys/" + key);
  const snapshot = await keyRef.once("value");
  
  if (snapshot.exists()) {
    const dataKey = snapshot.val();
    // Ambil data detail user-nya
    const userSnapshot = await db.ref("users/" + dataKey.username).once("value");
    return { valid: true, user: userSnapshot.val() };
  } else {
    return { valid: false, pesan: "API Key tidak valid/salah!" };
  }
}

/**
 * 3. Fungsi Cek Login Web
 */
async function cekLogin(username, password) {
  const userRef = db.ref("users/" + username);
  const snapshot = await userRef.once("value");
  const data = snapshot.val();

  if (data && data.password === password) {
    return { status: true, data: data };
  } else {
    return { status: false, pesan: "Username atau Password salah!" };
  }
}

// --- OTOMATISASI ---

// Laporan Online ke Vercel tiap 10 detik
setInterval(() => {
  db.ref("status_panel").update({ 
    last_update: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
    unix_time: Date.now(),
    status: "Online"
  });
}, 10000);

// --- CONTOH CARA PAKE (Testing) ---
// Buka komen di bawah kalau mau coba buat user pertama kali:
// buatUser("winz_admin", "winz123");

console.log(">> [WINZ XTR] Dashboard & API Key System is RUNNING...");

// Export biar bisa dipake di file lain (misal bot.js)
module.exports = { cekApiKey, buatUser, cekLogin };
