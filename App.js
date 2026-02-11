// Firebase config
firebase.initializeApp({
  apiKey: "AIzaSyBDvT2rZPyA5n129hLS8stC-Xns4XLJLao",
  authDomain: "school-chat-173.firebaseapp.com",
  projectId: "school-chat-173",
  storageBucket: "school-chat-173.firebasestorage.app",
  messagingSenderId: "307920162706",
  appId: "1:307920162706:web:45f2c7299945d613417b4b"
});

const db = firebase.firestore();

// Elements
const loginDiv = document.getElementById("login");
const appDiv = document.getElementById("app");
const errorText = document.getElementById("error");

let username = localStorage.getItem("username");
let room = "general";

// Swear filter
const badWords = ["fuck","shit","bitch","nigger"];
function censor(text) {
  let t = text;
  badWords.forEach(w => {
    t = t.replace(new RegExp(w, "gi"), "****");
  });
  return t;
}

// LOGIN (FIXED)
async function login() {
  const u = usernameInput.value.trim();
  if (!u) return;

  const banned = await db.collection("bans").doc(u).get();
  if (banned.exists) {
    errorText.textContent = "You are banned.";
    return;
  }

  const userDoc = await db.collection("users").doc(u).get();

  // Block only if name exists AND not this device
  if (userDoc.exists && localStorage.getItem("username") !== u) {
    errorText.textContent = "Username taken";
    return;
  }

  if (!userDoc.exists) {
    await db.collection("users").doc(u).set({ joined: Date.now() });
  }

  localStorage.setItem("username", u);
  location.reload();
}

// AUTO LOGIN
if (username) {
  loginDiv.style.display = "none";
  appDiv.style.display = "flex";
  document.getElementById("me").textContent = username;

  if (username === "admin") {
    document.getElementById("adminPanel").style.display = "block";
  }

  listenUsers();
  listenMessages();
}

// USERS
function listenUsers() {
  db.collection("users").onSnapshot(snap => {
    users.innerHTML = "";
    snap.forEach(doc => {
      if (doc.id === username) return;
      const div = document.createElement("div");
      div.className = "user";
      div.textContent = doc.id;
      users.appendChild(div);
    });
  });
}

// ROOMS
function switchRoom(r, el) {
  room = r;
  document.querySelectorAll(".room").forEach(x => x.classList.remove("active"));
  el.classList.add("active");
  listenMessages();
}

// MESSAGES
function listenMessages() {
  db.collection("messages")
    .where("room", "==", room)
    .orderBy("time")
    .onSnapshot(snap => {
      messages.innerHTML = "";
      snap.forEach(doc => {
        const m = doc.data();
        messages.innerHTML += `
          <div class="msg"><b>${m.user}</b>: ${m.text}</div>
        `;
      });
    });
}

function sendMessage() {
  const text = censor(msgInput.value.trim());
  if (!text) return;

  db.collection("messages").add({
    user: username,
    text,
    room,
    time: firebase.firestore.FieldValue.serverTimestamp()
  });

  msgInput.value = "";
}

// ADMIN BAN
function banUser() {
  const u = banInput.value.trim();
  if (!u) return;
  db.collection("bans").doc(u).set({ banned: true });
  alert(u + " banned");
}
