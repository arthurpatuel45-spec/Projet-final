const state = {
  score: 0,
  clicksPerSecond: 0,
  clicksPerClick: 1,
  activeSkin: 'classic',
  autoLevel: 0,
  clickLevel: 0,
  unlockedSkins: new Set(['classic']),
  questGoal: 10,
  questReward: 25,
  questText: 'Quête : clique 10 brocolis'
};

const scoreCount = document.getElementById('score-count');
const cpsStat = document.getElementById('cps-stat');
const cpcStat = document.getElementById('cpc-stat');
const broccoliButton = document.getElementById('broccoli-button');
const shopToggle = document.getElementById('shop-toggle');
const shopPanel = document.getElementById('shop-panel');
const floatingTextLayer = document.getElementById('floating-text-layer');
const questText = document.getElementById('quest-text');
const skinButtons = document.querySelectorAll('.skin-btn');
const upgradeButtons = document.querySelectorAll('.upgrade-btn');

function getUpgradeCost(type) {
  const baseCost = type === 'auto' ? 15 : 20;
  const level = type === 'auto' ? state.autoLevel : state.clickLevel;
  return Math.floor(baseCost * Math.pow(1.15, level));
}

function formatNumber(value) {
  return Number(value).toLocaleString('fr-FR');
}

function updateQuest() {
  const done = state.score >= state.questGoal;
  if (done) {
    state.score += state.questReward;
    state.questGoal += 15;
    state.questText = `Quête complétée ! Prochaine cible : ${state.questGoal} brocolis`;
  } else {
    state.questText = `Quête : clique ${state.questGoal} brocolis`;
  }

  questText.textContent = state.questText;
}

function updateStats() {
  scoreCount.textContent = formatNumber(state.score);
  cpcStat.textContent = state.clicksPerClick;
  cpsStat.textContent = state.clicksPerSecond;

  skinButtons.forEach((button) => {
    const isActive = button.dataset.skin === state.activeSkin;
    const isUnlocked = state.unlockedSkins.has(button.dataset.skin);
    button.classList.toggle('is-active', isActive);
    button.disabled = !isUnlocked && state.score < Number(button.dataset.price);
  });

  upgradeButtons.forEach((button) => {
    const cost = getUpgradeCost(button.dataset.upgrade);
    const costElement = button.querySelector('.upgrade-cost');
    costElement.textContent = formatNumber(cost);
    button.disabled = state.score < cost;
  });

  updateQuest();
}

function createFloatingText(x, y, value) {
  const text = document.createElement('span');
  text.className = 'floating-text';
  text.textContent = `+${value}`;
  text.style.left = `${x}px`;
  text.style.top = `${y}px`;
  floatingTextLayer.appendChild(text);

  setTimeout(() => {
    text.remove();
  }, 700);
}

broccoliButton.addEventListener('click', (event) => {
  state.score += state.clicksPerClick;
  createFloatingText(event.clientX, event.clientY, state.clicksPerClick);
  updateStats();
});

skinButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const skin = button.dataset.skin;
    if (!state.unlockedSkins.has(skin)) {
      const price = Number(button.dataset.price);
      if (state.score < price) return;
      state.score -= price;
      state.unlockedSkins.add(skin);
    }

    state.activeSkin = skin;
    broccoliButton.dataset.skin = skin;
    updateStats();
  });
});

upgradeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const type = button.dataset.upgrade;
    const cost = getUpgradeCost(type);

    if (state.score < cost) return;

    state.score -= cost;

    if (type === 'auto') {
      state.autoLevel += 1;
      state.clicksPerSecond += 1;
    } else {
      state.clickLevel += 1;
      state.clicksPerClick += 1;
    }

    updateStats();
  });
});

shopToggle.addEventListener('click', () => {
  const hidden = shopPanel.classList.toggle('hidden');
  shopToggle.setAttribute('aria-expanded', String(!hidden));
});

setInterval(() => {
  if (state.clicksPerSecond > 0) {
    state.score += state.clicksPerSecond;
    updateStats();
  }
}, 1000);

broccoliButton.dataset.skin = state.activeSkin;
updateStats();
