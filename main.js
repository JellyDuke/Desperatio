/*********************************************************
 * 데이터 구조 & 게임 상태
 ********************************************************/
//DB
document.addEventListener('DOMContentLoaded', () => {
  const adminMoneyBtn = document.querySelector('.admin-money-btn');
  if (adminMoneyBtn) {
    adminMoneyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      gameState.player.money += 2000000;
      updateUserStatus();  // UI 업데이트: 소지금 등 반영
      saveGameState();     // 게임 상태 저장
      alert("2백만 골드가 지급되었습니다.");
    });
  }
});
const itemClassMapping = {
  "잎파리": "leaf",
  "슬라임 젤리": "jelly",
  "슬라임 코어": "jelly-core",
  "오크의 투구": "helmet",
  "오팔": "opal",
  "골드": "gold",
  "실버": "silver",
  "루비": "ruby",
  "사파이어": "sapphire",
  "다이아몬드": "diamond",
  "개구리 다리": "frogleg",
  "끈적한 거미줄": "cooked-spider-web",
  "거미 송곳니": "spider-fangs",
  "딱정벌레 껍질": "beetle-shell"
};

// 상점 스킬 DB (전투 시 스킬 효과 적용 방식 포함)
const storeSkillDB = [
  {
    name: "강타",
    description: "적에게 강력한 타격을 입혀 데미지를 증가시킵니다. (전투 중 랜덤 발동)",
    effects: {
      1: { damageBonus: 3 },
      2: { damageBonus: 8 },
      3: { damageBonus: 27 }
    },
    requiredLevel: 1,       // 최소 1레벨부터 구매/사용 가능
    type: "damage",         // 데미지 관련 스킬
    basePrice: 20000,
    variance: 5000,           // 스킬 가격 변동은 여전히 적용 (원하는 경우 조정 가능)
    appearanceChance: 1,  // 50% 확률로 상점에 등장
    activation: "random",   // 전투 시 랜덤 발동
    triggerChance: 0.3,     // 약 30% 확률로 발동
    rarity: "common", //회귀도
    unlockCondition: {
      type: "defeat",     // defeat, useSkill, reachLevel 등
      target: "식물",  // 특정 몬스터
      count: 3
    }
  },
  {
    name: "회복",
    description: "전투 시 매 라운드 일정량의 체력을 회복합니다. (패시브 효과)",
    effects: {
      1: { healthBonus: 5 },
      2: { healthBonus: 8 },
      3: { healthBonus: 15 }
    },
    requiredLevel: 1,
    type: "heal",           // 체력 회복 스킬
    basePrice: 34200,
    variance: 10000,
    appearanceChance: 1,  // 40% 확률
    activation: "passive",   // 별도 입력 없이 자동 적용 (예: 매 라운드 회복)
    triggerChance: 1,
    rarity: "common", //회귀도
    unlockCondition: {
      type: "defeat",     // defeat, useSkill, reachLevel 등
      target: "슬라임",  // 특정 몬스터
      count: 5
    }
  },
  {
    name: "출혈",
    description: "적에게 출혈 효과를 부여하여 일정 시간 동안 추가 데미지를 줍니다. (전투 중 랜덤 발동)",
    effects: {
      1: { bleedDamage: 3 },
      2: { bleedDamage: 6 },
      3: { bleedDamage: 9 }
    },
    requiredLevel: 2,
    type: "bleed",          // 출혈 효과 스킬
    basePrice: 14550,
    variance: 2555,
    appearanceChance: 1,  // 30% 확률
    activation: "random",   // 전투 시 랜덤 발동
    triggerChance: 0.2,      // 약 20% 확률로 발동
    rarity: "common", //회귀도
    unlockCondition: {
      type: "defeat",     // defeat, useSkill, reachLevel 등
      target: "오크",  // 특정 몬스터
      count: 5
    }
  }
];

const storeItemDB = [
  {
    item: "골드",
    description: "순수한 금속의 영롱한 빛이 돋보이는 귀금속으로, 상점에서 주요 거래 수단으로 사용됩니다.",
    previousPrice: null,
    effect: null,
    dailyChangePercent: 0,
    basePrice: 220024,
    originalBasePrice: 220024,
    isUp: null,
    appearanceChance: 0.7,
    dailyFluctuationRate: 4,
    volatilityFactor: 1.1
  },
  {
    item: "실버",
    description: "은은한 광채를 내는 귀금속으로, 소지 시 별다른 효과는 없습니다.",
    previousPrice: null,
    effect: null,
    dailyChangePercent: 0,
    basePrice: 225,
    originalBasePrice: 225,
    isUp: null,
    appearanceChance: 0.9,
    dailyFluctuationRate: 3,
    volatilityFactor: 1.2
  },
  {
    item: "오팔",
    description: "다채로운 색상이 반짝이는 보석으로, 소지 시 특별한 효과는 없지만 수집 가치가 있습니다.",
    previousPrice: null,
    effect: null,
    dailyChangePercent: 0,
    basePrice: 2250,
    originalBasePrice: 2250,
    isUp: null,
    appearanceChance: 0.8,
    dailyFluctuationRate: 8,
    volatilityFactor: 1.3
  },
  {
    item: "루비",
    description: "깊은 붉은 빛을 발하는 보석으로, 수집용으로 인기가 있으나 소지 시 별다른 효과는 없습니다.",
    previousPrice: null,
    effect: null,
    dailyChangePercent: 0,
    basePrice: 45318,
    originalBasePrice: 45318,
    isUp: null,
    appearanceChance: 0.6,
    dailyFluctuationRate: 30,
    volatilityFactor: 1.4
  },
  {
    item: "사파이어",
    description: "투명한 푸른빛이 매력적인 보석으로, 장식용 및 수집용으로 활용됩니다.",
    previousPrice: null,
    effect: null,
    dailyChangePercent: 0,
    basePrice: 646257,
    originalBasePrice: 646257,
    isUp: null,
    appearanceChance: 0.2,
    dailyFluctuationRate: 12,
    volatilityFactor: 1.2
  },
  {
    item: "다이아몬드",
    description: "희귀성과 경이로움이 결합된 최고급 보석. 극소수만이 거래할 수 있는 고급 자산입니다.",
    previousPrice: null,
    effect: null,
    dailyChangePercent: 0,
    basePrice: 12546457,
    originalBasePrice: 12546457,
    isUp: null,
    appearanceChance: 0.2,
    dailyFluctuationRate: 20,
    volatilityFactor: 1.5
  }
];


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
  },
  frog: {
    name: "평야 개구리",
    discoveryMessage: "개구리를 발견했습니다! 전투를 시작합니다...",
    maxDelay: 25000,
    health: 15,
    deathMessage: "개구리와의 전투에서 패배하여 사망했습니다...",
    victoryMessage: "개구리를 무찔렀습니다!",
    militaryLevel: 2,
    loot: [
      { item: "개구리 다리", basePrice: 3, variance: 10, dropChance: 0.9 },
    ],
    experience: 17,
    narrativeSteps: [
      "풀숲이 바스락거립니다... 무언가가 다가오고 있습니다.",
      "촉촉한 발소리와 함께 평야 개구리가 모습을 드러냅니다!",
      "개구리가 날렵하게 펄쩍 뛰어올라 당신을 노립니다!",
      "개구리의 혀가 번개처럼 튀어나와 공격합니다!",
      "당신은 뒹굴며, 개구리의 움직임에 대비합니다!"
    ]
  },
  beetle: {
    name: "갑옷벌레",
    discoveryMessage: "갑옷벌레가 다가오고 있습니다! 전투를 시작합니다...",
    maxDelay: 20000,
    health: 35,
    deathMessage: "단단한 껍질에 막혀 패배했습니다...",
    victoryMessage: "갑옷벌레의 껍질을 부쉈습니다!",
    militaryLevel: 3,
    loot: [
      { item: "딱정벌레 껍질", basePrice: 18, variance: 8, dropChance: 0.6 }
    ],
    experience: 25,
    narrativeSteps: [
      "딱딱한 껍질 소리가 들려옵니다...",
      "커다란 갑옷벌레가 땅을 기며 다가옵니다...",
      "단단한 등껍질이 햇빛을 반사합니다...",
      "벌레가 머리를 숙이며 돌진합니다!",
      "당신은 약점을 노려 강하게 내려칩니다!"
    ]
  },
  spider: {
    name: "숲거미",
    discoveryMessage: "숲의 거미줄 사이에서 거대한 거미가 모습을 드러냅니다...",
    maxDelay: 25000,
    health: 128,
    deathMessage: "거미줄에 갇혀 무기력하게 당했습니다...",
    victoryMessage: "거미를 베어냈습니다!",
    militaryLevel: 3,
    loot: [
      { item: "끈적한 거미줄", basePrice: 12, variance: 6, dropChance: 0.7 },
      { item: "거미 송곳니", basePrice: 120, variance: 100, dropChance: 0.2 }
    ],
    experience: 35,
    narrativeSteps: [
      "끈적한 거미줄이 발에 감깁니다...",
      "어둠 속에서 붉은 눈동자가 빛납니다...",
      "거미가 조용히, 그러나 빠르게 접근합니다...",
      "날카로운 다리와 송곳니가 당신을 노립니다!",
      "당신은 날렵하게 몸을 돌려 반격합니다!"
    ]
  }
  // 필요할 때마다 더 추가...
};

//지역
const regionMonsters = {
  "왕국 외곽": {
    "왕국 서부 평야": ["plant", "slime"],
    "왕국 동부 경계": ["slime", "orc"],
    "피안의 숲": ["frog","spider","beetle"]
  },
  "왕도": {
    "왕궁 중심부": [],
    "군사 본부": [],
    "계급 심사실": [],
    "훈련장": [],
    "왕국 상점가": [],
    "시민 거주구역": [],
    "영지 관리구역": [],
    "배정된 영지": [],
    "왕국 기록보관소": []
  } 
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
    location: "왕국 서부 평야",     // 현재 위치 (초기값: "중앙")
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
    resourcesInitialized: false, // [추가] 처음에만 랜덤 세팅을 위한 플래그
    roundCount: 0               // 초기 회차: 아직 죽은 적 없음
  }
};

function resetGameCompletely() {
  // localStorage 전체 삭제
  localStorage.clear();

  storeItemDB.splice(0, storeItemDB.length,
    {
      item: "골드",
      description: "순수한 금속의 영롱한 빛이 돋보이는 귀금속으로, 상점에서 주요 거래 수단으로 사용됩니다.",
      previousPrice: null,
      effect: null,
      dailyChangePercent: 0,
      basePrice: 220024,
      originalBasePrice: 220024,
      isUp: null,
      appearanceChance: 0.7,
      dailyFluctuationRate: 4,
      volatilityFactor: 1.1
    },
    {
      item: "실버",
      description: "은은한 광채를 내는 귀금속으로, 소지 시 별다른 효과는 없습니다.",
      previousPrice: null,
      effect: null,
      dailyChangePercent: 0,
      basePrice: 225,
      originalBasePrice: 225,
      isUp: null,
      appearanceChance: 0.9,
      dailyFluctuationRate: 3,
      volatilityFactor: 1.2
    },
    {
      item: "오팔",
      description: "다채로운 색상이 반짝이는 보석으로, 소지 시 특별한 효과는 없지만 수집 가치가 있습니다.",
      previousPrice: null,
      effect: null,
      dailyChangePercent: 0,
      basePrice: 2250,
      originalBasePrice: 2250,
      isUp: null,
      appearanceChance: 0.8,
      dailyFluctuationRate: 8,
      volatilityFactor: 1.3
    },
    {
      item: "루비",
      description: "깊은 붉은 빛을 발하는 보석으로, 수집용으로 인기가 있으나 소지 시 별다른 효과는 없습니다.",
      previousPrice: null,
      effect: null,
      dailyChangePercent: 0,
      basePrice: 45318,
      originalBasePrice: 45318,
      isUp: null,
      appearanceChance: 0.6,
      dailyFluctuationRate: 30,
      volatilityFactor: 1.4
    },
    {
      item: "사파이어",
      description: "투명한 푸른빛이 매력적인 보석으로, 장식용 및 수집용으로 활용됩니다.",
      previousPrice: null,
      effect: null,
      dailyChangePercent: 0,
      basePrice: 646257,
      originalBasePrice: 646257,
      isUp: null,
      appearanceChance: 0.2,
      dailyFluctuationRate: 12,
      volatilityFactor: 1.2
    },
    {
      item: "다이아몬드",
      description: "희귀성과 경이로움이 결합된 최고급 보석. 극소수만이 거래할 수 있는 고급 자산입니다.",
      previousPrice: null,
      effect: null,
      dailyChangePercent: 0,
      basePrice: 12546457,
      originalBasePrice: 12546457,
      isUp: null,
      appearanceChance: 0.2,
      dailyFluctuationRate: 20,
      volatilityFactor: 1.5
    }
  );

  // gameState를 기본 상태로 재설정
  gameState.player = {
    rank: "노예",
    experience: 0,
    level: 1,
    militaryLevel: 1,
    charismaLevel: 1,
    governance: 1,
    skills: [],         // 스킬도 초기화
    inventory: [],
    location: "왕국 서부 평야", // 초기 위치
    isMoving: false,
    health: 50,
    bonusHealth: 0,
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
    roundCount: 1,
    resourcesInitialized: false
  };

  // 초기 상태를 localStorage에 저장
  localStorage.setItem('gameState', JSON.stringify(gameState));

  // UI 업데이트 (예: 내 정보, 왕국 상태, 인벤토리 등)
  resetUserClasses();
  updateMyInfo();
  updateKingdomStatus(gameState.kingdom); //왕국 정보 업데이트
  updateInventory();
  updateUserClass();
  startGameDateTimer();
  updateLocationMoveUI();
  saveGameState();
  console.log("게임이 완전히 초기화되었습니다.");
}
//리셋 버튼
document.addEventListener('DOMContentLoaded', () => {
  const resetBtn = document.querySelector('.reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetGameCompletely();
      // reset 후 .popup와 .new 클래스를 동시에 가진 요소를 숨깁니다.
      document.querySelectorAll('.popup.new').forEach(element => {
        element.style.display = 'none';
      });
    });
  }
});

//사망시
function resetGameExceptSkills() {

  // 기존 타이머 중지
  stopGameDateTimer();

  const savedSkills = gameState?.player?.skills ? [...gameState.player.skills] : [];
  localStorage.clear();
  let oldRoundCount = gameState.progress.roundCount || 1;

  storeItemDB.splice(0, storeItemDB.length,
    {
      item: "골드",
      description: "순수한 금속의 영롱한 빛이 돋보이는 귀금속으로, 상점에서 주요 거래 수단으로 사용됩니다.",
      previousPrice: null,
      effect: null,
      dailyChangePercent: 0,
      basePrice: 220024,
      originalBasePrice: 220024,
      isUp: null,
      appearanceChance: 0.7,
      dailyFluctuationRate: 4,
      volatilityFactor: 1.1
    },
    {
      item: "실버",
      description: "은은한 광채를 내는 귀금속으로, 소지 시 별다른 효과는 없습니다.",
      previousPrice: null,
      effect: null,
      dailyChangePercent: 0,
      basePrice: 225,
      originalBasePrice: 225,
      isUp: null,
      appearanceChance: 0.9,
      dailyFluctuationRate: 3,
      volatilityFactor: 1.2
    },
    {
      item: "오팔",
      description: "다채로운 색상이 반짝이는 보석으로, 소지 시 특별한 효과는 없지만 수집 가치가 있습니다.",
      previousPrice: null,
      effect: null,
      dailyChangePercent: 0,
      basePrice: 2250,
      originalBasePrice: 2250,
      isUp: null,
      appearanceChance: 0.8,
      dailyFluctuationRate: 8,
      volatilityFactor: 1.3
    },
    {
      item: "루비",
      description: "깊은 붉은 빛을 발하는 보석으로, 수집용으로 인기가 있으나 소지 시 별다른 효과는 없습니다.",
      previousPrice: null,
      effect: null,
      dailyChangePercent: 0,
      basePrice: 45318,
      originalBasePrice: 45318,
      isUp: null,
      appearanceChance: 0.6,
      dailyFluctuationRate: 30,
      volatilityFactor: 1.4
    },
    {
      item: "사파이어",
      description: "투명한 푸른빛이 매력적인 보석으로, 장식용 및 수집용으로 활용됩니다.",
      previousPrice: null,
      effect: null,
      dailyChangePercent: 0,
      basePrice: 646257,
      originalBasePrice: 646257,
      isUp: null,
      appearanceChance: 0.2,
      dailyFluctuationRate: 12,
      volatilityFactor: 1.2
    },
    {
      item: "다이아몬드",
      description: "희귀성과 경이로움이 결합된 최고급 보석. 극소수만이 거래할 수 있는 고급 자산입니다.",
      previousPrice: null,
      effect: null,
      dailyChangePercent: 0,
      basePrice: 12546457,
      originalBasePrice: 12546457,
      isUp: null,
      appearanceChance: 0.2,
      dailyFluctuationRate: 20,
      volatilityFactor: 1.5
    }
  );

  gameState.player = {
    rank: "노예",
    experience: 0,
    level: 1,
    militaryLevel: 1,
    charismaLevel: 1,
    governance: 1,
    skills: savedSkills,
    inventory: [],
    location: "왕국 서부 평야",    // [추가] 위치 초기화
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
  // 플레이어 사망 후 .user에 붙은 클래스 초기화
  resetUserClasses();
  updateMyInfo();
  updateKingdomStatus(gameState.kingdom); //왕국 정보 업데이트
  updateInventory();
  updateUserClass();
  startGameDateTimer();
  updateLocationMoveUI();
  saveGameState();
}

// 플레이어 체력을 확인하여 0 이하이면 사망 처리하는 함수
function checkPlayerHealth() {
  if (gameState.player.health <= 0) {
    const msgContainer = document.querySelector('.kingdom-message-combat');
    if (msgContainer) {
      const deathMsg = document.createElement('div');
      deathMsg.textContent = "플레이어 체력이 0입니다. 사망합니다...";
      deathMsg.style.color = "#ff0000"; // 빨간색 메시지
      msgContainer.appendChild(deathMsg);
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }
    resetGameExceptSkills(); // 사망 시 스킬 제외하고 초기화
  }
}

setInterval(checkPlayerHealth, 500); // 500ms마다 체크

function resetUserClasses() {
  const userElem = document.querySelector('.user');
  if (userElem) {
    // 기본 클래스인 "user"만 남기고 나머지 클래스 제거
    userElem.className = 'user';
  }
}
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
    data.soldiercount = Math.floor(data.population / 3);
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
  gameState.kingdom.soldiercount = data.soldiercount;
  gameState.kingdom.population = data.population;
  gameState.kingdom.resources = data.resources;

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
  updateRankByLevel(); //랭크 레벨 업데이트
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
    moneyElem.textContent = gameState.player.money.toLocaleString();
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
    const gameFirst = document.querySelector('.page.game-first');
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
  updateRankByLevel();
  initGameStart(); //게임 새 시작시
  initExport(); // 게임 내보내기
  initLoad(); //게임 불러오기
  showMessageGuideOnHover(); //mouse hover	
  updateInventory(); //인벤토리
  updateCombatPopupUI();// 팝업 UI에 현재 위치와 몬스터 표시
  renderOwnedSkills(); //보유스킬
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
  const gameFirst = document.querySelector('.page.game-first');
  const gameMain = document.querySelector('.page.game-main');

  if (!gameStartBtn || !gameFirst || !gameMain) return;

  gameStartBtn.addEventListener('click', () => {
    // 기존 게임 데이터 초기화 (예: 'gameData' 키 삭제)
    localStorage.removeItem('gameData');

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
    { menu: '.user', popup: '.popup.my-info' },
    { menu: '.menu.combat', popup: '.popup.combat' },
    { menu: '.menu.enforce', popup: '.popup.enforce' },
    { menu: '.menu.inventory', popup: '.popup.inventory' },
    { menu: '.menu.skill', popup: '.popup.skill' },
    { menu: '.menu.move', popup: '.popup.move' },
    { menu: '.button-map', popup: '.popup.map-info' },
    { menu: '.menu.shop', popup: '.popup.shop' },
    { menu: '.menu.new', popup: '.popup.new' }
  ];

  mappings.forEach(mapping => {
    const menuElem = document.querySelector(mapping.menu);
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

// 플레이어의 위치(세부 지역 또는 그룹)를 기준으로 해당 몬스터 목록을 반환하는 헬퍼 함수
function getMonstersForLocation(location) {
  // 먼저, 세부 지역으로 존재하는지 확인
  for (const group in regionMonsters) {
    if (regionMonsters[group].hasOwnProperty(location)) {
      return regionMonsters[group][location];
    }
  }
  // 만약 세부 지역이 아니라면(즉, 그룹명인 경우), 해당 그룹의 모든 하위 지역을 합칩니다.
  if (regionMonsters.hasOwnProperty(location)) {
    let monsters = [];
    const groupData = regionMonsters[location];
    if (Array.isArray(groupData)) {
      return groupData;
    } else if (typeof groupData === 'object') {
      Object.values(groupData).forEach(arr => {
        monsters = monsters.concat(arr);
      });
      return monsters;
    }
  }
  return [];
}

function updateCombatList(region) {
  const container = document.querySelector('.card-list');
  if (!container) return;
  container.innerHTML = ''; // 기존 목록 초기화
  console.log("container:", container);

  // getMonstersForLocation()를 이용하여 해당 위치에 맞는 몬스터 키 배열을 구함
  const monsterKeys = getMonstersForLocation(region);
  console.log('monsterKeys:', monsterKeys);
  if (!monsterKeys || monsterKeys.length === 0) return;
  
  monsterKeys.forEach((key) => {
    const monster = monsterData[key];
    if (!monster) return;
    const template = document.querySelector('.combat-list-wrap-combat');
    console.log('template:', template);
    if (!template) return;
    const clone = template.cloneNode(true);
    clone.style.display = "flex";
    
    const nameElem = clone.querySelector('.monster-name');
    if (nameElem) {
      nameElem.textContent = monster.name;
    }
    const levelElem = clone.querySelector('.monster-level');
    if (levelElem) {
      levelElem.textContent = `무력 레벨: ${monster.militaryLevel}`;
    }
    
    // "수색하기" 버튼 클릭 이벤트 처리
    const combatBtn = clone.querySelector('.combat-btn');
    if (combatBtn) {
      combatBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (combatInProgress) {
          const msg = document.createElement('div');
          msg.textContent = "이미 수색중입니다!";
          document.querySelector('.kingdom-message-combat').appendChild(msg);
          return;
        }
        combatInProgress = true;
        startNarrativeCombat(key, document.querySelector('.kingdom-message-combat'), () => {
          combatInProgress = false;
        });
        const combatPopup = document.querySelector('.popup.combat');
        if (combatPopup) {
          combatPopup.style.display = 'none';
        }
      });
    }
    
    container.appendChild(clone);
  });
}



document.addEventListener('DOMContentLoaded', function () {
  function closeParentPopup(element) {
    const parentPopup = element.closest('.popup');
    if (parentPopup) {
      parentPopup.style.display = 'none';
    }
  }

  document.querySelectorAll('.move-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      closeParentPopup(this);
    });
  });
});

//이동 관련

function updateLocationMoveUI() {
  const locationElem = document.querySelector('.location-move');
  if (locationElem) {
    locationElem.textContent = gameState.player.location;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateLocationMoveUI();
});

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
    updateLocationMoveUI()
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

function renderRegionGroups() {
  // 탭 버튼 영역과 콘텐츠 영역(이동 리스트)를 선택합니다.
  const tabsContainer = document.querySelector('.region-group-tabs');
  const contentsContainer = document.querySelector('.location-list'); // 기존 initLocationList()의 컨테이너와 동일

  // 기존 내용 초기화
  tabsContainer.innerHTML = '';
  contentsContainer.innerHTML = '';

  // regionMonsters 객체의 각 그룹(여기서는 "왕국 외곽")에 대해 처리
  Object.keys(regionMonsters).forEach((groupName, index) => {
    // 탭 버튼 생성
    const tabBtn = document.createElement('button');
    tabBtn.textContent = groupName;
    tabBtn.setAttribute('data-group', groupName);
    tabBtn.classList.add('region-tab-btn');
    if (index === 0) {
      tabBtn.classList.add('active');
    }
    tabsContainer.appendChild(tabBtn);

    // 그룹 콘텐츠 영역 생성 (각 그룹에 해당하는 지역 목록을 보여줄 영역)
    const groupContent = document.createElement('div');
    groupContent.classList.add('region-content-group');
    // 고유 ID를 생성 (예: group-왕국-외곽)
    groupContent.id = `group-${groupName.replace(/\s+/g, '-')}`;
    // 첫 번째 그룹은 기본적으로 보이고, 나머지는 숨김 (여기선 하나뿐이라 block)
    groupContent.style.display = index === 0 ? 'block' : 'none';

    // 해당 그룹의 지역 객체 (예: "왕국 외곽" 아래에 "왕국 서부 평야", "왕국 동부 경계", "피안의 숲")
    const regions = regionMonsters[groupName];
    Object.keys(regions).forEach(regionName => {
      // 기존 initLocationList()와 유사한 구조: move-list, location-name, move-btn
      const regionDiv = document.createElement('div');
      regionDiv.classList.add('move-list', 'flex');

      const locName = document.createElement('div');
      locName.classList.add('location-name');
      locName.textContent = regionName;

      const btn = document.createElement('a');
      btn.href = '#';
      btn.classList.add('move-btn', 'w-button');
      btn.textContent = '이동';
      btn.addEventListener('click', e => {
        e.preventDefault();
        const messageContainer = document.querySelector('.kingdom-message-combat');
        if (!messageContainer) return;
        moveTo(regionName, messageContainer);
      });

      regionDiv.appendChild(locName);
      regionDiv.appendChild(btn);
      groupContent.appendChild(regionDiv);
    });

    // 생성한 그룹 콘텐츠를 이동 리스트(콘텐츠 영역)에 추가
    contentsContainer.appendChild(groupContent);
  });

  // 탭 버튼 클릭 이벤트: 클릭 시 해당 그룹 콘텐츠만 보이도록 처리
  document.querySelectorAll('.region-group-tabs button').forEach(btn => {
    btn.addEventListener('click', function() {
      const selectedGroup = this.getAttribute('data-group');
      // 모든 탭 버튼에서 active 클래스 제거 후 현재 버튼에 active 추가
      document.querySelectorAll('.region-group-tabs button').forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      // 모든 그룹 콘텐츠 숨기기
      document.querySelectorAll('.region-content-group').forEach(content => {
        content.style.display = 'none';
      });

      // 선택한 그룹 콘텐츠만 표시
      const activeContent = document.getElementById(`group-${selectedGroup.replace(/\s+/g, '-')}`);
      if (activeContent) {
        activeContent.style.display = 'block';
      }
    });
  });
}

// DOMContentLoaded 시 초기 렌더링
document.addEventListener('DOMContentLoaded', () => {
  renderRegionGroups();
   // 기존 초기화 코드들이 있다면 그 아래에 추가
   document.querySelectorAll('.move-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const popup = btn.closest('.popup.move');
      if (popup) {
        popup.style.display = 'none';
      }
    });
  });
});

//스킬

function renderEnforceList() {
  const enforceListElem = document.querySelector('.card-enforce-list');
  if (!enforceListElem) return;
  enforceListElem.innerHTML = ''; // 기존 내용 초기화

  const enforceableSkills = gameState.player.skills.filter(skillObj => {
    const skillData = storeSkillDB.find(s => s.name === skillObj.name);
    if (!skillData) return false;
    const maxLevel = Object.keys(skillData.effects).length;
    return skillObj.level < maxLevel;
  });

  if (enforceableSkills.length === 0) {
    const noSkillMsg = document.createElement('div');
    noSkillMsg.classList.add("no-skills");
    noSkillMsg.textContent = "강화 가능한 스킬이 없습니다.";
    enforceListElem.appendChild(noSkillMsg);
    return;
  }

  const rarityColorMapping = {
    common: "#d3d3d3",
    rare: "#4fc3f7",
    epic: "#ba68c8",
    legendary: "#ffb74d"
  };

  enforceableSkills.forEach(skillObj => {
    const skillData = storeSkillDB.find(s => s.name === skillObj.name);
    if (!skillData) return;

    const maxLevel = Object.keys(skillData.effects).length;
    if (skillObj.level >= maxLevel) return;

    const upgradeCost = skillData.basePrice * Math.pow(2, skillObj.level);
    const nextLevel = skillObj.level + 1;
    let nextEffectText = "";
    if (skillData.effects[nextLevel]) {
      const nextEffect = skillData.effects[nextLevel];
      nextEffectText = Object.entries(nextEffect)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
      nextEffectText = "다음 강화 효과: " + nextEffectText;
    } else {
      nextEffectText = "이미 최대 레벨";
    }

    // 외부 컨테이너: container (이전의 cardWrap 대신 사용)
    const container = document.createElement('div');
    container.classList.add('enforce-list');

    // 내부 컨테이너: skillInfoDiv 안에 card-enforce-wrap를 생성하여 스킬 정보를 표시
    const skillInfoDiv = document.createElement('div');
    skillInfoDiv.classList.add('skill-info');

    const rarityKey = (skillData.rarity || "common").toLowerCase();
    const rarityColor = rarityColorMapping[rarityKey] || "#d3d3d3";

    const cardWrapDiv = document.createElement('div');
    cardWrapDiv.classList.add('card-enforce-wrap');
    cardWrapDiv.innerHTML = `<strong style="color: ${rarityColor};">${skillData.name}</strong> (강화 단계: ${skillObj.level})<br>
      강화 비용: ${upgradeCost.toLocaleString()}원<br>
      ${nextEffectText}`;

    skillInfoDiv.appendChild(cardWrapDiv);
    container.appendChild(skillInfoDiv);

    // 강화 버튼 생성 및 추가
    const enforceBtn = document.createElement('button');
    enforceBtn.classList.add('enforce-btn');
    enforceBtn.textContent = '강화하기';
    enforceBtn.dataset.skill = skillData.name;
    enforceBtn.addEventListener('click', (e) => {
      e.preventDefault();
      upgradeSkill(skillData.name);
    });
    container.appendChild(enforceBtn);

    enforceListElem.appendChild(container);
  });
}



function upgradeSkill(skillName) {
  // 플레이어 보유 스킬은 { name, level } 형태로 저장되어 있다고 가정합니다.
  const playerSkill = gameState.player.skills.find(s => s.name === skillName);
  if (!playerSkill) {
    alert("해당 스킬을 보유하고 있지 않습니다.");
    return;
  }

  // storeSkillDB에서 스킬 데이터를 찾습니다.
  const skillData = storeSkillDB.find(s => s.name === skillName);
  if (!skillData) {
    alert("스킬 데이터가 존재하지 않습니다.");
    return;
  }

  const currentLevel = playerSkill.level;
  const maxLevel = Object.keys(skillData.effects).length;

  if (currentLevel >= maxLevel) {
    alert("이미 최대 강화 단계입니다.");
    return;
  }

  // 강화 비용 계산: basePrice × 2^(현재 강화 단계)
  const upgradeCost = skillData.basePrice * Math.pow(2, currentLevel);

  // 소지금이 올바른 숫자인지 강제 변환
  gameState.player.money = Number(gameState.player.money) || 0;
  if (gameState.player.money < upgradeCost) {
    alert(`강화 비용이 부족합니다. 필요한 금액: ${upgradeCost.toLocaleString()}원`);
    return;
  }

  // 강화 비용 차감 (강화 성공/실패 여부와 상관없이 차감)
  gameState.player.money -= upgradeCost;

  // 랜덤 성공 확률: 0.3 ~ 0.9 사이
  const successRate = 0.3 + Math.random() * 0.6;
  if (Math.random() < successRate) {
    // 강화 성공: 현재 강화 단계 증가
    playerSkill.level++;

    const msgContainer = document.querySelector('.kingdom-message-combat');
    if (msgContainer) {
      const upgradeMsg = document.createElement('div');
      upgradeMsg.textContent = `${skillName} 스킬 강화 성공! 현재 강화 단계: ${playerSkill.level} (비용: ${upgradeCost.toLocaleString()}원, 성공 확률: ${(successRate * 100).toFixed(1)}%)`;
      upgradeMsg.style.color = "#32cd32"; // 연두색: 성공 메시지
      msgContainer.appendChild(upgradeMsg);
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }
    console.log(`${skillName} upgraded to level ${playerSkill.level}`);
  } else {
    // 강화 실패: 강화 단계 변화 없음
    const msgContainer = document.querySelector('.kingdom-message-combat');
    if (msgContainer) {
      const failMsg = document.createElement('div');
      failMsg.textContent = `${skillName} 스킬 강화 실패! (비용: ${upgradeCost.toLocaleString()}원, 성공 확률: ${(successRate * 100).toFixed(1)}%)`;
      failMsg.style.color = "#ff0000"; // 빨간색: 실패 메시지
      msgContainer.appendChild(failMsg);
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }
    console.log(`${skillName} upgrade failed.`);
  }

  // UI 업데이트
  renderEnforceList();
  renderOwnedSkills();
  updateUserStatus();
  saveGameState();
}




function renderOwnedSkills() {
  const cardList = document.querySelector('.card-list-skill');
  if (!cardList) return;
  cardList.innerHTML = '';

  // 플레이어 스킬 배열이 비어있다면
  if (!gameState.player.skills || gameState.player.skills.length === 0) {
    const noSkillMsg = document.createElement('div');
    noSkillMsg.classList.add("no-skills");
    noSkillMsg.textContent = "보유 스킬이 없습니다.";
    cardList.appendChild(noSkillMsg);
    return;
  }

  // 등급별 색상 매핑
  const rarityColorMapping = {
    common: "#d3d3d3",      // 연한 회색
    rare: "#4fc3f7",        // 연한 파란색
    epic: "#ba68c8",        // 보라색
    legendary: "#ffb74d"     // 주황색
  };

  // 플레이어 스킬은 { name: "강타", level: 1 } 형태로 저장되어 있다고 가정
  gameState.player.skills.forEach(skillObj => {
    // storeSkillDB에서 해당 스킬 정보를 찾습니다.
    const skillData = storeSkillDB.find(s => s.name === skillObj.name);
    if (!skillData) return;

    // 스킬 카드 컨테이너 생성
    const cardWrap = document.createElement('div');
    cardWrap.classList.add('skill-wrap');

    // 등급별 색상 결정 (소문자로 변환)
    const rarityKey = (skillData.rarity || "common").toLowerCase();
    const rarityColor = rarityColorMapping[rarityKey] || "#d3d3d3";

    // 현재 효과(현재 레벨에 해당하는 효과)
    const currentLevel = skillObj.level;
    const currentEffect = skillData.effects[currentLevel] || {};
    const effectText = Object.entries(currentEffect)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");

    // 다음 강화 효과: 현재 레벨+1이 존재하면 그 효과를, 없으면 "이미 최대 레벨" 표시
    const nextLevel = currentLevel + 1;
    let nextUpgradeText = "";
    if (skillData.effects[nextLevel]) {
      const nextEffect = skillData.effects[nextLevel];
      nextUpgradeText = "다음 강화: " + Object.entries(nextEffect)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
    } else {
      nextUpgradeText = "이미 최대 레벨입니다.";
    }

    // HTML 구성: 스킬 이름, 등급, 상세 설명, 필요 레벨, 발동 방식, 발동 확률, 현재 효과, 그리고 다음 강화 효과
    cardWrap.innerHTML = `
      <div class="skill-title" style="color: ${rarityColor};">
        ${skillData.name} 
        <span class="skill-rarity" style="color: ${rarityColor};">
          (${skillData.rarity})
        </span>
      </div>
      <div class="skill-detail">
        <p class="skill-description">${skillData.description}</p>
        <p class="skill-required-level">필요 레벨: ${skillData.requiredLevel}</p>
        <p class="skill-triggerChance">발동 확률: ${Math.round(skillData.triggerChance * 100)}%</p>
        <p class="skill-activation">발동 방식: ${skillData.activation}</p>
        <p class="skill-effects">스킬 레벨: ${currentLevel}</p>
        <p class="skill-effects">${effectText}</p>
        <p class="skill-effects">${nextUpgradeText}</p>
      </div>
    `;

    cardList.appendChild(cardWrap);
  });
  renderEnforceList();
}






//전투 팝업 업데이트
/*********************************************************
 * 전투 팝업 업데이트 (헤더: 지역명만 표시)
 ********************************************************/
function updateCombatPopupUI() {
  // 플레이어의 상세 위치(예: "왕국 서부 평야")를 그대로 사용
  const location = gameState.player.location;
  const combatCard = document.querySelector('.popup.combat');
  if (!combatCard) return;

  // 헤더에 상세 위치 표시
  const cardTitle = combatCard.querySelector('.card-title');
  if (cardTitle) {
    cardTitle.textContent = location;
  }

  // 해당 상세 위치의 몬스터 목록을 업데이트합니다.
  updateCombatList(location);
}

// 플레이어의 위치(예: "왕국 서부 평야")를 받아서 해당하는 상위 그룹(예: "왕국 외곽")을 리턴하는 함수
function getRegionGroupFromLocation(location) {
  for (const group in regionMonsters) {
    const regions = regionMonsters[group];
    if (regions.hasOwnProperty(location)) {
      return group;
    }
  }
  // 만약 해당하는 그룹이 없다면, 기본적으로 입력된 location을 리턴하거나 다른 처리를 합니다.
  return location;
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

  // 새로운 전투 시작 시, 이전 bleed 효과 초기화
  delete monster.bleed;
  monster.health = monster.health; // (필요하다면 hp를 다시 초기화)

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

function calculateDamage(attacker) {
  const baseAttack = 10;
  const strengthBonus = attacker.militaryLevel * 2;
  const randomFactor = Math.random() * 0.3 + 0.85; // 0.85 ~ 1.15
  // 만약 attacker에 critChance가 없으면 기본 10% 확률 사용
  const critChance = (attacker.critChance !== undefined ? attacker.critChance : 0.1);
  const isCrit = Math.random() < critChance;
  const critMultiplier = isCrit ? 2 : 1;
  const damage = Math.floor((baseAttack + strengthBonus) * randomFactor * critMultiplier);
  return { damage, isCrit };
}

// 스킬 효과 적용 함수 (공격 데미지 보정)
function applyPlayerAttackSkills(baseDamage, msgContainer) {
  if (!msgContainer) {
    msgContainer = document.querySelector('.kingdom-message-combat');
  }

  let bonusDamage = 0;

  // 스킬 종류별 색상 매핑
  const skillTypeColorMapping = {
    "damage": "#ff6347", // 토마토 레드 (예: 강타)
    "heal": "#7CFC00",   // 연두색 (예: 회복)
    "bleed": "#ff4500"   // 오렌지레드 (예: 출혈)
  };

  // 등급별 색상 매핑 (기본: 연한 회색)
  const rarityColorMapping = {
    "common": "#d3d3d3",
    "rare": "#4fc3f7",
    "epic": "#ba68c8",
    "legendary": "#ffb74d"
  };

  // 플레이어 스킬이 객체 배열 { name, level } 형태라고 가정합니다.
  gameState.player.skills.forEach(skillObj => {
    const skill = storeSkillDB.find(s => s.name === skillObj.name);
    if (!skill) return;

    // "random" 스킬의 경우 발동 확률에 따라 보너스 데미지 적용
    if (skill.activation === "random" && Math.random() < skill.triggerChance) {
      // 현재 강화 단계에 따른 효과 적용: 예를 들어, "강타"의 경우
      const dmgBonus = skill.effects[skillObj.level]?.damageBonus || 0;
      bonusDamage += dmgBonus;

      let msgColor = skillTypeColorMapping[skill.type];
      if (!msgColor) {
        msgColor = rarityColorMapping[skill.rarity.toLowerCase()] || "#ffffff";
      }
      const skillMsg = document.createElement('div');
      skillMsg.textContent = `[스킬 발동] ${skill.name}이(가) 발동하여 ${dmgBonus}의 추가 데미지를 부여합니다.`;
      skillMsg.style.color = msgColor;
      msgContainer.appendChild(skillMsg);
      msgContainer.scrollTop = msgContainer.scrollHeight;
      console.log(skillMsg.textContent);
    }
  });

  return baseDamage + bonusDamage;
}


// 패시브 회복 스킬 적용 함수 (매 라운드 시작 시)
function applyPassiveHealing() {
  let totalHealing = 0;
  gameState.player.skills.forEach(skillObj => {
    const skill = storeSkillDB.find(s => s.name === skillObj.name);
    if (!skill) return;

    if (skill.activation === "passive") {
      // 현재 강화 단계에 따른 체력 회복 효과 적용
      const healValue = skill.effects[skillObj.level]?.healthBonus || 0;
      totalHealing += healValue;
      console.log(`[스킬 발동] ${skill.name}이(가) 발동하여 ${healValue}의 체력을 회복합니다.`);
    }
  });
  gameState.player.health += totalHealing;
  return totalHealing;
}


// 출혈 효과를 매 턴 적용하는 함수
function applyBleedEffect(target, msgContainer) {
  if (target.bleed && target.bleed.rounds > 0) {
    // 출혈 데미지를 대상에게 적용
    target.health -= target.bleed.damage;
    if (target.health < 0) target.health = 0;

    // 메시지 출력 - bleed 효과 메시지에 색상 적용 (오렌지레드)
    const bleedMsg = document.createElement('div');
    bleedMsg.textContent = `[스킬 발동] 출혈이(가) 발동하여 3라운동안 몬스터가 ${target.bleed.damage}의 추가 피해를 받습니다.`;
    bleedMsg.style.color = "#ff4500"; // 오렌지레드
    if (msgContainer) {
      msgContainer.appendChild(bleedMsg);
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }

    // 남은 효과 턴 감소
    target.bleed.rounds--;
    if (target.bleed.rounds <= 0) {
      delete target.bleed; // 효과 종료 시 제거
    }
  }
}

// 출혈 스킬 발동을 시도하는 함수 (플레이어 공격 시점에 호출)
function tryApplyBleedSkill(monster, msgContainer) {  
  // 플레이어가 "출혈" 스킬을 가지고 있는지 객체 배열에서 찾기
  const playerBleedSkill = gameState.player.skills.find(s => s.name === "출혈");
  if (!playerBleedSkill) return;

  const bleedSkill = storeSkillDB.find(s => s.name === "출혈");
  if (!bleedSkill) return;

  // 이미 monster에 bleed 효과가 있다면 새로 적용하지 않음
  if (monster.bleed) return;

  // 출혈 스킬이 random인 경우 triggerChance에 따라 발동
  if (bleedSkill.activation === "random" && Math.random() < bleedSkill.triggerChance) {
    // 플레이어의 현재 강화 단계에 따른 bleedDamage 적용
    const bleedDamage = bleedSkill.effects[playerBleedSkill.level]?.bleedDamage || 0;
    // bleed 효과를 부여 (예: 지속 3턴)
    monster.bleed = { damage: bleedDamage, rounds: 3 };

    // 초기 메시지는 제거합니다.
    // (매 턴 applyBleedEffect에서 출혈 효과 메시지를 출력합니다.)
    console.log(`[스킬 발동] ${bleedSkill.name} 발동 - ${bleedDamage}의 추가 피해, 3턴 지속`);
  } 
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

    const roundMsg = document.createElement('div');
    roundMsg.textContent = `=== Round ${roundNumber} ===`;
    msgContainer.appendChild(roundMsg);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // 라운드 시작 시 패시브 회복 스킬 적용
    const healed = applyPassiveHealing();
    if (healed > 0) {
      const healMsg = document.createElement('div');
      healMsg.textContent = `패시브 회복 효과로 ${healed}의 체력이 회복되었습니다.`;
      healMsg.style.color = "#7CFC00"; // 연두색
      msgContainer.appendChild(healMsg);
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }

    // 매 라운드 시작 시, 출혈 효과 적용 (있다면)
    applyBleedEffect(monster, msgContainer);

    // 플레이어 공격
    let { damage: basePlayerDamage, isCrit: playerCrit } = calculateDamage(gameState.player);
    // 플레이어 공격 시 "출혈" 스킬 발동 시도 (단, 조건에 따라 한 번만 적용)
    tryApplyBleedSkill(monster, msgContainer);
    // 스킬 보정이 적용된 최종 데미지 계산
    let finalPlayerDamage = applyPlayerAttackSkills(basePlayerDamage, msgContainer);
    const playerAttackMsg = document.createElement('div');
    playerAttackMsg.textContent = `플레이어가 ${playerCrit ? "치명타로 " : ""}${finalPlayerDamage}의 데미지를 입혔습니다.`;
    msgContainer.appendChild(playerAttackMsg);
    msgContainer.scrollTop = msgContainer.scrollHeight;
    currentMonsterHealth -= finalPlayerDamage;

    // 몬스터 공격
    const { damage: monsterDamage, isCrit: monsterCrit } = calculateDamage(monster);
    gameState.player.health -= monsterDamage;
    if (gameState.player.health < 0) gameState.player.health = 0;

    const monsterAttackMsg = document.createElement('div');
    monsterAttackMsg.textContent = `몬스터가 ${monsterCrit ? "치명타로 " : ""}${monsterDamage}의 데미지를 주었습니다. 남은 플레이어 체력: ${gameState.player.health}`;
    msgContainer.appendChild(monsterAttackMsg);
    msgContainer.scrollTop = msgContainer.scrollHeight;
    updateHealthBar();

    // 전투 종료 판정
    if (currentMonsterHealth <= 0) {
      console.log("몬스터 체력 0 이하 → 승리 처리");
      const victoryMsg = document.createElement('div');
      victoryMsg.textContent = monster.victoryMessage;
      msgContainer.appendChild(victoryMsg);
      msgContainer.scrollTop = msgContainer.scrollHeight;
      onMonsterDefeated(monsterKey, msgContainer);
      if (typeof finalCallback === 'function') finalCallback();
      return;
    }
    if (gameState.player.health <= 0) {
      console.log("플레이어 체력 0 이하 → 사망 처리");
      const defeatMsg = document.createElement('div');
      defeatMsg.textContent = "전투 도중 사망했습니다...";
      msgContainer.appendChild(defeatMsg);
      msgContainer.scrollTop = msgContainer.scrollHeight;
      resetGameExceptSkills();
      if (typeof finalCallback === 'function') finalCallback();
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

  // ✅ 누적 처치 수 기록 추가
  if (!gameState.progress.defeatedMonsters) {
    gameState.progress.defeatedMonsters = {};
  }
  const name = monster.name;
  if (!gameState.progress.defeatedMonsters[name]) {
    gameState.progress.defeatedMonsters[name] = 1;
  } else {
    gameState.progress.defeatedMonsters[name]++;
  }

  // 전리품 드랍 처리: loot 배열에서 드랍할 아이템들을 결정합니다.
  const droppedLoot = getDroppedLoot(monster.loot);

  if (droppedLoot.length > 0) {
    droppedLoot.forEach(lootData => {
      const lootItem = lootData.item;
      // 인벤토리에 해당 아이템을 1개 추가할 수 있는지 검사
      if (canAddItemToInventory(lootItem, 1)) {
        gameState.player.inventory.push(lootItem);
        const lootDiv = document.createElement('div');
        lootDiv.textContent = `전리품: ${lootItem}을(를) 획득했습니다.`;
        messageContainer.appendChild(lootDiv);
        messageContainer.scrollTop = messageContainer.scrollHeight;
      } else {
        // 슬롯이 부족하면 "인벤토리가 꽉 찼습니다!" 메시지를 최근 활동 영역에 표시
        const fullDiv = document.createElement('div');
        fullDiv.textContent = "인벤토리가 꽉 찼습니다!";
        fullDiv.style.color = "yellow"; // 강조 효과 (선택사항)
        messageContainer.appendChild(fullDiv);
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    });
  } else {
    const noLootDiv = document.createElement('div');
    noLootDiv.textContent = "전리품이 떨어지지 않았습니다.";
    messageContainer.appendChild(noLootDiv);
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  // 경험치 추가 등 나머지 처리...
  gameState.player.experience += monster.experience;
  const expDiv = document.createElement('div');
  expDiv.textContent = `경험치 ${monster.experience} 획득했습니다.`;
  messageContainer.appendChild(expDiv);
  messageContainer.scrollTop = messageContainer.scrollHeight;

  updateInventory();
  checkLevelUp(messageContainer);
  saveGameState();
  renderOwnedSkills()
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

      // 레벨업 후 스킬 해금 조건이 바뀌었을 수 있으므로 UI 갱신
      updateTodaySkillList();
      renderSkillShop();

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

//스킬
window.addEventListener('DOMContentLoaded', () => {
  // 로컬 스토리지에 저장된 스킬 목록을 전역 변수에 할당
  todaySkillList = JSON.parse(localStorage.getItem("todaySkillList")) || [];
  renderSkillShop();
});

let todaySkillList = [];

function refreshSkillShopForNewDay() {
  const todayKey = `${gameState.currentDate.year}-${gameState.currentDate.month}-${gameState.currentDate.day}`;

  // 이미 갱신한 날짜라면 그대로 유지
  if (localStorage.getItem("lastSkillShopDate") === todayKey) return;

  todaySkillList = [];

  storeSkillDB.forEach(skill => {
    // 등장 확률 체크
    if (Math.random() <= skill.appearanceChance) {
      // 잠금 조건 체크
      if (checkSkillUnlockCondition(skill.unlockCondition)) {
        const priceFluctuation = Math.floor((Math.random() - 0.5) * skill.variance * 2);
        skill.todayPrice = skill.basePrice + priceFluctuation;
        todaySkillList.push(skill);
      }
    }
  });
  // console.log(`[${skill.name}] 등장확률: ${skill.appearanceChance}, 등장결과: ${appear}, 잠금해제: ${unlocked}`);
  console.log("전체 스킬 수:", storeSkillDB.length);
  localStorage.setItem("lastSkillShopDate", todayKey);
  console.log("오늘 상점에 등장한 스킬:", todaySkillList.map(s => s.name));
  localStorage.setItem("todaySkillList", JSON.stringify(todaySkillList));
  renderSkillShop();
  renderOwnedSkills();
  renderEnforceList()
}

function checkSkillUnlockCondition(condition) {
  if (!condition) return true;

  const progress = gameState.progress;

  switch (condition.type) {
    case "defeat":
      return (progress.defeatedMonsters?.[condition.target] || 0) >= condition.count;

    case "useSkill":
      return (progress.usedSkills?.[condition.target] || 0) >= condition.count;

    case "reachLevel":
      return gameState.player.level >= condition.target;

    default:
      return false;
  }

}

function renderSkillShop() {
  const skillListElem = document.querySelector(".shop-skill-sell-list");
  skillListElem.innerHTML = "";
  // 등급에 따른 색상 매핑 (기본(common)은 연한 회색)
  const rarityColorMapping = {
    "common": "#d3d3d3",    // 연한 회색
    "rare": "#4fc3f7",      // 연한 파란색
    "epic": "#ba68c8",      // 보라색
    "legendary": "#ffb74d"  // 주황색
  };

  // 모든 스킬을 표시하도록 storeSkillDB 전체를 사용합니다.
  const skillList = storeSkillDB;
  skillList.forEach(skill => {
    const rarityColor = rarityColorMapping[skill.rarity.toLowerCase()] || "#d3d3d3";
    // 해금 여부는 checkSkillUnlockCondition 함수로 판단 (true이면 해금된 것)
    const unlocked = checkSkillUnlockCondition(skill.unlockCondition);

    const skillElem = document.createElement("div");
    skillElem.classList.add("skill-sell-list");

    let innerHTML = `
      <div class="shop-skill-txt">
        <div class="skill-flex-box">
          <div class="skill-name" style="color: ${rarityColor};">${skill.name}</div>
          <div class="skill-rarity" style="color: ${rarityColor};">${skill.rarity}</div>
        </div>
        <div class="skill-description">${skill.description}</div>
        <div class="skill-flex-box-wrap">
          <div>타입:</div><div class="skill-activation">${skill.activation}</div>
        </div>
        <div class="skill-flex-box-wrap">
          <div>필요 레벨:</div><div class="skill-required-level">${skill.requiredLevel}</div>
        </div>
        <div class="skill-flex-box-wrap">
          <div>발동 확률:</div><div class="skill-triggerChance">${Math.round(skill.triggerChance * 100)}%</div>
        </div>
        <div class="skill-flex-box-wrap price">
          <div>가격:</div><div class="skill-price">${skill.todayPrice?.toLocaleString() || skill.basePrice.toLocaleString()}</div>
        </div>
      </div>
    `;

    // 해금되었으면 구매 버튼, 해금되지 않은 경우에는 .skill-unlock div 추가
    if (unlocked) {
      innerHTML += `<button class="skill-buy-btn" data-skill="${skill.name}">구매</button>`;
    } else {
      innerHTML += `<div class="skill-unlock">해금 조건 미충족</div>`;
    }

    skillElem.innerHTML = innerHTML;
    skillListElem.appendChild(skillElem);
  });

  // 구매 버튼 이벤트 연결 (해금되지 않은 스킬은 버튼이 없으므로 무시됨)
  setSkillBuyButtonEvents();
  renderOwnedSkills();
  renderEnforceList()

}
function updateTodaySkillList() {
  // storeSkillDB에 있는 모든 스킬 정보를 오늘의 스킬 목록으로 저장합니다.
  // (여기서는 가격 등 랜덤 요소는 storeSkillDB를 기준으로 이미 생성된 값을 그대로 사용한다고 가정)
  localStorage.setItem("todaySkillList", JSON.stringify(storeSkillDB));
  renderSkillShop();
}
function setSkillBuyButtonEvents() {
  document.querySelectorAll(".skill-buy-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const skillName = btn.dataset.skill;
      const skill = todaySkillList.find(s => s.name === skillName);

      if (!skill) return;

      if (gameState.player.level < skill.requiredLevel) {
        alert("레벨이 부족합니다!");
        return;
      }

      gameState.player.money = Number(gameState.player.money) || 0;
      if (gameState.player.money < skill.todayPrice) {
        alert("소지금이 부족합니다!");
        return;
      }

      // 수정된 부분: 이미 보유한 스킬 확인 (객체 배열이므로 some 사용)
      if (gameState.player.skills.some(s => s.name === skill.name)) {
        alert("이미 보유한 스킬입니다!");
        return;
      }

      gameState.player.money -= skill.todayPrice;
      gameState.player.skills.push({ name: skillName, level: 1 });
      alert(`[${skill.name}] 스킬을 구매했습니다!`);

      updateTodaySkillList()
      renderSkillShop();
      updateUserStatus();
      saveGameState();
      renderOwnedSkills();
    });
  });
}
//상점
// 기존 getLootPriceInfo 함수는 그대로 사용
function getLootPriceInfo(itemName) {
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
  return null;
}

// 상점 아이템 정보를 반환하는 헬퍼 함수
function getStoreItemInfo(itemName) {
  return storeItemDB.find(item => item.item === itemName);
}

/**
 * 하루가 지날 때마다 상점 아이템을 갱신하는 함수
 * 1) dailyFluctuationRate를 바탕으로 가격 조정
 * 2) 오늘 등장할 아이템 목록을 재구성하고 DOM 갱신
 */
// ——— Shop DB Persistence ———
function loadShopDB() {
  try {
    const saved = localStorage.getItem('shopDB');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // 기존 배열 참조를 유지하며 내용을 전부 교체합니다.
        storeItemDB.splice(0, storeItemDB.length, ...parsed);
        console.log("Shop DB loaded:", storeItemDB);
      } else {
        console.warn("저장된 shopDB 데이터 형식이 올바르지 않습니다.");
      }
    }
  } catch (error) {
    console.error("shopDB 로딩 에러:", error);
  }
}

function saveShopDB() {
  try {
    localStorage.setItem('shopDB', JSON.stringify(storeItemDB));
    console.log("Shop DB saved.");
  } catch (error) {
    console.error("shopDB 저장 에러:", error);
  }
}

function refreshShopItemsForNewDay() {
  // 💡 기준 가격이 없으면 초기화
  storeItemDB.forEach(item => {
    if (!item.originalBasePrice) {
      item.originalBasePrice = item.basePrice;
    }
  });

  const today = `${gameState.currentDate.year}-${String(gameState.currentDate.month).padStart(2, '0')}-${String(gameState.currentDate.day).padStart(2, '0')}`;
  const lastDate = localStorage.getItem('lastShopDate') || '';

  if (today === lastDate) return;

  storeItemDB.forEach(item => {
    item.previousPrice = item.basePrice;
    const oldPrice = item.basePrice;

    const volatility = item.volatilityFactor || 1;
    const basePrice = item.basePrice;
    const originalBase = item.originalBasePrice || basePrice;

    let direction = Math.random() < 0.48 ? -1 : 1;
    let eventFluct = 1;
    let eventText = '';
    let isEvent = false;

    // 💥 저가 반등 확률 및 상승폭 강화
    const reboundThreshold = 50;
    if (basePrice <= reboundThreshold) {
      const reboundChance = Math.min(1, Math.max(0.9, 1 - basePrice / 100)); // 가격 낮을수록 상승확률 증가
      if (Math.random() < reboundChance) {
        direction = 1;
      }
    }

    // 💥 폭등 / 폭락 이벤트
    const randomEventRoll = Math.random();
    if (randomEventRoll < 0.005) {
      eventFluct = 1.1 + Math.random() * 2;
      direction = 1;
      eventText = '💥 폭등';
      isEvent = true;
    } else if (randomEventRoll < 0.01) {
      eventFluct = 0.5 + Math.random() * 0.3;
      direction = -1;
      eventText = '📉 폭락';
      isEvent = true;
    }

    // 📈 기본 변동률 계산
    let rate = 0;
    const baseRate = item.dailyFluctuationRate / 100;

    if (!isEvent) {
      const roll = Math.random();
      if (roll < 0.7) {
        rate = baseRate * (Math.random() * 0.5); // 소폭
      } else if (roll < 0.95) {
        rate = baseRate * (0.5 + Math.random()); // 중간
      } else {
        rate = baseRate * (1 + Math.random()); // 강한
      }

      if (basePrice <= reboundThreshold && direction === 1) {
        rate *= 2; // 저가일 때 상승폭 강화
      }
    } else {
      // 이벤트일 경우 직접 설정
      rate = direction === 1 ? (1 + Math.random()) : (0.8 + Math.random() * 0.7);
    }

    // 💡 회귀: 기준 가격에서 멀수록 변동 폭 약화
    const regressionFactor = 1 + 0.25 + Math.abs(originalBase - basePrice) / originalBase;
    const change = Math.floor(basePrice * rate * direction * eventFluct * volatility / regressionFactor);
    item.basePrice = Math.max(24, basePrice + change);

    // 💾 최근 5일 가격 기록
    if (!item.priceHistory) item.priceHistory = [];
    item.priceHistory.push(item.basePrice);
    if (item.priceHistory.length > 5) {
      item.priceHistory.shift();
    }

    const newPrice = item.basePrice;
    const rawPercent = ((newPrice - oldPrice) / oldPrice) * 100;
    let roundedPercent = Math.round(rawPercent);

    // ±3% 미만이면 1~3% 보정
    if (Math.abs(roundedPercent) < 3 && oldPrice !== newPrice) {
      const correction = Math.floor(Math.random() * 3) + 1;
      roundedPercent = newPrice > oldPrice ? correction : -correction;
    }

    item.dailyChangePercent = roundedPercent;
    item.isUp = newPrice > oldPrice;

    console.log(`[${item.item}] ${eventText || '일반'} 이전: ${oldPrice} → ${newPrice} (${roundedPercent}%)`);

    // 📢 왕국 메시지 - 이벤트 알림
    if (eventText) {
      const kingdomMsgElem = document.querySelector('.kingdom-message-news');
      if (kingdomMsgElem) {
        const msg = document.createElement('div');
        msg.classList.add('txt');
        msg.style.color = direction > 0 ? '#ff6363' : '#66aaff';
        msg.textContent = `[${eventText}] ${item.item} 가격이 ${oldPrice.toLocaleString()} → ${newPrice.toLocaleString()} 으로 ${direction === 1 ? '상승' : '하락'}했습니다.`;
        kingdomMsgElem.appendChild(msg);
        scrollToBottom(kingdomMsgElem);
      }
    }
  });

  // 📊 경제 뉴스 스타일 분석 결과 출력
  const summaryDateKey = 'lastSummaryDate';
  const lastSummaryDate = localStorage.getItem(summaryDateKey);
  if (lastSummaryDate !== today) {
    const summary = generateEconomicSummaryNews(storeItemDB);
    if (summary) {
      const kingdomMsgElem = document.querySelector('.kingdom-message-news');
      if (kingdomMsgElem) {
        const msg = document.createElement('div');
        msg.classList.add('txt');
        msg.style.color = '#f1d255';
        msg.textContent = summary;
        kingdomMsgElem.appendChild(msg);
        scrollToBottom(kingdomMsgElem);
      }
    }
    localStorage.setItem(summaryDateKey, today); // ✅ 오늘 요약 뉴스 출력 기록
  }

  // 💾 저장
  saveShopDB();
}


function generateEconomicSummaryNews(items) {
  const downItems = [];
  const unstableItems = [];
  const stableItems = [];

  items.forEach(item => {
    const history = item.priceHistory;
    const base = item.originalBasePrice || item.basePrice;

    if (!history || history.length < 5) return;

    const changes = history.map(p => (p - base) / base);
    const avg = changes.reduce((a, b) => a + b, 0) / changes.length;
    const variance = changes.map(c => Math.pow(c - avg, 2)).reduce((a, b) => a + b, 0) / changes.length;
    const stdDev = Math.sqrt(variance);

    if (avg < -0.05 && stdDev < 0.05) {
      downItems.push(item.item);
    } else if (stdDev > 0.07) {
      unstableItems.push(item.item);
    } else {
      stableItems.push(item.item);
    }
  });

  const parts = [];

  if (downItems.length) parts.push(`${downItems.join('·')} 하락`);
  if (unstableItems.length) parts.push(`${unstableItems.join('·')} 불안정`);
  if (stableItems.length) parts.push(`${stableItems.join('·')} 안정세`);
  if (parts.length === 0) return null;

  return `📊 최근 5일 시장 요약: ${parts.join(', ')}입니다.`;
}



// 구매하려는 아이템 정보를 임시 저장할 변수
let selectedItemForPurchase = null;

// 페이지 로드 후 상점 초기화
document.addEventListener('DOMContentLoaded', () => {
  loadShopDB();
  initShopItems();
  initBuyPopup();
});

/**
 * 상점 아이템을 확률적으로 뽑아서 .shop-item-sell-list 안에 생성
 */
function initShopItems() {
  const today = `${gameState.currentDate.year}-${String(gameState.currentDate.month).padStart(2, '0')}-${String(gameState.currentDate.day).padStart(2, '0')}`;
  let todaysItems = [];
  const lastShopDate = localStorage.getItem('lastShopDate') || '';

  if (today !== lastShopDate) {
    // 새로운 날이면 가격 갱신 후 오늘의 아이템 결정
    refreshShopItemsForNewDay();
    todaysItems = storeItemDB.filter(item => Math.random() < item.appearanceChance);
    localStorage.setItem('todayShopItems', JSON.stringify(todaysItems));
    localStorage.setItem('lastShopDate', today);
    console.log("새로운 날, 오늘의 상점 아이템:", todaysItems);
  } else {
    // 같은 날이면 저장된 오늘의 아이템을 불러옵니다.
    const storedItems = localStorage.getItem('todayShopItems');
    if (storedItems) {
      try {
        todaysItems = JSON.parse(storedItems);
      } catch (error) {
        console.error("todayShopItems 파싱 에러:", error);
        todaysItems = [];
      }
    }
  }

  const container = document.querySelector('.shop-item-sell-list');
  if (!container) return;
  container.innerHTML = '';

  if (todaysItems.length === 0) {
    container.textContent = "재고가 없습니다.";
    return;
  }

  todaysItems.forEach(itemData => {
    const itemBox = document.createElement('div');
    itemBox.classList.add('item-sell-box');

    const shopItem = document.createElement('div');
    shopItem.classList.add('shop-item', itemClassMapping[itemData.item] || '');

    const shopItemTxt = document.createElement('div');
    shopItemTxt.classList.add('shop-item-txt');

    const nameElem = document.createElement('div');
    nameElem.classList.add('item-name');
    nameElem.textContent = itemData.item;

    const descElem = document.createElement('div');
    descElem.classList.add('item-description');
    descElem.textContent = itemData.description;

    const itemRateBox = document.createElement('div');
    itemRateBox.classList.add('item-rate-box');

    const priceElem = document.createElement('div');
    priceElem.classList.add('item-price');
    priceElem.textContent = `${itemData.basePrice.toLocaleString()}원`;

    const rateElem = document.createElement('div');
    rateElem.classList.add('item-rate-txt', itemData.isUp ? 'up' : 'down');
    rateElem.textContent = `${itemData.isUp ? '▲' : '▼'}${Math.abs(itemData.dailyChangePercent)}%`;

    itemRateBox.append(priceElem, rateElem);
    shopItemTxt.append(nameElem, descElem, itemRateBox);

    const buyBtn = document.createElement('button');
    buyBtn.classList.add('item-buy-btn');
    buyBtn.textContent = "구매";
    buyBtn.addEventListener('click', () => {
      selectedItemForPurchase = itemData;
      showBuyPopup();
    });

    itemBox.append(shopItem, shopItemTxt, buyBtn);
    container.appendChild(itemBox);
  });
}

/**
 * 구매 팝업(.input-buy) 관련 초기화
 */

function canAddItemToInventory(itemName, quantity) {
  // 현재 인벤토리의 아이템별 총 개수를 계산
  const counts = {};
  gameState.player.inventory.forEach(item => {
    counts[item] = (counts[item] || 0) + 1;
  });
  // 구매할 아이템 추가
  counts[itemName] = (counts[itemName] || 0) + quantity;

  // 각 아이템은 99개씩 슬롯에 들어가므로, 필요한 슬롯 수 계산
  let totalSlots = 0;
  for (const key in counts) {
    totalSlots += Math.ceil(counts[key] / 99);
  }

  // 총 슬롯 수가 28개를 넘으면 false 반환
  return totalSlots <= 28;
}


function initBuyPopup() {
  const inputBuy = document.querySelector('.input-buy');
  const inputField = document.querySelector('.input-buy-field');
  const buyConfirmBtn = document.querySelector('.buy-input-btn');
  const buyCloseBtn = document.querySelector('.buy-input-close-btn');

  if (!inputBuy || !inputField || !buyConfirmBtn || !buyCloseBtn) return;

  // 구매 확정 버튼
  buyConfirmBtn.addEventListener('click', () => {
    const quantity = parseInt(inputField.value, 10);
    if (isNaN(quantity) || quantity <= 0) {
      alert("구매할 개수를 올바르게 입력하세요.");
      return;
    }

    // 총 구매 금액 계산
    const totalCost = selectedItemForPurchase.basePrice * quantity;

    // 소지금 확인
    if (gameState.player.money < totalCost) {
      alert("소지금이 부족합니다!");
      return;
    }

    // 인벤토리 슬롯 체크: 구매 후 슬롯이 28개를 초과하면 구매 불가
    if (!canAddItemToInventory(selectedItemForPurchase.item, quantity)) {
      alert("인벤토리 슬롯이 부족하여 구매할 수 없습니다!");
      return;
    }

    // 구매 진행: 돈 차감 및 인벤토리에 아이템 추가
    gameState.player.money -= totalCost;
    for (let i = 0; i < quantity; i++) {
      gameState.player.inventory.push(selectedItemForPurchase.item);
    }

    alert(`${selectedItemForPurchase.item}을(를) ${quantity}개 구매했습니다!`);

    // UI 및 상태 업데이트
    updateInventory();
    updateShopInventory();
    updateUserStatus();
    saveGameState();

    hideBuyPopup();
  });


  // 닫기 버튼
  buyCloseBtn.addEventListener('click', () => {
    hideBuyPopup();
  });
}

/**
 * 구매 팝업 열기
 */
function showBuyPopup() {
  const inputBuy = document.querySelector('.input-buy');
  const inputField = document.querySelector('.input-buy-field');
  if (!inputBuy || !inputField) return;

  inputField.value = "1";        // 기본값 1
  inputBuy.style.display = 'flex';
}

/**
 * 구매 팝업 닫기
 */
function hideBuyPopup() {
  const inputBuy = document.querySelector('.input-buy');
  if (!inputBuy) return;

  inputBuy.style.display = 'none';
  // 구매 아이템 초기화
  selectedItemForPurchase = null;
}

//shop tap 버튼 기능
document.addEventListener('DOMContentLoaded', () => {
  const shopSellBtn = document.querySelector('.shop-sell-btn');
  const shopItemBtns = document.querySelectorAll('.shop-item-btn');
  const shopSkillBtn = document.querySelector('.shop-skill-btn');

  // helper: 모든 관련 버튼에서 "on" 클래스를 제거합니다.
  function removeActiveClass() {
    if (shopSellBtn) shopSellBtn.classList.remove('on');
    shopItemBtns.forEach(btn => btn.classList.remove('on'));
    if (shopSkillBtn) shopSkillBtn.classList.remove('on');
  }

  // .shop-sell-btn 클릭 시
  if (shopSellBtn) {
    shopSellBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // 다른 flex 영역 숨기기
      const hideEls = document.querySelectorAll('.kingdom-item-card, .kingdom-skill-shop-card');
      hideEls.forEach(el => el.style.display = 'none');
      // .shop-inventory 영역 보이기
      const inventory = document.querySelector('.shop-inventory');
      if (inventory) {
        inventory.style.display = 'flex';
      }
      // 버튼 활성화 표시 ("on" 클래스 추가)
      removeActiveClass();
      shopSellBtn.classList.add('on');
    });
  }

  // .shop-item-btn 클릭 시
  shopItemBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // 다른 flex 영역 숨기기
      const hideEls = document.querySelectorAll('.shop-inventory, .kingdom-skill-shop-card');
      hideEls.forEach(el => el.style.display = 'none');
      // .kingdom-item-card 영역 보이기
      const itemCard = document.querySelector('.kingdom-item-card');
      if (itemCard) {
        itemCard.style.display = 'flex';
      }
      // 해당 버튼 활성화 ("on" 클래스 추가)
      removeActiveClass();
      btn.classList.add('on');
    });
  });

  // .shop-skill-btn 클릭 시
  if (shopSkillBtn) {
    shopSkillBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // 다른 flex 영역 숨기기
      const hideEls = document.querySelectorAll('.shop-inventory, .kingdom-item-card');
      hideEls.forEach(el => el.style.display = 'none');
      // .kingdom-skill-shop-card 영역 보이기
      const skillCard = document.querySelector('.kingdom-skill-shop-card');
      if (skillCard) {
        skillCard.style.display = 'flex';
      }
      // 버튼 활성화 ("on" 클래스 추가)
      removeActiveClass();
      shopSkillBtn.classList.add('on');
    });
  }

  // 초기 상태: .shop-inventory은 flex, 나머지 영역은 숨김, 그리고 .shop-sell-btn에 "on" 클래스 추가
  const inventory = document.querySelector('.shop-inventory');
  if (inventory) {
    inventory.style.display = 'flex';
  }
  const hideEls = document.querySelectorAll('.kingdom-item-card, .kingdom-skill-shop-card');
  hideEls.forEach(el => el.style.display = 'none');
  removeActiveClass();
  if (shopSellBtn) {
    shopSellBtn.classList.add('on');
  }
});



// 상점 인벤토리 업데이트 함수
function updateShopInventory() {
  // .popup.shop 내의 모든 인벤토리 슬롯(28칸이라고 가정)
  const shopInvBoxes = document.querySelectorAll('.popup.shop .inventory-box');
  if (!shopInvBoxes.length) return;

  // 플레이어 인벤토리를 아이템별로 그룹화: { "아이템명": 개수, ... }
  const inventoryCounts = {};
  gameState.player.inventory.forEach(item => {
    inventoryCounts[item] = (inventoryCounts[item] || 0) + 1;
  });

  // 각 아이템의 총 개수를 99개씩 분리하여 slots 배열 생성
  let slots = [];
  for (const item in inventoryCounts) {
    let count = inventoryCounts[item];
    while (count > 0) {
      const slotCount = count >= 99 ? 99 : count;
      slots.push({ item: item, count: slotCount });
      count -= slotCount;
    }
  }

  // 슬롯이 인벤토리 박스 수(예: 28)보다 많으면 초과 슬롯은 무시
  if (slots.length > shopInvBoxes.length) {
    slots = slots.slice(0, shopInvBoxes.length);
  }

  // 각 상점 인벤토리 슬롯 업데이트
  shopInvBoxes.forEach((box, index) => {
    // 기존 클래스 초기화 (기본 클래스 'inventory-box' 유지)
    box.className = 'inventory-box';
    if (index < slots.length) {
      const slot = slots[index];
      // 슬롯에 아이템 개수를 표시
      box.textContent = slot.count.toString();
      // data-item 속성에 아이템 이름 저장 (예: "오팔")
      box.dataset.item = slot.item;
      // 전역 itemClassMapping을 사용하여 CSS 클래스 추가 (예: .opal)
      const className = itemClassMapping[slot.item] || slot.item.replace(/\s+/g, '-').toLowerCase();
      box.classList.add(className);
    } else {
      box.textContent = '';
      delete box.dataset.item;
    }
  });

  // 상점 인벤토리 클릭 이벤트 등록 (감정 등)
  addShopItemClickListeners();
}





// 수정된 감정 함수 (아이템 클릭 시)
function addShopItemClickListeners() {
  // .popup.shop 내의 모든 inventory-box 요소 선택
  const shopInvBoxes = document.querySelectorAll('.popup.shop .inventory-box');
  shopInvBoxes.forEach(box => {
    box.addEventListener('click', function (e) {
      e.preventDefault();

      // 다른 박스 클릭 시 기존 선택 표시 제거
      shopInvBoxes.forEach(b => {
        b.style.border = ""; // 초기 상태로 복구
      });
      this.style.border = "2px solid white";

      // data-item 속성에서 아이템 이름 가져오기
      const itemName = this.dataset.item;
      if (!itemName) return;

      // 플레이어 인벤토리에서 해당 아이템 개수 계산
      const itemCount = gameState.player.inventory.filter(item => item === itemName).length;

      const connoisseur = document.querySelector('.popup.shop .connoisseur');
      if (!connoisseur) return;

      // 우선, 몬스터 전리품 정보에서 가격 조회, 없으면 상점 DB에서 조회
      let price = 0;
      const lootInfo = getLootPriceInfo(itemName);
      if (lootInfo) {
        price = getDailyRandomPrice(lootInfo.basePrice, lootInfo.variance);
      } else {
        const storeInfo = getStoreItemInfo(itemName);
        if (storeInfo) {
          price = storeInfo.basePrice;
        }
      }

      // 총가격: 단가 * 개수
      const totalPrice = price * itemCount;

      // toLocaleString()을 사용해 가독성 있게 숫자 표시
      connoisseur.textContent = `감정: ${itemName}, 가격: ${price.toLocaleString()}원, 총가격: ${totalPrice.toLocaleString()}원`;
    });
  });
}



function sellAllItems() {
  let totalSale = 0;
  // 플레이어 인벤토리 순회 (각 아이템은 문자열로 저장)
  gameState.player.inventory.forEach(item => {
    let price = 0;
    // 먼저 몬스터 전리품 정보에서 가격 정보를 찾습니다.
    const lootInfo = getLootPriceInfo(item);
    if (lootInfo) {
      price = getDailyRandomPrice(lootInfo.basePrice, lootInfo.variance);
    } else {
      // 없다면, 상점 아이템 DB에서 정보를 찾습니다.
      const storeInfo = getStoreItemInfo(item);
      if (storeInfo) {
        // 상점 시세(즉, 업데이트된 basePrice)를 그대로 사용
        price = storeInfo.basePrice;
      }
    }
    totalSale += price;
  });

  // 플레이어의 돈에 판매 금액을 추가
  gameState.player.money += totalSale;

  // 판매 후 인벤토리 비우기 (혹은 판매한 아이템만 제거)
  gameState.player.inventory = [];

  // UI 업데이트: 인벤토리, 상점 인벤토리, 유저 상태 등
  updateInventory();
  updateShopInventory();
  updateUserStatus();

  // 결과 메시지 표시
  const connoisseur = document.querySelector('.popup.shop .connoisseur');
  if (connoisseur) {
    connoisseur.textContent = `모든 아이템을 팔아 ${totalSale}원을 획득했습니다.`;
  }

  // 게임 상태 저장
  saveGameState();

  // 즉시 소지금 UI 업데이트
  const moneyElem = document.querySelector('.money');
  if (moneyElem) {
    moneyElem.textContent = gameState.player.money.toLocaleString('ko-KR');
  }
}

// .money 요소를 바로 찾아 업데이트 (즉시 갱신)
const moneyElem = document.querySelector('.money');
if (moneyElem) {
  moneyElem.textContent = gameState.player.money;
}

// .sell-all-btn 버튼에 이벤트 등록
document.addEventListener('DOMContentLoaded', () => {
  const sellAllBtn = document.querySelector('.sell-all-btn');
  const checkAllSellContainer = document.querySelector('.check-all-sell');
  const checkBtn = document.querySelector('.check-btn');
  const cancelBtn = document.querySelector('.cancle-btn');

  if (sellAllBtn && checkAllSellContainer && checkBtn && cancelBtn) {
    // .sell-all-btn 클릭 시, 확인 UI 보여주기
    sellAllBtn.addEventListener('click', (e) => {
      e.preventDefault();
      checkAllSellContainer.style.display = 'flex';
    });

    // .check-btn 클릭 시, 실제 판매 실행 후 확인 UI 숨기기
    checkBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sellAllItems();
      checkAllSellContainer.style.display = 'none';
    });

    // .cancel-btn 클릭 시, 확인 UI 숨기기
    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      checkAllSellContainer.style.display = 'none';
    });
  }
});

let selectedSellItem = null; // 현재 판매할 아이템을 저장할 전역 변수


function sellSelectedItem(quantity) {
  if (!selectedSellItem) {
    alert("판매할 아이템을 먼저 선택하세요!");
    return;
  }

  // 현재 인벤토리에서 선택된 아이템의 수량 계산
  let currentCount = gameState.player.inventory.filter(item => item === selectedSellItem).length;
  if (quantity > currentCount) {
    alert("판매할 수 있는 수량이 부족합니다!");
    return;
  }

  // 판매 가격 산출: 먼저 전리품 정보(loot)를 확인하고, 없으면 상점 아이템 DB에서 조회
  let price = 0;
  const lootInfo = getLootPriceInfo(selectedSellItem);
  if (lootInfo) {
    price = getDailyRandomPrice(lootInfo.basePrice, lootInfo.variance);
  } else {
    const storeInfo = getStoreItemInfo(selectedSellItem);
    if (storeInfo) {
      price = storeInfo.basePrice;
    }
  }

  const totalSale = price * quantity;

  // 인벤토리에서 판매한 개수만큼 제거
  let soldCount = 0;
  gameState.player.inventory = gameState.player.inventory.filter(item => {
    if (item === selectedSellItem && soldCount < quantity) {
      soldCount++;
      return false; // 해당 항목 제거
    }
    return true;
  });

  // 판매 금액을 유저 소지금에 추가
  gameState.player.money += totalSale;

  // UI 업데이트 및 게임 상태 저장
  updateInventory();
  updateShopInventory();
  updateUserStatus();
  saveGameState();

  // connoisseur 업데이트: 판매 완료 후 결과 메시지 표시
  const connoisseur = document.querySelector('.popup.shop .connoisseur');
  if (connoisseur) {
    connoisseur.textContent = `${selectedSellItem} ${quantity}개 판매 완료. 총 ${totalSale.toLocaleString()}원을 획득했습니다.`;
  }

  alert(`${selectedSellItem}을(를) ${quantity}개 팔아 ${totalSale.toLocaleString()}원을 획득했습니다.`);
}


function setupSellSelectFunctionality() {
  // 1. 인벤토리 아이템 클릭 시 판매할 아이템 선택
  const shopInvBoxes = document.querySelectorAll('.popup.shop .inventory-box');
  shopInvBoxes.forEach(box => {
    box.addEventListener('click', function (e) {
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
    sellSelectBtn.addEventListener('click', function (e) {
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

  // 3. .sell-input-btn 클릭 시 입력된 개수만큼 판매 처리 (sellSelectedItem 함수 호출)
  const sellInputBtn = document.querySelector('.sell-input-btn');
  if (sellInputBtn) {
    sellInputBtn.addEventListener('click', function (e) {
      e.preventDefault();
      const inputField = document.querySelector('.input-sell-field');
      if (!inputField) return;
      const sellCount = parseInt(inputField.value, 10);
      if (isNaN(sellCount) || sellCount <= 0) {
        alert("판매할 개수를 올바르게 입력하세요!");
        return;
      }

      // 입력된 개수를 인자로 전달하여 판매 처리
      sellSelectedItem(sellCount);

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
    sellInputCloseBtn.addEventListener('click', function (e) {
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


//차트
document.querySelector(".item-chart-btn").addEventListener("click", () => {
  const chartContainer = document.querySelector(".chart-item");
  if (chartContainer) {
    chartContainer.style.display = "flex";
    startPriceChartSlideshow(storeItemDB); // 슬라이드 시작
  }
});

document.querySelector(".chart-close-btn").addEventListener("click", () => {
  const chartContainer = document.querySelector(".chart-item");
  if (chartContainer) {
    chartContainer.style.display = "none";
    if (chartInterval) clearInterval(chartInterval); // 슬라이드 멈춤
  }
});


//차트
let currentChartIndex = 0;
let chartInterval = null;

function drawPriceChart(item) {
  const canvas = document.getElementById("priceChartCanvas");
  if (!canvas || !item.priceHistory || item.priceHistory.length < 2) return;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const prices = item.priceHistory;
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const range = maxPrice - minPrice || 1;

  // ✅ padding 정의
  const paddingTop = 40;
  const paddingSide = 20;
  const paddingBottom = 20;

  const stepX = (canvas.width - paddingSide * 2) / (prices.length - 1);
  const getY = (price) =>
    canvas.height - paddingBottom - ((price - minPrice) / range) * (canvas.height - paddingTop - paddingBottom);

  // 스타일
  ctx.strokeStyle = "#00ffcc";
  ctx.lineWidth = 2;
  ctx.font = "12px sans-serif";
  ctx.fillStyle = "#fff";

  // 선
  ctx.beginPath();
  prices.forEach((price, i) => {
    const x = paddingSide + i * stepX;
    const y = getY(price);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // 점 + 텍스트
  prices.forEach((price, i) => {
    const x = paddingSide + i * stepX;
    const y = getY(price);
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText(price.toLocaleString(), x - 10, y - 8);
  });

  // 타이틀
  ctx.fillStyle = "#f1d255";
  ctx.fillText(`[${item.item}] 최근 5일 가격`, 10, 15);
}


function startPriceChartSlideshow(items, interval = 3000) {
  if (!items || items.length === 0) return;

  // 초기 상태
  currentChartIndex = 0;
  drawPriceChart(items[currentChartIndex]);

  // 이전 슬라이드가 있으면 멈춤
  if (chartInterval) clearInterval(chartInterval);

  chartInterval = setInterval(() => {
    currentChartIndex = (currentChartIndex + 1) % items.length;
    drawPriceChart(items[currentChartIndex]);
  }, interval);
}


//인벤토리
// [추가] 인벤토리 갱신 함수: .inventory-box 내부에 .leaf 요소를 찾아 잎파리 개수를 표시
// [수정/추가된 코드]
// [수정된 코드] updateInventory 함수 수정
function updateInventory() {
  // 28개 슬롯 요소를 선택 (HTML에 28개의 .inventory-box 요소가 있어야 함)
  const invBoxes = document.querySelectorAll('.inventory-box');

  // 플레이어 인벤토리를 아이템별로 그룹화: { "아이템명": 개수, ... }
  const inventoryCounts = {};
  gameState.player.inventory.forEach(item => {
    inventoryCounts[item] = (inventoryCounts[item] || 0) + 1;
  });

  // 각 아이템의 총 개수를 99개씩 분리하여 slots 배열 생성
  let slots = [];
  for (const item in inventoryCounts) {
    let count = inventoryCounts[item];
    while (count > 0) {
      // 한 슬롯에 최대 99개를 담음
      let slotCount = count >= 99 ? 99 : count;
      slots.push({ item: item, count: slotCount });
      count -= slotCount;
    }
  }

  // 슬롯이 28개보다 많으면 초과 슬롯은 무시 (혹은 별도 처리 가능)
  if (slots.length > invBoxes.length) {
    slots = slots.slice(0, invBoxes.length);
  }

  // 각 인벤토리 슬롯을 업데이트
  invBoxes.forEach((box, index) => {
    // 기존 클래스 초기화 (기본 클래스 유지)
    box.className = 'inventory-box';
    if (index < slots.length) {
      const slot = slots[index];
      // 슬롯에 아이템 개수를 표시 (예: "99" 또는 "1")
      box.textContent = slot.count.toString();
      // data-item에 아이템 이름 저장 (예: "오팔")
      box.dataset.item = slot.item;
      // itemClassMapping을 통해 CSS 클래스 추가 (예: .opal)
      const className = itemClassMapping[slot.item] || slot.item.replace(/\s+/g, '-').toLowerCase();
      box.classList.add(className);
    } else {
      box.textContent = '';
      delete box.dataset.item;
    }
  });
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

  // 지난 '일수(분)' 차이를 계산해서 자원 변화 적용
  const diffDays = currentMinutes - lastMinutes;
  if (diffDays > 0) {
    for (let i = 0; i < diffDays; i++) {
      dailyResourceChange();
    }
    lastMinutes = currentMinutes;
    localStorage.setItem("lastMinutes", lastMinutes);
  }

  let baseDate = localStorage.getItem("baseDate");
  if (!baseDate) {
    baseDate = { year: 24, month: 4, day: 12 };
    localStorage.setItem("baseDate", JSON.stringify(baseDate));
  } else {
    baseDate = JSON.parse(baseDate);
  }

  let newDay = baseDate.day + currentMinutes;
  let newMonth = baseDate.month;
  let newYear = baseDate.year;
  while (newDay > 30) {
    newDay -= 30;
    newMonth++;
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
  }

  const currentDateString = `${newYear}-${String(newMonth).padStart(2, '0')}-${String(newDay).padStart(2, '0')}`;
  // 날짜가 바뀌었으면, dateTextDisplayed를 false로 재설정
  if (currentDateString !== lastDateStr) {
    dateTextDisplayed = false;
    lastDateStr = currentDateString;
    localStorage.setItem("lastDateStr", lastDateStr);

    refreshSkillShopForNewDay();
  }

  // 날짜가 바뀌었거나 페이지가 처음 로드되었을 때, 상점 목록을 갱신하여 즉시 UI에 반영
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

  const dateInfoElem = document.querySelector('.date-info');
  if (dateInfoElem) {
    dateInfoElem.textContent = `함락 ${newYear}년 ${String(newMonth).padStart(2, '0')}월 ${String(newDay).padStart(2, '0')}일`;
  }

  refreshShopItemsForNewDay();
  initShopItems();
  updateShopInventory();
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

