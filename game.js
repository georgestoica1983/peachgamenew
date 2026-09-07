// game.js - Rhythm Engine & Mechanics for Peach Sensory Symphony

document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const stageTitleText = document.getElementById('stage-title-text');
  const bpmIndicator = document.getElementById('bpm-indicator');
  const btnAudioToggle = document.getElementById('btn-audio-toggle');

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
  const ratingContainer = document.getElementById('rating-container');
  const nodesLayer = document.getElementById('rhythm-nodes-layer');

  const instructionTitle = document.getElementById('instruction-title');
  const instructionSub = document.getElementById('instruction-sub');
  const tabFinger = document.getElementById('tab-finger');
  const tabTongue = document.getElementById('tab-tongue');
  const btnBreathCatch = document.getElementById('btn-breath-catch');
  const btnNextStage = document.getElementById('btn-next-stage');
  const btnNextStageText = document.getElementById('btn-next-stage-text');

  const victoryModal = document.getElementById('victory-modal');
  const modalRankBadge = document.getElementById('modal-rank-badge');
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
    sigCanvas.width = sigCanvas.clientWidth;
    sigCanvas.height = sigCanvas.clientHeight;
  }
  window.addEventListener('resize', resizeCanvases);
  resizeCanvases();

  // Stage Configs (5 Progressive Levels)
  const STAGES = [
    {
      level: 1,
      name: 'Stage 1: First Light',
      bpm: 75,
      targetKpi: 20,
      noteIntervalMs: 1200,
      introText: 'Atinge obrajii stâng și drept când cercul de ritm se micșorează!',
      subText: 'Menține apăsat Punctul de Plăcere de sub codiță pentru multiplicator 2x.'
    },
    {
      level: 2,
      name: 'Stage 2: Velvet Curves',
      bpm: 95,
      targetKpi: 45,
      noteIntervalMs: 900,
      introText: 'Fă gesturi circulare (swirls) pe Punctul de Plăcere de sub codiță!',
      subText: 'Comută pe Limbă (👅) pentru glisare fluidă și multiplicator 3x.'
    },
    {
      level: 3,
      name: 'Stage 3: Breathless Waves',
      bpm: 115,
      targetKpi: 70,
      noteIntervalMs: 700,
      introText: 'Atenție la respirație! Nu supraîncălzi Punctul de Plăcere.',
      subText: 'Dacă se înroșește, răcorește-l cu o mângâiere lină sau ia o pauză de sărut.'
    },
    {
      level: 4,
      name: 'Stage 4: Poly-Rhythm Desires',
      bpm: 130,
      targetKpi: 90,
      noteIntervalMs: 520,
      introText: 'Poliritm: Ține apăsat Punctul de Plăcere în timp ce bați ritmul pe obraji!',
      subText: 'Atingeți cu ambele degete simultan.'
    },
    {
      level: 5,
      name: 'Stage 5: Grand Climax (KPI Overdrive)',
      bpm: 145,
      targetKpi: 100,
      noteIntervalMs: 400,
      introText: 'Sprint final de intensitate maximă! Gâfâit garantat la 100%.',
      subText: 'Activează toate cele 3 zone pentru desăvârșirea acordului.'
    }
  ];

  // Game Engine State
  let currentStageIdx = 0;
  let score = 0;
  let combo = 0;
  let maxCombo = 0;
  let totalNotes = 0;
  let hitNotes = 0;
  let kpi = 0;
  let breath = 100;
  let multiplier = 1;
  let activeTool = 'finger'; // 'finger' | 'tongue'
  let isGameActive = false;

  // Active Rhythm Notes Queue
  let activeNotes = [];
  let noteSpawnTimer = null;

  // Pleasure Spot Mechanics
  let pleasureSpotTouchStart = 0;
  let pleasureSpotAccumulatedAngle = 0;
  let lastAngle = null;
  let overheatLevel = 0; // 0 to 100
  let isOverheated = false;

  // Haptic feedback
  function vibrate(ms = 25) {
    if (navigator.vibrate) {
      try { navigator.vibrate(ms); } catch (e) {}
    }
  }

  // Particle System
  function addParticles(x, y, count = 18, type = 'star') {
    const colors = ['#f59e0b', '#ff5e7e', '#10b981', '#f472b6', '#fcd34d', '#ffffff'];
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

  // Rating Popup Display
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

  // Update Top HUD Display
  function updateHUD() {
    valScore.textContent = score.toLocaleString();
    valCombo.textContent = `${combo}x`;
    if (combo >= 15) {
      statComboBox.classList.add('hype');
    } else {
      statComboBox.classList.remove('hype');
    }

    const acc = totalNotes === 0 ? 100 : Math.round((hitNotes / totalNotes) * 100);
    valAccuracy.textContent = `${acc}%`;

    // Multiplier calculation
    if (combo >= 40) multiplier = 8;
    else if (combo >= 20) multiplier = 4;
    else if (combo >= 10) multiplier = 2;
    else multiplier = 1;

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

  // Spawn a Rhythm Node with Approach Ring
  function spawnRhythmNode() {
    if (!isGameActive) return;

    const stage = STAGES[currentStageIdx];
    const targets = ['left', 'right', 'center'];
    const chosenTarget = targets[Math.floor(Math.random() * targets.length)];

    const rect = peachWrap.getBoundingClientRect();
    let targetX = 0;
    let targetY = 0;

    if (chosenTarget === 'left') {
      targetX = rect.left + rect.width * 0.32;
      targetY = rect.top + rect.height * 0.58;
    } else if (chosenTarget === 'right') {
      targetX = rect.left + rect.width * 0.68;
      targetY = rect.top + rect.height * 0.58;
    } else {
      // Pleasure Spot right below stem in center
      targetX = rect.left + rect.width * 0.5;
      targetY = rect.top + rect.height * 0.37;
    }

    const ring = document.createElement('div');
    ring.className = 'rhythm-approach-ring';
    ring.style.left = `${targetX - 25}px`;
    ring.style.top = `${targetY - 25}px`;
    ring.style.width = '50px';
    ring.style.height = '50px';
    nodesLayer.appendChild(ring);

    const hitWindowMs = 700; // approach duration
    const targetHitTime = Date.now() + hitWindowMs;

    const noteObj = {
      target: chosenTarget,
      targetTime: targetHitTime,
      element: ring,
      x: targetX,
      y: targetY,
      hit: false
    };
    activeNotes.push(noteObj);
    totalNotes++;

    // Animate Approach Ring
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
        // Time expired: Check for Miss
        setTimeout(() => {
          if (!noteObj.hit) {
            noteObj.hit = true;
            ring.remove();
            handleNoteResult('miss', noteObj);
          }
        }, 120);
      }
    }
    requestAnimationFrame(animateRing);
  }

  // Handle Note Hit Result
  function handleNoteResult(rating, noteObj) {
    if (rating === 'perfect') {
      combo++;
      hitNotes++;
      const gain = 300 * multiplier;
      score += gain;
      kpi = Math.min(100, kpi + 2.8);
      breath = Math.max(10, breath - (currentStageIdx >= 2 ? 3.5 : 1.5));
      showRating('PERFECT!', 'perfect');
      window.symphonyAudio.playPerfectHit();
      vibrate(30);
      addParticles(noteObj.x, noteObj.y, 16, 'star');
    } else if (rating === 'great') {
      combo++;
      hitNotes++;
      const gain = 150 * multiplier;
      score += gain;
      kpi = Math.min(100, kpi + 1.6);
      breath = Math.max(10, breath - (currentStageIdx >= 2 ? 2.5 : 1.0));
      showRating('GREAT!', 'great');
      window.symphonyAudio.playGreatHit();
      vibrate(20);
      addParticles(noteObj.x, noteObj.y, 10, 'circle');
    } else {
      // Miss
      combo = 0;
      breath = Math.max(5, breath - 6.0);
      showRating('MISS', 'miss');
      window.symphonyAudio.playMiss();
      vibrate(50);
    }

    if (combo > maxCombo) maxCombo = combo;
    jigglePeach();
    updateHUD();
    checkStageProgress();
  }

  // Check if player hit the active note
  function tryHitTarget(targetName, e) {
    window.symphonyAudio.init();
    const now = Date.now();

    // Find closest unhit note for this target
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
      // Free tap (slight pleasure gain if on beat)
      score += 25 * multiplier;
      kpi = Math.min(100, kpi + 0.6);
      updateHUD();
      checkStageProgress();
    }
  }

  // Check Stage Completion
  function checkStageProgress() {
    const currentStage = STAGES[currentStageIdx];
    if (kpi >= currentStage.targetKpi) {
      if (currentStageIdx < STAGES.length - 1) {
        // Prompt transition to next stage
        btnNextStageText.textContent = `Treci la ${STAGES[currentStageIdx + 1].name}`;
        btnNextStage.style.display = 'flex';
      } else {
        // Climax Complete! (100% KPI)
        finishSymphony();
      }
    }
  }

  // Start Next Stage
  function advanceStage() {
    currentStageIdx++;
    const stage = STAGES[currentStageIdx];
    stageTitleText.textContent = stage.name;
    bpmIndicator.textContent = `⚡ ${stage.bpm} BPM`;
    instructionTitle.textContent = stage.introText;
    instructionSub.textContent = stage.subText;
    btnNextStage.style.display = 'none';

    // Update audio BPM
    window.symphonyAudio.setBPM(stage.bpm);

    if (stage.level === 2) {
      swirlGuideRing.style.display = 'block';
    }

    // Restart note spawn timer with new tempo
    clearInterval(noteSpawnTimer);
    noteSpawnTimer = setInterval(spawnRhythmNode, stage.noteIntervalMs);
  }

  btnNextStage.addEventListener('click', advanceStage);

  // Finish Game & Open Modal
  function finishSymphony() {
    isGameActive = false;
    clearInterval(noteSpawnTimer);
    window.symphonyAudio.stopBeatLoop();
    window.symphonyAudio.playVictoryFanfare();
    vibrate(100);
    addParticles(window.innerWidth / 2, window.innerHeight / 2, 80, 'heart');

    const acc = totalNotes === 0 ? 100 : Math.round((hitNotes / totalNotes) * 100);
    modalFinalScore.textContent = score.toLocaleString();
    modalMaxCombo.textContent = `${maxCombo}x`;
    modalFinalAccuracy.textContent = `${acc}%`;

    // Grade
    if (acc >= 94) {
      modalRankBadge.textContent = '★ S RANK • EXCELLENT ★';
      modalRankBadge.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    } else if (acc >= 85) {
      modalRankBadge.textContent = '★ A RANK • GREAT ★';
      modalRankBadge.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    } else {
      modalRankBadge.textContent = '★ B RANK • GOOD ★';
      modalRankBadge.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
    }

    setTimeout(() => {
      victoryModal.classList.add('open');
    }, 600);
  }

  // =========================================
  // INTERACTIVE TOUCH ZONES
  // =========================================

  // Left Cheek (🍓)
  peachLeft.addEventListener('click', (e) => tryHitTarget('left', e));
  peachLeft.addEventListener('touchstart', (e) => {
    e.preventDefault();
    tryHitTarget('left', e);
  }, { passive: false });

  // Right Cheek (🍑)
  peachRight.addEventListener('click', (e) => tryHitTarget('right', e));
  peachRight.addEventListener('touchstart', (e) => {
    e.preventDefault();
    tryHitTarget('right', e);
  }, { passive: false });

  // Pleasure Spot (✨ Center Below Stem)
  pleasureSpotGroup.addEventListener('click', (e) => {
    handlePleasureSpotTap(e);
  });

  pleasureSpotGroup.addEventListener('touchstart', (e) => {
    e.preventDefault();
    pleasureSpotTouchStart = Date.now();
    handlePleasureSpotTap(e);
  }, { passive: false });

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
    const rect = pleasureSpotCore.getBoundingClientRect();
    addParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 14, 'heart');

    tryHitTarget('center', e);
  }

  // Pleasure Spot Swirl Tracker (Continuous circle gesture)
  pleasureSpotGroup.addEventListener('touchmove', (e) => {
    if (isOverheated || activeTool !== 'tongue') return;
    const touch = e.touches[0];
    const rect = pleasureSpotGroup.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const currentAngle = Math.atan2(touch.clientY - cy, touch.clientX - cx);

    if (lastAngle !== null) {
      let deltaAngle = currentAngle - lastAngle;
      if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
      if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

      pleasureSpotAccumulatedAngle += Math.abs(deltaAngle);

      // Completed a 360-degree swirl!
      if (pleasureSpotAccumulatedAngle >= Math.PI * 2) {
        pleasureSpotAccumulatedAngle = 0;
        onSuccessfulSwirl(touch.clientX, touch.clientY);
      }
    }
    lastAngle = currentAngle;
  }, { passive: true });

  function onSuccessfulSwirl(x, y) {
    score += 450 * multiplier;
    kpi = Math.min(100, kpi + 4.2);
    // Swirl cools down overheat!
    overheatLevel = Math.max(0, overheatLevel - 25);
    showRating('SWEET SWIRL!', 'perfect');
    window.symphonyAudio.playPleasureSpotShimmer();
    vibrate(40);
    addParticles(x, y, 22, 'heart');
    updateHUD();
    checkStageProgress();
  }

  // Overheat State Logic
  function triggerOverheat() {
    isOverheated = true;
    pleasureSpotCore.classList.add('overheated');
    showRating('SUPRAÎNCĂLZIRE!', 'overheat');
    vibrate([80, 50, 80]);

    setTimeout(() => {
      isOverheated = false;
      overheatLevel = 0;
      pleasureSpotCore.classList.remove('overheated');
    }, 2500);
  }

  // Gradual Overheat Cooldown
  setInterval(() => {
    if (overheatLevel > 0 && !isOverheated) {
      overheatLevel = Math.max(0, overheatLevel - 8);
    }
  }, 1000);

  // Tool Selector Toggle
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

  // Breath Catch Button
  btnBreathCatch.addEventListener('click', () => {
    breath = Math.min(100, breath + 35);
    window.symphonyAudio.playGlideTone(680);
    vibrate(25);
    updateHUD();
  });

  // Audio Toggle
  btnAudioToggle.addEventListener('click', () => {
    const isMuted = window.symphonyAudio.toggleMute();
    btnAudioToggle.textContent = isMuted ? '🔇' : '🔔';
  });

  // =========================================
  // SIGNATURE CANVAS LOGIC
  // =========================================
  const sigCtx = sigCanvas.getContext('2d');
  let isDrawing = false;
  let hasSigned = false;

  sigCtx.lineWidth = 2.5;
  sigCtx.lineCap = 'round';
  sigCtx.strokeStyle = '#d97706';

  function getSigCoords(e) {
    const rect = sigCanvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: cx - rect.left, y: cy - rect.top };
  }

  function startSig(e) {
    isDrawing = true;
    hasSigned = true;
    const p = getSigCoords(e);
    sigCtx.beginPath();
    sigCtx.moveTo(p.x, p.y);
  }

  function drawSig(e) {
    if (!isDrawing) return;
    const p = getSigCoords(e);
    sigCtx.lineTo(p.x, p.y);
    sigCtx.stroke();
  }

  function endSig() { isDrawing = false; }

  sigCanvas.addEventListener('mousedown', startSig);
  sigCanvas.addEventListener('mousemove', drawSig);
  window.addEventListener('mouseup', endSig);

  sigCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startSig(e);
  }, { passive: false });

  sigCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    drawSig(e);
  }, { passive: false });

  sigCanvas.addEventListener('touchend', endSig);

  btnClearSig.addEventListener('click', () => {
    sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
    hasSigned = false;
  });

  btnSignComplete.addEventListener('click', () => {
    if (!hasSigned) {
      sigCtx.font = '24px "Playfair Display", Georgia, serif';
      sigCtx.fillStyle = '#d97706';
      sigCtx.fillText('★ Otter & Prestatorul ★', 40, 48);
    }
    window.symphonyAudio.playVictoryFanfare();
    vibrate(80);
    btnSignComplete.innerHTML = `<span>✓ ACORD VALIDAT & DESĂVÂRȘIT!</span><span>🎉</span>`;
    btnSignComplete.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

    setTimeout(() => {
      alert('🎉 Felicitări! Simfonia senzorială a fost desăvârșită cu succes! Garanție de rezultat îndeplinită și pupături asigurate pentru întreaga zi.');
    }, 700);
  });

  // Start Game Loop on first interaction
  function startGame() {
    if (isGameActive) return;
    isGameActive = true;
    window.symphonyAudio.init();
    window.symphonyAudio.setBPM(STAGES[0].bpm);
    window.symphonyAudio.startBeatLoop();
    noteSpawnTimer = setInterval(spawnRhythmNode, STAGES[0].noteIntervalMs);
  }

  // Trigger start on first touch/click
  document.body.addEventListener('touchstart', startGame, { once: true });
  document.body.addEventListener('click', startGame, { once: true });

  updateHUD();
});
