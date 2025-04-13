import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Firebase 설정 및 초기화
const firebaseConfig = {
  apiKey: "AIzaSyC2SSTwR74MNggXve5_lTrzYgd9lVe2A1E",
  authDomain: "game-1a6bb.firebaseapp.com",
  projectId: "game-1a6bb",
  storageBucket: "game-1a6bb.appspot.com",
  messagingSenderId: "131774298629",
  appId: "1:131774298629:web:1e39f2b854bc258202ba6c",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 유저 정보
const roomId = localStorage.getItem("roomId");
const uid = localStorage.getItem("uid");
if (!roomId || !uid) {
  alert("잘못된 접근입니다.");
  location.href = "/wallgame/robby";
  throw new Error("roomId 또는 uid 없음");
}

// 초기 위치 상태
const playerState = {
  x: 100,
  y: 200,
  direction: "down",
  frameIndex: 0,
};

// 플레이어 등록
await setDoc(doc(db, "rooms", roomId, "players", uid), {
  ...playerState,
  lastUpdate: Date.now(),
});
console.log("✅ 플레이어 Firestore 등록 완료");

// 캔버스 설정
const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;
canvas.width = DESIGN_WIDTH;
canvas.height = DESIGN_HEIGHT;

// 타일 이미지 및 맵 로딩
const tileImages = {
  0: new Image(),
  1: new Image(),
  2: new Image(),
};
tileImages[0].src = "https://cdn.prod.website-files.com/67c6e0338a6a5dbe54292175/67f28581e22715681416a38f_tile-img.png";
tileImages[1].src = "https://cdn.prod.website-files.com/67c6e0338a6a5dbe54292175/67f287564c514c8de81a0ee2_wall.png";
tileImages[2].src = "https://cdn.prod.website-files.com/67c6e0338a6a5dbe54292175/67f3af44d3491da525dc42f5_ChatGPT%20Image%202025%EB%85%84%204%EC%9B%94%207%EC%9D%BC%20%EC%98%A4%ED%9B%84%2007_54_38%20(1).png";

const playerSprite = new Image();
playerSprite.src = "https://cdn.prod.website-files.com/67c6e0338a6a5dbe54292175/67f74eb4c670b8a7a2114bb8_character_base_16x16.png";

// 플레이어 위치 및 이동 처리
const FRAME_WIDTH = 16;
const FRAME_HEIGHT = 16;
const MAX_FRAMES = 4;
const FRAME_SPEED = 12;
const player = { x: 0, y: 0, radius: 8, speed: 100 };
let direction = "down";
let frameIndex = 0;
let frameTimer = 0;
let lastTime = performance.now();
let keys = {};
let lastSync = 0; // 🔁 Firebase 동기화 간격 조절용

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") e.preventDefault();
  keys[e.key.toLowerCase()] = true;
});
document.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

let mapData = [];
async function loadMapData() {
  const res = await fetch("https://jellyduke.github.io/Desperatio/mapData.json");
  mapData = await res.json();
  const rows = mapData.length;
  const cols = mapData[0].length;
  player.x = (cols * 48) / 2;
  player.y = (rows * 48) / 2;
}

function isWall(x, y) {
  const minX = x - player.radius;
  const maxX = x + player.radius;
  const minY = y - player.radius;
  const maxY = y + player.radius;
  const tileMinCol = Math.floor(minX / 48);
  const tileMaxCol = Math.floor(maxX / 48);
  const tileMinRow = Math.floor(minY / 48);
  const tileMaxRow = Math.floor(maxY / 48);
  for (let row = tileMinRow; row <= tileMaxRow; row++) {
    for (let col = tileMinCol; col <= tileMaxCol; col++) {
      if (row < 0 || row >= mapData.length || col < 0 || col >= mapData[0].length) return true;
      if (mapData[row][col] === 1) return true;
    }
  }
  return false;
}

function draw() {
  ctx.clearRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
  const offsetX = DESIGN_WIDTH / 2 - player.x;
  const offsetY = DESIGN_HEIGHT / 2 - player.y;

  for (let r = 0; r < mapData.length; r++) {
    for (let c = 0; c < mapData[r].length; c++) {
      const tile = mapData[r][c];
      const img = tileImages[tile];
      if (img) ctx.drawImage(img, c * 48 + offsetX, r * 48 + offsetY, 48, 48);
    }
  }

  for (const player of Object.values(otherPlayers)) {
    const drawX = player.x + offsetX - FRAME_WIDTH / 2;
    const drawY = player.y + offsetY - FRAME_HEIGHT / 2;
    const dirMap = { down: 0, left: 3, right: 2, up: 1 };
    const spriteRow = dirMap[player.direction] ?? 0;
    const spriteX = player.frameIndex * FRAME_WIDTH;
    const spriteY = spriteRow * FRAME_HEIGHT;
    ctx.drawImage(playerSprite, spriteX, spriteY, FRAME_WIDTH, FRAME_HEIGHT, drawX, drawY, FRAME_WIDTH, FRAME_HEIGHT);
  }

  const myDrawX = DESIGN_WIDTH / 2 - FRAME_WIDTH / 2;
  const myDrawY = DESIGN_HEIGHT / 2 - FRAME_HEIGHT / 2;
  const dirMap = { down: 0, left: 3, right: 2, up: 1 };
  const mySpriteRow = dirMap[direction] ?? 0;
  const mySpriteX = frameIndex * FRAME_WIDTH;
  const mySpriteY = mySpriteRow * FRAME_HEIGHT;
  ctx.drawImage(playerSprite, mySpriteX, mySpriteY, FRAME_WIDTH, FRAME_HEIGHT, myDrawX, myDrawY, FRAME_WIDTH, FRAME_HEIGHT);
}

// 🔄 자신의 위치를 Firestore에 업데이트
async function updateMyPosition() {
  const myPlayerRef = doc(db, "rooms", roomId, "players", uid);
  await updateDoc(myPlayerRef, {
    x: player.x,
    y: player.y,
    direction,
    frameIndex,
    lastUpdate: Date.now(),
  });
}
setInterval(updateMyPosition, 200); // 0.2초 간격으로 위치 업데이트

// 12. 게임 루프: 플레이어 이동 + 애니메이션 업데이트

function update(currentTime) {
  const delta = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  let dx = 0, dy = 0;
  if (keys["w"]) dy -= 1;
  if (keys["s"]) dy += 1;
  if (keys["a"]) dx -= 1;
  if (keys["d"]) dx += 1;

  if (dx !== 0 || dy !== 0) {
    if (Math.abs(dx) > Math.abs(dy)) {
      direction = dx > 0 ? "right" : "left";
    } else {
      direction = dy > 0 ? "down" : "up";
    }

    frameTimer += delta * 60;
    if (frameTimer >= FRAME_SPEED) {
      frameTimer = 0;
      frameIndex = (frameIndex + 1) % MAX_FRAMES;
    }

    const len = Math.hypot(dx, dy);
    dx /= len;
    dy /= len;
    const moveDist = player.speed * delta;
    const nextX = player.x + dx * moveDist;
    const nextY = player.y + dy * moveDist;

    if (!isWall(nextX, player.y)) player.x = nextX;
    if (!isWall(player.x, nextY)) player.y = nextY;
  } else {
    frameIndex = 0;
    frameTimer = 0;
  }

  // ✅ Firestore에 내 위치 동기화 (0.2초마다)
  if (currentTime - lastSync > 200) {
    lastSync = currentTime;

    const myRef = doc(db, "rooms", roomId, "players", uid);
    setDoc(myRef, {
      x: player.x,
      y: player.y,
      direction: direction,
      frameIndex: frameIndex,
      lastUpdate: Date.now()
    }, { merge: true });
  }

  draw();
  requestAnimationFrame(update);
}

let otherPlayers = {};
onSnapshot(doc(db, "rooms", roomId), (snap) => {
  const data = snap.data();
  if (!data?.players) return;
  otherPlayers = {};
  for (const [otherId, p] of Object.entries(data.players)) {
    if (otherId === uid) continue;
    otherPlayers[otherId] = p;
  }
});

// 초기화
await Promise.all([
  ...Object.values(tileImages).map((img) => new Promise((res) => (img.onload = res))),
  new Promise((res) => (playerSprite.onload = res)),
]);

await loadMapData();
update();
