// ✅ Firebase 설정 및 초기화
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC2SSTwR74MNggXve5_lTrzYgd9lVe2A1E",
  authDomain: "game-1a6bb.firebaseapp.com",
  databaseURL: "https://game-1a6bb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "game-1a6bb",
  storageBucket: "game-1a6bb.appspot.com",
  messagingSenderId: "131774298629",
  appId: "1:131774298629:web:1e39f2b854bc258202ba6c"
};

const app = initializeApp(firebaseConfig);
const rtdb = getDatabase(app);
const auth = getAuth(app);

const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 1920;
canvas.height = 1080;

let mapData = [];
let currentUser = null;
let roomId = localStorage.getItem("roomId");
let uid = localStorage.getItem("uid");
const player = { x: 0, y: 0, direction: "down", frameIndex: 0, speed: 100, radius: 8 };
const otherPlayers = {};

const playerSprite = new Image();
playerSprite.src = "https://cdn.prod.website-files.com/67c6e0338a6a5dbe54292175/67f74eb4c670b8a7a2114bb8_character_base_16x16.png";

const tileImages = {
  0: new Image(),
  1: new Image(),
  2: new Image()
};
tileImages[0].src = "https://cdn.prod.website-files.com/67c6e0338a6a5dbe54292175/67f28581e22715681416a38f_tile-img.png"; // grass
tileImages[1].src = "https://cdn.prod.website-files.com/67c6e0338a6a5dbe54292175/67f287564c514c8de81a0ee2_wall.png"; // wall
tileImages[2].src = "https://cdn.prod.website-files.com/67c6e0338a6a5dbe54292175/67f3af44d3491da525dc42f5_ChatGPT%20Image%202025%EB%85%84%204%EC%9B%94%207%EC%9D%BC%20%EC%98%A4%ED%9B%84%2007_54_38%20(1).png"; // decoration

async function loadMapData() {
  const res = await fetch("https://jellyduke.github.io/Desperatio/mapData.json");
  mapData = await res.json();
  setPlayerToMapCenter();
}

function setPlayerToMapCenter() {
  const rows = mapData.length;
  const cols = mapData[0].length;
  player.x = (cols * 48) / 2;
  player.y = (rows * 48) / 2;
}

function isWall(x, y) {
  const tileMinCol = Math.floor((x - player.radius) / 48);
  const tileMaxCol = Math.floor((x + player.radius) / 48);
  const tileMinRow = Math.floor((y - player.radius) / 48);
  const tileMaxRow = Math.floor((y + player.radius) / 48);
  for (let r = tileMinRow; r <= tileMaxRow; r++) {
    for (let c = tileMinCol; c <= tileMaxCol; c++) {
      if (mapData[r]?.[c] === 1) return true;
    }
  }
  return false;
}

const keys = {};
document.addEventListener("keydown", (e) => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", (e) => keys[e.key.toLowerCase()] = false);

let direction = "down";
let frameIndex = 0;
let frameTimer = 0;
const FRAME_SPEED = 12;
let lastTime = performance.now();

function update(currentTime) {
  const delta = (currentTime - lastTime) / 1000;
  lastTime = currentTime;
  let dx = 0, dy = 0;
  if (keys["w"]) dy -= 1;
  if (keys["s"]) dy += 1;
  if (keys["a"]) dx -= 1;
  if (keys["d"]) dx += 1;
  if (dx !== 0 || dy !== 0) {
    direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
    frameTimer += delta * 60;
    if (frameTimer >= FRAME_SPEED) {
      frameTimer = 0;
      frameIndex = (frameIndex + 1) % 4;
    }
    const len = Math.hypot(dx, dy);
    dx /= len;
    dy /= len;
    const moveDist = player.speed * delta;
    const nextX = player.x + dx * moveDist;
    const nextY = player.y + dy * moveDist;
    if (!isWall(nextX, player.y)) player.x = nextX;
    if (!isWall(player.x, nextY)) player.y = nextY;
    syncPlayer();
  } else {
    frameIndex = 0;
    frameTimer = 0;
  }
  draw();
  requestAnimationFrame(update);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const offsetX = canvas.width / 2 - player.x;
  const offsetY = canvas.height / 2 - player.y;
  for (let r = 0; r < mapData.length; r++) {
    for (let c = 0; c < mapData[r].length; c++) {
      const tile = mapData[r][c];
      ctx.drawImage(tileImages[tile], c * 48 + offsetX, r * 48 + offsetY, 48, 48);
    }
  }
  for (const p of Object.values(otherPlayers)) {
    const spriteY = { down: 0, left: 48, right: 32, up: 16 }[p.direction];
    ctx.drawImage(playerSprite, p.frameIndex * 16, spriteY, 16, 16, p.x + offsetX - 8, p.y + offsetY - 8, 16, 16);
  }
  const spriteY = { down: 0, left: 48, right: 32, up: 16 }[direction];
  ctx.drawImage(playerSprite, frameIndex * 16, spriteY, 16, 16, canvas.width / 2 - 8, canvas.height / 2 - 8, 16, 16);
}

function syncPlayer() {
  if (!uid || !roomId) return;
  set(ref(rtdb, `rooms/${roomId}/players/${uid}`), {
    x: player.x,
    y: player.y,
    direction,
    frameIndex,
    lastUpdate: Date.now()
  });
}

onAuthStateChanged(auth, (user) => {
  if (!user) return;
  currentUser = user;
  uid = user.uid;
  roomId = localStorage.getItem("roomId");
  if (!roomId || !uid) return;
  onValue(ref(rtdb, `rooms/${roomId}/players`), (snapshot) => {
    const val = snapshot.val();
    if (!val) return;
    for (const [pid, pdata] of Object.entries(val)) {
      if (pid !== uid) otherPlayers[pid] = pdata;
    }
  });
});

Promise.all([playerSprite.decode(), ...Object.values(tileImages).map(img => img.decode())])
  .then(loadMapData)
  .then(() => requestAnimationFrame(update));
