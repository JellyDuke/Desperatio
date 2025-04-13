 // Firebase 초기화 및 필요한 모듈 가져오기
 import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
 import {
   getFirestore,
   doc,
   setDoc,  
   getDoc,
   onSnapshot
 } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
 import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

 // Firebase 설정
 const firebaseConfig = {
   apiKey: "AIzaSyC2SSTwR74MNggXve5_lTrzYgd9lVe2A1E",
   authDomain: "game-1a6bb.firebaseapp.com",
   projectId: "game-1a6bb",
   storageBucket: "game-1a6bb.appspot.com",
   messagingSenderId: "131774298629",
   appId: "1:131774298629:web:1e39f2b854bc258202ba6c"
 };

 // Firebase 앱 초기화
 const app = initializeApp(firebaseConfig);
 const db = getFirestore(app);
 const auth = getAuth(app);

 // localStorage에서 방 ID와 사용자 UID 읽어오기
 const roomId = localStorage.getItem("roomId");
 const uid = localStorage.getItem("uid");

 if (!roomId || !uid) {
   console.error("필요한 정보가 부족합니다.");
   // 필요에 따라 대기실로 리디렉션하는 코드 추가
   // location.href = "/wallgame/robby";
   throw new Error("roomId 또는 uid가 없음");
 }

 // 게임에서 사용할 플레이어의 초기 상태 객체 (실제 값으로 대체)
 const playerState = {
   x: 100,            // 예시 값 (게임 로직에 따라 player.x)
   y: 200,            // 예시 값 (게임 로직에 따라 player.y)
   direction: "down", // 예시 값 (예: "down", "up", "left", "right")
   frameIndex: 0      // 예시 값 (애니메이션 프레임 인덱스)
 };

 /**
  * Firebase에 플레이어 초기 상태 등록 함수
  * @param {string} roomId - 방 ID
  * @param {string} uid - 사용자 UID
  * @param {object} playerState - 플레이어 상태 객체 (x, y, direction, frameIndex 등)
  */
 async function initFirebaseGame(roomId, uid, playerState) {
   // 해당 방의 players 컬렉션 아래에 uid 문서 생성/덮어쓰기
   const playerRef = doc(db, "rooms", roomId, "players", uid);
   await setDoc(playerRef, {
     x: playerState.x,
     y: playerState.y,
     direction: playerState.direction,
     frameIndex: playerState.frameIndex,
     lastUpdate: Date.now()  // 업데이트 시간 기록 (옵션)
   });
   console.log(`[Firebase] 플레이어 정보 등록 완료: ${uid}`);
 }

 /**
  * Firestore에서 방 데이터를 로드하는 함수
  * @param {string} roomId - 방 ID
  * @param {string} uid - 사용자 UID
  */
 async function loadGameData(roomId, uid) {
   const roomRef = doc(db, "rooms", roomId);
   const roomSnap = await getDoc(roomRef);
   if (roomSnap.exists()) {
     const roomData = roomSnap.data();
     console.log("방 정보:", roomData);

     // 내 플레이어 정보 읽기
     const myPlayerData = roomData.players ? roomData.players[uid] : null;
     console.log("내 플레이어 정보:", myPlayerData);
     // 필요한 후속 작업을 여기에 추가 (예: 화면 렌더링, 업데이트 시작 등)
     return roomData;
   } else {
     console.error("해당 방이 존재하지 않습니다.");
     return null;
   }
 }

 // Firebase에 플레이어 데이터 등록 후, 데이터 로드
 initFirebaseGame(roomId, uid, playerState)
   .then(() => loadGameData(roomId, uid))
   .then((data) => {
     if (data) {
       console.log("게임 데이터 로드 완료:", data);
       // 이후 게임 로직에 맞게 데이터를 활용 (예: 실시간 업데이트 리스너 등록 등)
     }
   })
   .catch((error) => {
     console.error("Firebase 작업 중 오류 발생:", error);
   });






// 1. 캔버스와 컨텍스트 가져오기 (HTML에 <canvas id="mapCanvas"> 와 <button id="resetBtn">가 있어야 함)
const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");

// 2. 고정 디자인 해상도 설정 (내부 해상도: 1920×1080)
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;
canvas.width = DESIGN_WIDTH;
canvas.height = DESIGN_HEIGHT;

// 3. 타일(프레임) 크기 설정 (픽셀 단위)
// 업로드하신 스프라이트 시트는 16×16 크기의 프레임, 각 방향당 5프레임
const FRAME_WIDTH = 16;
const FRAME_HEIGHT = 16;
const MAX_FRAMES = 4; // 각 방향당 프레임 5개

// 4. GitHub의 맵 데이터 불러오기
let mapData = [];
async function loadMapData() {
  const res = await fetch("https://jellyduke.github.io/Desperatio/mapData.json");
  mapData = await res.json();
}

// 5. 플레이어 객체 (게임 내 좌표 기준)
const player = {
  x: 0,
  y: 0,
  radius: 8,  // 충돌 검사 등에 사용
  speed: 100,
};

// 6. 맵 데이터를 기준으로 플레이어를 중앙에 배치
function setPlayerToMapCenter() {
  if (!mapData || mapData.length === 0) return;
  const rows = mapData.length;
  const cols = mapData[0].length;
  // 맵 한가운데에 플레이어 놓기 (타일 크기 = 48이 아니라면 적절히 조정)
  // 만약 맵 타일 크기도 16×16이라면 아래에서 48 → 16으로 수정해줘야 합니다.
  player.x = (cols * 48) / 2;  // ★ mapData의 타일 크기가 48일 경우
  player.y = (rows * 48) / 2;  // ★ 필요하면 여기서 48→16으로 변경
}

// 7. 맵 타일 이미지 로드
const tileImages = {
  0: new Image(),
  1: new Image(),
  2: new Image()
};
tileImages[0].src = "https://cdn.prod.website-files.com/67c6e0338a6a5dbe54292175/67f28581e22715681416a38f_tile-img.png";
tileImages[1].src = "https://cdn.prod.website-files.com/67c6e0338a6a5dbe54292175/67f287564c514c8de81a0ee2_wall.png";
tileImages[2].src = "https://cdn.prod.website-files.com/67c6e0338a6a5dbe54292175/67f3af44d3491da525dc42f5_ChatGPT%20Image%202025%EB%85%84%204%EC%9B%94%207%EC%9D%BC%20%EC%98%A4%ED%9B%84%2007_54_38%20(1).png";

// 8. 플레이어 스프라이트 이미지 로드 (16×16, 각 방향 5프레임)
const playerSprite = new Image();
// 아래 URL을 업로드하신 16×16 스프라이트 시트 경로로 교체
playerSprite.src = "https://cdn.prod.website-files.com/67c6e0338a6a5dbe54292175/67f74eb4c670b8a7a2114bb8_character_base_16x16.png";

// 9. 플레이어 애니메이션 상태 변수
// 방향: "down", "left", "right", "up" 중 하나
let direction = "down";
let frameIndex = 0;     // 0~4
let frameTimer = 0;     // 프레임 전환 속도 제어
const FRAME_SPEED = 12; // 틱 단위 애니메이션 전환 속도

// 10. 키 입력 처리 (WASD 및 스페이스바)
const keys = {};
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    scrollToPlayer();
    return;
  }
  keys[e.key.toLowerCase()] = true;
});
document.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

// 11. 벽(충돌) 검사 함수
function isWall(x, y) {
  const minX = x - player.radius;
  const maxX = x + player.radius;
  const minY = y - player.radius;
  const maxY = y + player.radius;

  // !!! 현재 맵 타일 크기가 48이라면 아래 col/row 계산에 48을 사용
  // 만약 mapData가 16×16짜리 타일이면 아래 48→16 변경
  const tileMinCol = Math.floor(minX / 48);
  const tileMaxCol = Math.floor(maxX / 48);
  const tileMinRow = Math.floor(minY / 48);
  const tileMaxRow = Math.floor(maxY / 48);

  for (let row = tileMinRow; row <= tileMaxRow; row++) {
    for (let col = tileMinCol; col <= tileMaxCol; col++) {
      if (row < 0 || row >= mapData.length || col < 0 || col >= mapData[0].length) {
        return true;
      }
      if (mapData[row][col] === 1) {
        return true;
      }
    }
  }
  return false;
}

// 12. 게임 루프: 플레이어 이동 + 애니메이션 업데이트
let lastTime = performance.now(); // 이전 프레임 시각 저장

function update(currentTime) {
  const delta = (currentTime - lastTime) / 1000; // 경과 시간(초)
  lastTime = currentTime;

  let dx = 0, dy = 0;
  if (keys["w"]) dy -= 1;
  if (keys["s"]) dy += 1;
  if (keys["a"]) dx -= 1;
  if (keys["d"]) dx += 1;

  if (dx !== 0 || dy !== 0) {
    // 방향 판단
    if (Math.abs(dx) > Math.abs(dy)) {
      direction = dx > 0 ? "right" : "left";
    } else {
      direction = dy > 0 ? "down" : "up";
    }

    // 프레임 전환 타이머 (시간 단위로 보정)
    frameTimer += delta * 60; // delta * 60은 "프레임 기준"과 비슷하게 동작
    if (frameTimer >= FRAME_SPEED) {
      frameTimer = 0;
      frameIndex = (frameIndex + 1) % MAX_FRAMES;
    }

    // 정규화된 방향에 시간 기반 이동 거리 계산
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

  draw();
  requestAnimationFrame(update);
}


// 13. 그리기 함수
function draw() {
  ctx.clearRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);

  const offsetX = DESIGN_WIDTH / 2 - player.x;
  const offsetY = DESIGN_HEIGHT / 2 - player.y;

  // 🧱 맵 타일 먼저 그림
  for (let r = 0; r < mapData.length; r++) {
    for (let c = 0; c < mapData[r].length; c++) {
      const tile = mapData[r][c];
      const img = tileImages[tile];
      if (img) {
        ctx.drawImage(img, c * 48 + offsetX, r * 48 + offsetY, 48, 48);
      }
    }
  }

  // 👾 다른 플레이어들 렌더링
  for (const player of Object.values(otherPlayers)) {
    const drawX = player.x + offsetX - FRAME_WIDTH / 2;
    const drawY = player.y + offsetY - FRAME_HEIGHT / 2;

    const dirMap = { down: 0, left: 3, right: 2, up: 1 };
    const spriteRow = dirMap[player.direction] ?? 0;
    const spriteX = player.frameIndex * FRAME_WIDTH;
    const spriteY = spriteRow * FRAME_HEIGHT;

    ctx.drawImage(
      playerSprite,
      spriteX, spriteY, FRAME_WIDTH, FRAME_HEIGHT,
      drawX, drawY, FRAME_WIDTH, FRAME_HEIGHT
    );
  }

  // 🙋 내 캐릭터는 항상 가운데
  const myDrawX = DESIGN_WIDTH / 2 - FRAME_WIDTH / 2;
  const myDrawY = DESIGN_HEIGHT / 2 - FRAME_HEIGHT / 2;

  const dirMap = { down: 0, left: 3, right: 2, up: 1 };
  const mySpriteRow = dirMap[direction] ?? 0;
  const mySpriteX = frameIndex * FRAME_WIDTH;
  const mySpriteY = mySpriteRow * FRAME_HEIGHT;

  ctx.drawImage(
    playerSprite,
    mySpriteX, mySpriteY, FRAME_WIDTH, FRAME_HEIGHT,
    myDrawX, myDrawY, FRAME_WIDTH, FRAME_HEIGHT
  );
}

let otherPlayers = {}; // 다른 플레이어 상태 저장

onSnapshot(doc(db, "rooms", roomId), (snapshot) => {
  const data = snapshot.data();
  if (!data || !data.players) return;

  otherPlayers = {};

  for (const [otherUid, playerInfo] of Object.entries(data.players)) {
    if (otherUid === uid) continue; // 자신은 제외
    otherPlayers[otherUid] = playerInfo;
  }
});

// 14. scrollToPlayer 함수 (별도 로직 없음)
function scrollToPlayer() {
  // 필요 시 구현
}

// 15. 리셋 버튼 이벤트
document.getElementById("resetBtn")?.addEventListener("click", scrollToPlayer);

// 16. 모든 이미지 로드 후 초기화 및 게임 시작
Promise.all([
  ...Object.values(tileImages).map(img => new Promise(resolve => { img.onload = resolve; })),
  new Promise(resolve => { playerSprite.onload = resolve; })
]).then(async () => {
  await loadMapData();
  setPlayerToMapCenter();
  update();
});
