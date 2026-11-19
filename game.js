// VICE OUTLAWS - Action, Traffic, Story & Mission System
// Ultra-Optimized 3D Open World Engine with Levels & Progression

(function() {
  'use strict';

  // --- AUDIO SYNTHESIZER ---
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.initialized = false;
      this.radioPlaying = true;
      this.radioStep = 0;
      this.radioInterval = null;
      this.engineOsc = null;
      this.engineGain = null;
      this.lastEngineUpdate = 0;
      this.tireCooldown = 0;
    }

    init() {
      if (this.initialized) return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.initialized = true;

        this.engineOsc = this.ctx.createOscillator();
        this.engineOsc.type = 'sawtooth';
        this.engineGain = this.ctx.createGain();
        this.engineGain.gain.setValueAtTime(0.025, this.ctx.currentTime);

        const engineFilter = this.ctx.createBiquadFilter();
        engineFilter.type = 'lowpass';
        engineFilter.frequency.setValueAtTime(260, this.ctx.currentTime);

        this.engineOsc.connect(engineFilter);
        engineFilter.connect(this.engineGain);
        this.engineGain.connect(this.ctx.destination);
        this.engineOsc.start();

        this.startRadio();
      } catch (e) {
        console.warn('Audio unlock pending user gesture', e);
      }
    }

    setEngineSpeed(speedRatio) {
      if (!this.initialized || !this.engineOsc) return;
      const now = performance.now();
      if (now - this.lastEngineUpdate < 35) return;
      this.lastEngineUpdate = now;

      const baseFreq = 42;
      const targetFreq = baseFreq + speedRatio * 170;
      this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.08);
      this.engineGain.gain.setTargetAtTime(0.015 + speedRatio * 0.04, this.ctx.currentTime, 0.08);
    }

    playTireScreech() {
      if (!this.initialized) return;
      if (Date.now() - this.tireCooldown < 120) return;
      this.tireCooldown = Date.now();

      const bufferSize = Math.floor(this.ctx.sampleRate * 0.08);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) output[i] = (Math.random() * 2 - 1) * 0.5;
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1250, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      whiteNoise.start();
    }

    playCrash() {
      if (!this.initialized) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(100, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(25, this.ctx.currentTime + 0.16);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.17);
    }

    playCashJingle() {
      if (!this.initialized) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.setValueAtTime(1174, this.ctx.currentTime + 0.09);

      gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.24);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    }

    playMissionSuccess() {
      if (!this.initialized) return;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C, E, G, C, E fanfare
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.09);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.09 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.09);
        osc.stop(this.ctx.currentTime + idx * 0.09 + 0.32);
      });
    }

    playHorn() {
      if (!this.initialized) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(370, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    }

    toggleRadio() {
      this.radioPlaying = !this.radioPlaying;
      if (this.radioPlaying) this.startRadio();
      else if (this.radioInterval) {
        clearInterval(this.radioInterval);
        this.radioInterval = null;
      }
      return this.radioPlaying;
    }

    startRadio() {
      if (!this.ctx) return;
      const notes = [110, 110, 130.81, 146.83, 110, 110, 164.81, 146.83];
      this.radioInterval = setInterval(() => {
        if (!this.radioPlaying || !this.initialized) return;
        const freq = notes[this.radioStep % notes.length];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.17);
        this.radioStep++;
      }, 180);
    }
  }

  // --- GAME STATE & LEVEL SYSTEM ---
  const STATE = {
    cash: 5000,
    health: 100,
    armor: 100,
    wantedLevel: 0,
    isEvading: false,
    evadeTimer: 0,
    driftScore: 0,
    cameraMode: 0,
    carColor: 0xff0055,
    neonColor: 0x00f0ff,
    busted: false,
    currentLevel: 1,
    levelStage: 0,
    cratesCollected: 0
  };

  const INPUT = {
    gas: false,
    brake: false,
    left: false,
    right: false,
    drift: false
  };

  // --- THREE.JS INITIALIZATION ---
  const container = document.getElementById('game-container');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0e0618);
  scene.fog = new THREE.FogExp2(0x130722, 0.005);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.5, 400);

  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    powerPreference: 'high-performance',
    stencil: false,
    depth: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
  renderer.shadowMap.enabled = false;
  container.appendChild(renderer.domElement);

  const sound = new SoundEngine();

  const ambientLight = new THREE.AmbientLight(0x553366, 1.6);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xff66bb, 1.2);
  dirLight.position.set(40, 80, 40);
  scene.add(dirLight);

  // --- CITY GRID CONFIGURATION ---
  const CITY_SIZE = 8;
  const BLOCK_SIZE = 42;
  const ROAD_WIDTH = 18;
  const STEP = BLOCK_SIZE + ROAD_WIDTH;
  const HALF_MAP = (CITY_SIZE * STEP) / 2;

  // Ground Asphalt
  const groundGeo = new THREE.PlaneGeometry(HALF_MAP * 2.6, HALF_MAP * 2.6);
  const groundMat = new THREE.MeshBasicMaterial({ color: 0x121217 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Window Texture
  function createWindowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#161420';
    ctx.fillRect(0, 0, 128, 128);

    const colors = ['#00f0ff', '#ff007f', '#ffd700', '#ffffff'];
    for (let y = 8; y < 120; y += 18) {
      for (let x = 6; x < 120; x += 16) {
        if (Math.random() > 0.45) {
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          ctx.fillRect(x, y, 9, 10);
        }
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 8);
    return tex;
  }
  const buildingTexture = createWindowTexture();

  const buildingMat = new THREE.MeshLambertMaterial({
    map: buildingTexture,
    color: 0xcccccc
  });

  const buildingData = [];
  const colliders = [];

  for (let ix = -CITY_SIZE / 2; ix < CITY_SIZE / 2; ix++) {
    for (let iz = -CITY_SIZE / 2; iz < CITY_SIZE / 2; iz++) {
      if (Math.abs(ix) <= 0 && Math.abs(iz) <= 0) continue;

      const cx = ix * STEP + STEP / 2;
      const cz = iz * STEP + STEP / 2;
      const height = 25 + Math.random() * 55;

      buildingData.push({ x: cx, y: height / 2, z: cz, height });
      colliders.push({
        minX: cx - BLOCK_SIZE / 2,
        maxX: cx + BLOCK_SIZE / 2,
        minZ: cz - BLOCK_SIZE / 2,
        maxZ: cz + BLOCK_SIZE / 2
      });
    }
  }

  // Instanced Buildings
  const bBoxGeo = new THREE.BoxGeometry(1, 1, 1);
  const buildingInstances = new THREE.InstancedMesh(bBoxGeo, buildingMat, buildingData.length);
  const dummy = new THREE.Object3D();

  buildingData.forEach((b, i) => {
    dummy.position.set(b.x, b.y, b.z);
    dummy.scale.set(BLOCK_SIZE, b.height, BLOCK_SIZE);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    buildingInstances.setMatrixAt(i, dummy.matrix);
  });
  buildingInstances.instanceMatrix.needsUpdate = true;
  scene.add(buildingInstances);

  // Instanced Road Markings
  const roadMarkingsData = [];
  for (let i = -HALF_MAP; i < HALF_MAP; i += 9) {
    for (let r = -CITY_SIZE / 2; r <= CITY_SIZE / 2; r++) {
      const roadCoord = r * STEP;
      roadMarkingsData.push({ x: i, z: roadCoord, rotY: Math.PI / 2 });
      roadMarkingsData.push({ x: roadCoord, z: i, rotY: 0 });
    }
  }

  const markGeo = new THREE.PlaneGeometry(0.45, 3.2);
  markGeo.rotateX(-Math.PI / 2);
  const markMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
  const markInstances = new THREE.InstancedMesh(markGeo, markMat, roadMarkingsData.length);

  roadMarkingsData.forEach((m, idx) => {
    dummy.position.set(m.x, 0.04, m.z);
    dummy.rotation.set(0, m.rotY, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    markInstances.setMatrixAt(idx, dummy.matrix);
  });
  markInstances.instanceMatrix.needsUpdate = true;
  scene.add(markInstances);

  // Instanced Palm Trees
  const treePositions = [];
  buildingData.forEach(b => {
    treePositions.push({ x: b.x + BLOCK_SIZE / 2 + 2.5, z: b.z });
    treePositions.push({ x: b.x - BLOCK_SIZE / 2 - 2.5, z: b.z });
  });

  const trunkGeo = new THREE.CylinderGeometry(0.25, 0.4, 7, 5);
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5a3d28 });
  const trunkInstances = new THREE.InstancedMesh(trunkGeo, trunkMat, treePositions.length);

  const leavesGeo = new THREE.ConeGeometry(2.4, 4.5, 5);
  const leavesMat = new THREE.MeshLambertMaterial({ color: 0x00cc66 });
  const leavesInstances = new THREE.InstancedMesh(leavesGeo, leavesMat, treePositions.length);

  treePositions.forEach((pos, idx) => {
    dummy.position.set(pos.x, 3.5, pos.z);
    dummy.scale.set(1, 1, 1);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    trunkInstances.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(pos.x, 7.5, pos.z);
    dummy.updateMatrix();
    leavesInstances.setMatrixAt(idx, dummy.matrix);
  });
  trunkInstances.instanceMatrix.needsUpdate = true;
  leavesInstances.instanceMatrix.needsUpdate = true;
  scene.add(trunkInstances, leavesInstances);

  // --- 3D MISSION BEACON & WAYPOINT SYSTEM ---
  const beaconGroup = new THREE.Group();
  // Vertical neon light pillar
  const pillarGeo = new THREE.CylinderGeometry(1.6, 1.6, 50, 16, 1, true);
  const pillarMat = new THREE.MeshBasicMaterial({
    color: 0xffd700,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide
  });
  const pillar = new THREE.Mesh(pillarGeo, pillarMat);
  pillar.position.y = 25;
  beaconGroup.add(pillar);

  // Rotating Floating Diamond Icon
  const diamondGeo = new THREE.OctahedronGeometry(1.5, 0);
  const diamondMat = new THREE.MeshBasicMaterial({ color: 0xffd700, wireframe: false });
  const diamondMesh = new THREE.Mesh(diamondGeo, diamondMat);
  diamondMesh.position.y = 3.5;
  beaconGroup.add(diamondMesh);

  // Ground Halo Ring
  const ringGeo = new THREE.RingGeometry(2.5, 3.2, 24);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xffd700, side: THREE.DoubleSide });
  const haloRing = new THREE.Mesh(ringGeo, ringMat);
  haloRing.position.y = 0.08;
  beaconGroup.add(haloRing);

  beaconGroup.position.set(STEP * 2, 0, STEP * 2);
  scene.add(beaconGroup);

  // --- PLAYER VEHICLE ---
  function buildPlayerCar() {
    const carGroup = new THREE.Group();
    const bodyMat = new THREE.MeshLambertMaterial({ color: STATE.carColor });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.7, 4.6), bodyMat);
    body.position.y = 0.65;
    carGroup.add(body);

    const cabinMat = new THREE.MeshLambertMaterial({ color: 0x111116 });
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 2.3), cabinMat);
    cabin.position.set(0, 1.25, -0.2);
    carGroup.add(cabin);

    const spoiler = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 0.5), new THREE.MeshBasicMaterial({ color: 0x050505 }));
    spoiler.position.set(0, 1.35, -2.1);
    carGroup.add(spoiler);

    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 8);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshBasicMaterial({ color: 0x222222 });

    const wheels = [];
    const wheelPos = [
      { x: -1.15, y: 0.42, z: 1.4, front: true },
      { x: 1.15, y: 0.42, z: 1.4, front: true },
      { x: -1.15, y: 0.42, z: -1.4, front: false },
      { x: 1.15, y: 0.42, z: -1.4, front: false }
    ];

    wheelPos.forEach(p => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(p.x, p.y, p.z);
      carGroup.add(w);
      wheels.push({ mesh: w, front: p.front });
    });

    const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 0.1), hlMat);
    hlL.position.set(-0.75, 0.65, 2.32);
    const hlR = hlL.clone();
    hlR.position.x = 0.75;
    carGroup.add(hlL, hlR);

    const tlMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
    const tl = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.16, 0.1), tlMat);
    tl.position.set(0, 0.68, -2.32);
    carGroup.add(tl);

    const underglowGeo = new THREE.PlaneGeometry(2.6, 4.8);
    underglowGeo.rotateX(-Math.PI / 2);
    const underglowMat = new THREE.MeshBasicMaterial({
      color: STATE.neonColor,
      transparent: true,
      opacity: 0.45
    });
    const underglow = new THREE.Mesh(underglowGeo, underglowMat);
    underglow.position.y = 0.05;
    carGroup.add(underglow);

    return { group: carGroup, wheels, bodyMat, underglowMat, tlMat };
  }

  const playerCar = buildPlayerCar();
  scene.add(playerCar.group);

  const PHYSICS = {
    x: 0,
    z: 0,
    rotY: 0,
    speed: 0,
    maxSpeed: 1.5,
    reverseMax: -0.5,
    accel: 0.025,
    brakeDecel: 0.05,
    naturalDecel: 0.012,
    steerAngle: 0,
    steerSpeed: 0.05,
    steerMax: 0.045,
    lateralVelocity: 0
  };

  // --- CIVILIAN TRAFFIC SYSTEM (CARS CRUSING THE STREETS) ---
  const trafficCars = [];
  const trafficColors = [0xffcc00, 0xffffff, 0x00ccff, 0xff3300, 0x222222, 0x00ff88, 0x9900ff];

  function createTrafficCar(initX, initZ, rotY, isSpecialTarget) {
    const group = new THREE.Group();
    const color = isSpecialTarget ? 0xffd700 : trafficColors[Math.floor(Math.random() * trafficColors.length)];

    const bodyMat = new THREE.MeshLambertMaterial({ color });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.75, 4.5), bodyMat);
    body.position.y = 0.65;
    group.add(body);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.65, 2.4), new THREE.MeshLambertMaterial({ color: 0x111116 }));
    cabin.position.set(0, 1.25, -0.1);
    group.add(cabin);

    // If taxi, add roof taxi light
    if (color === 0xffcc00 && !isSpecialTarget) {
      const taxiSign = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 0.3), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      taxiSign.position.set(0, 1.7, -0.1);
      group.add(taxiSign);
    }

    // If special target, add golden beacon on roof
    if (isSpecialTarget) {
      const halo = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.15, 8, 16), new THREE.MeshBasicMaterial({ color: 0xffd700 }));
      halo.rotation.x = Math.PI / 2;
      halo.position.y = 2.4;
      group.add(halo);
    }

    group.position.set(initX, 0, initZ);
    group.rotation.y = rotY;
    scene.add(group);

    trafficCars.push({
      mesh: group,
      x: initX,
      z: initZ,
      rotY: rotY,
      speed: 0.35 + Math.random() * 0.25,
      isSpecialTarget: !!isSpecialTarget,
      health: isSpecialTarget ? 100 : 30
    });
  }

  // Populate ambient traffic cars on street avenues
  for (let t = -3; t <= 3; t++) {
    const rx = t * STEP;
    createTrafficCar(rx + 4, -HALF_MAP + Math.random() * HALF_MAP * 2, 0, false);
    createTrafficCar(-HALF_MAP + Math.random() * HALF_MAP * 2, rx - 4, Math.PI / 2, false);
  }

  // --- POLICE SQUAD CARS ---
  const policeCars = [];
  function spawnPolice(spawnNearX, spawnNearZ) {
    if (policeCars.length >= 4) return;

    const pGroup = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.75, 4.6), new THREE.MeshLambertMaterial({ color: 0x111111 }));
    body.position.y = 0.65;
    pGroup.add(body);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 2.2), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    cabin.position.set(0, 1.25, -0.2);
    pGroup.add(cabin);

    const sirenMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.18, 0.3),
      new THREE.MeshBasicMaterial({ color: 0xff0033 })
    );
    sirenMesh.position.set(0, 1.65, -0.2);
    pGroup.add(sirenMesh);

    const angle = Math.random() * Math.PI * 2;
    const dist = 65;
    const posX = spawnNearX + Math.cos(angle) * dist;
    const posZ = spawnNearZ + Math.sin(angle) * dist;

    pGroup.position.set(posX, 0, posZ);
    scene.add(pGroup);

    policeCars.push({
      mesh: pGroup,
      sirenMesh,
      x: posX,
      z: posZ,
      rotY: angle,
      speed: 0,
      maxSpeed: 1.15 + STATE.wantedLevel * 0.08,
      flashTimer: 0,
      pinTime: 0
    });
  }

  // --- SKIDMARK POOL ---
  const MAX_SKIDS = 25;
  const skidPool = [];
  const skidMat = new THREE.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.5 });
  const sGeo = new THREE.PlaneGeometry(0.4, 1.2);
  sGeo.rotateX(-Math.PI / 2);

  for (let i = 0; i < MAX_SKIDS; i++) {
    const s = new THREE.Mesh(sGeo, skidMat);
    s.visible = false;
    scene.add(s);
    skidPool.push({ mesh: s, life: 0 });
  }
  let skidIdx = 0;

  function spawnSkid(x, z, rotY) {
    const item = skidPool[skidIdx];
    item.mesh.position.set(x, 0.03, z);
    item.mesh.rotation.y = rotY;
    item.mesh.visible = true;
    item.life = 120;
    skidIdx = (skidIdx + 1) % MAX_SKIDS;
  }

  // --- MISSION STORY PROGRESSION ENGINE ---
  const MISSIONS = {
    1: {
      title: "THE FIRST SCORE",
      instruction: "Drive to the glowing marker at Ocean Bank",
      beaconPos: { x: STEP * 2, z: STEP * 2 },
      reward: 5000,
      epilogue: "You secured the stolen diamond briefcase and outran the patrol squad! The Boss has promoted your rank."
    },
    2: {
      title: "GRAND THEFT CARTEL",
      instruction: "Hunt down and steal the Cartel Boss's Gold Supercar!",
      beaconPos: { x: -STEP * 2, z: STEP * 2 },
      reward: 10000,
      epilogue: "You hijacked the Cartel Boss's custom ride and recovered the encrypted PDA. You now run the district."
    },
    3: {
      title: "THE HARBOR GETAWAY",
      instruction: "Collect 3 contraband crates across the city & escape!",
      beaconPos: { x: 0, z: -HALF_MAP + 25 },
      reward: 25000,
      epilogue: "Incredible getaway! All contraband secured, 4-star military blockade bypassed! You are the King of Vice Outlaws!"
    }
  };

  function showStoryDialog(caller, msg, durationMs) {
    const box = document.getElementById('dialog-box');
    document.getElementById('dialog-caller').textContent = caller;
    document.getElementById('dialog-message').textContent = msg;
    box.classList.remove('hidden');

    setTimeout(() => {
      box.classList.add('hidden');
    }, durationMs || 5000);
  }

  function startLevel(lvl) {
    STATE.currentLevel = lvl;
    STATE.levelStage = 0;
    STATE.cratesCollected = 0;

    const data = MISSIONS[lvl] || MISSIONS[1];
    document.getElementById('mission-level-badge').textContent = 'LEVEL ' + lvl;
    document.getElementById('mission-name').textContent = data.title;
    document.getElementById('mission-instruction').textContent = data.instruction;

    // Reposition 3D Mission Beacon
    beaconGroup.position.set(data.beaconPos.x, 0, data.beaconPos.z);
    beaconGroup.visible = true;

    if (lvl === 1) {
      showStoryDialog('TONY "THE FIXER"', '"Welcome to Vice City, kid. Go to the bank alley and steal the diamond briefcase!"', 6000);
    } else if (lvl === 2) {
      showStoryDialog('TONY "THE FIXER"', '"Rival cartel boss is cruising in a Gold Supercar. Track it, ram it off the road, and take it!"', 6000);
      // Spawn golden cartel target car
      createTrafficCar(STEP, -STEP, Math.PI / 2, true);
    } else if (lvl === 3) {
      showStoryDialog('TONY "THE FIXER"', '"Feds are raiding the safehouses! Collect 3 hidden contraband crates and escape to the harbor!"', 6000);
    }
  }

  function completeLevel() {
    sound.playMissionSuccess();
    const data = MISSIONS[STATE.currentLevel];
    STATE.cash += data.reward;
    updateHUD(true);

    const modal = document.getElementById('level-complete-modal');
    document.getElementById('completed-level-name').textContent = data.title;
    document.getElementById('level-reward-val').textContent = '+$' + data.reward.toLocaleString();
    document.getElementById('level-epilogue').textContent = data.epilogue;
    modal.classList.remove('hidden');

    beaconGroup.visible = false;
    setWantedLevel(0);
    policeCars.forEach(p => scene.remove(p.mesh));
    policeCars.length = 0;
  }

  document.getElementById('next-level-btn').addEventListener('click', () => {
    document.getElementById('level-complete-modal').classList.add('hidden');
    const nextLvl = STATE.currentLevel >= 3 ? 1 : STATE.currentLevel + 1;
    startLevel(nextLvl);
  });

  // --- STUNT & DRIFT UI TRIGGER ---
  let stuntTimeout = null;
  function triggerStunt(title, amount) {
    STATE.cash += amount;
    sound.playCashJingle();
    updateHUD();

    const popup = document.getElementById('stunt-popup');
    const titleEl = document.getElementById('stunt-title');
    const cashEl = document.getElementById('stunt-cash');

    titleEl.textContent = title;
    cashEl.textContent = '+$' + amount;
    popup.classList.remove('hidden');

    if (stuntTimeout) clearTimeout(stuntTimeout);
    stuntTimeout = setTimeout(() => popup.classList.add('hidden'), 1600);
  }

  // --- WANTED LEVEL ---
  function setWantedLevel(stars) {
    if (stars === STATE.wantedLevel) return;
    STATE.wantedLevel = Math.max(0, Math.min(5, stars));
    updateWantedStars();

    while (policeCars.length < Math.min(4, STATE.wantedLevel)) {
      spawnPolice(PHYSICS.x, PHYSICS.z);
    }
  }

  function updateWantedStars() {
    const starEls = document.querySelectorAll('#wanted-stars .star');
    starEls.forEach((el, idx) => {
      if (idx < STATE.wantedLevel) {
        el.classList.add('active');
        if (STATE.isEvading) el.classList.add('flashing');
        else el.classList.remove('flashing');
      } else {
        el.classList.remove('active', 'flashing');
      }
    });

    const cooldownBanner = document.getElementById('cooldown-banner');
    if (STATE.isEvading && STATE.wantedLevel > 0) {
      cooldownBanner.classList.remove('hidden');
    } else {
      cooldownBanner.classList.add('hidden');
    }
  }

  // --- HUD UPDATE (THROTTLED) ---
  let lastHudUpdate = 0;
  function updateHUD(force) {
    const now = performance.now();
    if (!force && now - lastHudUpdate < 66) return;
    lastHudUpdate = now;

    document.getElementById('cash-display').textContent = String(Math.floor(STATE.cash)).padStart(7, '0');
    document.getElementById('health-bar').style.width = STATE.health + '%';
    document.getElementById('armor-bar').style.width = STATE.armor + '%';

    const speedMPH = Math.round(Math.abs(PHYSICS.speed) * 72);
    document.getElementById('speed-display').textContent = speedMPH;

    const gearEl = document.getElementById('gear-display');
    if (PHYSICS.speed < -0.05) gearEl.textContent = 'REV';
    else if (speedMPH === 0) gearEl.textContent = 'N';
    else if (speedMPH < 35) gearEl.textContent = '1ST';
    else if (speedMPH < 65) gearEl.textContent = '2ND';
    else if (speedMPH < 95) gearEl.textContent = '3RD';
    else gearEl.textContent = 'TOP';

    // Distance to mission beacon
    if (beaconGroup.visible) {
      const dx = beaconGroup.position.x - PHYSICS.x;
      const dz = beaconGroup.position.z - PHYSICS.z;
      const distM = Math.round(Math.sqrt(dx * dx + dz * dz));
      document.getElementById('mission-dist').textContent = distM + 'm';
    }
  }

  // --- RADAR / MINI-MAP ---
  const radarCanvas = document.getElementById('radar-canvas');
  const radarCtx = radarCanvas.getContext('2d');
  let lastRadarUpdate = 0;

  function drawRadar() {
    const now = performance.now();
    if (now - lastRadarUpdate < 45) return;
    lastRadarUpdate = now;

    radarCtx.clearRect(0, 0, 160, 160);
    const cx = 80;
    const cy = 80;
    const scale = 0.5;

    radarCtx.save();
    radarCtx.translate(cx, cy);
    radarCtx.rotate(-PHYSICS.rotY);

    // Simplified street lines
    radarCtx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
    radarCtx.lineWidth = 5;
    for (let r = -2; r <= 2; r++) {
      const coord = r * STEP;
      radarCtx.beginPath();
      radarCtx.moveTo((-coord + PHYSICS.x) * scale, -50);
      radarCtx.lineTo((-coord + PHYSICS.x) * scale, 50);
      radarCtx.stroke();
    }

    // Traffic blips (small grey dots)
    radarCtx.fillStyle = '#aaaaaa';
    trafficCars.forEach(tc => {
      const rx = (tc.x - PHYSICS.x) * scale;
      const rz = (tc.z - PHYSICS.z) * scale;
      radarCtx.beginPath();
      radarCtx.arc(rx, rz, 2, 0, Math.PI * 2);
      radarCtx.fill();
    });

    // Mission Beacon (Pulsing Gold Star)
    if (beaconGroup.visible) {
      const bx = (beaconGroup.position.x - PHYSICS.x) * scale;
      const bz = (beaconGroup.position.z - PHYSICS.z) * scale;
      radarCtx.fillStyle = '#ffd700';
      radarCtx.beginPath();
      radarCtx.arc(bx, bz, 5.5, 0, Math.PI * 2);
      radarCtx.fill();
    }

    // Police blips (flashing red)
    policeCars.forEach(cop => {
      const rx = (cop.x - PHYSICS.x) * scale;
      const rz = (cop.z - PHYSICS.z) * scale;
      radarCtx.fillStyle = '#ff0044';
      radarCtx.beginPath();
      radarCtx.arc(rx, rz, 4, 0, Math.PI * 2);
      radarCtx.fill();
    });

    radarCtx.restore();

    // Center player icon
    radarCtx.fillStyle = '#00f0ff';
    radarCtx.beginPath();
    radarCtx.moveTo(cx, cy - 7);
    radarCtx.lineTo(cx - 5, cy + 6);
    radarCtx.lineTo(cx + 5, cy + 6);
    radarCtx.closePath();
    radarCtx.fill();
  }

  // --- BUSTED / RESPAWN ---
  function triggerBusted() {
    if (STATE.busted) return;
    STATE.busted = true;
    sound.playCrash();
    document.getElementById('busted-screen').classList.remove('hidden');
    STATE.cash = Math.max(0, STATE.cash - 1000);
    updateHUD(true);
  }

  document.getElementById('respawn-btn').addEventListener('click', () => {
    STATE.busted = false;
    document.getElementById('busted-screen').classList.add('hidden');
    PHYSICS.x = 0;
    PHYSICS.z = 0;
    PHYSICS.speed = 0;
    PHYSICS.rotY = 0;
    STATE.health = 100;
    STATE.armor = 100;
    setWantedLevel(0);
    policeCars.forEach(p => scene.remove(p.mesh));
    policeCars.length = 0;
    updateHUD(true);
  });

  // --- UPDATE VEHICLE & TRAFFIC ---
  function updateVehicle() {
    if (STATE.busted) return;

    if (INPUT.gas) {
      PHYSICS.speed = Math.min(PHYSICS.maxSpeed, PHYSICS.speed + PHYSICS.accel);
    } else if (INPUT.brake) {
      if (PHYSICS.speed > 0.05) PHYSICS.speed = Math.max(0, PHYSICS.speed - PHYSICS.brakeDecel);
      else PHYSICS.speed = Math.max(PHYSICS.reverseMax, PHYSICS.speed - PHYSICS.accel * 0.7);
    } else {
      if (PHYSICS.speed > 0) PHYSICS.speed = Math.max(0, PHYSICS.speed - PHYSICS.naturalDecel);
      else if (PHYSICS.speed < 0) PHYSICS.speed = Math.min(0, PHYSICS.speed + PHYSICS.naturalDecel);
    }

    if (INPUT.left) {
      PHYSICS.steerAngle = Math.min(PHYSICS.steerMax, PHYSICS.steerAngle + PHYSICS.steerSpeed);
    } else if (INPUT.right) {
      PHYSICS.steerAngle = Math.max(-PHYSICS.steerMax, PHYSICS.steerAngle - PHYSICS.steerSpeed);
    } else {
      PHYSICS.steerAngle *= 0.75;
    }

    const speedFactor = (PHYSICS.speed / PHYSICS.maxSpeed);
    PHYSICS.rotY += PHYSICS.steerAngle * (PHYSICS.speed >= 0 ? 1 : -1) * (0.4 + Math.abs(speedFactor) * 0.8);

    // Drift mechanic
    const isDrifting = INPUT.drift && Math.abs(PHYSICS.speed) > 0.4 && Math.abs(PHYSICS.steerAngle) > 0.015;
    if (isDrifting) {
      PHYSICS.lateralVelocity = PHYSICS.steerAngle * PHYSICS.speed * 1.4;
      sound.playTireScreech();

      spawnSkid(PHYSICS.x, PHYSICS.z, PHYSICS.rotY);
      STATE.driftScore += 12;
      if (STATE.driftScore > 260) {
        triggerStunt('SICK DRIFT!', Math.min(800, STATE.driftScore));
        STATE.driftScore = 0;
      }
    } else {
      PHYSICS.lateralVelocity *= 0.8;
      STATE.driftScore = 0;
    }

    const nextX = PHYSICS.x + Math.sin(PHYSICS.rotY) * PHYSICS.speed + Math.cos(PHYSICS.rotY) * PHYSICS.lateralVelocity;
    const nextZ = PHYSICS.z + Math.cos(PHYSICS.rotY) * PHYSICS.speed - Math.sin(PHYSICS.rotY) * PHYSICS.lateralVelocity;

    // Building Collision
    const pad = 1.8;
    let collided = false;
    for (let i = 0; i < colliders.length; i++) {
      const c = colliders[i];
      if (nextX + pad > c.minX && nextX - pad < c.maxX &&
          nextZ + pad > c.minZ && nextZ - pad < c.maxZ) {
        collided = true;
        break;
      }
    }

    // Traffic Collision
    trafficCars.forEach(tc => {
      const dx = nextX - tc.x;
      const dz = nextZ - tc.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < 3.2) {
        collided = true;
        sound.playCrash();
        tc.speed = -tc.speed * 0.5;

        // If hitting a special cartel target car
        if (tc.isSpecialTarget && STATE.currentLevel === 2 && STATE.levelStage === 0) {
          tc.health -= 40;
          triggerStunt('TARGET HIT!', 500);
          if (tc.health <= 0) {
            STATE.levelStage = 1;
            playerCar.bodyMat.color.setHex(0xffd700); // Turned into gold car!
            setWantedLevel(3);
            showStoryDialog('TONY "THE FIXER"', '"CARTEL RIDE STOLEN! You got 3 stars on your tail! Deliver it to the Chop Shop Safehouse!"', 7000);
            document.getElementById('mission-instruction').textContent = 'Evade cops and deliver to Chop Shop Safehouse!';
            beaconGroup.position.set(-HALF_MAP + 30, 0, -HALF_MAP + 30);
            scene.remove(tc.mesh);
          }
        } else if (STATE.wantedLevel === 0 && Math.abs(PHYSICS.speed) > 0.4) {
          setWantedLevel(1); // Crashing into civilians alerts police
        }
      }
    });

    if (!collided) {
      PHYSICS.x = nextX;
      PHYSICS.z = nextZ;
    } else {
      PHYSICS.speed = -PHYSICS.speed * 0.35;
      sound.playCrash();
      if (Math.abs(PHYSICS.speed) > 0.25) {
        if (STATE.armor > 0) STATE.armor = Math.max(0, STATE.armor - 10);
        else STATE.health = Math.max(0, STATE.health - 10);
      }
    }

    playerCar.group.position.set(PHYSICS.x, 0, PHYSICS.z);
    playerCar.group.rotation.y = PHYSICS.rotY;

    playerCar.wheels.forEach(w => {
      w.mesh.rotation.x += PHYSICS.speed * 1.2;
      if (w.front) w.mesh.rotation.y = PHYSICS.steerAngle * 6;
    });

    sound.setEngineSpeed(Math.abs(PHYSICS.speed) / PHYSICS.maxSpeed);

    // --- MISSION BEACON TRIGGER CHECK ---
    if (beaconGroup.visible) {
      const bdx = beaconGroup.position.x - PHYSICS.x;
      const bdz = beaconGroup.position.z - PHYSICS.z;
      const distToBeacon = Math.sqrt(bdx * bdx + bdz * bdz);

      if (distToBeacon < 4.5) {
        // Handle Mission Events
        if (STATE.currentLevel === 1) {
          if (STATE.levelStage === 0) {
            // Picked up diamond case
            STATE.levelStage = 1;
            sound.playCashJingle();
            triggerStunt('DIAMOND CASE STOLEN!', 1000);
            setWantedLevel(2);
            showStoryDialog('TONY "THE FIXER"', '"You got the stones! 2 squad cars inbound! Shake the heat and deliver to Palm Motel!"', 7000);
            document.getElementById('mission-instruction').textContent = 'Evade police or reach the Palm Safehouse!';
            beaconGroup.position.set(-STEP * 2, 0, -STEP * 2);
          } else {
            // Reached Safehouse
            completeLevel();
          }
        } else if (STATE.currentLevel === 2) {
          if (STATE.levelStage === 1) {
            completeLevel();
          }
        } else if (STATE.currentLevel === 3) {
          STATE.cratesCollected++;
          sound.playCashJingle();
          triggerStunt('CONTRABAND CRATE ' + STATE.cratesCollected + '/3', 1500);

          if (STATE.cratesCollected === 1) {
            setWantedLevel(3);
            beaconGroup.position.set(HALF_MAP - 30, 0, HALF_MAP - 30);
            document.getElementById('mission-instruction').textContent = 'Collect Crate 2/3!';
          } else if (STATE.cratesCollected === 2) {
            setWantedLevel(4);
            beaconGroup.position.set(-HALF_MAP + 30, 0, HALF_MAP - 30);
            document.getElementById('mission-instruction').textContent = 'Collect Crate 3/3!';
          } else {
            // All collected, escape to harbor!
            document.getElementById('mission-instruction').textContent = 'ALL CRATES COLLECTED! ESCAPE TO THE HARBOR BOAT!';
            beaconGroup.position.set(0, 0, -HALF_MAP + 15);
            if (distToBeacon < 4.0 && STATE.cratesCollected >= 3) {
              completeLevel();
            }
          }
        }
      }
    }
  }

  // --- TRAFFIC UPDATE ---
  function updateTraffic() {
    trafficCars.forEach(tc => {
      tc.x += Math.sin(tc.rotY) * tc.speed;
      tc.z += Math.cos(tc.rotY) * tc.speed;

      // Wrap around city map bounds
      if (tc.x > HALF_MAP) tc.x = -HALF_MAP;
      if (tc.x < -HALF_MAP) tc.x = HALF_MAP;
      if (tc.z > HALF_MAP) tc.z = -HALF_MAP;
      if (tc.z < -HALF_MAP) tc.z = HALF_MAP;

      tc.mesh.position.set(tc.x, 0, tc.z);
    });
  }

  // --- POLICE UPDATE ---
  function updatePolice() {
    if (policeCars.length === 0) return;

    let closestDist = 9999;
    policeCars.forEach(cop => {
      cop.flashTimer += 0.2;
      cop.sirenMesh.material.color.setHex(Math.sin(cop.flashTimer) > 0 ? 0xff0033 : 0x0066ff);

      const dx = PHYSICS.x - cop.x;
      const dz = PHYSICS.z - cop.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < closestDist) closestDist = dist;

      const targetAngle = Math.atan2(dx, dz);
      let diff = targetAngle - cop.rotY;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;

      cop.rotY += Math.sign(diff) * Math.min(Math.abs(diff), 0.035);
      cop.speed = Math.min(cop.maxSpeed, cop.speed + 0.02);

      cop.x += Math.sin(cop.rotY) * cop.speed;
      cop.z += Math.cos(cop.rotY) * cop.speed;
      cop.mesh.position.set(cop.x, 0, cop.z);
      cop.mesh.rotation.y = cop.rotY;

      if (dist < 3.8) {
        cop.pinTime += 0.016;
        if (cop.pinTime > 2.5) triggerBusted();
      } else {
        cop.pinTime = Math.max(0, cop.pinTime - 0.02);
      }
    });

    if (closestDist > 65 && STATE.wantedLevel > 0) {
      if (!STATE.isEvading) {
        STATE.isEvading = true;
        STATE.evadeTimer = 0;
        updateWantedStars();
      }
      STATE.evadeTimer += 0.016;
      if (STATE.evadeTimer > 7.0) {
        setWantedLevel(0);
        STATE.isEvading = false;
        triggerStunt('POLICE EVADED!', 1200);
        policeCars.forEach(p => scene.remove(p.mesh));
        policeCars.length = 0;
        updateWantedStars();
      }
    } else if (STATE.isEvading) {
      STATE.isEvading = false;
      updateWantedStars();
    }
  }

  // --- CAMERA & BEACON ROTATION ---
  function updateCamera() {
    // Rotate 3D Mission Beacon diamond
    if (beaconGroup.visible) {
      diamondMesh.rotation.y += 0.04;
      diamondMesh.position.y = 3.5 + Math.sin(Date.now() * 0.004) * 0.6;
    }

    if (STATE.cameraMode === 0) {
      const targetCamX = PHYSICS.x - Math.sin(PHYSICS.rotY) * 10.5;
      const targetCamZ = PHYSICS.z - Math.cos(PHYSICS.rotY) * 10.5;
      camera.position.x += (targetCamX - camera.position.x) * 0.15;
      camera.position.y += (4.0 - camera.position.y) * 0.15;
      camera.position.z += (targetCamZ - camera.position.z) * 0.15;
      camera.lookAt(PHYSICS.x, 1.2, PHYSICS.z);
    } else if (STATE.cameraMode === 1) {
      const targetCamX = PHYSICS.x - Math.sin(PHYSICS.rotY) * 20.0;
      const targetCamZ = PHYSICS.z - Math.cos(PHYSICS.rotY) * 20.0;
      camera.position.x += (targetCamX - camera.position.x) * 0.1;
      camera.position.y += (11.0 - camera.position.y) * 0.1;
      camera.position.z += (targetCamZ - camera.position.z) * 0.1;
      camera.lookAt(PHYSICS.x, 1.0, PHYSICS.z);
    } else {
      camera.position.x += (PHYSICS.x - camera.position.x) * 0.2;
      camera.position.y = 44.0;
      camera.position.z += (PHYSICS.z - camera.position.z) * 0.2;
      camera.lookAt(PHYSICS.x, 0, PHYSICS.z);
    }
  }

  function updateSkids() {
    skidPool.forEach(s => {
      if (s.life > 0) {
        s.life--;
        if (s.life <= 0) s.mesh.visible = false;
      }
    });
  }

  // --- MAIN ANIMATION LOOP ---
  function animate() {
    requestAnimationFrame(animate);

    updateVehicle();
    updateTraffic();
    updatePolice();
    updateCamera();
    updateSkids();
    drawRadar();
    updateHUD();

    renderer.render(scene, camera);
  }

  // --- KEYBOARD LISTENERS ---
  window.addEventListener('keydown', (e) => {
    sound.init();
    switch(e.code) {
      case 'KeyW': case 'ArrowUp': INPUT.gas = true; break;
      case 'KeyS': case 'ArrowDown': INPUT.brake = true; break;
      case 'KeyA': case 'ArrowLeft': INPUT.left = true; break;
      case 'KeyD': case 'ArrowRight': INPUT.right = true; break;
      case 'Space': INPUT.drift = true; break;
      case 'KeyC': STATE.cameraMode = (STATE.cameraMode + 1) % 3; break;
      case 'KeyR':
        PHYSICS.speed = 0;
        PHYSICS.rotY = 0;
        playerCar.group.rotation.set(0, 0, 0);
        break;
      case 'KeyH': sound.playHorn(); break;
    }
  });

  window.addEventListener('keyup', (e) => {
    switch(e.code) {
      case 'KeyW': case 'ArrowUp': INPUT.gas = false; break;
      case 'KeyS': case 'ArrowDown': INPUT.brake = false; break;
      case 'KeyA': case 'ArrowLeft': INPUT.left = false; break;
      case 'KeyD': case 'ArrowRight': INPUT.right = false; break;
      case 'Space': INPUT.drift = false; break;
    }
  });

  function setupTouchBtn(btnId, inputKey) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      sound.init();
      INPUT[inputKey] = true;
    }, { passive: false });
    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      INPUT[inputKey] = false;
    }, { passive: false });
    btn.addEventListener('mousedown', () => { sound.init(); INPUT[inputKey] = true; });
    btn.addEventListener('mouseup', () => { INPUT[inputKey] = false; });
  }

  setupTouchBtn('btn-gas', 'gas');
  setupTouchBtn('btn-brake', 'brake');
  setupTouchBtn('btn-left', 'left');
  setupTouchBtn('btn-right', 'right');
  setupTouchBtn('btn-drift', 'drift');

  document.getElementById('cam-btn').addEventListener('click', () => {
    sound.init();
    STATE.cameraMode = (STATE.cameraMode + 1) % 3;
  });

  const radioBtn = document.getElementById('radio-btn');
  const radioStatus = document.getElementById('radio-status');
  radioBtn.addEventListener('click', () => {
    sound.init();
    const isPlaying = sound.toggleRadio();
    radioStatus.textContent = isPlaying ? 'SYNTHWAVE FM' : 'OFF';
  });

  const garageModal = document.getElementById('garage-modal');
  document.getElementById('close-garage-btn').addEventListener('click', () => {
    garageModal.classList.add('hidden');
  });
  document.querySelector('.game-logo').addEventListener('click', () => {
    garageModal.classList.remove('hidden');
  });

  document.querySelectorAll('.swatch').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const color = e.target.getAttribute('data-color');
      playerCar.bodyMat.color.setStyle(color);
    });
  });

  document.querySelectorAll('.swatch-neon').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const neon = e.target.getAttribute('data-neon');
      playerCar.underglowMat.color.setStyle(neon);
    });
  });

  document.getElementById('ad-cash-btn').addEventListener('click', () => {
    const btn = document.getElementById('ad-cash-btn');
    btn.textContent = '⏳ SIMULATING 3s REWARDED VIDEO AD...';
    btn.disabled = true;
    setTimeout(() => {
      STATE.cash += 5000;
      sound.playCashJingle();
      updateHUD(true);
      btn.textContent = '📺 WATCH AD: FREE +$5,000';
      btn.disabled = false;
      alert('🎉 Rewarded Ad Completed! +$5,000 Cash added.');
    }, 2000);
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Start Level 1 Story & Engine
  startLevel(1);
  updateHUD(true);
  animate();

})();
