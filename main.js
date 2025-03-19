 
/*********************************************************
 * 데이터 구조 & 게임 상태
 ********************************************************/
//DB
const itemClassMapping = {
  "잎파리": "leaf",
  "슬라임 젤리": "jelly",
  "슬라임 코어": "jelly-core",
  "오크의 투구": "helmet"
};

const monsterData = {
  plant: {
    name: "식물",
    discoveryMessage: "식물을 발견했습니다! 전투를 시작합니다...",
    maxDelay: 30000,     // 30초 이내 랜덤 시간
    health: 20,  // 식물 체력
    deathMessage: "전투에서 패배하여 사망했습니다...",
    victoryMessage: "전투에서 승리했습니다!",
    militaryLevel: 1,
    loot: [
	{ item: "잎파리", basePrice: 5, variance: 6, dropChance: 0.8 },
    ],
    experience: 10,
    narrativeSteps: [
      "주변의 숲속이 서서히 어두워집니다...",
      "무언가가 당신을 지켜보는 듯한 기분이 듭니다...",
      "풀숲 사이에서 이상한 흔들림이 감지됩니다...",
      "식물이 공격 자세를 취합니다!",
      "당신은 무기를 휘두룹니다!!..."
    ]
  },
  slime: {
    name: "슬라임",
    discoveryMessage: "슬라임을 발견했습니다! 전투를 시작합니다...",
    maxDelay: 20000,
    health: 30,
    deathMessage: "슬라임에게 패배하여 사망했습니다...",
    victoryMessage: "슬라임을 처치했습니다!",
    militaryLevel: 2,
    // 여러 전리품 후보와 각 드랍 확률을 설정
    loot: [
      { item: "슬라임 젤리", basePrice: 15, variance: 10, dropChance: 0.7 },
      { item: "슬라임 코어", basePrice: 25, variance: 15, dropChance: 0.1 }
    ],
    experience: 20,
    narrativeSteps: [
      "젤리가 천천히 흘러내리며 슬라임의 윤곽이 드러납니다...",
      "슬라임이 흐물거리는 몸으로 천천히 다가옵니다...",
      "빛나는 젤리 같은 눈동자가 당신을 응시합니다...",
      "슬라임이 몸을 부풀리며 공격 자세를 취합니다!",
      "당신은 재빠르게 반격의 기회를 노립니다!"
    ]
  },
  orc: {
    name: "오크",
    discoveryMessage: "오크를 발견했습니다! 전투를 시작합니다...",
    maxDelay: 25000,
    health: 50,  // 오크 체력
    deathMessage: "오크와의 전투에서 패배하여 사망했습니다...",
    victoryMessage: "오크를 무찔렀습니다!",
    militaryLevel: 4,
    loot: [
	{ item: "오크의 투구", basePrice: 35, variance: 20, dropChance: 0.6 },
    ],
    experience: 50,
    narrativeSteps: [
      "먼 산 너머로 우뢰와 같은 포효가 들려옵니다...",
      "거친 발걸음 소리와 함께 오크가 전장으로 돌진합니다...",
      "굵은 근육과 함께 무거운 무기가 반짝입니다...",
      "오크의 포효가 전장을 뒤흔들며 공포를 자아냅니다!",
      "당신은 단호하게 전투 태세를 갖추고 대응합니다!"
    ]
  }
  // 필요할 때마다 더 추가...
};

// [추가된 코드] 각 지역별 몬스터 목록 (중앙 지역은 삭제)
const regionMonsters = {
  "왕국 서부": [ "plant", "slime"],
  "왕국 동부": [ "orc", "slime"],
};

  const gameState = {
    // 플레이어 정보
    player: {
      rank: "노예",           
      experience: 0,          
      level: 1,               
      militaryLevel: 1,       
      charismaLevel: 1,       
      governance: 1,          
      skills: [],             
      inventory: [],
      location: "왕국 서부",     // 현재 위치 (초기값: "중앙")
      isMoving: false,       // 이동 중 여부
      health: 50, // 초기 체력
      bonusHealth: 0, //스킬로 인해 추가 체력
      money: 0  
    },

    // 왕국 상태 및 자원 정보
    kingdom: {
      status: "위기",         
      citizenanxiety: 0,     
      soldiercount: 0,     
      population: 100000,       
      resources: {
        gold: 0,             
        wood: 0,             
        ore: 0,              
        magicstone: 0,       
        food: 0              
      }
    },
		 // 날짜 정보 추가
    currentDate: {
      year: 24,
      month: 4,
      day: 12
    },
    // 게임 진행 상황 및 이벤트 기록
    progress: {
      currentCycle: 1,        
      monsterInvasions: [],
      resourcesInitialized: false // [추가] 처음에만 랜덤 세팅을 위한 플래그
    }
  };
  
  // 이후 gameState를 이용하는 로직을 추가합니다.
  // [추가된 코드]
/**
 * 왕국 현황을 업데이트하는 함수
 * @param {Object} data - 예: { status: '위기', citizenAnxiety: 78, soldiercount: 2544, ... }
 */
 
// -- updateKingdomStatus 함수 (중복 정의 제거 및 일관성 유지)
// [수정/추가] : 한 개의 updateKingdomStatus 함수만 사용하며, gameState.kingdom의 키와 일치하도록 소문자로 통일합니다.
// -- updateKingdomStatus 함수 (수정/추가)
function updateKingdomStatus(data) {
  // [수정/추가]
  // 만약 아직 자원이 초기화되지 않았다면, resources 객체 내부에 랜덤 값을 생성합니다.
  if (!gameState.progress.resourcesInitialized) {
    data.citizenanxiety = Math.floor(Math.random() * 41) + 10; // 10 ~ 50
    // [수정] 시민 수를 1,000,000 ~ 3,000,000 사이의 랜덤 값으로 설정
    data.population = Math.floor(Math.random() * (3000000 - 1000000 + 1)) + 1000000;
    // [수정] 병사수는 시민 수의 1/3
    data.soldiercount = Math.floor(data.citizen / 3);
    // 자원값을 resources 객체 내부에 저장
    data.resources = {
      food: Math.floor(Math.random() * 2000) + 4000,       // 4000 ~ 5999
      wood: Math.floor(Math.random() * 2000) + 4000,       // 4000 ~ 5999
      ore: Math.floor(Math.random() * 2000) + 4000,        // 4000 ~ 5999
      magicstone: Math.floor(Math.random() * 2000) + 4000, // 4000 ~ 5999
      gold: Math.floor(Math.random() * 500) + 500          // 500 ~ 999
    };

    gameState.progress.resourcesInitialized = true;
  }

  // HTML 요소 업데이트 (클래스 모두 소문자)
  const statusElem = document.querySelector('.status');
  if (statusElem) {
    statusElem.textContent = data.status ?? '';
  }

  // 시민 불안도 (숫자가 그리 크지 않다면 그대로 표시하거나,
  // 3자리 콤마 표시를 원하시면 toLocaleString() 적용)
  const anxietyElem = document.querySelector('.citizenanxiety');
  if (anxietyElem) {
    anxietyElem.textContent = (data.citizenanxiety ?? 0).toLocaleString();
  }

  // 병사수
  const soldierElem = document.querySelector('.soldiercount');
  if (soldierElem) {
    soldierElem.textContent = (data.soldiercount ?? 0).toLocaleString();
  }

  // 시민수
  const citizenElem = document.querySelector('.citizen');
  if (citizenElem) {
    citizenElem.textContent = (data.population ?? 0).toLocaleString();
  }

  // 자원 (food, wood, ore, magicstone, gold)
  const foodElem = document.querySelector('.food');
  if (foodElem) {
    foodElem.textContent = (data.resources.food ?? 0).toLocaleString();
  }
  const woodElem = document.querySelector('.wood');
  if (woodElem) {
    woodElem.textContent = (data.resources.wood ?? 0).toLocaleString();
  }
  const oreElem = document.querySelector('.ore');
  if (oreElem) {
    oreElem.textContent = (data.resources.ore ?? 0).toLocaleString();
  }
  const magicElem = document.querySelector('.magicstone');
  if (magicElem) {
    magicElem.textContent = (data.resources.magicstone ?? 0).toLocaleString();
  }
  const goldElem = document.querySelector('.gold');
  if (goldElem) {
    goldElem.textContent = (data.resources.gold ?? 0).toLocaleString();
  }

  // gameState에 반영
  gameState.kingdom.citizenanxiety = data.citizenanxiety;
  gameState.kingdom.soldiercount   = data.soldiercount;
  gameState.kingdom.population     = data.population ;
  gameState.kingdom.resources      = data.resources;

  saveGameState();
}


//매일 자원 감소 왕국

// 매일 자원 변화 함수 (불안도와 인구수 가중치를 적용)
/**
 * 매일 자원 변화 함수 (불안도와 인구수, 군인 변화 가중치를 적용)
 */
function dailyResourceChange() {
  const anxiety = gameState.kingdom.citizenanxiety; // 불안도
  let pop = gameState.kingdom.population;          // 현재 시민 수
  const month = gameState.currentDate.month;
  
  // ================================
  // [수정/추가] 인구수 변화 로직:
  // 매일 인구수는 20~100 증가하거나, 1~60 감소 (감소는 절반 적용)
  // ================================
  let popChange = 0;
  if (Math.random() < 0.5) {
    popChange = Math.floor(Math.random() * 81) + 20;  // 20 ~ 100 증가
  } else {
    popChange = - (Math.floor(Math.random() * 60) + 1); // 1 ~ 60 감소
  }

  let popMultiplier = 1;
  if (pop >= 1000000) {
    popMultiplier += 0.20;
  } else if (pop >= 400000) {
    popMultiplier += 0.10;
  } else if (pop >= 100000) {
    popMultiplier += 0.05;
  }
  
  popChange = Math.round(popChange * popMultiplier);
  if (popChange < 0) {
    popChange = Math.floor(popChange * 0.5); // 감소는 절반만 적용
  }
  pop += popChange;
  if (pop < 0) pop = 0;
  gameState.kingdom.population = pop;
  
  

  // ================================
  // [수정/추가] 군인(병사수) 변화 로직:
  // 매일 군인은 기본적으로 인구수의 1/3로 계산하고, 여기에 10~50 증가 또는 1~10 감소를 더함.
  // ================================
  let baseSoldier = Math.floor(pop / 3);
  let soldierChange = 0;
  if (Math.random() < 0.5) {
    soldierChange = Math.floor(Math.random() * 41) + 10;  // 10 ~ 50 증가
  } else {
    soldierChange = - (Math.floor(Math.random() * 10) + 1); // 1 ~ 10 감소
  }
  gameState.kingdom.soldiercount = baseSoldier + soldierChange;

  // ================================
  // FOOD (음식)
  // ================================
  // 1~7월: 70% 확률로 1~104 증가, 아니면 1~21 감소
  // 8~12월: 70% 확률로 5~80 감소, 아니면 5~10 증가
  if (month >= 1 && month <= 7) {
    if (Math.random() < 0.7) {
      let baseIncrease = Math.floor(Math.random() * 104) + 1; // +1 ~ +104
      let finalIncrease = Math.floor(baseIncrease * popMultiplier * (anxiety >= 60 ? 0.5 : 1));
      gameState.kingdom.resources.food += finalIncrease;
    } else {
      let baseDecrease = Math.floor(Math.random() * 21) + 1; // -1 ~ -21
      gameState.kingdom.resources.food = Math.max(gameState.kingdom.resources.food - baseDecrease, 0);
    }
  } else { // 8월 ~ 12월
    if (Math.random() < 0.7) {
      let baseDecrease = Math.floor(Math.random() * 76) + 5; // -5 ~ -80
      gameState.kingdom.resources.food = Math.max(gameState.kingdom.resources.food - baseDecrease, 0);
    } else {
      let baseIncrease = Math.floor(Math.random() * 6) + 5; // +5 ~ +10
      let finalIncrease = Math.floor(baseIncrease * popMultiplier * (anxiety >= 60 ? 0.5 : 1));
      gameState.kingdom.resources.food += finalIncrease;
    }
  }

  // ================================
  // WOOD (나무) : 매일 1~222 증가, 인구수 가중치 및 불안도 계수 적용
  let woodIncrease = Math.floor(Math.random() * 222) + 1;
  woodIncrease = Math.floor(woodIncrease * popMultiplier * (anxiety >= 60 ? 0.5 : 1));
  gameState.kingdom.resources.wood += woodIncrease;

  // ================================
  // ORE (광물) : 매일 1~355 증가, 인구수 가중치 및 불안도 계수 적용
  let oreIncrease = Math.floor(Math.random() * 355) + 1;
  oreIncrease = Math.floor(oreIncrease * popMultiplier * (anxiety >= 60 ? 0.5 : 1));
  gameState.kingdom.resources.ore += oreIncrease;

  // ================================
  // MAGICSTONE (마석) : 매일 1~428 증가, 인구수 가중치 및 불안도 계수 적용
  let magicstoneIncrease = Math.floor(Math.random() * 428) + 1;
  magicstoneIncrease = Math.floor(magicstoneIncrease * popMultiplier * (anxiety >= 60 ? 0.5 : 1));
  gameState.kingdom.resources.magicstone += magicstoneIncrease;

  // ================================
  // GOLD (골드) : 매일 1~34 증가하거나 감소 (50% 확률)
  let goldChange = Math.floor(Math.random() * 34) + 1;
  if (Math.random() < 0.5) {
    goldChange = Math.floor(goldChange * popMultiplier * (anxiety >= 60 ? 0.5 : 1));
    gameState.kingdom.resources.gold += goldChange;
  } else {
    goldChange = Math.floor(goldChange * 0.8);
    gameState.kingdom.resources.gold = Math.max(gameState.kingdom.resources.gold - goldChange, 0);
  }
  saveGameState();
}



/**
 * .popup.my-info 내의 rank, experience, level, militaryLevel, charisma, governance, roundCount
 * 를 현재 gameState 값으로 갱신
 */
function updateMyInfo() {
  const myInfoPopup = document.querySelector('.popup.my-info');
  if (!myInfoPopup) return; // 팝업이 없으면 종료

  // 계급
  const rankElem = myInfoPopup.querySelector('.rank');
  if (rankElem) {
    rankElem.textContent = gameState.player.rank;
  }
  // 경험치
  const expElem = myInfoPopup.querySelector('.experience');
  if (expElem) {
    expElem.textContent = gameState.player.experience;
  }
  // 레벨
  const levelElem = myInfoPopup.querySelector('.level');
  if (levelElem) {
    levelElem.textContent = gameState.player.level;
  }
  // 무력레벨
  const milLevelElem = myInfoPopup.querySelector('.militarylevel');
  if (milLevelElem) {
    milLevelElem.textContent = gameState.player.militaryLevel;
  }
  // 카리스마
  const chaElem = myInfoPopup.querySelector('.charisma');
  if (chaElem) {
    chaElem.textContent = gameState.player.charismaLevel;
  }
  // 통치도
  const govElem = myInfoPopup.querySelector('.governance');
  if (govElem) {
    govElem.textContent = gameState.player.governance;
  }
  // 회차 수
  const roundElem = myInfoPopup.querySelector('.roundcount');
  if (roundElem) {
    // roundCount는 gameState.progress 내에 있다고 가정
    roundElem.textContent = gameState.progress.roundCount ?? 1;
  }
  // .user-status 업데이트
  updateUserStatus();
  //체력바 업데이트
  updateHealthBar();
}
function updateUserStatus() {
  const statusContainer = document.querySelector('.user-status');
  if (!statusContainer) return;
  
  const levelElem = statusContainer.querySelector('.level');
  if (levelElem) {
    levelElem.textContent = gameState.player.level;
  }
  const moneyElem = statusContainer.querySelector('.money');
  if (moneyElem) {
    moneyElem.textContent = gameState.player.money;
  }
  const healthElem = statusContainer.querySelector('.health');
  if (healthElem) {
    healthElem.textContent = gameState.player.health;
  }
   // 계급에 따라 .user 요소의 클래스를 업데이트
  updateUserClass();
}
//계급별 프로필
function updateUserClass() {
  const userElem = document.querySelector('.user');
  if (!userElem) return;
  
  const rank = gameState.player.rank;
  let newRoleClass = "";
  
  if (rank === "노예") {
    newRoleClass = "slave";
  } else if (rank === "시민") {
    newRoleClass = "citizen-user";
  } else {
    newRoleClass = "private";
  }
  
  // 이미 추가되어 있지 않다면 새로운 역할 클래스를 추가 (기존 .user 클래스는 유지)
  if (!userElem.classList.contains(newRoleClass)) {
    userElem.classList.add(newRoleClass);
  }
}


// 예시: 플레이어의 기본 최대 체력은 50 * (1.3)^(level-1)로 계산하고,
// 추가로 스킬이나 기타 보너스로 인한 체력 증가량(bonusHealth)을 더하도록 합니다.
function getMaxHealth() {
  const baseMax = 50 * Math.pow(1.3, gameState.player.level - 1);
  const bonus = gameState.player.bonusHealth || 0;  // 스킬 등으로 추가된 체력 보너스
  return Math.floor(baseMax + bonus);
}

function updateHealthBar() {
  const healthBar = document.querySelector('.health-bar');
  if (!healthBar) return;
  
  const maxHealth = getMaxHealth();
  const currentHealth = gameState.player.health;
  
  let percentage = (currentHealth / maxHealth) * 100;
  if (percentage < 0) percentage = 0;
  
  healthBar.style.width = percentage + '%';
}

// 예를 들어 플레이어 데이터에 bonusHealth를 추가하는 방법:
gameState.player.bonusHealth = 0;  // 초기에는 보너스 체력 0


//게임 시작 버튼 눌렀을때
document.addEventListener('DOMContentLoaded', () => {

  // 페이지 로드 시 gameStarted 플래그 확인하여 화면 초기 상태 설정
  if (localStorage.getItem('gameStarted') === 'true') {
    const gameFirst = document.querySelector('.page.game-fisrt');
    const gameMain = document.querySelector('.page.game-main');
    if (gameFirst && gameMain) {
      gameFirst.style.display = 'none';
      gameMain.style.display = 'flex';
    }
  }

  // 저장된 gameState가 있다면 불러와서 gameState에 반영
  const savedState = localStorage.getItem('gameState');
  if (savedState) {
    const parsedState = JSON.parse(savedState);
      // 필수 속성이 누락된 경우 기본값 설정
      if (!parsedState.currentDate) {
        parsedState.currentDate = { year: 24, month: 4, day: 12 };
      }
    // 저장된 데이터를 파싱해서 gameState에 할당 (필요한 경우 deep copy)
    Object.assign(gameState, JSON.parse(savedState));
    // 만약 게임 진행 상황 전체를 교체하고 싶다면:
    // gameState = JSON.parse(savedState);
  }
   // [추가된 코드] 새로고침 시 이동 상태 리셋
  gameState.player.isMoving = false;
  
  updateKingdomStatus(gameState.kingdom);//랜덤 초기값
  updateMyInfo(); // 내 정보 팝업 갱신
  initGameStart(); //게임 새 시작시
  initExport(); // 게임 내보내기
  initLoad(); //게임 불러오기
  showMessageGuideOnHover() //mouse hover	
  updateInventory() //인벤토리
  updateCombatPopupUI();// 팝업 UI에 현재 위치와 몬스터 표시
  initLocationList();// 동적 이동
});

document.addEventListener('DOMContentLoaded', () => {
  const storedDateText = localStorage.getItem('lastdatetext');
  if (storedDateText) {
    const kingdomMessageNewsElem = document.querySelector('.kingdom-message-news');
    if (kingdomMessageNewsElem) {
      kingdomMessageNewsElem.innerHTML = storedDateText;
    }
  }
});

function initGameStart() {
  const gameStartBtn = document.querySelector('.game-start-btn');
  const gameFirst = document.querySelector('.page.game-fisrt');
  const gameMain = document.querySelector('.page.game-main');

  if (!gameStartBtn || !gameFirst || !gameMain) return;

  gameStartBtn.addEventListener('click', () => {
    // 기존 게임 데이터 초기화 (예: 'gameData' 키 삭제)
    localStorage.removeItem('gameData');

    // 화면 전환: .page.game-fisrt 숨기고 .page.game-main 보이게
    gameFirst.style.display = 'none';
    gameMain.style.display = 'flex';

    // 새 게임 시작 플래그 저장
    localStorage.setItem('gameStarted', 'true');

    // 새 게임 데이터를 초기화하는 로직 추가 (예시)
    const newGameData = {
      score: 0,
      level: 1,
      // ... 추가 데이터
    };

    console.log('새 게임이 시작되었습니다.', newGameData);
  });
}

function initExport() {
  const exportBtn = document.querySelector('.export-btn');
  if (!exportBtn) return;

  exportBtn.addEventListener('click', () => {
    // 실제 게임 데이터 객체로 대체하세요.
    const gameData = {
      score: 0,
      level: 1,
      // ... 추가 데이터
    };

    exportSaveData(gameData);
  });
}

// 저장 불러오기 기능
function initLoad() {
  const loadBtn = document.querySelector('.load-btn');
  const importFileInput = document.getElementById('importFile');
  if (!loadBtn || !importFileInput) return;

  loadBtn.addEventListener('click', () => {
    importFileInput.click();
  });

  importFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.json')) {
        alert('JSON 파일만 올려주세요.');
        importFileInput.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const loadedData = JSON.parse(e.target.result);
          console.log('불러온 데이터:', loadedData);
          // 불러온 데이터를 gameState 등에 반영하는 로직 추가
        } catch (error) {
          console.error('JSON 파싱 오류:', error);
          alert('파일 데이터를 읽는 중 오류가 발생했습니다.');
        }
      };
      reader.readAsText(file);
    }
  });
}

// 게임 데이터를 JSON 파일로 내보내는 함수
function exportSaveData(saveData) {
  const jsonStr = JSON.stringify(saveData);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gameSaveData.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// [수정된 코드]
function showMessageGuideOnHover() {
  const buttonBoxes = document.querySelectorAll('.button-box');
  
  buttonBoxes.forEach(box => {
    // [추가된 부분] 각 .button-box 내부의 .message-guide 요소를 찾음
    const messageGuide = box.querySelector('.message-guide');
    if (!messageGuide) return; // 해당 box 안에 .message-guide가 없으면 건너뜀
    
    box.addEventListener('mouseenter', () => {
      // [수정된 부분] display: 'flex'로 변경
      messageGuide.style.display = 'flex';
    });
    
    box.addEventListener('mouseleave', () => {
      messageGuide.style.display = 'none';
    });
  });
}


// [수정된 코드] 맵 열기
document.addEventListener('DOMContentLoaded', () => {
  const mappings = [
    { menu: '.menu.my-info',    popup: '.popup.my-info' },
    { menu: '.menu.combat',     popup: '.popup.combat' },
    { menu: '.menu.training',   popup: '.popup.training' },
    { menu: '.menu.inventory',  popup: '.popup.inventory' },
    { menu: '.menu.skill',      popup: '.popup.skill' },
    { menu: '.menu.move',       popup: '.popup.move' },
    { menu: '.button-map',      popup: '.popup.map-info' },
    { menu: '.menu.shop',      popup: '.popup.shop' }
  ];
  
  mappings.forEach(mapping => {
    const menuElem  = document.querySelector(mapping.menu);
    const popupElem = document.querySelector(mapping.popup);
    if (!menuElem || !popupElem) {
      console.error(`Element not found for mapping: ${mapping.menu} or ${mapping.popup}`);
      return;
    }
    
    // .menu.combat 버튼은 이동 중일 때 특별 처리
    if (mapping.menu === '.menu.combat') {
      menuElem.addEventListener('click', () => {
        if (gameState.player.isMoving) {
          // 이동 중이면 "이동중입니다!" 메시지만 출력하고 팝업은 열지 않음
          const combatMsgContainer = document.querySelector('.kingdom-message-combat');
          if (combatMsgContainer) {
            const msg = document.createElement('div');
            msg.textContent = "이동중입니다!";
            combatMsgContainer.appendChild(msg);
            combatMsgContainer.scrollTop = combatMsgContainer.scrollHeight;
          }
          return;
        }
        // 이동 중이 아니면 팝업 열기 및 UI 갱신
        popupElem.style.display = 'flex';
        updateCombatPopupUI();
      });
    } else if (mapping.menu === '.menu.shop') {
      menuElem.addEventListener('click', () => {
        popupElem.style.display = 'flex';
        // 상점 팝업 열릴 때 인벤토리 정보를 업데이트
        updateShopInventory();
      }); 
    } else {
      // 그 외의 메뉴 버튼은 기존대로 작동
      menuElem.addEventListener('click', () => {
        popupElem.style.display = 'flex';
        updateCombatPopupUI();
      });
    }
  });
  
  // 각 팝업 내부의 .close-btn을 클릭하면 팝업 닫기
  const closeBtns = document.querySelectorAll('.close-btn');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const popup = btn.closest('.popup');
      if (popup) {
        popup.style.display = 'none';
      }
    });
  });
});

//내정보

/**
 * 플레이어 레벨에 따라 계급(rank)을 자동으로 변경
 * (원하는 규칙에 맞춰 수정 가능)
 */
function updateRankByLevel() {
  const level = gameState.player.level;
  let newRank = "노예"; // 기본값

  if (level >= 2 && level < 6) {
    newRank = "시민";
  } else if (level >= 6 && level <= 20) {
    if (level <= 10) {
      newRank = "이병";
    } else if (level <= 15) {
      newRank = "상병";
    } else { // level 16 ~ 20
      newRank = "병장";
    }
  }
  
  // 레벨 1은 기본 "노예" 유지, 레벨 21 이상은 별도 처리(예: "병장" 유지)로 설정할 수 있습니다.
  gameState.player.rank = newRank;
  console.log("새로운 계급:", newRank);
}

/**
 * 지역별 전투 목록 UI 업데이트 함수
 * @param {string} region - "왕국 서부", "왕국 동부" 등
 */
function updateCombatList(region) {
  // [수정] .card-list 컨테이너를 찾음
  const container = document.querySelector('.card-list');
  if (!container) return;
  container.innerHTML = ''; // 기존 목록 초기화

  // regionMonsters[region] -> 예: ["orc", "slime"]
  const monsterKeys = regionMonsters[region];
  if (!monsterKeys || monsterKeys.length === 0) return;

  monsterKeys.forEach((key) => {
    // monsterData에서 실제 몬스터 객체 얻기
    const monster = monsterData[key];
    if (!monster) return;

    // [수정] 템플릿 요소를 찾음 (display: none)
    const template = document.querySelector('.combat-list-wrap-combat');
    if (!template) return;

    // [추가] 템플릿 복제
    const clone = template.cloneNode(true);
    // 템플릿이 숨겨져 있으므로 복제 후 표시
    clone.style.display = "flex";

    // 몬스터 이름, 무력 레벨 등 업데이트
    const nameElem = clone.querySelector('.monster-name');
    if (nameElem) {
      nameElem.textContent = monster.name;
    }
    const levelElem = clone.querySelector('.monster-level');
    if (levelElem) {
      levelElem.textContent = `무력 레벨: ${monster.militaryLevel}`;
    }

    // [수정] "수색하기" 버튼 클릭 시 => 해당 monsterKey로 전투 시작
    const combatBtn = clone.querySelector('.combat-btn');
    if (combatBtn) {
      combatBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // [추가] 전역 변수로 중복 전투 방지
        if (combatInProgress) {
          const msg = document.createElement('div');
          msg.textContent = "이미 수색중입니다!";
          document.querySelector('.kingdom-message-combat').appendChild(msg);
          return;
        }
        combatInProgress = true; // 전투 시작

        // monsterKey를 그대로 전달
        startNarrativeCombat(key, document.querySelector('.kingdom-message-combat'), () => {
          combatInProgress = false; // 전투 끝
        });
         // --- 수정됨: 수색 기능 실행 후 전투 팝업 닫기 ---
        const combatPopup = document.querySelector('.popup.combat');
        if (combatPopup) {
          combatPopup.style.display = 'none';
        }
      });
    }

    container.appendChild(clone);
  });
}

document.addEventListener('DOMContentLoaded', function(){
  function closeParentPopup(element) {
    const parentPopup = element.closest('.popup');
    if (parentPopup) {
      parentPopup.style.display = 'none';
    }
  }

  document.querySelectorAll('.move-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      closeParentPopup(this);
    });
  });
});

//이동 관련
function moveTo(destination, msgContainer) {
  // 이동 중 수색 및 전투 중이면 이동 불가
  if (combatInProgress) {
    const msg = document.createElement('div');
    msg.textContent = "수색중입니다!";
    msgContainer.appendChild(msg);
    msgContainer.scrollTop = msgContainer.scrollHeight;
    return;
  }
  if (gameState.player.isMoving) {
    const msg = document.createElement('div');
    msg.textContent = `이미 이동 중입니다!`;
    msgContainer.appendChild(msg);
    msgContainer.scrollTop = msgContainer.scrollHeight;
    return;
  }
  // 현재 위치와 도착지가 같으면 이동하지 않음
  if (gameState.player.location === destination) {
    const msg = document.createElement('div');
    msg.textContent = `이미 ${destination}에 있습니다!`;
    msgContainer.appendChild(msg);
    msgContainer.scrollTop = msgContainer.scrollHeight;
    return;
  }
  
  // 이동 시작: 이동 상태 true, 수색 버튼 비활성화
  gameState.player.isMoving = true;
  const combatBtn = document.querySelector('.combat-btn');
  if (combatBtn) {
    combatBtn.disabled = true;
  }
  const startMsg = document.createElement('div');
  startMsg.textContent = `${destination}로 이동을 시작합니다...`;
  msgContainer.appendChild(startMsg);
  msgContainer.scrollTop = msgContainer.scrollHeight;
  
  const travelTime = 5000; // 이동 시간 예시 (5초)
  
  function completeMovement() {
    gameState.player.location = destination;
    gameState.player.isMoving = false;
    // 이동 완료 후 수색 버튼 재활성화
    if (combatBtn) {
      combatBtn.disabled = false;
    }
    const endMsg = document.createElement('div');
    endMsg.textContent = `${destination}에 도착했습니다!`;
    msgContainer.appendChild(endMsg);
    msgContainer.scrollTop = msgContainer.scrollHeight;
    updateCombatPopupUI();
    saveGameState();
  }
  
  setTimeout(() => {
    let encounterOccurred = Math.random() < 0.3; // 30% 확률 기습 발생
    if (encounterOccurred) {
      let monsters = regionMonsters[destination];
      if (monsters && monsters.length > 0) {
        let randomIndex = Math.floor(Math.random() * monsters.length);
        let encounteredKey = monsters[randomIndex];
        // 기습 전투는 이동 상태 무시 (isAmbush === true)
        startNarrativeCombat(encounteredKey, msgContainer, () => {
          completeMovement();
        }, true);
      } else {
        completeMovement();
      }
    } else {
      completeMovement();
    }
  }, travelTime);
  
  saveGameState();
}

function initLocationList() {
  const locList = document.querySelector('.location-list');
  if (!locList) return;
  
  // 기존 내용 초기화
  locList.innerHTML = '';

  // regionMonsters 객체에 있는 모든 지역에 대해 버튼 생성
  Object.keys(regionMonsters).forEach(region => {
    // 버튼을 감싸는 컨테이너 생성 (예: .move-list)
    const moveDiv = document.createElement('div');
    moveDiv.classList.add('move-list', 'flex');

    // 지역 이름 표시
    const locName = document.createElement('div');
    locName.classList.add('location-name');
    locName.textContent = region;

    // 이동 버튼 생성
    const btn = document.createElement('a');
    btn.href = '#';
    btn.classList.add('move-btn', 'w-button');
    btn.textContent = '이동';

    // 버튼 클릭 시 moveTo 함수 호출
    btn.addEventListener('click', e => {
      e.preventDefault();
      const messageContainer = document.querySelector('.kingdom-message-combat');
      if (!messageContainer) return;
      moveTo(region, messageContainer);
    });

    // 요소 조립 및 추가
    moveDiv.appendChild(locName);
    moveDiv.appendChild(btn);
    locList.appendChild(moveDiv);
  });
}


//전투 팝업 업데이트
/*********************************************************
 * 전투 팝업 업데이트 (헤더: 지역명만 표시)
 ********************************************************/
function updateCombatPopupUI() {
  // [수정] 지역 이름만 헤더에 표시
  const location = gameState.player.location;
  const combatCard = document.querySelector('.popup.combat');
  if (!combatCard) return;

  // 헤더에 지역명만 표시
  const cardTitle = combatCard.querySelector('.card-title');
  if (cardTitle) {
    cardTitle.textContent = location; 
  }

  // [추가] 지역별 몬스터 목록 UI 생성
  updateCombatList(location);
}

//전투 관련
// 전역 변수 선언 (전투 진행 여부)
let combatInProgress = false;

document.addEventListener('DOMContentLoaded', () => {
  // 페이지 로드 시 이동 상태 초기화
  gameState.player.isMoving = false;

  // 전투(수색) 버튼 요소
  const combatBtn = document.querySelector('.combat-btn');
  const combatContainer = document.querySelector('.kingdom-message-combat');
  if (!combatBtn || !combatContainer) return;

  // 수색 버튼 클릭 이벤트 핸들러
  combatBtn.addEventListener('click', () => {
    // 이동 중이면 수색 기능 실행 안 함
    if (gameState.player.isMoving) {
      // 이미 버튼이 비활성화되어 있다면(이동 중) 추가 메시지 출력 없이 return
      return;
    }
    
    // 전투(수색)가 이미 진행 중이면 아무런 동작 없이 return
    if (combatInProgress) {
      return;
    }
    
    // 정상적인 상태라면 전투 시작 전에 혹시 남은 메시지 관련 dataset 플래그 삭제
    delete combatBtn.dataset.movingMsgShown;
    delete combatBtn.dataset.combatMsgShown;

    combatInProgress = true;
    startNarrativeCombat("plant", combatContainer, () => {
      combatInProgress = false;
    });
  });
});

/**
 * 전투(수색) 실행 함수
 * @param {string} monsterKey - 예: 'plant', 'slime'
 * @param {HTMLElement} msgContainer - 메시지 출력 컨테이너
 * @param {Function} finalCallback - 전투 종료 후 호출할 콜백 함수
 * @param {boolean} [isAmbush=false] - 기습 전투 여부 (기습이면 이동 상태 무시)
 */
// 전투(수색) 실행 함수 수정 (monsterKey를 추가 인자로 받음)
function startNarrativeCombat(monsterKey, msgContainer, finalCallback, isAmbush = false) {
  if (gameState.player.isMoving && !isAmbush) {
    return;
  }
  
  const monster = monsterData[monsterKey];
  if (!monster) return;
  
  const initialMessage = isAmbush
    ? `${monster.name}에게 기습당했습니다!`
    : `${monster.name} 수색을 시작합니다...`;
  const startDiv = document.createElement('div');
  startDiv.textContent = initialMessage;
  msgContainer.appendChild(startDiv);
  msgContainer.scrollTop = msgContainer.scrollHeight;
  
  const delay = isAmbush ? 0 : Math.random() * monster.maxDelay;
  
  setTimeout(() => {
    const discoverDiv = document.createElement('div');
    discoverDiv.textContent = monster.discoveryMessage;
    msgContainer.appendChild(discoverDiv);
    msgContainer.scrollTop = msgContainer.scrollHeight;
    
    playNarrativeSteps(monster, msgContainer, () => {
      // monsterKey를 함께 전달
      simulateCombatRounds(monster, monsterKey, msgContainer, finalCallback);
    });
  }, delay);
}



/**
 * 전투 서사 진행 함수: monster의 narrativeSteps를 순차적으로 출력
 */
function playNarrativeSteps(monster, container, onComplete) {
  const steps = monster.narrativeSteps || [];
  let index = 0;
  
  function nextStep() {
    if (index < steps.length) {
      const stepDiv = document.createElement('div');
      stepDiv.textContent = steps[index];
      container.appendChild(stepDiv);
      container.scrollTop = container.scrollHeight;
      index++;
      setTimeout(nextStep, 1000 + Math.random() * 2000);
    } else {
      if (typeof onComplete === 'function') {
        onComplete();
      }
    }
  }
  
  nextStep();
}

/**
 * 전투 라운드를 진행하는 함수
 * 플레이어와 몬스터가 동시에 공격을 주고받으며, 한 라운드마다 체력을 갱신합니다.
 * 전투가 종료되면 finalCallback을 호출합니다.
 */
// 전투 라운드 함수 수정: monsterKey 인자를 추가하여 사용
function simulateCombatRounds(monster, monsterKey, msgContainer, finalCallback) {
  let currentMonsterHealth = monster.health;
  let roundNumber = 1;
  
  function roundFight() {
    // 한 라운드 시작 메시지
    const roundMsg = document.createElement('div');
    roundMsg.textContent = `=== Round ${roundNumber} ===`;
    msgContainer.appendChild(roundMsg);
    msgContainer.scrollTop = msgContainer.scrollHeight;
    // 플레이어의 공격 데미지: 무력레벨 당 3~7의 랜덤 값
    const playerDamage = gameState.player.militaryLevel * (Math.floor(Math.random() * 5) + 3);
    const playerAttackMsg = document.createElement('div');
    playerAttackMsg.textContent = `플레이어가 ${playerDamage}의 데미지를 입혔습니다.`;
    msgContainer.appendChild(playerAttackMsg);
    msgContainer.scrollTop = msgContainer.scrollHeight;
    
    currentMonsterHealth -= playerDamage;
	  
    // 몬스터의 공격 데미지: 몬스터 무력레벨 당 3~7의 랜덤 값
    const monsterDamage = monster.militaryLevel * (Math.floor(Math.random() * 5) + 3);
    gameState.player.health -= monsterDamage;
	
    // 체력을 음수가 되지 않도록 0으로 클램프(clamp)
    if (gameState.player.health < 0) {
      gameState.player.health = 0;
    }
	  
    const monsterAttackMsg = document.createElement('div');
    monsterAttackMsg.textContent = `몬스터가 ${monsterDamage}의 데미지를 주었습니다. 남은 플레이어 체력: ${gameState.player.health}`;
    msgContainer.appendChild(monsterAttackMsg);
    msgContainer.scrollTop = msgContainer.scrollHeight;
     // 전투 결과 판정
    if (currentMonsterHealth <= 0) {
      const victoryMsg = document.createElement('div');
      victoryMsg.textContent = monster.victoryMessage;
      msgContainer.appendChild(victoryMsg);
      msgContainer.scrollTop = msgContainer.scrollHeight;
      
      // 올바른 monsterKey를 전달하여 전리품과 경험치를 지급
      onMonsterDefeated(monsterKey, msgContainer);
      
      if (typeof finalCallback === 'function') {
        finalCallback();
      }
      return;
    }
    
    if (gameState.player.health <= 0) {
      const defeatMsg = document.createElement('div');
      defeatMsg.textContent = "전투 도중 사망했습니다...";
      msgContainer.appendChild(defeatMsg);
      msgContainer.scrollTop = msgContainer.scrollHeight;
      
      resetGameExceptSkills();
      if (typeof finalCallback === 'function') {
        finalCallback();
      }
      return;
    }
    
    roundNumber++;
    setTimeout(roundFight, 1500);
  }
  
  roundFight();
}
//경험치
/**
 * 레벨별 요구 경험치 공식 (원하는 대로 수정 가능)
 * 예: level * 100
 */
function getRequiredExpForLevel(level) {
  if (level <= 10) {
    // 레벨 1~10: 20 * level² (예: 레벨 10이면 20*100 = 2000 EXP)
    return Math.floor(20 * Math.pow(level, 2));
  } else if (level <= 20) {
    // 레벨 11~20:
    // 10레벨까지 누적: 20 * 10² = 2000
    const baseFor10 = Math.floor(20 * Math.pow(10, 2)); 
    // 레벨 11부터 20까지는 선형 증가와 2차항 추가: 
    // 예: extra = 80*(level - 10) + 10*(level - 10)²
    const extra = Math.floor(80 * (level - 10) + 10 * Math.pow(level - 10, 2));
    return baseFor10 + extra;
  } else {
    // 레벨 21 이상:
    // 20레벨까지 누적: baseFor20 = 2000 + [80*10 + 10*10²] = 2000 + (800 + 1000) = 3800
    const baseFor20 = Math.floor(20 * Math.pow(10, 2)) + Math.floor(80 * 10 + 10 * Math.pow(10, 2));
    // 이후 레벨은 선형과 2차항을 적용: 예: extra = 150*(level - 20) + 25*(level - 20)²
    const extra = Math.floor(150 * (level - 20) + 25 * Math.pow(level - 20, 2));
    return baseFor20 + extra;
  }
}
function seededRandom(seed) {
  return Math.abs(Math.sin(seed)) % 1;
}

function getGameTimeSeed() {
  const date = gameState.currentDate;
  const seed = Number(
    date.year.toString() +
    date.month.toString().padStart(2, '0') +
    date.day.toString().padStart(2, '0')
  );
  return seed;
}

function getDailyRandomPrice(basePrice, variance) {
  const seed = getGameTimeSeed();
  const randomValue = seededRandom(seed);
  return basePrice + Math.floor(randomValue * variance);
}

function getDroppedLoot(lootArray) {
  const dropped = [];
  lootArray.forEach(loot => {
    // Math.random()은 0 이상 1 미만의 값을 반환합니다.
    if (Math.random() < loot.dropChance) {
      dropped.push(loot);
    }
  });
  return dropped;
}
/**
 * 몬스터 처치 후 전리품 & 경험치를 지급하고, 레벨업 여부 확인
 * @param {string} monsterKey - 'plant', 'slime' 등
 * @param {HTMLElement} messageContainer - 최근 활동(.kingdom-message-combat) 요소
 */
function onMonsterDefeated(monsterKey, messageContainer) {
  const monster = monsterData[monsterKey];
  if (!monster) return;
  
  // 전리품 드랍 처리: loot 배열에서 드랍할 아이템들을 결정합니다.
  const droppedLoot = getDroppedLoot(monster.loot);
  
  // 전리품 메시지 출력 (드랍된 아이템들이 있으면)
  if (droppedLoot.length > 0) {
    droppedLoot.forEach(lootData => {
      const lootPrice = getDailyRandomPrice(lootData.basePrice, lootData.variance);
      const lootItem = lootData.item;
      const currentLootCount = gameState.player.inventory.filter(item => item === lootItem).length;
      
      if (currentLootCount < 99) {
        gameState.player.inventory.push(lootItem);
        const lootDiv = document.createElement('div');
        lootDiv.textContent = `전리품: ${lootItem}을(를) 획득했습니다.`;
        messageContainer.appendChild(lootDiv);
        messageContainer.scrollTop = messageContainer.scrollHeight;
      } else {
        const fullDiv = document.createElement('div');
        fullDiv.textContent = "인벤토리가 가득 찼습니다! (최대 99개)";
        messageContainer.appendChild(fullDiv);
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    });
  } else {
    // 드랍된 전리품이 없을 경우
    const noLootDiv = document.createElement('div');
    noLootDiv.textContent = "전리품이 떨어지지 않았습니다.";
    messageContainer.appendChild(noLootDiv);
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }
  
  // 경험치는 별도로 추가 및 출력
  gameState.player.experience += monster.experience;
  const expDiv = document.createElement('div');
  expDiv.textContent = `경험치 ${monster.experience} 획득했습니다.`;
  messageContainer.appendChild(expDiv);
  messageContainer.scrollTop = messageContainer.scrollHeight;
  
  // 기타 업데이트 처리: 인벤토리, 레벨업 체크, 게임 상태 저장 등
  updateInventory();
  checkLevelUp(messageContainer);
  saveGameState();
}

/**
 * 플레이어 경험치를 확인하고 레벨업, 무력레벨업
 * 레벨업 시 최근 활동 영역에 메시지 표시
 */
function checkLevelUp(messageContainer) {
  const player = gameState.player;
  
  while (true) {
    const requiredExp = getRequiredExpForLevel(player.level);
    if (player.experience >= requiredExp) {
      player.experience -= requiredExp;
      player.level++;

      // 레벨업 시 계급 업데이트
      updateRankByLevel();
      // 업데이트된 계급을 UI에 반영
      updateUserClass();
      updateUserStatus();
	    
      // 플레이어 최대 체력 갱신: 초기 50에서 레벨당 1.3배씩 증가
      player.health = Math.floor(50 * Math.pow(1.3, player.level - 1));
      
      const levelUpDiv = document.createElement('div');
      levelUpDiv.textContent = `플레이어 레벨이 ${player.level}이 되었습니다! 체력이 ${player.health}로 증가했습니다.`;
      messageContainer.appendChild(levelUpDiv);
      messageContainer.scrollTop = messageContainer.scrollHeight;
      
      // 무력 레벨 증가 (예전과 동일)
      player.militaryLevel++;
      const mLevelDiv = document.createElement('div');
      mLevelDiv.textContent = `무력 레벨이 ${player.militaryLevel}이 되었습니다! (공격력 증가)`;
      messageContainer.appendChild(mLevelDiv);
      messageContainer.scrollTop = messageContainer.scrollHeight;
      
      // 레벨이 3의 배수이면 카리스마와 통치도도 상승
      if (player.level % 3 === 0) {
        player.charismaLevel++;
        player.governance++;
        const charGovDiv = document.createElement('div');
        charGovDiv.textContent =
          `카리스마와 통치도가 각각 1씩 상승했습니다! (현재 카리스마: ${player.charismaLevel}, 통치도: ${player.governance})`;
        messageContainer.appendChild(charGovDiv);
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    } else {
      break;
    }
  }
  
  updateMyInfo();
  saveGameState();
}

//상점
function getLootPriceInfo(itemName) {
  // monsterData의 각 몬스터에서 loot 배열을 검사
  for (const key in monsterData) {
    if (monsterData.hasOwnProperty(key)) {
      const lootArray = monsterData[key].loot;
      for (let i = 0; i < lootArray.length; i++) {
        if (lootArray[i].item === itemName) {
          return lootArray[i]; // { item, basePrice, variance, dropChance }
        }
      }
    }
  }
  return null; // 해당 아이템 정보를 찾지 못한 경우
}
// 상점 인벤토리 업데이트 함수
function updateShopInventory() {
  // .popup.shop 내부의 모든 inventory-box 선택
  const shopInvBoxes = document.querySelectorAll('.popup.shop .inventory-box');
  if (!shopInvBoxes.length) return;

  // 플레이어 인벤토리를 아이템별로 그룹화 (예: { "잎파리": 10, "슬라임 젤리": 3, ... })
  const inventoryCounts = {};
  gameState.player.inventory.forEach(item => {
    inventoryCounts[item] = (inventoryCounts[item] || 0) + 1;
  });

  // 그룹화된 데이터를 슬롯 배열로 변환 (각 슬롯: { item, count })
  let slots = Object.keys(inventoryCounts).map(item => ({
    item: item,
    count: Math.min(inventoryCounts[item], 99)
  }));

  // 슬롯 수가 inventory-box 개수를 초과하면 초과 슬롯은 무시
  if (slots.length > shopInvBoxes.length) {
    slots = slots.slice(0, shopInvBoxes.length);
  }

  shopInvBoxes.forEach((box, index) => {
    // 기존 클래스 초기화 (기본 클래스 'inventory-box' 유지)
    box.className = 'inventory-box';
    if (index < slots.length) {
      const slot = slots[index];
      // 슬롯에 아이템 개수를 텍스트로 표시
      box.textContent = slot.count.toString();
      // data-item 속성에 아이템 이름 저장 (클릭 시 사용)
      box.dataset.item = slot.item;
      // 아이템에 대응하는 CSS 클래스 추가
      let className = itemClassMapping[slot.item] || slot.item.replace(/\s+/g, '-').toLowerCase();
      box.classList.add(className);
    } else {
      box.textContent = '';
      delete box.dataset.item;
    }
  });
  
  // 아이템 클릭 이벤트 등록
  addShopItemClickListeners();
}

function addShopItemClickListeners() {
  // .popup.shop 내의 모든 inventory-box 요소 선택
  const shopInvBoxes = document.querySelectorAll('.popup.shop .inventory-box');
  shopInvBoxes.forEach(box => {
    box.addEventListener('click', function(e) {
      e.preventDefault();
      
      // 다른 박스를 클릭하면 기존에 선택된 박스의 border 초기화
      shopInvBoxes.forEach(b => {
        b.style.border = ""; // 초기 상태로 복구
      });
      // 현재 클릭한 박스에 border 적용
      this.style.border = "2px solid white";
      
      // data-item 속성에서 아이템 이름 가져오기
      const itemName = this.dataset.item;
      if (!itemName) return;
      
      const connoisseur = document.querySelector('.popup.shop .connoisseur');
      if (!connoisseur) return;
      
      // monsterData 내의 loot 정보를 통해 가격 정보 가져오기
      const lootInfo = getLootPriceInfo(itemName);
      if (lootInfo) {
        const price = getDailyRandomPrice(lootInfo.basePrice, lootInfo.variance);
        connoisseur.textContent = `감정: ${itemName}, 가격: ${price}`;
      } else {
        connoisseur.textContent = `감정: ${itemName}`;
      }
    });
  });
}

function sellAllItems() {
  let totalSale = 0;
  // 플레이어 인벤토리 배열 순회 (각 아이템은 문자열로 저장되어 있음)
  gameState.player.inventory.forEach(item => {
    // monsterData 내에서 해당 아이템의 가격 정보를 찾음
    const lootInfo = getLootPriceInfo(item);
    if (lootInfo) {
      // 현재 게임 시간 기준 가격 계산
      const price = getDailyRandomPrice(lootInfo.basePrice, lootInfo.variance);
      totalSale += price;
    }
  });
  
  // 플레이어 돈에 판매 금액 추가
  gameState.player.money += totalSale;
  
  // 판매 후 인벤토리 비우기
  gameState.player.inventory = [];
  
  // 인벤토리 및 상점 UI 업데이트
  updateInventory();
  updateShopInventory();  // 상점 팝업 내 인벤토리 업데이트 (필요 시)

  // updateUserStatus 함수를 호출하여 돈 등의 UI를 즉시 갱신
  updateUserStatus();

  // .connoisseur 영역에 판매 결과 메시지 출력 (상점 팝업 내에 있어야 함)
  const connoisseur = document.querySelector('.popup.shop .connoisseur');
  if (connoisseur) {
    connoisseur.textContent = `모든 아이템을 팔아 ${totalSale}원을 획득했습니다.`;
  }
  
  // 게임 상태 저장
  saveGameState();
}
 // .money 요소를 바로 찾아 업데이트 (즉시 갱신)
  const moneyElem = document.querySelector('.money');
  if (moneyElem) {
    moneyElem.textContent = gameState.player.money;
  }

// .sell-all-btn 버튼에 이벤트 등록
document.addEventListener('DOMContentLoaded', () => {
  const sellAllBtn = document.querySelector('.sell-all-btn');
  if (sellAllBtn) {
    sellAllBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sellAllItems();
    });
  }
});
let selectedSellItem = null; // 현재 판매할 아이템을 저장할 전역 변수

function setupSellSelectFunctionality() {
  // 1. 인벤토리 아이템 클릭 시 판매할 아이템 선택
  const shopInvBoxes = document.querySelectorAll('.popup.shop .inventory-box');
  shopInvBoxes.forEach(box => {
    box.addEventListener('click', function(e) {
      e.preventDefault();
      // data-item 속성에 저장된 아이템 이름을 선택
      const itemName = this.dataset.item;
      if (!itemName) return;
      selectedSellItem = itemName;
      // 모든 아이템의 선택 표시 제거 후, 이 항목에 선택 표시 추가
      shopInvBoxes.forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      // .connoisseur 영역에 선택된 아이템 표시 (옵션)
      const connoisseur = document.querySelector('.popup.shop .connoisseur');
      if (connoisseur) {
        connoisseur.textContent = `선택됨: ${selectedSellItem}`;
      }
    });
  });
  
  // 2. .sell-select-btn 클릭 시 판매 입력 창(.input-sell) 표시
  const sellSelectBtn = document.querySelector('.sell-select-btn');
  if (sellSelectBtn) {
    sellSelectBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (!selectedSellItem) {
        alert("판매할 아이템을 먼저 선택하세요!");
        return;
      }
      const inputSellWindow = document.querySelector('.input-sell');
      if (inputSellWindow) {
        inputSellWindow.style.display = 'flex';
      }
    });
  }
  
  // 3. .sell-input-btn 클릭 시 입력된 개수만큼 판매 처리
  const sellInputBtn = document.querySelector('.sell-input-btn');
  if (sellInputBtn) {
    sellInputBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const inputField = document.querySelector('.input-sell-field');
      if (!inputField) return;
      const sellCount = parseInt(inputField.value, 10);
      if (isNaN(sellCount) || sellCount <= 0) {
        alert("판매할 개수를 올바르게 입력하세요!");
        return;
      }
      
      // 판매할 아이템이 플레이어 인벤토리에 몇 개 있는지 확인하고, 지정된 개수만큼 판매
      let soldCount = 0;
      const newInventory = [];
      gameState.player.inventory.forEach(item => {
        if (item === selectedSellItem && soldCount < sellCount) {
          soldCount++;
        } else {
          newInventory.push(item);
        }
      });
      
      if (soldCount === 0) {
        alert("판매할 아이템이 부족합니다!");
      } else {
        // 판매할 아이템의 가격 정보를 monsterData 내에서 가져오기
        const lootInfo = getLootPriceInfo(selectedSellItem);
        let saleValue = 0;
        if (lootInfo) {
          const price = getDailyRandomPrice(lootInfo.basePrice, lootInfo.variance);
          saleValue = price * soldCount;
        }
        // 플레이어 돈에 판매 금액 추가
        gameState.player.money += saleValue;
        // 업데이트된 인벤토리 반영
        gameState.player.inventory = newInventory;
        // 결과 메시지 출력
        const connoisseur = document.querySelector('.popup.shop .connoisseur');
        if (connoisseur) {
          connoisseur.textContent = `${selectedSellItem} ${soldCount}개를 판매하여 ${saleValue}원 획득했습니다.`;
        }
        // UI 업데이트 (인벤토리, 상점 등)
        updateInventory();
        updateShopInventory();
        saveGameState();
	updateUserStatus();

      }
      
      // 입력 필드 초기화, 선택 항목 초기화, 선택 표시 제거
      inputField.value = "";
      selectedSellItem = null;
      shopInvBoxes.forEach(box => box.classList.remove('selected'));
      
      // 판매 입력 창 닫기
      const inputSellWindow = document.querySelector('.input-sell');
      if (inputSellWindow) {
        inputSellWindow.style.display = 'none';
      }
    });
  }
  
  // 4. .sell-input-close-btn 클릭 시 판매 입력 창 닫기
  const sellInputCloseBtn = document.querySelector('.sell-input-close-btn');
  if (sellInputCloseBtn) {
    sellInputCloseBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const inputSellWindow = document.querySelector('.input-sell');
      if (inputSellWindow) {
        inputSellWindow.style.display = 'none';
      }
    });
  }
}

// DOMContentLoaded 시 Sell Select 기능 설정
document.addEventListener('DOMContentLoaded', () => {
  setupSellSelectFunctionality();
});


//인벤토리
// [추가] 인벤토리 갱신 함수: .inventory-box 내부에 .leaf 요소를 찾아 잎파리 개수를 표시
// [수정/추가된 코드]
// [수정된 코드] updateInventory 함수 수정
function updateInventory() {
  // 인벤토리 박스 요소를 찾습니다.
  const invBoxes = document.querySelectorAll('.inventory-box'); // 총 28개 슬롯

  // 게임 상태의 인벤토리를 아이템별로 그룹화 (예: { "잎파리": 10, "슬라임 젤리": 3, ... })
  const inventoryCounts = {};
  gameState.player.inventory.forEach(item => {
    inventoryCounts[item] = (inventoryCounts[item] || 0) + 1;
  });

  // inventoryCounts 객체를 슬롯 배열로 변환 (각 슬롯은 { item, count } 객체)
  let slots = Object.keys(inventoryCounts).map(item => {
    return {
      item: item,
      // 각 슬롯 당 최대 99개로 제한
      count: Math.min(inventoryCounts[item], 99)
    };
  });

  // 슬롯 종류가 28개를 초과하면 28개까지만 사용하고, 가득 참 상태로 표시
  let isFull = false;
  if (slots.length > invBoxes.length) {
    slots = slots.slice(0, invBoxes.length);
    isFull = true;
  }

  // 각 인벤토리 슬롯 업데이트
  invBoxes.forEach((box, index) => {
    // 기존 클래스 초기화 (기본 클래스 유지)
    box.className = 'inventory-box';
    if (index < slots.length) {
      const slot = slots[index];
      // 슬롯에 해당하는 아이템 수량 텍스트 적용
      box.textContent = slot.count.toString();
      // 아이템명에 대응하는 CSS 클래스명을 추가
      let className = itemClassMapping[slot.item] || slot.item.replace(/\s+/g, '-').toLowerCase();
      box.classList.add(className);
    } else {
      box.textContent = '';
    }
  });

  // [수정된 부분]
  // 만약 슬롯 종류가 28개를 초과하면, 최근 활동 영역에 "최근 활동에 인벤토리가 꽉찼습니다!" 메시지 노란색으로 추가
  if (isFull) {
    const recentActivityContainer = document.querySelector('.kingdom-message-combat');
    if (recentActivityContainer) {
      const fullMsg = document.createElement('div');
      fullMsg.textContent = "인벤토리가 꽉찼습니다!";
      fullMsg.style.color = "yellow";
      recentActivityContainer.appendChild(fullMsg);
      recentActivityContainer.scrollTop = recentActivityContainer.scrollHeight;
    }
  }
}

//사망시
function resetGameExceptSkills() {
  const savedSkills = gameState?.player?.skills ? [...gameState.player.skills] : [];
  localStorage.clear();
  let oldRoundCount = gameState.progress.roundCount || 1;
  gameState.player = {
    rank: "노예",
    experience: 0,
    level: 1,
    militaryLevel: 1,
    charismaLevel: 1,
    governance: 1,
    skills: savedSkills,
    inventory: [],
    location: "왕국 서부",    // [추가] 위치 초기화
    isMoving: false,     // [추가] 이동 상태 초기화
    health: 50,
    money: 0  
  };
  gameState.currentDate = {
    year: 24,
    month: 4,
    day: 12
  };
  gameState.progress = {
    currentCycle: 1,
    monsterInvasions: [],
    roundCount: oldRoundCount + 1,
    resourcesInitialized: false
  };
  localStorage.setItem('gameState', JSON.stringify(gameState));
  updateMyInfo();
  saveGameState();
  updateKingdomStatus(gameState.kingdom); //왕국 정보 업데이트
  updateInventory();
}

//날짜
// 전역 변수 선언 (페이지 로드 시 한 번만 초기화)
// [수정된 부분] 전역 변수 선언: 지난 '분' (즉, 일수)를 localStorage에서 불러오거나 기본값 0으로 설정
let lastMinutes = Number(localStorage.getItem("lastMinutes")) || 0;

// [수정된 부분] 전역 변수 선언: baseRealTime을 localStorage에서 불러오거나, 없으면 현재 시간으로 설정 (새로고침 시에도 기존 값 유지)
let storedBaseRealTime = Number(localStorage.getItem("baseRealTime"));
if (!storedBaseRealTime) {
  storedBaseRealTime = Date.now();
  localStorage.setItem("baseRealTime", storedBaseRealTime);
}

// [추가된 부분] 타이머 제어를 위한 전역 변수
let gameDateTimer = null;

// [추가된 부분] 게임 날짜 업데이트 타이머 시작 함수
function startGameDateTimer() {
  if (!gameDateTimer) {
    gameDateTimer = setInterval(updateGameDate, 1000);
  }
}

// [추가된 부분] 게임 날짜 업데이트 타이머 중지 함수
function stopGameDateTimer() {
  if (gameDateTimer) {
    clearInterval(gameDateTimer);
    gameDateTimer = null;
  }
}

// [수정된 부분] 페이지 가시성 변화에 따른 타이머 제어 및 baseRealTime 재설정
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    // 페이지가 보이면 baseRealTime을 현재 시간으로 재설정하지 않고 기존 값을 유지합니다.
    startGameDateTimer();
  } else {
    stopGameDateTimer();
  }
});

// 초기 페이지 로드시 현재 상태에 맞춰 타이머 시작/중지 결정 (기존 값 유지)
if (document.visibilityState === "visible") {
  startGameDateTimer();
} else {
  stopGameDateTimer();
}

// [수정된 부분] 전역 변수: 날짜 텍스트 출력 여부와 마지막 업데이트 날짜 문자열 (새로고침 시 기본 false, 빈 문자열)
let dateTextDisplayed = false;
let lastDateStr = localStorage.getItem("lastDateStr") || "";

// 날짜 업데이트 함수 (1분 = 1일 가정)
function updateGameDate() {
  const baseTime = Number(localStorage.getItem("baseRealTime") || Date.now());
  const currentMinutes = Math.floor((Date.now() - baseTime) / (1000 * 60)); // 1분 = 1일

  // [추가된 부분] 지난 '일수(분)' 차이를 계산해서 자원 변화 적용 (페이지가 떠있지 않아도 경과한 만큼 반영)
  const diffDays = currentMinutes - lastMinutes;
  if (diffDays > 0) {
    for (let i = 0; i < diffDays; i++) {
      dailyResourceChange();
    }
    lastMinutes = currentMinutes;
    localStorage.setItem("lastMinutes", lastMinutes);
  }

  // baseDate 불러오기 (없으면 기본값 설정)
  let baseDate = localStorage.getItem("baseDate");
  if (!baseDate) {
    baseDate = { year: 24, month: 4, day: 12 };
    localStorage.setItem("baseDate", JSON.stringify(baseDate));
  } else {
    baseDate = JSON.parse(baseDate);
  }

  // 기준 날짜에서 currentMinutes만큼 일수를 증가
  let newDay = baseDate.day + currentMinutes;
  let newMonth = baseDate.month;
  let newYear = baseDate.year;

  // 한 달을 30일로 가정하여 계산
  while (newDay > 30) {
    newDay -= 30;
    newMonth++;
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
  }

  const currentDateString = `${newYear}-${String(newMonth).padStart(2, '0')}-${String(newDay).padStart(2, '0')}`;

  // 날짜가 바뀌었으면 자원 변화 처리 및 날짜 텍스트 플래그 재설정
  if (currentDateString !== lastDateStr) {
    dateTextDisplayed = false;
    lastDateStr = currentDateString;
    localStorage.setItem("lastDateStr", lastDateStr);
  }

  // [수정된 부분] 현재 페이지 로드 시 또는 날짜가 바뀌었을 때, 날짜 메시지를 한 번만 추가
  if (!dateTextDisplayed) {
    const kingdomMsgElem = document.querySelector('.kingdom-message-news');
    if (kingdomMsgElem) {
      const newTxtDiv = document.createElement('div');
      newTxtDiv.classList.add('txt');
      newTxtDiv.style.color = '#78ca86';
      newTxtDiv.textContent = `오늘은 ${newYear}년 ${String(newMonth).padStart(2, '0')}월 ${String(newDay).padStart(2, '0')}일입니다.`;
      kingdomMsgElem.appendChild(newTxtDiv);
      scrollToBottom(kingdomMsgElem);
    }
    dateTextDisplayed = true;
  }

  // 날짜 정보 영역 (.date-info) 매번 갱신 (누적되지 않음)
  const dateInfoElem = document.querySelector('.date-info');
  if (dateInfoElem) {
    dateInfoElem.textContent = `함락 ${newYear}년 ${String(newMonth).padStart(2, '0')}월 ${String(newDay).padStart(2, '0')}일`;
  }

  // 여기에 gameState.currentDate를 업데이트하는 부분 추가
  gameState.currentDate = { year: newYear, month: newMonth, day: newDay };
	
  updateKingdomStatus(gameState.kingdom);
  saveGameState();
}

// 1초마다 updateGameDate 호출 (매일 감각)
setInterval(updateGameDate, 1000);


// 저장 함수
function saveGameState() {
  localStorage.setItem('gameState', JSON.stringify(gameState));
}

//회복로직
document.addEventListener('DOMContentLoaded', () => {
  const healMenuBtn = document.querySelector('.menu.heal');
  const healPopup = document.querySelector('.popup.heal');
  const healLoading = document.querySelector('.heal-loading');
  const messageContainer = document.querySelector('.kingdom-message-combat');

  if (healMenuBtn && healPopup && healLoading) {
    healMenuBtn.addEventListener('click', () => {
      // 플레이어가 이동 중이거나 전투(수색)가 진행 중이면 healing 기능 실행 안 함
      if (gameState.player.isMoving || combatInProgress) {
        if (messageContainer) {
          const msgDiv = document.createElement('div');
          msgDiv.textContent = "활동을 마무리 해주세요!";
          messageContainer.appendChild(msgDiv);
          messageContainer.scrollTop = messageContainer.scrollHeight;
        }
        return;
      }
      
      // 전투나 이동 중이 아니라면 healing 팝업 열기
      healPopup.style.display = 'flex';
      
      // 휴식중 애니메이션 시작 (사람이 자는 듯한 애니메이션)
      startSleepAnimation();
      
      // 치유 진행 동안 치유 버튼 비활성화
      healMenuBtn.disabled = true;
      
      // 회복 시간: 5초 ~ 20초 랜덤 (밀리초 단위)
      const healingDuration = Math.floor(Math.random() * (20000 - 5000 + 1)) + 5000;
      
      setTimeout(() => {
        // 플레이어 체력 회복 (최대 체력으로)
        gameState.player.health = getMaxHealth();
        updateHealthBar();
        updateUserStatus();
        
        // 애니메이션 중단 및 팝업 닫기
        stopSleepAnimation();
        healPopup.style.display = 'none';
        
        // 치유 버튼 다시 활성화
        healMenuBtn.disabled = false;
      }, healingDuration);
    });
  }
});



let sleepAnimationInterval = null;

function startSleepAnimation() {
  const healLoading = document.querySelector('.heal-loading');
  if (!healLoading) return;
  
  // heal-loading의 크기와 위치 설정
  healLoading.style.width = '150px';
  healLoading.style.height = '150px';
  healLoading.style.position = 'relative';
  
  // sleep-container가 없으면 생성
  let sleepContainer = document.querySelector('.sleep-container');
  if (!sleepContainer) {
    sleepContainer = document.createElement('div');
    sleepContainer.className = 'sleep-container';
    sleepContainer.style.position = 'absolute';
    sleepContainer.style.top = '0';
    sleepContainer.style.left = '0';
    sleepContainer.style.width = '150px';
    sleepContainer.style.height = '150px';
    sleepContainer.style.overflow = 'hidden';
    healLoading.appendChild(sleepContainer);
  }
  
  // "잠자는 사람" 이모지 관련 요소 제거 (이제 생성하지 않음)
  
  // 500ms마다 "Z" 문자를 생성하여 위로 떠오르는 애니메이션 적용
  sleepAnimationInterval = setInterval(() => {
    const zElem = document.createElement('span');
    zElem.textContent = "Z";
    // heal-loading 영역이 150px이므로 0~150px 사이의 랜덤 가로 위치 설정
    const randomLeft = Math.random() * 150;
    zElem.style.position = 'absolute';
    zElem.style.left = randomLeft + 'px';
    zElem.style.bottom = '0px';
    zElem.style.opacity = '1';
    zElem.style.fontSize = '20px';
    zElem.style.transition = 'all 2s linear';
    
    sleepContainer.appendChild(zElem);
    // 강제 reflow 후 애니메이션 시작
    void zElem.offsetWidth;
    zElem.style.bottom = '100%';
    zElem.style.opacity = '0';
    zElem.style.transform = 'scale(1.5)';
    
    // 2.1초 후 요소 제거
    setTimeout(() => {
      if (zElem.parentNode === sleepContainer) {
        sleepContainer.removeChild(zElem);
      }
    }, 2100);
    
  }, 500);
}

function stopSleepAnimation() {
  clearInterval(sleepAnimationInterval);
  sleepAnimationInterval = null;
  const sleepContainer = document.querySelector('.sleep-container');
  if (sleepContainer) {
    sleepContainer.innerHTML = '';
  }
}

// 스크롤 기능 함수: 컨테이너에 .scroll 클래스가 있으면 맨 아래로 스크롤
function scrollToBottom(container) {
  if (container && container.classList.contains('scroll')) {
    container.scrollTop = container.scrollHeight;
  }
}

//page 첫 애니
document.addEventListener('DOMContentLoaded', () => {
  initFireflyAnimation();
});

function initFireflyAnimation() {
  // 클래스 이름을 ".page.game-first"로 사용 (페이지와 game-first 두 클래스)
  const gameFirst = document.querySelector('.page.game-first');
  if (!gameFirst) return;

  // 만약 요소가 숨겨져 있다면 애니메이션 실행하지 않음
  if (window.getComputedStyle(gameFirst).display === 'none') {
    return;
  }

  // .page.game-first 요소의 overflow-x 방지 및 relative 설정
  gameFirst.style.position = 'relative';
  gameFirst.style.overflowX = 'hidden';

  // 반딧불이를 담을 컨테이너 생성
  const fireflyContainer = document.createElement('div');
  fireflyContainer.style.position = 'absolute';
  fireflyContainer.style.top = '0';
  fireflyContainer.style.left = '0';
  fireflyContainer.style.width = '100%';
  fireflyContainer.style.height = '100%';
  fireflyContainer.style.pointerEvents = 'none';
  fireflyContainer.style.zIndex = '1';
  gameFirst.appendChild(fireflyContainer);

  // CSS 애니메이션 keyframes 정의 (백틱으로 템플릿 리터럴 사용)
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    @keyframes firefly {
      0% {
        transform: translate(0, 0) scale(0.5);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      95% {
        opacity: 1;
      }
      100% {
        transform: translate(var(--dx), var(--dy)) scale(1.2);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(styleEl);

  // 반딧불이 생성 함수
  function createFirefly() {
    const firefly = document.createElement('div');
    const size = Math.random() * 10 + 5; // 5~15px 사이 랜덤 크기
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    const endX = (Math.random() * 120) - 10;
    const endY = (Math.random() * 120) - 10;

    firefly.style.position = 'absolute';
    firefly.style.left = startX + '%';
    firefly.style.top = startY + '%';
    firefly.style.width = size + 'px';
    firefly.style.height = size + 'px';
    firefly.style.background = 'radial-gradient(circle, rgba(255,255,150,1) 0%, rgba(255,255,150,0.2) 70%, rgba(255,255,150,0) 100%)';
    firefly.style.borderRadius = '50%';
    firefly.style.boxShadow = '0 0 8px rgba(255,255,100,0.8)';

    // 이동 거리 계산 후 CSS 커스텀 속성에 저장
    firefly.style.setProperty('--dx', (endX - startX) + '%');
    firefly.style.setProperty('--dy', (endY - startY) + '%');

    const duration = Math.random() * 3000 + 4000; // 4~7초
    const delay = Math.random() * 2000;           // 0~2초
    // 템플릿 리터럴을 사용하여 올바르게 애니메이션 문자열 생성
    firefly.style.animation = `firefly ${duration}ms ease-out ${delay}ms forwards`;

    // 애니메이션 종료 후 제거
    setTimeout(() => {
      if (firefly.parentNode) {
        firefly.parentNode.removeChild(firefly);
      }
    }, duration + delay + 100);

    return firefly;
  }

  // 주기적으로 반딧불이 생성
  const fireflyInterval = setInterval(() => {
    if (window.getComputedStyle(gameFirst).display === 'none') {
      clearInterval(fireflyInterval);
      return;
    }
    const firefly = createFirefly();
    fireflyContainer.appendChild(firefly);
  }, 200);
}

