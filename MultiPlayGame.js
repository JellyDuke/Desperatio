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
  speed: 1,
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
function update() {
  let dx = 0, dy = 0;
  if (keys["w"]) dy -= 1;
  if (keys["s"]) dy += 1;
  if (keys["a"]) dx -= 1;
  if (keys["d"]) dx += 1;

  if (dx !== 0 || dy !== 0) {
    // 이동 방향 -> 애니메이션 방향
    if (Math.abs(dx) > Math.abs(dy)) {
      direction = dx > 0 ? "right" : "left";
    } else {
      direction = dy > 0 ? "down" : "up";
    }

    // 프레임 전환
    frameTimer++;
    if (frameTimer >= FRAME_SPEED) {
      frameTimer = 0;
      frameIndex = (frameIndex + 1) % MAX_FRAMES; // 0~4 반복
    }

    // 플레이어 이동
    const len = Math.hypot(dx, dy);
    dx /= len;
    dy /= len;
    const nextX = player.x + dx * player.speed;
    const nextY = player.y + dy * player.speed;
    if (!isWall(nextX, player.y)) player.x = nextX;
    if (!isWall(player.x, nextY)) player.y = nextY;

  } else {
    // 정지 시: 한 프레임(여기서는 0번 or 중간 프레임) 유지
    // 필요에 따라 원하는 프레임 인덱스를 지정 가능
    frameIndex = 0;
    frameTimer = 0;
  }

  draw();
  requestAnimationFrame(update);
}

// 13. 그리기 함수
function draw() {
  ctx.clearRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
  
  // 맵을 플레이어 중심으로 오프셋
  // (mapData가 48픽셀 타일이라 가정)
  const offsetX = DESIGN_WIDTH / 2 - player.x;
  const offsetY = DESIGN_HEIGHT / 2 - player.y;

  // 맵 타일 그리기
  // 실제 맵 타일 크기(48 or 16)에 맞게 수정
  for (let r = 0; r < mapData.length; r++) {
    for (let c = 0; c < mapData[r].length; c++) {
      const tile = mapData[r][c];
      const img = tileImages[tile];
      if (img) {
        ctx.drawImage(img,
          c * 48 + offsetX, // ★ 여기도 48→16 변경할 수도 있음
          r * 48 + offsetY,
          48, 48
        );
      }
    }
  }
  
  // 플레이어 스프라이트 그리기
  // 5칸(열) × 4칸(행) = 20프레임
  // 행(0: down, 1: left, 2: right, 3: up),
  // 열(frameIndex: 0..4)
  const drawX = DESIGN_WIDTH / 2 - FRAME_WIDTH / 2;
  const drawY = DESIGN_HEIGHT / 2 - FRAME_HEIGHT / 2;

  let spriteRow;
  if (direction === "down") {
    spriteRow = 0;
  } else if (direction === "left") {
    spriteRow = 3;
  } else if (direction === "right") {
    spriteRow = 2;
  } else {
    spriteRow = 1; // up
  }
  const spriteX = frameIndex * FRAME_WIDTH;
  const spriteY = spriteRow * FRAME_HEIGHT;

  ctx.drawImage(
    playerSprite,
    spriteX, spriteY, FRAME_WIDTH, FRAME_HEIGHT,
    drawX, drawY, FRAME_WIDTH, FRAME_HEIGHT
  );
}

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
