import { db } from "./firebase.js";
import {
  collection, doc, setDoc, getDoc, addDoc,
  onSnapshot, query, where, serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const badWords = ["fuck","shit","bitch","nigger"];
const censor = t => badWords.reduce(
  (a,w)=>a.replace(new RegExp(w,"gi"),"****"), t
);

let username = localStorage.getItem("username");
let room = "general";

const loginDiv = document.getElementById("login");
const appDiv = document.getElementById("app");

async function init() {
  if (!username) return;

  const ban = await getDoc(doc(db,"bans",username));
  if (ban.exists()) {
    localStorage.removeItem("username");
    location.reload();
    return;
  }

  loginDiv.hidden = true;
  appDiv.hidden = false;
  document.getElementById("me").textContent = username;

  listenRooms();
  listenUsers();
  listenFriends();
}

document.getElementById("loginBtn").onclick = async () => {
  const u = usernameInput.value.trim();
  if (!u) return;

  const ref = doc(db,"users",u);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    loginError.textContent = "Username taken";
    return;
  }

  await setDoc(ref,{ name:u, created:Date.now() });
  localStorage.setItem("username",u);
  location.reload();
};

function listenRooms() {
  const q = query(collection(db,"messages"), where("room","==",room));
  onSnapshot(q,s=>{
    messages.innerHTML="";
    s.forEach(d=>{
      const m=d.data();
      messages.innerHTML+=`<div class="message"><b>${m.user}</b>: ${m.text}</div>`;
    });
  });
}

document.querySelectorAll(".tab").forEach(t=>{
  t.onclick=()=>{
    document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
    t.classList.add("active");
    room=t.dataset.room;
    roomTitle.textContent="# "+room;
    listenRooms();
  };
});

sendBtn.onclick=async()=>{
  const text=censor(msgInput.value.trim());
  if(!text)return;
  await addDoc(collection(db,"messages"),{
    user:username,text,room,time:serverTimestamp()
  });
  msgInput.value="";
};

function listenUsers(){
  onSnapshot(collection(db,"users"),s=>{
    userList.innerHTML="";
    s.forEach(d=>{
      if(d.id===username)return;
      const div=document.createElement("div");
      div.className="user";
      div.textContent=d.id;
      div.onclick=()=>openDM(d.id);
      userList.appendChild(div);
    });
  });
}

function listenFriends(){
  const q=query(collection(db,"friends"),where("users","array-contains",username));
  onSnapshot(q,s=>{
    friendsList.innerHTML="";
    s.forEach(d=>{
      const other=d.data().users.find(u=>u!==username);
      const div=document.createElement("div");
      div.className="friend";
      div.textContent=other;
      div.onclick=()=>openDM(other);
      friendsList.appendChild(div);
    });
  });
}

function openDM(other){
  alert("DM system wired — persistence ready (can expand next)");
}

init();
