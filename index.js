<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Winz Access - Login System</title>
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js"></script>
    <style>
        body { background: #000; color: #ff0000; font-family: 'Courier New', monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .login-card { border: 2px solid #ff0000; padding: 30px; box-shadow: 0 0 15px #ff0000; background: #0a0a0a; width: 300px; text-align: center; }
        input { width: 100%; padding: 10px; margin: 10px 0; background: #111; border: 1px solid #ff0000; color: #fff; box-sizing: border-box; text-align: center; }
        button { width: 100%; padding: 10px; background: #ff0000; border: none; color: #000; font-weight: bold; cursor: pointer; transition: 0.3s; margin-top: 10px; }
        button:hover { background: #fff; box-shadow: 0 0 10px #fff; }
        #status { margin-top: 15px; font-size: 0.8em; }
    </style>
</head>
<body>

<div class="login-card">
    <h2>WINZ SYSTEM</h2>
    <div id="panel-status" style="font-size: 0.7em; margin-bottom: 10px;">Checking Panel...</div>
    <input type="text" id="user" placeholder="USERNAME">
    <input type="password" id="pass" placeholder="PASSWORD">
    <button onclick="login()">ENTER SYSTEM</button>
    <div id="status">WAITING...</div>
</div>

<script>
    const firebaseConfig = {
        apiKey: "AIzaSyANRhJ2YCC1-zqEkZhrIUnluUQcg9A5HrM", //
        databaseURL: "https://winzshop-e91e0-default-rtdb.asia-southeast1.firebasedatabase.app", //
        projectId: "winzshop-e91e0"
    };

    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();

    // Pantau Status Panel (Online/Offline)
    db.ref("status_panel").on("value", (snapshot) => {
        const data = snapshot.val();
        const pStatus = document.getElementById("panel-status");
        if (data) {
            const isOnline = (Date.now() - data.unix_time) < 30000;
            pStatus.innerHTML = isOnline ? "<span style='color:#0f0'>PANEL: ONLINE</span>" : "<span style='color:#f00'>PANEL: OFFLINE</span>";
        }
    });

    function login() {
        const username = document.getElementById('user').value;
        const password = document.getElementById('pass').value;
        const status = document.getElementById('status');

        if (!username || !password) {
            status.innerText = "ISI SEMUA KOLOM!";
            return;
        }

        status.innerText = "VERIFYING...";

        db.ref('users/' + username).once('value').then((snapshot) => {
            const data = snapshot.val();
            if (data && data.password === password) {
                status.style.color = "#00ff00";
                status.innerText = "ACCESS GRANTED!";
                localStorage.setItem("winz_user", JSON.stringify(data));
                setTimeout(() => { window.location.href = "dashboard.html"; }, 1500);
            } else {
                status.innerText = "WRONG USER/PASS!";
            }
        });
    }
</script>
</body>
</html>
