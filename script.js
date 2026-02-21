// script.js - полная логика игры с сохранением

(function() {
    // --- СОСТОЯНИЕ ИГРЫ ---
    let crystals = 0;
    let clickPower = 1;
    let totalClicks = 0;
    
    let currentPowerUpgradeCost = 10;
    let currentMultiUpgradeCost = 50;

    const POWER_COST_MULTIPLIER = 1.8;
    const MULTI_COST_MULTIPLIER = 2.2;
    const SAVE_KEY = 'epic_clicker_save';

    // DOM элементы
    const scoreDisplay = document.getElementById('scoreDisplay');
    const perClickDisplay = document.getElementById('perClickDisplay');
    const levelDisplay = document.getElementById('levelDisplay');
    const totalClicksDisplay = document.getElementById('totalClicksDisplay');
    const clickValueBadge = document.getElementById('clickValueBadge');
    const saveIndicator = document.getElementById('saveIndicator');

    const clickButton = document.getElementById('clickButton');
    const upgradePowerBtn = document.getElementById('upgradePowerBtn');
    const upgradeMultiBtn = document.getElementById('upgradeMultiBtn');
    const saveBtn = document.getElementById('saveBtn');
    const resetBtn = document.getElementById('resetBtn');

    const powerCostDisplay = document.getElementById('powerCostDisplay');
    const multiCostDisplay = document.getElementById('multiCostDisplay');
    const powerCostNote = document.getElementById('powerCostNote');
    const multiCostNote = document.getElementById('multiCostNote');

    // --- СОХРАНЕНИЕ И ЗАГРУЗКА ---
    function saveGame() {
        const gameState = {
            crystals: crystals,
            clickPower: clickPower,
            totalClicks: totalClicks,
            powerUpgradeCost: currentPowerUpgradeCost,
            multiUpgradeCost: currentMultiUpgradeCost,
            lastSaved: new Date().toISOString()
        };

        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
            
            saveIndicator.textContent = '💾 сохранено';
            saveIndicator.style.color = '#a5ffa5';
            saveIndicator.style.borderColor = '#a5ffa5';
            
            setTimeout(() => {
                saveIndicator.textContent = '💾 автосохранение';
                saveIndicator.style.color = '';
                saveIndicator.style.borderColor = '';
            }, 1500);
            
            return true;
        } catch (e) {
            console.warn('Не удалось сохранить:', e);
            return false;
        }
    }

    function loadGame() {
        try {
            const saved = localStorage.getItem(SAVE_KEY);
            if (!saved) return false;

            const state = JSON.parse(saved);
            
            crystals = state.crystals ?? 0;
            clickPower = state.clickPower ?? 1;
            totalClicks = state.totalClicks ?? 0;
            currentPowerUpgradeCost = state.powerUpgradeCost ?? 10;
            currentMultiUpgradeCost = state.multiUpgradeCost ?? 50;

            saveIndicator.textContent = '✅ загружено';
            saveIndicator.style.color = '#88ff88';
            
            setTimeout(() => {
                saveIndicator.textContent = '💾 автосохранение';
                saveIndicator.style.color = '';
            }, 1500);
            
            return true;
        } catch (e) {
            console.warn('Ошибка загрузки:', e);
            return false;
        }
    }

    function autoSave() {
        saveGame();
    }

    // --- ФОРМАТИРОВАНИЕ ---
    function formatNumber(num) {
        return Number.isInteger(num) ? num : num.toFixed(2);
    }

    // --- ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ---
    function refreshUI() {
        scoreDisplay.textContent = formatNumber(crystals);
        perClickDisplay.textContent = formatNumber(clickPower);
        clickValueBadge.textContent = `+${formatNumber(clickPower)}`;

        const level = 1 + Math.floor(totalClicks / 8);
        levelDisplay.textContent = level;
        totalClicksDisplay.textContent = totalClicks;

        powerCostDisplay.textContent = Math.ceil(currentPowerUpgradeCost);
        multiCostDisplay.textContent = Math.ceil(currentMultiUpgradeCost);

        powerCostNote.innerHTML = `⚡ цена ${Math.ceil(currentPowerUpgradeCost)}`;
        multiCostNote.innerHTML = `💰 цена ${Math.ceil(currentMultiUpgradeCost)}`;

        upgradePowerBtn.disabled = (crystals < currentPowerUpgradeCost);
        upgradeMultiBtn.disabled = (crystals < currentMultiUpgradeCost);

        upgradePowerBtn.classList.toggle('disabled', crystals < currentPowerUpgradeCost);
        upgradeMultiBtn.classList.toggle('disabled', crystals < currentMultiUpgradeCost);
    }

    // --- ВСПЛЫВАЮЩИЙ ТЕКСТ ---
    function spawnFloatingText(value, x, y) {
        const floatEl = document.createElement('div');
        floatEl.className = 'floating-number';
        floatEl.textContent = `+${formatNumber(value)}`;
        floatEl.style.left = x + 'px';
        floatEl.style.top = y + 'px';
        document.body.appendChild(floatEl);
        setTimeout(() => floatEl.remove(), 900);
    }

    // --- КЛИК ---
    function handleClick(event) {
        crystals += clickPower;
        totalClicks += 1;

        let clientX, clientY;
        if (event && typeof event.clientX === 'number') {
            clientX = event.clientX;
            clientY = event.clientY;
        } else {
            const rect = clickButton.getBoundingClientRect();
            clientX = rect.left + rect.width / 2;
            clientY = rect.top + rect.height / 2;
        }
        spawnFloatingText(clickPower, clientX, clientY - 20);

        clickButton.style.transform = 'scale(0.88) translateY(8px)';
        setTimeout(() => {
            clickButton.style.transform = '';
        }, 100);

        refreshUI();
        autoSave();
    }

    // --- УЛУЧШЕНИЯ ---
    function upgradePower() {
        if (crystals < currentPowerUpgradeCost) return;

        crystals -= currentPowerUpgradeCost;
        clickPower += 1;
        currentPowerUpgradeCost = Math.ceil(currentPowerUpgradeCost * POWER_COST_MULTIPLIER);

        showUpgradeEffect('⚡ сила +1');
        refreshUI();
        autoSave();
    }

    function upgradeMultiplier() {
        if (crystals < currentMultiUpgradeCost) return;

        crystals -= currentMultiUpgradeCost;
        clickPower *= 2;
        currentMultiUpgradeCost = Math.ceil(currentMultiUpgradeCost * MULTI_COST_MULTIPLIER);

        showUpgradeEffect('✨ УДВОЕНИЕ ✨');
        refreshUI();
        autoSave();
    }

    function showUpgradeEffect(text) {
        upgradePowerBtn.style.backgroundColor = '#2d6a4f';
        upgradeMultiBtn.style.backgroundColor = '#5f2d6a';
        setTimeout(() => {
            upgradePowerBtn.style.backgroundColor = '';
            upgradeMultiBtn.style.backgroundColor = '';
        }, 150);

        const rect = clickButton.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top - 30;
        const msg = document.createElement('div');
        msg.className = 'floating-number';
        msg.textContent = text;
        msg.style.left = x + 'px';
        msg.style.top = y + 'px';
        msg.style.fontSize = '2rem';
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 700);
    }

    // --- СБРОС ---
    function resetGame() {
        if (confirm('Вернуться в начало? Весь прогресс будет удалён.')) {
            crystals = 0;
            clickPower = 1;
            totalClicks = 0;
            currentPowerUpgradeCost = 10;
            currentMultiUpgradeCost = 50;

            refreshUI();
            autoSave();

            clickButton.style.transform = 'scale(0.7) rotate(2deg)';
            setTimeout(() => clickButton.style.transform = '', 200);
            
            saveIndicator.textContent = '♻️ сброшено';
            setTimeout(() => {
                saveIndicator.textContent = '💾 автосохранение';
            }, 1500);
        }
    }

    // --- ИНИЦИАЛИЗАЦИЯ ---
    loadGame();
    refreshUI();

    // --- СОБЫТИЯ ---
    clickButton.addEventListener('click', handleClick);
    upgradePowerBtn.addEventListener('click', upgradePower);
    upgradeMultiBtn.addEventListener('click', upgradeMultiplier);
    saveBtn.addEventListener('click', () => {
        saveGame();
        saveIndicator.textContent = '💾 сохранено!';
        setTimeout(() => {
            saveIndicator.textContent = '💾 автосохранение';
        }, 1500);
    });
    resetBtn.addEventListener('click', resetGame);

    // Пробел
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !e.repeat) {
            e.preventDefault();
            const rect = clickButton.getBoundingClientRect();
            const fakeEvent = {
                clientX: rect.left + rect.width / 2,
                clientY: rect.top + rect.height / 2
            };
            handleClick(fakeEvent);
        }
    });

    // Сохранение перед закрытием
    window.addEventListener('beforeunload', () => {
        saveGame();
    });

    // Периодическое автосохранение
    setInterval(() => {
        saveGame();
    }, 30000);
})();