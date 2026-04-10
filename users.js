/**
 * DAFTAR USER MANUAL WINZ XTR
 * Lo bisa tambah user di sini. 
 * Nanti pas panel jalan, script bakal ngecek ke sini.
 */

const daftarUser = [
  {
    username: "winz_admin",
    password: "123", // Ganti pass sesuka lo
    role: "admin",
    saldo: 1000000
  },
  {
    username: "customer1",
    password: "vipseller",
    role: "user",
    saldo: 50000
  }
];

module.exports = daftarUser;
