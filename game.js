// game.js - Rhythm Engine & Mechanics for Peach Sensory Symphony (with 1v1 Pass & Play Duel & Spicy Wagers)

document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const stageTitleText = document.getElementById('stage-title-text');
  const bpmIndicator = document.getElementById('bpm-indicator');
  const btnAudioToggle = document.getElementById('btn-audio-toggle');
  const turnPlayerName = document.getElementById('turn-player-name');
  const turnPillIndicator = document.getElementById('turn-pill-indicator');
  const feverBanner = document.getElementById('fever-banner');

  const valScore = document.getElementById('val-score');
  const valCombo = document.getElementById('val-combo');
  const statComboBox = document.getElementById('stat-combo-box');
  const valAccuracy = document.getElementById('val-accuracy');
  const valMultiplier = document.getElementById('val-multiplier');

  const barPleasure = document.getElementById('bar-pleasure');
  const labelKpiVal = document.getElementById('label-kpi-val');
  const barBreath = document.getElementById('bar-breath');
  const labelBreathVal = document.getElementById('label-breath-val');

  const rhythmStage = document.getElementById('rhythm-stage');
  const peachWrap = document.getElementById('peach-interactive-wrap');
  const peachLeft = document.getElementById('peach-left');
  const peachRight = document.getElementById('peach-right');
  const pleasureSpotGroup = document.getElementById('pleasure-spot-group');
  const pleasureSpotCore = document.getElementById('pleasure-spot-core');
  const swirlGuideRing = document.getElementById('swirl-guide-ring');
  const rpmBadge = document.getElementById('rpm-badge');
  const ratingContainer = document.getElementById('rating-container');
  const nodesLayer = document.getElementById('rhythm-nodes-layer');

  const instructionTitle = document.getElementById('instruction-title');
  const instructionSub = document.getElementById('instruction-sub');
  const tabFinger = document.getElementById('tab-finger');
  const tabTongue = document.getElementById('tab-tongue');
  const btnBreathCatch = document.getElementById('btn-breath-catch');
  const btnNextStage = document.getElementById('btn-next-stage');
  const btnNextStageText = document.getElementById('btn-next-stage-text');

  // Character Toggle & Cucumber Elements
  const btnCharToggle = document.getElementById('btn-char-toggle');
  const charTabBtns = document.querySelectorAll('.char-tab-btn');
  const cucumberLeft = document.getElementById('cucumber-left');
  const cucumberRight = document.getElementById('cucumber-right');
  const cucumberTipGroup = document.getElementById('cucumber-tip-group');
  const cucumberTipCore = document.getElementById('cucumber-tip-core');

  // Modals References
  const wagerModal = document.getElementById('wager-modal');
  const wagersList = document.getElementById('wagers-list');
  const customWagerText = document.getElementById('custom-wager-text');
  const btnStartDuel = document.getElementById('btn-start-duel');

  const handoverModal = document.getElementById('handover-modal');
  const handoverTargetScore = document.getElementById('handover-target-score');
  const handoverWagerText = document.getElementById('handover-wager-text');
  const btnStartPlayer2 = document.getElementById('btn-start-player2');

  const duelWinnerModal = document.getElementById('duel-winner-modal');
  const duelWinnerBadge = document.getElementById('duel-winner-badge');
  const duelWinnerHeadline = document.getElementById('duel-winner-headline');
  const p1DuelCol = document.getElementById('p1-duel-col');
  const p2DuelCol = document.getElementById('p2-duel-col');
  const p1Crown = document.getElementById('p1-crown');
  const p2Crown = document.getElementById('p2-crown');
  const p1FinalScore = document.getElementById('p1-final-score');
  const p2FinalScore = document.getElementById('p2-final-score');
  const p1FinalAcc = document.getElementById('p1-final-acc');
  const p2FinalAcc = document.getElementById('p2-final-acc');
  const duelAwardedWagerText = document.getElementById('duel-awarded-wager-text');
  const duelSigCanvas = document.getElementById('duel-signature-canvas');
  const btnClearDuelSig = document.getElementById('btn-clear-duel-sig');
  const btnFinishDuel = document.getElementById('btn-finish-duel');

  // Solo Modal fallback
  const victoryModal = document.getElementById('victory-modal');
  const modalFinalScore = document.getElementById('modal-final-score');
  const modalMaxCombo = document.getElementById('modal-max-combo');
  const modalFinalAccuracy = document.getElementById('modal-final-accuracy');
  const sigCanvas = document.getElementById('signature-canvas');
  const btnClearSig = document.getElementById('btn-clear-sig');
  const btnSignComplete = document.getElementById('btn-sign-complete');

  // Particle Canvas
  const partCanvas = document.getElementById('particles-canvas');
  const partCtx = partCanvas.getContext('2d');
  let particles = [];

  function resizeCanvases() {
    partCanvas.width = window.innerWidth;
    partCanvas.height = window.innerHeight;
    if (sigCanvas) {
      sigCanvas.width = sigCanvas.clientWidth;
      sigCanvas.height = sigCanvas.clientHeight;
    }
    if (duelSigCanvas) {
      duelSigCanvas.width = duelSigCanvas.clientWidth;
      duelSigCanvas.height = duelSigCanvas.clientHeight;
    }
  }
  window.addEventListener('resize', resizeCanvases);
  resizeCanvases();

  // =========================================
  // SONG MOVEMENTS CONFIGURATION (Full Track)
  // =========================================
  const SONG_MOVEMENTS = [
    {
      name: 'Mișcarea 1: Încălzire Senzorială',
      bpm: 85,
      durationMs: 18000,
      noteIntervalMs: 1000,
      intro: 'Atinge ritmic obrajii stâng și drept!',
      sub: 'Pregătește ritmul pentru runda decisivă.'
    },
    {
      name: 'Mișcarea 2: Ritm & Swirls pe Punctul de Plăcere',
      bpm: 105,
      durationMs: 20000,
      noteIntervalMs: 800,
      intro: 'Rotiri circulare pe Punctul de Plăcere de sub codiță!',
      sub: 'Măsoară viteza RPM și activează multiplicatorul 3x.'
    },
    {
      name: 'Mișcarea 3: FEVER DROP & Valuri de Foc',
      bpm: 125,
      durationMs: 20000,
      noteIntervalMs: 600,
      intro: 'Menține combo-ul peste 15x pentru FEVER MODE!',
      sub: 'Multiplicatori uriași 8x și 16x pe ecran.'
    },
    {
      name: 'Mișcarea 4: CLIMAX OVERDRIVE • Gâfâit Garantat',
      bpm: 140,
      durationMs: 20000,
      noteIntervalMs: 440,
      intro: 'Sprint final de viteză maximă pentru scorul suprem!',
      sub: 'Totul se decide acum!'
    }
  ];

  // Game Engine & Duel State
  let isGameActive = false;
  let currentTurnPlayer = 'Prestatorul'; // 'Prestatorul' | 'Otter'
  let selectedWager = '20 de minute de masaj senzual cu ulei cald la lumina lumânărilor fără nicio grabă';

  // Stats for Player 1 and Player 2
  let p1Stats = { score: 0, combo: 0, maxCombo: 0, totalNotes: 0, hitNotes: 0, maxRpm: 0 };
  let p2Stats = { score: 0, combo: 0, maxCombo: 0, totalNotes: 0, hitNotes: 0, maxRpm: 0 };

  // Current Turn Active Variables
  let currentMovementIdx = 0;
  let movementTimer = null;
  let noteSpawnTimer = null;
  let activeNotes = [];
  let score = 0;
  let combo = 0;
  let maxCombo = 0;
  let totalNotes = 0;
  let hitNotes = 0;
  let kpi = 0;
  let breath = 100;
  let multiplier = 1;
  let activeTool = 'finger'; // 'finger' | 'tongue'
  let activeCharacter = 'peach'; // 'peach' | 'cucumber'
  let isFeverActive = false;
  let currentTurnMaxRpm = 0;

  function setCharacter(charName) {
    activeCharacter = charName;
    if (activeCharacter === 'cucumber') {
      document.body.classList.add('cucumber-active');
      if (btnCharToggle) btnCharToggle.textContent = '🥒';
    } else {
      document.body.classList.remove('cucumber-active');
      if (btnCharToggle) btnCharToggle.textContent = '🍑';
    }

    charTabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.char === activeCharacter);
    });
  }

  // Pleasure Spot Mechanics
  let lastSwirlAngle = null;
  let lastSwirlTime = null;
  let accumulatedSwirlAngle = 0;
  let overheatLevel = 0;
  let isOverheated = false;
  let rpmHideTimeout = null;

  // Haptics helper
  function vibrate(ms = 25) {
    if (navigator.vibrate) {
      try { navigator.vibrate(ms); } catch (e) {}
    }
  }

  // Particle System
  function addParticles(x, y, count = 18, type = 'star') {
    const colors = isFeverActive
      ? ['#f43f5e', '#fbbf24', '#f59e0b', '#ec4899', '#ffffff']
      : ['#f59e0b', '#ff5e7e', '#10b981', '#f472b6', '#fcd34d', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        radius: Math.random() * 4 + 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: Math.random() * 0.02 + 0.015,
        type: type
      });
    }
  }

  function renderParticles() {
    partCtx.clearRect(0, 0, partCanvas.width, partCanvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      partCtx.save();
      partCtx.globalAlpha = p.life;
      partCtx.fillStyle = p.color;

      if (p.type === 'heart') {
        const s = p.radius * 1.5;
        partCtx.translate(p.x, p.y);
        partCtx.beginPath();
        partCtx.moveTo(0, 0);
        partCtx.bezierCurveTo(-s, -s, -s * 1.4, s * 0.4, 0, s * 1.4);
        partCtx.bezierCurveTo(s * 1.4, s * 0.4, s, -s, 0, 0);
        partCtx.fill();
      } else {
        partCtx.beginPath();
        partCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        partCtx.fill();
      }
      partCtx.restore();
    }
    requestAnimationFrame(renderParticles);
  }
  renderParticles();

  // Rating Popups Display
  function showRating(text, type) {
    const el = document.createElement('div');
    el.className = `rating-popup ${type}`;
    el.textContent = text;
    ratingContainer.appendChild(el);
    setTimeout(() => el.remove(), 600);
  }

  // Peach Jiggle Effect
  function jigglePeach() {
    peachWrap.classList.remove('jiggle');
    void peachWrap.offsetWidth;
    peachWrap.classList.add('jiggle');
  }

  // Update Top HUD
  function updateHUD() {
    valScore.textContent = score.toLocaleString();
    valCombo.textContent = `${combo}x`;

    if (combo >= 15) {
      statComboBox.classList.add('hype');
      if (!isFeverActive) {
        activateFeverMode();
      }
    } else {
      statComboBox.classList.remove('hype');
      if (isFeverActive) {
        deactivateFeverMode();
      }
    }

    const acc = totalNotes === 0 ? 100 : Math.round((hitNotes / totalNotes) * 100);
    valAccuracy.textContent = `${acc}%`;

    // Multiplier
    if (isFeverActive) {
      multiplier = combo >= 30 ? 16 : 8;
    } else {
      if (combo >= 40) multiplier = 8;
      else if (combo >= 20) multiplier = 4;
      else if (combo >= 10) multiplier = 2;
      else multiplier = 1;
    }

    valMultiplier.textContent = `${multiplier}x MULTI`;

    // Pleasure Gauge
    barPleasure.style.width = `${Math.min(100, kpi)}%`;
    labelKpiVal.textContent = `${Math.round(kpi)}%`;

    // Breath Gauge
    barBreath.style.width = `${Math.max(0, Math.min(100, breath))}%`;
    labelBreathVal.textContent = `${Math.round(breath)}%`;

    if (breath < 35) {
      barBreath.classList.add('danger');
      window.symphonyAudio.playHeartbeat();
    } else {
      barBreath.classList.remove('danger');
    }
  }

  // FEVER MODE Activators
  function activateFeverMode() {
    isFeverActive = true;
    document.body.classList.add('fever-active');
    window.symphonyAudio.setFever(true);
    showRating('🔥 FEVER OVERDRIVE!', 'perfect');
    vibrate([40, 30, 40]);
  }

  function deactivateFeverMode() {
    isFeverActive = false;
    document.body.classList.remove('fever-active');
    window.symphonyAudio.setFever(false);
  }

  // =========================================
  // RHYTHM NOTE SPAWNING & HIT DETECTION
  // =========================================
  function spawnRhythmNode() {
    if (!isGameActive) return;

    const targets = ['left', 'right', 'center'];
    const chosenTarget = targets[Math.floor(Math.random() * targets.length)];

    const pw = peachWrap.clientWidth || 240;
    const ph = peachWrap.clientHeight || 240;

    let localX = 0;
    let localY = 0;

    if (activeCharacter === 'cucumber') {
      if (chosenTarget === 'left') {
        localX = pw * 0.38;
        localY = ph * 0.58;
      } else if (chosenTarget === 'right') {
        localX = pw * 0.62;
        localY = ph * 0.58;
      } else {
        // Sensitive Tip of Cucumber
        localX = pw * 0.50;
        localY = ph * 0.28;
      }
    } else {
      if (chosenTarget === 'left') {
        localX = pw * 0.35;
        localY = ph * 0.58;
      } else if (chosenTarget === 'right') {
        localX = pw * 0.65;
        localY = ph * 0.58;
      } else {
        // Pleasure Spot right below stem
        localX = pw * 0.50;
        localY = ph * 0.37;
      }
    }

    const ring = document.createElement('div');
    ring.className = chosenTarget === 'center' ? 'rhythm-approach-ring pleasure-spot-ring' : 'rhythm-approach-ring';
    ring.style.left = `${localX - 25}px`;
    ring.style.top = `${localY - 25}px`;
    ring.style.width = '50px';
    ring.style.height = '50px';
    nodesLayer.appendChild(ring);

    const hitWindowMs = 650;
    const targetHitTime = Date.now() + hitWindowMs;

    const rect = peachWrap.getBoundingClientRect();
    const noteObj = {
      target: chosenTarget,
      targetTime: targetHitTime,
      element: ring,
      x: rect.left + localX,
      y: rect.top + localY,
      hit: false
    };
    activeNotes.push(noteObj);
    totalNotes++;

    const startScale = 2.4;
    const startTime = Date.now();

    function animateRing() {
      if (noteObj.hit) {
        ring.remove();
        return;
      }
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / hitWindowMs);
      const currentScale = startScale - (startScale - 1) * progress;
      ring.style.transform = `scale(${currentScale})`;

      if (progress < 1) {
        requestAnimationFrame(animateRing);
      } else {
        setTimeout(() => {
          if (!noteObj.hit) {
            noteObj.hit = true;
            ring.remove();
            handleNoteResult('miss', noteObj);
          }
        }, 110);
      }
    }
    requestAnimationFrame(animateRing);
  }

  function handleNoteResult(rating, noteObj) {
    if (rating === 'perfect') {
      combo++;
      hitNotes++;
      const gain = 300 * multiplier;
      score += gain;
      kpi = Math.min(100, kpi + 2.5);
      breath = Math.max(10, breath - 2.5);
      showRating('PERFECT!', 'perfect');
      window.symphonyAudio.playPerfectHit();
      vibrate(28);
      addParticles(noteObj.x, noteObj.y, 16, 'star');
    } else if (rating === 'great') {
      combo++;
      hitNotes++;
      const gain = 150 * multiplier;
      score += gain;
      kpi = Math.min(100, kpi + 1.4);
      breath = Math.max(10, breath - 1.5);
      showRating('GREAT!', 'great');
      window.symphonyAudio.playGreatHit();
      vibrate(18);
      addParticles(noteObj.x, noteObj.y, 10, 'circle');
    } else {
      combo = 0;
      breath = Math.max(5, breath - 5.0);
      showRating('MISS', 'miss');
      window.symphonyAudio.playMiss();
      vibrate(45);
    }

    if (combo > maxCombo) maxCombo = combo;
    jigglePeach();
    updateHUD();
  }

  function tryHitTarget(targetName, e) {
    window.symphonyAudio.init();
    const now = Date.now();

    const note = activeNotes.find(n => !n.hit && n.target === targetName && Math.abs(now - n.targetTime) <= 190);

    if (note) {
      note.hit = true;
      const delta = Math.abs(now - note.targetTime);
      if (delta <= 75) {
        handleNoteResult('perfect', note);
      } else {
        handleNoteResult('great', note);
      }
    } else {
      score += 25 * multiplier;
      kpi = Math.min(100, kpi + 0.5);
      updateHUD();
    }
  }

  // =========================================
  // SONG TRACK RUNNER (Full Track Progression)
  // =========================================
  function startSongMovement(idx) {
    if (!isGameActive) return;
    currentMovementIdx = idx;
    const movement = SONG_MOVEMENTS[idx];

    stageTitleText.textContent = `${currentTurnPlayer} • ${movement.name}`;
    bpmIndicator.textContent = `⚡ ${movement.bpm} BPM`;
    instructionTitle.textContent = movement.intro;
    instructionSub.textContent = movement.sub;

    window.symphonyAudio.setBPM(movement.bpm);

    if (idx >= 1) {
      swirlGuideRing.style.display = 'block';
    }

    clearInterval(noteSpawnTimer);
    noteSpawnTimer = setInterval(spawnRhythmNode, movement.noteIntervalMs);

    movementTimer = setTimeout(() => {
      if (currentMovementIdx < SONG_MOVEMENTS.length - 1) {
        startSongMovement(currentMovementIdx + 1);
      } else {
        // Full song completed for current player!
        finishPlayerTurn();
      }
    }, movement.durationMs);
  }

  function startPlayerTurn() {
    isGameActive = true;
    currentMovementIdx = 0;
    score = 0;
    combo = 0;
    maxCombo = 0;
    totalNotes = 0;
    hitNotes = 0;
    kpi = 0;
    breath = 100;
    currentTurnMaxRpm = 0;
    deactivateFeverMode();

    turnPlayerName.textContent = currentTurnPlayer;
    turnPillIndicator.className = currentTurnPlayer === 'Otter'
      ? 'turn-pill-indicator otter-turn'
      : 'turn-pill-indicator';

    window.symphonyAudio.init();
    window.symphonyAudio.startBeatLoop();
    updateHUD();

    startSongMovement(0);
  }

  function finishPlayerTurn() {
    isGameActive = false;
    clearInterval(noteSpawnTimer);
    clearTimeout(movementTimer);
    window.symphonyAudio.stopBeatLoop();
    deactivateFeverMode();

    const acc = totalNotes === 0 ? 100 : Math.round((hitNotes / totalNotes) * 100);

    if (currentTurnPlayer === 'Prestatorul') {
      // Save Player 1 stats
      p1Stats = {
        score: score,
        maxCombo: maxCombo,
        accuracy: acc,
        maxRpm: currentTurnMaxRpm
      };

      window.symphonyAudio.playTurnChangeChime();
      vibrate([60, 40, 60]);

      // Show Handover Modal
      handoverTargetScore.textContent = p1Stats.score.toLocaleString();
      handoverWagerText.textContent = selectedWager;
      handoverModal.classList.add('open');

    } else {
      // Player 2 (Otter) finished! Complete Duel!
      p2Stats = {
        score: score,
        maxCombo: maxCombo,
        accuracy: acc,
        maxRpm: currentTurnMaxRpm
      };

      finishDuelCeremony();
    }
  }

  // =========================================
  // DUEL WINNER CEREMONY
  // =========================================
  function finishDuelCeremony() {
    window.symphonyAudio.playVictoryFanfare();
    vibrate([80, 50, 100]);
    addParticles(window.innerWidth / 2, window.innerHeight * 0.4, 80, 'heart');

    p1FinalScore.textContent = p1Stats.score.toLocaleString();
    p1FinalAcc.textContent = `${p1Stats.accuracy}% Acc (Max ${p1Stats.maxCombo}x)`;

    p2FinalScore.textContent = p2Stats.score.toLocaleString();
    p2FinalAcc.textContent = `${p2Stats.accuracy}% Acc (Max ${p2Stats.maxCombo}x)`;

    duelAwardedWagerText.textContent = selectedWager;

    const isOtterWinner = p2Stats.score >= p1Stats.score;

    if (isOtterWinner) {
      duelWinnerHeadline.textContent = 'Otter a Câștigat Duelul!';
      duelWinnerBadge.textContent = '👑 OTTER ESTE REGINA RITMULUI!';
      p2DuelCol.classList.add('winner');
      p1DuelCol.classList.remove('winner');
      p2Crown.style.visibility = 'visible';
      p1Crown.style.visibility = 'hidden';
    } else {
      duelWinnerHeadline.textContent = 'Prestatorul a Câștigat Duelul!';
      duelWinnerBadge.textContent = '👑 PRESTATORUL A TRIUMFAT!';
      p1DuelCol.classList.add('winner');
      p2DuelCol.classList.remove('winner');
      p1Crown.style.visibility = 'visible';
      p2Crown.style.visibility = 'hidden';
    }

    setTimeout(() => {
      duelWinnerModal.classList.add('open');
      resizeCanvases();
    }, 400);
  }

  // =========================================
  // SPICY WAGER SELECTION LOGIC
  // =========================================
  const wagerOptions = document.querySelectorAll('.wager-card-option');
  wagerOptions.forEach(card => {
    card.addEventListener('click', () => {
      wagerOptions.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      const wagerType = card.dataset.wager;
      if (wagerType === 'custom') {
        customWagerText.focus();
        selectedWager = customWagerText.value.trim() || 'Miză secretă personalizată aleasă în cuplu';
      } else {
        selectedWager = wagerType;
      }
      window.symphonyAudio.playGlideTone(580);
      vibrate(15);
    });
  });

  customWagerText.addEventListener('input', () => {
    selectedWager = customWagerText.value.trim() || 'Miză secretă personalizată aleasă în cuplu';
  });

  btnStartDuel.addEventListener('click', () => {
    const selectedOption = document.querySelector('.wager-card-option.selected');
    if (selectedOption && selectedOption.dataset.wager === 'custom') {
      selectedWager = customWagerText.value.trim() || 'Miză secretă personalizată aleasă în cuplu';
    }
    wagerModal.classList.remove('open');
    currentTurnPlayer = 'Prestatorul';
    startPlayerTurn();
  });

  // Handover Button to Otter
  btnStartPlayer2.addEventListener('click', () => {
    handoverModal.classList.remove('open');
    currentTurnPlayer = 'Otter';
    startPlayerTurn();
  });

  // Replay Duel
  btnFinishDuel.addEventListener('click', () => {
    duelWinnerModal.classList.remove('open');
    wagerModal.classList.add('open');
  });

  // Character Select Buttons (Header toggle & Modal selector)
  if (btnCharToggle) {
    btnCharToggle.addEventListener('click', () => {
      setCharacter(activeCharacter === 'peach' ? 'cucumber' : 'peach');
      window.symphonyAudio.playGlideTone(520);
      vibrate(20);
    });
  }

  charTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedChar = btn.dataset.char;
      if (selectedChar) {
        setCharacter(selectedChar);
        window.symphonyAudio.playGlideTone(520);
        vibrate(20);
      }
    });
  });

  // =========================================
  // TOUCH ZONES & PLEASURE SPOT SWIRL TRACKER
  // =========================================
  // Peach Touch Zones
  peachLeft.addEventListener('click', (e) => tryHitTarget('left', e));
  peachLeft.addEventListener('touchstart', (e) => {
    e.preventDefault();
    tryHitTarget('left', e);
  }, { passive: false });

  peachRight.addEventListener('click', (e) => tryHitTarget('right', e));
  peachRight.addEventListener('touchstart', (e) => {
    e.preventDefault();
    tryHitTarget('right', e);
  }, { passive: false });

  pleasureSpotGroup.addEventListener('click', (e) => handlePleasureSpotTap(e));
  pleasureSpotGroup.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handlePleasureSpotTap(e);
  }, { passive: false });

  // Cucumber Touch Zones
  if (cucumberLeft) {
    cucumberLeft.addEventListener('click', (e) => tryHitTarget('left', e));
    cucumberLeft.addEventListener('touchstart', (e) => {
      e.preventDefault();
      tryHitTarget('left', e);
    }, { passive: false });
  }

  if (cucumberRight) {
    cucumberRight.addEventListener('click', (e) => tryHitTarget('right', e));
    cucumberRight.addEventListener('touchstart', (e) => {
      e.preventDefault();
      tryHitTarget('right', e);
    }, { passive: false });
  }

  if (cucumberTipGroup) {
    cucumberTipGroup.addEventListener('click', (e) => handlePleasureSpotTap(e));
    cucumberTipGroup.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handlePleasureSpotTap(e);
    }, { passive: false });
  }

  function handlePleasureSpotTap(e) {
    if (isOverheated) {
      showRating('OVERHEAT!', 'overheat');
      window.symphonyAudio.playMiss();
      vibrate(60);
      return;
    }

    overheatLevel += 18;
    if (overheatLevel >= 100) {
      triggerOverheat();
      return;
    }

    window.symphonyAudio.playPleasureSpotShimmer();
    vibrate(35);
    const activeCore = (activeCharacter === 'cucumber' && cucumberTipCore) ? cucumberTipCore : pleasureSpotCore;
    const rect = activeCore ? activeCore.getBoundingClientRect() : pleasureSpotGroup.getBoundingClientRect();
    addParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 14, 'heart');

    tryHitTarget('center', e);
  }

  // Real-time Swirl & RPM Calculation
  function handleSwirlMove(e, targetEl) {
    if (isOverheated || activeTool !== 'tongue') return;
    const touch = e.touches[0];
    const rect = targetEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const currentAngle = Math.atan2(touch.clientY - cy, touch.clientX - cx);
    const now = Date.now();

    if (lastSwirlAngle !== null && lastSwirlTime !== null) {
      let deltaAngle = currentAngle - lastSwirlAngle;
      if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
      if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

      const deltaMs = now - lastSwirlTime;
      accumulatedSwirlAngle += Math.abs(deltaAngle);

      // Instant RPM calculation
      if (deltaMs > 20) {
        const rpm = ((Math.abs(deltaAngle) / (2 * Math.PI)) / (deltaMs / 60000));
        if (rpm > 30 && rpm < 400) {
          rpmBadge.textContent = `⚡ ${Math.round(rpm)} RPM`;
          rpmBadge.classList.add('visible');

          if (rpm > currentTurnMaxRpm) {
            currentTurnMaxRpm = Math.round(rpm);
          }

          clearTimeout(rpmHideTimeout);
          rpmHideTimeout = setTimeout(() => {
            rpmBadge.classList.remove('visible');
          }, 1200);
        }
      }

      // Complete 360-degree swirl
      if (accumulatedSwirlAngle >= Math.PI * 2) {
        accumulatedSwirlAngle = 0;
        onSuccessfulSwirl(touch.clientX, touch.clientY);
      }
    }
    lastSwirlAngle = currentAngle;
    lastSwirlTime = now;
  }

  pleasureSpotGroup.addEventListener('touchmove', (e) => handleSwirlMove(e, pleasureSpotGroup), { passive: true });
  pleasureSpotGroup.addEventListener('touchend', () => {
    lastSwirlAngle = null;
    lastSwirlTime = null;
  });

  if (cucumberTipGroup) {
    cucumberTipGroup.addEventListener('touchmove', (e) => handleSwirlMove(e, cucumberTipGroup), { passive: true });
    cucumberTipGroup.addEventListener('touchend', () => {
      lastSwirlAngle = null;
      lastSwirlTime = null;
    });
  }

  function onSuccessfulSwirl(x, y) {
    score += 450 * multiplier;
    kpi = Math.min(100, kpi + 4.2);
    overheatLevel = Math.max(0, overheatLevel - 25);
    showRating('SWEET SWIRL!', 'perfect');
    window.symphonyAudio.playPleasureSpotShimmer();
    vibrate(40);
    addParticles(x, y, 22, 'heart');
    updateHUD();
  }

  function triggerOverheat() {
    isOverheated = true;
    pleasureSpotCore.classList.add('overheated');
    if (cucumberTipCore) cucumberTipCore.classList.add('overheated');
    showRating('SUPRAÎNCĂLZIRE!', 'overheat');
    vibrate([80, 50, 80]);

    setTimeout(() => {
      isOverheated = false;
      overheatLevel = 0;
      pleasureSpotCore.classList.remove('overheated');
      if (cucumberTipCore) cucumberTipCore.classList.remove('overheated');
    }, 2500);
  }

  setInterval(() => {
    if (overheatLevel > 0 && !isOverheated) {
      overheatLevel = Math.max(0, overheatLevel - 8);
    }
  }, 1000);

  // Tool Segmented Selector
  tabFinger.addEventListener('click', () => {
    activeTool = 'finger';
    tabFinger.classList.add('active');
    tabTongue.classList.remove('active');
    window.symphonyAudio.playGlideTone(550);
    vibrate(15);
  });

  tabTongue.addEventListener('click', () => {
    activeTool = 'tongue';
    tabTongue.classList.add('active');
    tabFinger.classList.remove('active');
    window.symphonyAudio.playGlideTone(420);
    vibrate(15);
  });

  btnBreathCatch.addEventListener('click', () => {
    breath = Math.min(100, breath + 35);
    window.symphonyAudio.playGlideTone(680);
    vibrate(25);
    updateHUD();
  });

  btnAudioToggle.addEventListener('click', () => {
    const isMuted = window.symphonyAudio.toggleMute();
    btnAudioToggle.textContent = isMuted ? '🔇' : '🔔';
  });

  // =========================================
  // SIGNATURE CANVASES LOGIC
  // =========================================
  function setupSignaturePad(canvasEl, clearBtn) {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    let drawing = false;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#be123c';

    function getCoords(e) {
      const rect = canvasEl.getBoundingClientRect();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: cx - rect.left, y: cy - rect.top };
    }

    function start(e) {
      drawing = true;
      const p = getCoords(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    }

    function draw(e) {
      if (!drawing) return;
      const p = getCoords(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }

    function stop() { drawing = false; }

    canvasEl.addEventListener('mousedown', start);
    canvasEl.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stop);

    canvasEl.addEventListener('touchstart', (e) => {
      e.preventDefault();
      start(e);
    }, { passive: false });

    canvasEl.addEventListener('touchmove', (e) => {
      e.preventDefault();
      draw(e);
    }, { passive: false });

    canvasEl.addEventListener('touchend', stop);

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      });
    }
  }

  setupSignaturePad(sigCanvas, btnClearSig);
  setupSignaturePad(duelSigCanvas, btnClearDuelSig);

  // Initial HUD Display
  updateHUD();
});
