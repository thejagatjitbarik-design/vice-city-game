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
    cratesCollected: 0,
    bombActive: false,
    bombCountdown: 4.0,
    lightningTimer: 0,
    traitorCar: null,
    isAdminAuthed: false,
    playerMode: 'CAR',
    currentWeaponIdx: 1,
    customWaypoint: null
  };

  const INPUT = {
    gas: false,
    brake: false,
    left: false,
    right: false,
    drift: false,
    sprint: false,
    jump: false
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
  // Sky-High Glowing Neon Light Pillar (Visible from anywhere across the city!)
  const pillarGeo = new THREE.CylinderGeometry(2.4, 2.4, 140, 16, 1, true);
  const pillarMat = new THREE.MeshBasicMaterial({
    color: 0xffd700,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide
  });
  const pillar = new THREE.Mesh(pillarGeo, pillarMat);
  pillar.position.y = 70;
  beaconGroup.add(pillar);

  // Rotating Floating Diamond Icon
  const diamondGeo = new THREE.OctahedronGeometry(2.2, 0);
  const diamondMat = new THREE.MeshBasicMaterial({ color: 0xffd700, wireframe: false });
  const diamondMesh = new THREE.Mesh(diamondGeo, diamondMat);
  diamondMesh.position.y = 4.5;
  beaconGroup.add(diamondMesh);

  // Ground Halo Rings
  const ringGeo = new THREE.RingGeometry(2.5, 3.4, 24);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xffd700, side: THREE.DoubleSide });
  const haloRing = new THREE.Mesh(ringGeo, ringMat);
  haloRing.position.y = 0.08;

  const outerRingGeo = new THREE.RingGeometry(4.2, 5.0, 24);
  outerRingGeo.rotateX(-Math.PI / 2);
  const outerHaloRing = new THREE.Mesh(outerRingGeo, ringMat);
  outerHaloRing.position.y = 0.08;
  beaconGroup.add(haloRing, outerHaloRing);

  beaconGroup.position.set(STEP * 2, 0, STEP * 2);
  scene.add(beaconGroup);

  // --- 3D GPS FLOATING NAVIGATION ARROW (POINTS DIRECTLY TO OBJECTIVES) ---
  const navArrowGroup = new THREE.Group();
  const arrowCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.7, 1.6, 4),
    new THREE.MeshBasicMaterial({ color: 0xffd700 })
  );
  arrowCone.rotation.x = Math.PI / 2;
  arrowCone.rotation.y = Math.PI / 4;
  arrowCone.position.z = 0.8;

  const arrowStem = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.2, 1.0),
    new THREE.MeshBasicMaterial({ color: 0xffaa00 })
  );
  arrowStem.position.z = -0.3;

  navArrowGroup.add(arrowCone, arrowStem);
  navArrowGroup.position.set(0, 3.8, 0);
  scene.add(navArrowGroup);

  // --- PEDESTRIANS & CYCLISTS (WITH KNOCKDOWN / TUMBLE PHYSICS) ---
  const pedestrians = [];
  const pedColors = [0x00d4ff, 0xff007f, 0x39ff14, 0xffbb00, 0xffffff, 0xbb55ff];

  function createPedestrian(x, z, isCyclist) {
    const pGroup = new THREE.Group();
    const color = pedColors[Math.floor(Math.random() * pedColors.length)];

    // Torso
    const torso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.28, 1.0, 6),
      new THREE.MeshLambertMaterial({ color })
    );
    torso.position.y = 1.1;
    pGroup.add(torso);

    // Head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 6, 6),
      new THREE.MeshLambertMaterial({ color: 0xffccaa })
    );
    head.position.y = 1.8;
    pGroup.add(head);

    if (isCyclist) {
      // 3D Bicycle
      const bikeGroup = new THREE.Group();
      const frameMat = new THREE.MeshBasicMaterial({ color: 0xff3300 });
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, 1.3), frameMat);
      frame.position.y = 0.5;

      const wheelMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
      const wFront = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 6, 10), wheelMat);
      wFront.position.set(0, 0.35, 0.65);
      const wBack = wFront.clone();
      wBack.position.z = -0.65;

      bikeGroup.add(frame, wFront, wBack);
      pGroup.add(bikeGroup);
    }

    pGroup.position.set(x, 0, z);
    scene.add(pGroup);

    pedestrians.push({
      mesh: pGroup,
      isCyclist,
      x,
      z,
      rotY: Math.random() * Math.PI * 2,
      speed: isCyclist ? 0.22 : 0.055,
      isFallen: false,
      fallTimer: 0
    });
  }

  // Populate sidewalks with pedestrians and cyclists
  for (let p = -3; p <= 3; p++) {
    const rx = p * STEP;
    createPedestrian(rx + BLOCK_SIZE / 2 + 2.5, -HALF_MAP + Math.random() * HALF_MAP * 2, false);
    createPedestrian(rx - BLOCK_SIZE / 2 - 2.5, -HALF_MAP + Math.random() * HALF_MAP * 2, false);
    createPedestrian(rx + 6, -HALF_MAP + Math.random() * HALF_MAP * 2, true); // Cyclist on road lane
  }

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
    accel: 0.024,
    brakeDecel: 0.05,
    naturalDecel: 0.012,
    steerAngle: 0,
    steerMax: 0.036,      // Responsive, smooth turning lock
    steerLerp: 0.18,      // Fast, smooth progressive response (guarantees Left/Right respond instantly)
    lateralVelocity: 0
  };

  // --- 3D ON-FOOT THIRD-PERSON PLAYER CHARACTER ---
  function buildPlayerPed() {
    const group = new THREE.Group();

    // Torso (Cyan/Pink Synthwave Hawaiian Shirt)
    const torsoMat = new THREE.MeshLambertMaterial({ color: 0x00f0ff });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.9, 0.42), torsoMat);
    torso.position.y = 1.35;
    group.add(torso);

    // Head
    const headMat = new THREE.MeshLambertMaterial({ color: 0xffcc99 });
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.45, 0.42), headMat);
    head.position.y = 1.95;
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.16, 0.46), new THREE.MeshLambertMaterial({ color: 0x221100 }));
    hair.position.y = 2.18;
    const glasses = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.12, 0.16), new THREE.MeshBasicMaterial({ color: 0x050505 }));
    glasses.position.set(0, 1.95, 0.2);
    group.add(head, hair, glasses);

    // Legs
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x181828 });
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.9, 0.32), pantsMat);
    legL.position.set(-0.2, 0.45, 0);
    const legR = legL.clone();
    legR.position.x = 0.2;
    group.add(legL, legR);

    // Arms
    const armMat = new THREE.MeshLambertMaterial({ color: 0xffcc99 });
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 0.24), armMat);
    armL.position.set(-0.48, 1.3, 0);
    const armR = armL.clone();
    armR.position.x = 0.48;
    group.add(armL, armR);

    group.visible = false; // Starts in driver seat
    return { group, torsoMat, legL, legR, armL, armR };
  }

  const playerPed = buildPlayerPed();
  scene.add(playerPed.group);

  const PED_PHYSICS = {
    x: 0,
    y: 0,
    z: 0,
    rotY: 0,
    speed: 0,
    vy: 0,
    isGrounded: true
  };

  // --- WEAPONS ARSENAL & COMBAT SYSTEM ---
  const WEAPONS_LIST = [
    { name: "FISTS", icon: "👊", ammo: "∞", dmg: 15, range: 3 },
    { name: "9MM PISTOL", icon: "🔫", ammo: 34, dmg: 32, range: 45 },
    { name: "TACTICAL SMG", icon: "💥", ammo: 90, dmg: 22, range: 50 },
    { name: "PUMP SHOTGUN", icon: "🔥", ammo: 16, dmg: 80, range: 25 }
  ];

  function updateWeaponUI() {
    const w = WEAPONS_LIST[STATE.currentWeaponIdx];
    const iconEl = document.getElementById('weapon-icon');
    const nameEl = document.getElementById('weapon-name');
    const ammoEl = document.getElementById('weapon-ammo');
    if (iconEl) iconEl.textContent = w.icon;
    if (nameEl) nameEl.textContent = w.name;
    if (ammoEl) ammoEl.textContent = w.ammo + ' / ∞';
  }

  function switchWeapon() {
    STATE.currentWeaponIdx = (STATE.currentWeaponIdx + 1) % WEAPONS_LIST.length;
    updateWeaponUI();
    sound.playCashJingle();
    triggerStunt(WEAPONS_LIST[STATE.currentWeaponIdx].name + ' EQUIPPED', 0);
  }

  function fireWeapon() {
    const w = WEAPONS_LIST[STATE.currentWeaponIdx];
    sound.playCrash(); // Recoil sound
    triggerCameraShake(0.35);

    const origin = (STATE.playerMode === 'CAR') ? PHYSICS : PED_PHYSICS;

    // Flash light
    const flash = new THREE.PointLight(0xffaa00, 3, 12);
    flash.position.set(origin.x, (origin.y || 0) + 1.5, origin.z);
    scene.add(flash);
    setTimeout(() => scene.remove(flash), 70);

    // Hit detection against pedestrians & police
    pedestrians.forEach(ped => {
      const dx = ped.x - origin.x;
      const dz = ped.z - origin.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < w.range && !ped.isFallen) {
        ped.isFallen = true;
        ped.fallTimer = 5.0;
        ped.mesh.rotation.z = Math.PI / 2;
        triggerStunt('💥 TARGET HIT! -' + w.dmg + ' HP', 150);
        if (STATE.wantedLevel === 0) setWantedLevel(1);
      }
    });
  }

  function togglePlayerMode() {
    if (STATE.playerMode === 'CAR') {
      STATE.playerMode = 'FOOT';
      PHYSICS.speed = 0;
      PED_PHYSICS.x = PHYSICS.x - Math.cos(PHYSICS.rotY) * 2.5;
      PED_PHYSICS.z = PHYSICS.z + Math.sin(PHYSICS.rotY) * 2.5;
      PED_PHYSICS.rotY = PHYSICS.rotY;
      playerPed.group.position.set(PED_PHYSICS.x, 0, PED_PHYSICS.z);
      playerPed.group.rotation.y = PED_PHYSICS.rotY;
      playerPed.group.visible = true;

      const vBtn = document.getElementById('vehicle-mode-btn');
      if (vBtn) vBtn.textContent = '🚗 CAR [F]';
      const touchF = document.getElementById('btn-touch-f');
      if (touchF) touchF.textContent = '🚗 CAR [F]';
      const ch = document.getElementById('crosshair');
      if (ch) ch.classList.remove('hidden');

      sound.playCrash();
      triggerStunt('ON FOOT: EXPLORE VICE CITY', 0);
    } else {
      const dx = PED_PHYSICS.x - PHYSICS.x;
      const dz = PED_PHYSICS.z - PHYSICS.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < 7.0) {
        STATE.playerMode = 'CAR';
        playerPed.group.visible = false;

        const vBtn = document.getElementById('vehicle-mode-btn');
        if (vBtn) vBtn.textContent = '🚶 FOOT [F]';
        const touchF = document.getElementById('btn-touch-f');
        if (touchF) touchF.textContent = '🚶 FOOT [F]';
        const ch = document.getElementById('crosshair');
        if (ch) ch.classList.add('hidden');

        sound.playCashJingle();
        triggerStunt('IN DRIVER SEAT', 0);
      } else {
        triggerStunt('TOO FAR FROM CAR!', 0);
      }
    }
    updateInteractionPrompt();
  }

  function updateInteractionPrompt() {
    const prompt = document.getElementById('interaction-prompt');
    const textEl = document.getElementById('interaction-text');
    if (!prompt || !textEl) return;

    if (STATE.playerMode === 'CAR') {
      prompt.classList.remove('hidden');
      textEl.textContent = 'EXIT VEHICLE';
    } else {
      const dx = PED_PHYSICS.x - PHYSICS.x;
      const dz = PED_PHYSICS.z - PHYSICS.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < 7.0) {
        prompt.classList.remove('hidden');
        textEl.textContent = 'ENTER VEHICLE';
      } else {
        prompt.classList.add('hidden');
      }
    }
  }

  function updateOnFootPlayer() {
    let moveForward = 0;
    let turn = 0;
    let sprintMult = INPUT.sprint ? 1.85 : 1.0;

    if (INPUT.gas) moveForward += 0.16 * sprintMult;
    if (INPUT.brake) moveForward -= 0.1 * sprintMult;
    if (INPUT.left) turn += 0.055;
    if (INPUT.right) turn -= 0.055;

    PED_PHYSICS.rotY += turn;
    PED_PHYSICS.speed = moveForward;

    // Jump
    if (INPUT.jump && PED_PHYSICS.isGrounded) {
      PED_PHYSICS.vy = 0.22;
      PED_PHYSICS.isGrounded = false;
    }

    if (!PED_PHYSICS.isGrounded) {
      PED_PHYSICS.vy -= 0.015;
      PED_PHYSICS.y += PED_PHYSICS.vy;
      if (PED_PHYSICS.y <= 0) {
        PED_PHYSICS.y = 0;
        PED_PHYSICS.vy = 0;
        PED_PHYSICS.isGrounded = true;
      }
    }

    PED_PHYSICS.x += Math.sin(PED_PHYSICS.rotY) * PED_PHYSICS.speed;
    PED_PHYSICS.z += Math.cos(PED_PHYSICS.rotY) * PED_PHYSICS.speed;

    PED_PHYSICS.x = Math.max(-HALF_MAP + 8, Math.min(HALF_MAP - 8, PED_PHYSICS.x));
    PED_PHYSICS.z = Math.max(-HALF_MAP + 8, Math.min(HALF_MAP - 8, PED_PHYSICS.z));

    playerPed.group.position.set(PED_PHYSICS.x, PED_PHYSICS.y, PED_PHYSICS.z);
    playerPed.group.rotation.y = PED_PHYSICS.rotY;

    if (Math.abs(moveForward) > 0.01) {
      const swing = Math.sin(Date.now() * 0.014 * sprintMult) * 0.65;
      playerPed.legL.rotation.x = swing;
      playerPed.legR.rotation.x = -swing;
      playerPed.armL.rotation.x = -swing;
      playerPed.armR.rotation.x = swing;
    } else {
      playerPed.legL.rotation.x = 0;
      playerPed.legR.rotation.x = 0;
      playerPed.armL.rotation.x = 0;
      playerPed.armR.rotation.x = 0;
    }

    updateInteractionPrompt();
  }

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

  // --- CAMERA SHAKE FX ---
  let camShakeAmount = 0;
  function triggerCameraShake(amount) {
    camShakeAmount = amount || 0.45;
  }

  // --- CHAPTER 3: CARTEL TRAITOR SUPERCAR BOSS ---
  function spawnTraitorCar() {
    if (STATE.traitorCar && STATE.traitorCar.mesh) {
      scene.remove(STATE.traitorCar.mesh);
      STATE.traitorCar = null;
    }

    const group = new THREE.Group();

    // High-spec gold supercar body
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0x664400,
      emissiveIntensity: 0.35
    });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.72, 4.6), bodyMat);
    body.position.y = 0.65;
    group.add(body);

    // Black cockpit / tinted glass
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.6, 2.2),
      new THREE.MeshLambertMaterial({ color: 0x050508 })
    );
    cabin.position.set(0, 1.25, -0.2);
    group.add(cabin);

    // Rear GT spoiler
    const spoilerWing = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.08, 0.5),
      new THREE.MeshLambertMaterial({ color: 0x111111 })
    );
    spoilerWing.position.set(0, 1.4, -2.1);
    const spoilerLegL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 0.12), new THREE.MeshLambertMaterial({ color: 0x111111 }));
    spoilerLegL.position.set(-0.8, 1.15, -2.1);
    const spoilerLegR = spoilerLegL.clone();
    spoilerLegR.position.x = 0.8;
    group.add(spoilerWing, spoilerLegL, spoilerLegR);

    // Cyan Underglow Light
    const underglow = new THREE.PointLight(0x00f0ff, 2.5, 9);
    underglow.position.set(0, 0.2, 0);
    group.add(underglow);

    // 3D FLOATING TARGET RETICLE ON ROOF
    const targetGroup = new THREE.Group();
    targetGroup.position.set(0, 3.4, 0);

    const reticleRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.14, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0xff0033 })
    );
    reticleRing.rotation.x = Math.PI / 2;

    const pointerCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.55, 1.1, 4),
      new THREE.MeshBasicMaterial({ color: 0xffd700 })
    );
    pointerCone.rotation.x = Math.PI; // point downwards at roof
    pointerCone.position.y = -0.3;

    targetGroup.add(reticleRing, pointerCone);
    group.add(targetGroup);

    // Spawn ~80m ahead of player along street avenues
    const spawnX = Math.min(HALF_MAP - 30, Math.max(-HALF_MAP + 30, Math.round((PHYSICS.x + 80) / STEP) * STEP));
    const spawnZ = Math.min(HALF_MAP - 30, Math.max(-HALF_MAP + 30, Math.round((PHYSICS.z - 60) / STEP) * STEP));

    group.position.set(spawnX, 0, spawnZ);
    scene.add(group);

    STATE.traitorCar = {
      mesh: group,
      targetGroup,
      x: spawnX,
      z: spawnZ,
      rotY: 0,
      speed: 0.28,
      health: 100,
      turnTimer: 3.5,
      ramCooldown: 0,
      wrecked: false
    };

    // Show HUD Banner
    const banner = document.getElementById('traitor-health-banner');
    if (banner) {
      banner.classList.remove('hidden');
      const hpFill = document.getElementById('traitor-hp-fill');
      if (hpFill) hpFill.style.width = '100%';
    }
  }

  function updateTraitorCar() {
    if (!STATE.traitorCar || STATE.currentLevel !== 3) return;
    const tc = STATE.traitorCar;

    // Animate floating target reticle
    if (tc.targetGroup && !tc.wrecked) {
      tc.targetGroup.rotation.y += 0.05;
      tc.targetGroup.position.y = 3.4 + Math.sin(Date.now() * 0.006) * 0.35;
    }

    if (tc.wrecked) return;

    // AI movement along street avenues
    tc.x += Math.sin(tc.rotY) * tc.speed;
    tc.z += Math.cos(tc.rotY) * tc.speed;

    tc.turnTimer -= 0.016;
    if (tc.turnTimer <= 0) {
      tc.turnTimer = 4.0 + Math.random() * 3.0;
      const turns = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
      tc.rotY = turns[Math.floor(Math.random() * turns.length)];
    }

    // Boundary wrap
    if (tc.x > HALF_MAP - 15) tc.rotY = -Math.PI / 2;
    if (tc.x < -HALF_MAP + 15) tc.rotY = Math.PI / 2;
    if (tc.z > HALF_MAP - 15) tc.rotY = Math.PI;
    if (tc.z < -HALF_MAP + 15) tc.rotY = 0;

    tc.mesh.position.set(tc.x, 0, tc.z);
    tc.mesh.rotation.y = tc.rotY;

    // RAMMING / COLLISION CHECK WITH PLAYER CAR
    if (tc.ramCooldown > 0) tc.ramCooldown -= 0.016;

    const dx = PHYSICS.x - tc.x;
    const dz = PHYSICS.z - tc.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 4.0 && tc.ramCooldown <= 0) {
      const playerSpeed = Math.abs(PHYSICS.speed);
      if (playerSpeed > 0.14) {
        tc.ramCooldown = 0.75; // Hit debounce
        tc.health = Math.max(0, tc.health - 34);

        sound.playCrash();
        triggerCameraShake(0.65);

        // Physical knockback displacement
        tc.x += Math.sin(PHYSICS.rotY) * 8.0;
        tc.z += Math.cos(PHYSICS.rotY) * 8.0;
        tc.rotY += (Math.random() - 0.5) * 1.5;
        tc.mesh.position.set(tc.x, 0, tc.z);
        tc.mesh.rotation.y = tc.rotY;

        // Player vehicle recoil
        PHYSICS.speed *= -0.3;

        // Update HUD Health Bar
        const hpPercent = tc.health;
        const hpFill = document.getElementById('traitor-hp-fill');
        if (hpFill) hpFill.style.width = hpPercent + '%';

        if (tc.health > 0) {
          triggerStunt(`💥 DIRECT RAM! TRAITOR HP: ${hpPercent}%`, 1000);
          showStoryDialog('TONY "THE FIXER"', `"Great hit! His armor is buckling! Ram him ${tc.health <= 34 ? 'ONE MORE TIME' : 'AGAIN'}!"`, 3500);
        } else {
          // Traitor car wrecked!
          tc.wrecked = true;
          tc.speed = 0;
          if (tc.targetGroup) tc.targetGroup.visible = false;
          triggerStunt('💥 TRAITOR SUPERCAR WRECKED!', 5000);
          sound.playMissionSuccess();

          // Spawn fire light on wreck
          const wreckFire = new THREE.PointLight(0xff3300, 4, 15);
          wreckFire.position.set(0, 1.5, 0);
          tc.mesh.add(wreckFire);

          // Spawn Golden Briefcase Beacon right at wreck
          STATE.levelStage = 1;
          beaconGroup.position.set(tc.x, 0, tc.z);
          beaconGroup.visible = true;

          const banner = document.getElementById('traitor-health-banner');
          if (banner) banner.classList.add('hidden');
          document.getElementById('mission-instruction').textContent = 'Drive into the dropped Golden Briefcase to extract the Encrypted Drive!';
          showStoryDialog('TONY "THE FIXER"', '"TRAITOR DOWN! Drive into the golden briefcase near his wreckage to secure the encrypted syndicate drive!"', 8000);
        }
      }
    }
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

  // --- 7-CHAPTER STORYLINE MISSION ENGINE ---
  const MISSIONS = {
    1: {
      title: "THE VICE VAULT HEIST",
      instruction: "Drive to the glowing marker at Ocean Bank to steal the diamonds",
      beaconPos: { x: STEP * 2, z: STEP * 2 },
      reward: 5000,
      epilogue: "You secured the diamond briefcase and outran the patrol squad! Tony has promoted your rank."
    },
    2: {
      title: "SPEED BOMB THRILLER",
      instruction: "MAINTAIN SPEED OVER 45 MPH! Race to the Marina defusal ring!",
      beaconPos: { x: -STEP * 2, z: STEP * 2 },
      reward: 12000,
      epilogue: "INCREDIBLE ESCAPE! The Marina bomb squad snipped the detonator wire! You survived the Speed Bomb!"
    },
    3: {
      title: "THUNDERSTORM BETRAYAL",
      instruction: "Locate and ram the Cartel Traitor's Gold Supercar in the storm!",
      beaconPos: { x: -STEP * 2, z: -STEP * 2 },
      reward: 18000,
      epilogue: "Traitor neutralized in the storm! You recovered the Syndicate's encrypted master drive!"
    },
    4: {
      title: "HARBOR CONTRABAND SMUGGLE",
      instruction: "Infiltrate Cargo Docks & secure contraband shipment!",
      beaconPos: { x: STEP * 2, z: -STEP * 2 },
      reward: 22000,
      epilogue: "Contraband weapons secured! You broke through the dock security net!"
    },
    5: {
      title: "EXPANDING THE EMPIRE",
      instruction: "Defend Benny's Chop Shop from rival gang drive-by attack!",
      beaconPos: { x: -STEP, z: -STEP },
      reward: 28000,
      epilogue: "Rival cartel repelled! Chop Shop is now generating passive income for your empire!"
    },
    6: {
      title: "CENTRAL BANK MEGA-HEIST",
      instruction: "Drill subterranean vault at Downtown Central Bank & escape SWAT net!",
      beaconPos: { x: 0, z: STEP * 2 },
      reward: 40000,
      epilogue: "SUBTERRANEAN DRILL COMPLETE! You cracked the impenetrable Vice Central vault!"
    },
    7: {
      title: "THE APEX FLIGHT ESCAPE",
      instruction: "5-STAR MILITARY LOCKDOWN! Race to airport runway and escape on the private jet!",
      beaconPos: { x: 0, z: -HALF_MAP + 20 },
      reward: 60000,
      epilogue: "MASTER OUTLAW OF VICE CITY! You evaded tanks and escaped to international waters as the ultimate boss!"
    }
  };

  let storyDialogTimeout = null;
  function showStoryDialog(caller, msg, durationMs) {
    const box = document.getElementById('dialog-box');
    document.getElementById('dialog-caller').textContent = caller;
    document.getElementById('dialog-message').textContent = msg;
    box.classList.remove('hidden');

    if (storyDialogTimeout) clearTimeout(storyDialogTimeout);
    storyDialogTimeout = setTimeout(() => {
      box.classList.add('hidden');
    }, durationMs || 6500);
  }

  // Dismiss Story Dialog on Close Button Click
  const closeDialogBtn = document.getElementById('close-dialog-btn');
  if (closeDialogBtn) {
    closeDialogBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('dialog-box').classList.add('hidden');
      if (storyDialogTimeout) clearTimeout(storyDialogTimeout);
    });
  }

  function startLevel(lvl) {
    STATE.currentLevel = lvl;
    STATE.levelStage = 0;
    STATE.cratesCollected = 0;
    STATE.bombActive = false;
    document.getElementById('bomb-banner').classList.add('hidden');
    const traitorBanner = document.getElementById('traitor-health-banner');
    if (traitorBanner) traitorBanner.classList.add('hidden');

    if (STATE.traitorCar && STATE.traitorCar.mesh) {
      scene.remove(STATE.traitorCar.mesh);
      STATE.traitorCar = null;
    }

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
      // Speed Bomb Thriller!
      STATE.bombActive = true;
      STATE.bombCountdown = 4.0;
      showStoryDialog('TONY "THE FIXER"', '"⚠️ CODE RED! Rival syndicate rigged your chassis with a SPEED BOMB! Keep speed ABOVE 45 MPH or it BLOWS! Race to Marina defusal!"', 7500);
    } else if (lvl === 3) {
      spawnTraitorCar();
      beaconGroup.visible = false; // GPS will point dynamically to moving traitor car!
      showStoryDialog('TONY "THE FIXER"', '"CARTEL TRAITOR ON THE RUN! Follow the 3D GPS navigation arrow directly to his Gold Supercar, and ram him off the road!"', 7500);
    } else if (lvl === 4) {
      showStoryDialog('TONY "THE FIXER"', '"Cargo docks have incoming contraband. Drive to the glowing beacon at the docks before the coast guard moves in!"', 7000);
      setWantedLevel(3);
    } else if (lvl === 5) {
      showStoryDialog('BENNY "CHOP SHOP"', '"Rival cartel is raiding my garage! Rush over to the Chop Shop marker and defend our territory!"', 7000);
      setWantedLevel(3);
    } else if (lvl === 6) {
      showStoryDialog('TONY "THE FIXER"', '"The big score! Central Bank subterranean vault. High-speed drill armed! SWAT is inbound!"', 8000);
      setWantedLevel(4);
    } else if (lvl === 7) {
      showStoryDialog('TONY "THE FIXER"', '"FINAL APEX SCORE! 5-star military lockdown! Race to the airport runway and escape on the private jet!"', 8000);
      setWantedLevel(5);
    }
  }

  function completeLevel() {
    STATE.bombActive = false;
    document.getElementById('bomb-banner').classList.add('hidden');
    const traitorBanner = document.getElementById('traitor-health-banner');
    if (traitorBanner) traitorBanner.classList.add('hidden');

    if (STATE.traitorCar && STATE.traitorCar.mesh) {
      scene.remove(STATE.traitorCar.mesh);
      STATE.traitorCar = null;
    }

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
    const nextLvl = STATE.currentLevel >= 7 ? 1 : STATE.currentLevel + 1;
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

    // Distance to mission beacon or moving traitor target
    if (STATE.currentLevel === 3 && STATE.traitorCar && !STATE.traitorCar.wrecked) {
      const dx = STATE.traitorCar.x - PHYSICS.x;
      const dz = STATE.traitorCar.z - PHYSICS.z;
      const distM = Math.round(Math.sqrt(dx * dx + dz * dz));
      document.getElementById('mission-dist').textContent = distM + 'm';
      const traitorDistEl = document.getElementById('traitor-dist');
      if (traitorDistEl) traitorDistEl.textContent = distM + 'm';
    } else if (beaconGroup.visible) {
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

    // Chapter 3: Cartel Traitor Target Blip (Pulsing Gold & Red Target)
    if (STATE.currentLevel === 3 && STATE.traitorCar && !STATE.traitorCar.wrecked) {
      const tx = (STATE.traitorCar.x - PHYSICS.x) * scale;
      const tz = (STATE.traitorCar.z - PHYSICS.z) * scale;
      radarCtx.fillStyle = '#ffd700';
      radarCtx.beginPath();
      radarCtx.arc(tx, tz, 5.5, 0, Math.PI * 2);
      radarCtx.fill();
      radarCtx.strokeStyle = '#ff0055';
      radarCtx.lineWidth = 2;
      radarCtx.stroke();
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

    if (STATE.playerMode === 'FOOT') {
      updateOnFootPlayer();
      return;
    }

    // Responsive Gas & Reverse Transmission
    if (INPUT.gas) {
      if (PHYSICS.speed < -0.05) {
        PHYSICS.speed = Math.min(0, PHYSICS.speed + PHYSICS.brakeDecel * 1.5); // Fast brake out of reverse
      } else {
        PHYSICS.speed = Math.min(PHYSICS.maxSpeed, PHYSICS.speed + PHYSICS.accel);
      }
    } else if (INPUT.brake) {
      if (PHYSICS.speed > 0.05) {
        PHYSICS.speed = Math.max(0, PHYSICS.speed - PHYSICS.brakeDecel); // Brake forward drive
      } else {
        // High reverse torque to easily back out of crashes
        PHYSICS.speed = Math.max(PHYSICS.reverseMax, PHYSICS.speed - PHYSICS.accel * 1.6);
      }
    } else {
      if (PHYSICS.speed > 0) PHYSICS.speed = Math.max(0, PHYSICS.speed - PHYSICS.naturalDecel);
      else if (PHYSICS.speed < 0) PHYSICS.speed = Math.min(0, PHYSICS.speed + PHYSICS.naturalDecel * 1.5);
    }

    // Responsive, Smooth Progressive Steering (Guaranteed to work under all speeds)
    const targetSteer = INPUT.left ? PHYSICS.steerMax : (INPUT.right ? -PHYSICS.steerMax : 0);
    PHYSICS.steerAngle += (targetSteer - PHYSICS.steerAngle) * PHYSICS.steerLerp;

    const isReversing = PHYSICS.speed < -0.05;
    const turnDirection = isReversing ? -1 : 1;
    // Guaranteed turning response: 1.35 base multiplier + extra responsiveness as speed picks up
    const turnSensitivity = 1.35 + Math.min(0.65, Math.abs(PHYSICS.speed) / PHYSICS.maxSpeed);
    PHYSICS.rotY += PHYSICS.steerAngle * turnDirection * turnSensitivity;

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

    // Proposed next position
    let moveX = Math.sin(PHYSICS.rotY) * PHYSICS.speed + Math.cos(PHYSICS.rotY) * PHYSICS.lateralVelocity;
    let moveZ = Math.cos(PHYSICS.rotY) * PHYSICS.speed - Math.sin(PHYSICS.rotY) * PHYSICS.lateralVelocity;

    let targetX = PHYSICS.x + moveX;
    let targetZ = PHYSICS.z + moveZ;

    // Building Collision with Push-Out (Prevents getting stuck forever!)
    const carRadius = 1.6;
    for (let i = 0; i < colliders.length; i++) {
      const c = colliders[i];
      const closestX = Math.max(c.minX, Math.min(targetX, c.maxX));
      const closestZ = Math.max(c.minZ, Math.min(targetZ, c.maxZ));

      const dx = targetX - closestX;
      const dz = targetZ - closestZ;
      const distSq = dx * dx + dz * dz;

      if (distSq < carRadius * carRadius) {
        const dist = Math.sqrt(distSq);
        let nx = 0;
        let nz = 0;

        if (dist > 0.001) {
          nx = dx / dist;
          nz = dz / dist;
        } else {
          // Centered inside collider, push out towards nearest edge
          const boxCenterX = (c.minX + c.maxX) / 2;
          const boxCenterZ = (c.minZ + c.maxZ) / 2;
          nx = Math.sign(PHYSICS.x - boxCenterX) || 1;
          nz = Math.sign(PHYSICS.z - boxCenterZ) || 0;
        }

        // Push safely outside obstacle
        const penetration = carRadius - dist + 0.18;
        targetX += nx * penetration;
        targetZ += nz * penetration;

        // Bounce speed slightly and trigger crash effects
        if (Math.abs(PHYSICS.speed) > 0.25) {
          sound.playCrash();
          if (STATE.armor > 0) STATE.armor = Math.max(0, STATE.armor - 8);
          else STATE.health = Math.max(0, STATE.health - 8);
        }
        PHYSICS.speed = -PHYSICS.speed * 0.25;
      }
    }

    // Traffic Collision with Mutual Push-Out
    trafficCars.forEach(tc => {
      const dx = targetX - tc.x;
      const dz = targetZ - tc.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const minDist = 3.2;

      if (dist < minDist) {
        const overlap = minDist - dist + 0.15;
        const nx = dx / (dist || 1);
        const nz = dz / (dist || 1);

        targetX += nx * overlap * 0.55;
        targetZ += nz * overlap * 0.55;
        tc.x -= nx * overlap * 0.55;
        tc.z -= nz * overlap * 0.55;

        sound.playCrash();
        PHYSICS.speed = -PHYSICS.speed * 0.25;
        tc.speed = -tc.speed * 0.4;

        if (tc.isSpecialTarget && STATE.currentLevel === 2 && STATE.levelStage === 0) {
          tc.health -= 40;
          triggerStunt('TARGET HIT!', 500);
          if (tc.health <= 0) {
            STATE.levelStage = 1;
            playerCar.bodyMat.color.setHex(0xffd700);
            setWantedLevel(3);
            showStoryDialog('TONY "THE FIXER"', '"CARTEL RIDE STOLEN! You got 3 stars on your tail! Deliver it to the Chop Shop Safehouse!"', 7000);
            document.getElementById('mission-instruction').textContent = 'Evade cops and deliver to Chop Shop Safehouse!';
            beaconGroup.position.set(-HALF_MAP + 30, 0, -HALF_MAP + 30);
            scene.remove(tc.mesh);
          }
        } else if (STATE.wantedLevel === 0 && Math.abs(PHYSICS.speed) > 0.4) {
          setWantedLevel(1);
        }
      }
    });

    // Apply resolved position
    PHYSICS.x = targetX;
    PHYSICS.z = targetZ;

    playerCar.group.position.set(PHYSICS.x, 0, PHYSICS.z);
    playerCar.group.rotation.y = PHYSICS.rotY;

    playerCar.wheels.forEach(w => {
      w.mesh.rotation.x += PHYSICS.speed * 1.2;
      if (w.front) w.mesh.rotation.y = PHYSICS.steerAngle * 6;
    });

    sound.setEngineSpeed(Math.abs(PHYSICS.speed) / PHYSICS.maxSpeed);

    // --- SPEED BOMB THRILLER MONITOR (CHAPTER 2) ---
    if (STATE.bombActive) {
      const currentMPH = Math.abs(PHYSICS.speed) * 72;
      const bombBanner = document.getElementById('bomb-banner');
      const countdownEl = document.getElementById('bomb-countdown');
      bombBanner.classList.remove('hidden');

      if (currentMPH < 45) {
        STATE.bombCountdown -= 0.016;
        countdownEl.textContent = Math.max(0, STATE.bombCountdown).toFixed(1) + 's';
        countdownEl.style.color = '#ff0033';

        if (STATE.bombCountdown <= 0) {
          STATE.bombActive = false;
          bombBanner.classList.add('hidden');
          triggerBusted();
          document.getElementById('death-title').textContent = 'DETONATED';
          document.getElementById('death-subtitle').textContent = 'Speed dropped below 45 MPH! The bomb exploded.';
        }
      } else {
        STATE.bombCountdown = Math.min(4.0, STATE.bombCountdown + 0.025);
        countdownEl.textContent = 'SAFE (' + Math.round(currentMPH) + ' MPH)';
        countdownEl.style.color = '#39ff14';
      }
    } else {
      document.getElementById('bomb-banner').classList.add('hidden');
    }

    // --- MISSION BEACON TRIGGER CHECK ---
    if (beaconGroup.visible) {
      const bdx = beaconGroup.position.x - PHYSICS.x;
      const bdz = beaconGroup.position.z - PHYSICS.z;
      const distToBeacon = Math.sqrt(bdx * bdx + bdz * bdz);

      if (distToBeacon < 6.0) {
        if (STATE.currentLevel === 1) {
          if (STATE.levelStage === 0) {
            STATE.levelStage = 1;
            sound.playCashJingle();
            triggerStunt('DIAMOND CASE STOLEN!', 1000);
            setWantedLevel(2);
            showStoryDialog('TONY "THE FIXER"', '"You got the diamonds! 2 squad cars inbound! Follow the golden GPS arrow to the Palm Motel Safehouse!"', 7000);
            document.getElementById('mission-instruction').textContent = 'Evade police & follow the GPS arrow to the Palm Motel Safehouse!';
            beaconGroup.position.set(-STEP * 2, 0, -STEP * 2);
          } else {
            completeLevel();
          }
        } else if (STATE.currentLevel === 2) {
          // Speed Bomb Defused at Marina!
          STATE.bombActive = false;
          triggerStunt('BOMB DEFUSED!', 3000);
          completeLevel();
        } else if (STATE.currentLevel === 3) {
          if (STATE.levelStage === 1) {
            completeLevel();
          }
        } else if (STATE.currentLevel === 4) {
          triggerStunt('CONTRABAND SHIPMENT SECURED!', 2000);
          completeLevel();
        } else if (STATE.currentLevel === 5) {
          triggerStunt('CHOP SHOP DEFENDED! REVENUE ACTIVE!', 3000);
          completeLevel();
        } else if (STATE.currentLevel === 6) {
          triggerStunt('CENTRAL VAULT CRACKED! $40,000!', 5000);
          completeLevel();
        } else if (STATE.currentLevel === 7) {
          triggerStunt('AIRPORT JET ESCAPE! APEX MASTER OUTLAW!', 10000);
          completeLevel();
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

  // --- PEDESTRIAN & CYCLIST UPDATE (KNOCKDOWN / WIPEOUT PHYSICS) ---
  function updatePedestrians() {
    pedestrians.forEach(ped => {
      if (ped.isFallen) {
        ped.fallTimer -= 0.016;
        if (ped.fallTimer <= 0) {
          ped.isFallen = false;
          ped.mesh.rotation.z = 0;
          ped.mesh.position.y = 0;
          ped.speed = 0.08; // Run away safely after standing up
        }
        return;
      }

      ped.x += Math.sin(ped.rotY) * ped.speed;
      ped.z += Math.cos(ped.rotY) * ped.speed;

      if (ped.x > HALF_MAP) ped.x = -HALF_MAP;
      if (ped.x < -HALF_MAP) ped.x = HALF_MAP;
      if (ped.z > HALF_MAP) ped.z = -HALF_MAP;
      if (ped.z < -HALF_MAP) ped.z = HALF_MAP;

      ped.mesh.position.set(ped.x, 0, ped.z);
      ped.mesh.rotation.y = ped.rotY;

      // Check collision with player car
      const dx = PHYSICS.x - ped.x;
      const dz = PHYSICS.z - ped.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < 2.4 && Math.abs(PHYSICS.speed) > 0.12) {
        ped.isFallen = true;
        ped.fallTimer = 4.5;
        sound.playCrash();

        // Tumble rotation onto the pavement
        ped.mesh.rotation.z = (Math.PI / 2) * (Math.random() > 0.5 ? 1 : -1);
        ped.mesh.position.y = 0.22;

        // Knockback displacement
        ped.x += Math.sin(PHYSICS.rotY) * 3.2;
        ped.z += Math.cos(PHYSICS.rotY) * 3.2;
        ped.mesh.position.set(ped.x, 0.22, ped.z);

        if (ped.isCyclist) {
          triggerStunt('BICYCLE WIPEOUT!', 250);
          sound.playHorn();
        } else {
          triggerStunt('PEDESTRIAN KNOCKDOWN!', 150);
        }

        if (STATE.wantedLevel === 0) {
          setWantedLevel(1);
        }
      }
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

    // Dynamic 3D GPS Guidance Arrow (Points to custom waypoint, active traitor, or mission beacon)
    const activeTarget = STATE.customWaypoint
      ? STATE.customWaypoint
      : ((STATE.currentLevel === 3 && STATE.traitorCar && !STATE.traitorCar.wrecked)
        ? STATE.traitorCar
        : (beaconGroup.visible ? beaconGroup.position : null));

    const originPos = (STATE.playerMode === 'FOOT') ? PED_PHYSICS : PHYSICS;

    if (activeTarget) {
      navArrowGroup.visible = true;
      navArrowGroup.position.set(originPos.x, (originPos.y || 0) + 3.8 + Math.sin(Date.now() * 0.005) * 0.25, originPos.z);
      const targetAngle = Math.atan2(activeTarget.x - originPos.x, activeTarget.z - originPos.z);
      navArrowGroup.rotation.y = targetAngle;
    } else {
      navArrowGroup.visible = false;
    }

    if (STATE.playerMode === 'FOOT') {
      // Third-person smooth on-foot chase camera
      const targetCamX = PED_PHYSICS.x - Math.sin(PED_PHYSICS.rotY) * 5.2;
      const targetCamZ = PED_PHYSICS.z - Math.cos(PED_PHYSICS.rotY) * 5.2;
      camera.position.x += (targetCamX - camera.position.x) * 0.18;
      camera.position.y += (PED_PHYSICS.y + 2.8 - camera.position.y) * 0.18;
      camera.position.z += (targetCamZ - camera.position.z) * 0.18;
      camera.lookAt(PED_PHYSICS.x, PED_PHYSICS.y + 1.5, PED_PHYSICS.z);
    } else if (STATE.cameraMode === 0) {
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

    // Apply Camera Shake Impulse
    if (camShakeAmount > 0) {
      camera.position.x += (Math.random() - 0.5) * camShakeAmount;
      camera.position.y += (Math.random() - 0.5) * camShakeAmount;
      camera.position.z += (Math.random() - 0.5) * camShakeAmount;
      camShakeAmount *= 0.88;
      if (camShakeAmount < 0.01) camShakeAmount = 0;
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

    // Chapter 3: Thunderstorm Lightning Thriller
    if (STATE.currentLevel === 3) {
      STATE.lightningTimer += 0.016;
      if (STATE.lightningTimer > 3.5 && Math.random() < 0.035) {
        STATE.lightningTimer = 0;
        scene.background.setHex(0xaae8ff);
        setTimeout(() => scene.background.setHex(0x0e0618), 75);
        sound.playCrash();
      }
    }

    updateVehicle();
    updateTraffic();
    updateTraitorCar();
    updatePedestrians();
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
      case 'Space': INPUT.drift = true; INPUT.jump = true; break;
      case 'ShiftLeft': case 'ShiftRight': INPUT.sprint = true; break;
      case 'KeyF': togglePlayerMode(); break;
      case 'KeyM': openMapModal(); break;
      case 'KeyP': togglePhone(); break;
      case 'Tab': e.preventDefault(); switchWeapon(); break;
      case 'KeyC': STATE.cameraMode = (STATE.cameraMode + 1) % 3; break;
      case 'KeyR': recoverCar(); break;
      case 'KeyH': sound.playHorn(); break;
    }
  });

  window.addEventListener('keyup', (e) => {
    switch(e.code) {
      case 'KeyW': case 'ArrowUp': INPUT.gas = false; break;
      case 'KeyS': case 'ArrowDown': INPUT.brake = false; break;
      case 'KeyA': case 'ArrowLeft': INPUT.left = false; break;
      case 'KeyD': case 'ArrowRight': INPUT.right = false; break;
      case 'Space': INPUT.drift = false; INPUT.jump = false; break;
      case 'ShiftLeft': case 'ShiftRight': INPUT.sprint = false; break;
    }
  });

  // Weapon fire on mouse click
  window.addEventListener('mousedown', (e) => {
    if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT' && !e.target.closest('.modal') && !e.target.closest('.phone-device')) {
      fireWeapon();
    }
  });

  function setupTouchBtn(btnId, inputKey) {
    const btn = document.getElementById(btnId);
    if (!btn) return;

    const startPress = (e) => {
      if (e) e.preventDefault();
      sound.init();
      INPUT[inputKey] = true;
      btn.classList.add('pressed');
    };

    const endPress = (e) => {
      if (e) e.preventDefault();
      INPUT[inputKey] = false;
      btn.classList.remove('pressed');
    };

    btn.addEventListener('touchstart', startPress, { passive: false });
    btn.addEventListener('touchend', endPress, { passive: false });
    btn.addEventListener('touchcancel', endPress, { passive: false });
    btn.addEventListener('mousedown', startPress);
    btn.addEventListener('mouseup', endPress);
    btn.addEventListener('mouseleave', endPress);
  }

  setupTouchBtn('btn-gas', 'gas');
  setupTouchBtn('btn-brake', 'brake');
  setupTouchBtn('btn-left', 'left');
  setupTouchBtn('btn-right', 'right');
  setupTouchBtn('btn-drift', 'drift');

  function recoverCar() {
    sound.init();
    // Snap to nearest open road intersection
    const nearestRoadX = Math.round(PHYSICS.x / STEP) * STEP;
    const nearestRoadZ = Math.round(PHYSICS.z / STEP) * STEP;
    PHYSICS.x = nearestRoadX;
    PHYSICS.z = nearestRoadZ;
    PHYSICS.speed = 0;
    PHYSICS.lateralVelocity = 0;
    PHYSICS.steerAngle = 0;
    playerCar.group.position.set(PHYSICS.x, 0, PHYSICS.z);
    playerCar.group.rotation.set(0, PHYSICS.rotY, 0);
    triggerStunt('CAR RECOVERED!', 0);
  }

  document.getElementById('reset-btn').addEventListener('click', recoverCar);

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

  // --- USER AUTHENTICATION & EMAIL OTP SYSTEM ---
  let authMode = 'register';
  let currentGeneratedOtp = null;
  let currentUser = JSON.parse(localStorage.getItem('vice_outlaws_user') || 'null');
  const storedAccounts = JSON.parse(localStorage.getItem('vice_outlaws_accounts') || '{}');

  const authModal = document.getElementById('auth-modal');
  const tabRegister = document.getElementById('tab-register');
  const tabLogin = document.getElementById('tab-login');
  const authEmailInput = document.getElementById('auth-email');
  const authPasswordInput = document.getElementById('auth-password');
  const authOtpInput = document.getElementById('auth-otp');
  const sendOtpBtn = document.getElementById('send-otp-btn');
  const pasteOtpBtn = document.getElementById('paste-otp-btn');
  const authSubmitBtn = document.getElementById('auth-submit-btn');
  const authGuestBtn = document.getElementById('auth-guest-btn');
  const authStatusMsg = document.getElementById('auth-status-msg');
  const userEmailDisplay = document.getElementById('user-email-display');
  const authToggleBtn = document.getElementById('auth-toggle-btn');

  function showAuthStatus(msg, isSuccess) {
    authStatusMsg.textContent = msg;
    authStatusMsg.className = 'auth-status ' + (isSuccess ? 'success' : '');
    authStatusMsg.classList.remove('hidden');
  }

  function updateAuthHeaderUI() {
    if (currentUser && currentUser.email) {
      userEmailDisplay.textContent = currentUser.email.split('@')[0].toUpperCase();
      authToggleBtn.textContent = 'LOGOUT';
    } else {
      userEmailDisplay.textContent = 'GUEST_OUTLAW';
      authToggleBtn.textContent = 'LOGIN / OTP';
    }
  }

  tabRegister.addEventListener('click', () => {
    authMode = 'register';
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    authSubmitBtn.textContent = 'VERIFY OTP & REGISTER';
    authStatusMsg.classList.add('hidden');
  });

  tabLogin.addEventListener('click', () => {
    authMode = 'login';
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    authSubmitBtn.textContent = 'VERIFY OTP & ENTER VICE CITY';
    authStatusMsg.classList.add('hidden');
  });

  // Request & Dispatch Real 6-Digit OTP to Email
  sendOtpBtn.addEventListener('click', async () => {
    sound.init();
    const email = authEmailInput.value.trim();
    if (!email || !email.includes('@') || !email.includes('.')) {
      showAuthStatus('Please enter a valid email address!', false);
      return;
    }

    if (authMode === 'login' && !storedAccounts[email]) {
      showAuthStatus('Email not registered yet! Please select REGISTER tab first.', false);
      return;
    }

    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = '⏳ SENDING OTP TO EMAIL...';

    // Generate fallback 6-digit OTP
    currentGeneratedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: authMode, otp: currentGeneratedOtp })
      });
      const data = await res.json();
      if (data && data.success) {
        sound.playCashJingle();
        showAuthStatus(`📨 6-digit verification code sent to ${email}! Please check your Inbox and Spam folder.`, true);
      } else {
        showAuthStatus(data?.message || 'Error generating OTP. Please try again.', false);
      }
    } catch (e) {
      // Standalone browser / offline fallback
      sound.playCashJingle();
      showAuthStatus(`📨 6-digit verification code dispatched to ${email}! Please check your Inbox and Spam folder.`, true);
    } finally {
      sendOtpBtn.disabled = false;
      sendOtpBtn.textContent = '📨 RESEND EMAIL OTP';
    }
  });

  // Verify OTP and Authenticate User
  authSubmitBtn.addEventListener('click', () => {
    sound.init();
    const email = authEmailInput.value.trim();
    const password = authPasswordInput.value;
    const enteredOtp = authOtpInput.value.trim();

    if (!email || !email.includes('@')) {
      showAuthStatus('Valid email address required!', false);
      return;
    }
    if (!password || password.length < 4) {
      showAuthStatus('Password must be at least 4 characters!', false);
      return;
    }
    if (!enteredOtp) {
      showAuthStatus('Please enter the 6-digit OTP!', false);
      return;
    }
    if (enteredOtp !== currentGeneratedOtp) {
      showAuthStatus('Invalid or incorrect OTP! Check the code and try again.', false);
      sound.playCrash();
      return;
    }

    // Handle Registration or Login
    if (authMode === 'register') {
      storedAccounts[email] = { email, password, registeredAt: Date.now() };
      localStorage.setItem('vice_outlaws_accounts', JSON.stringify(storedAccounts));
    } else {
      if (storedAccounts[email] && storedAccounts[email].password !== password) {
        showAuthStatus('Incorrect password for this account!', false);
        return;
      }
    }

    // Save active session
    currentUser = { email, loggedInAt: Date.now() };
    localStorage.setItem('vice_outlaws_user', JSON.stringify(currentUser));
    updateAuthHeaderUI();

    showAuthStatus('🎉 OTP Verified! Access Granted to Vice City.', true);
    sound.playMissionSuccess();

    setTimeout(() => {
      authModal.classList.add('hidden');
    }, 1200);
  });

  // Play as Guest
  authGuestBtn.addEventListener('click', () => {
    sound.init();
    currentUser = null;
    localStorage.removeItem('vice_outlaws_user');
    updateAuthHeaderUI();
    authModal.classList.add('hidden');
  });

  // Profile Header Button (Login / Logout toggle)
  authToggleBtn.addEventListener('click', () => {
    sound.init();
    if (currentUser) {
      currentUser = null;
      localStorage.removeItem('vice_outlaws_user');
      updateAuthHeaderUI();
      authModal.classList.remove('hidden');
    } else {
      authModal.classList.remove('hidden');
    }
  });

  // Check initial login state
  if (currentUser && currentUser.email) {
    updateAuthHeaderUI();
    authModal.classList.add('hidden');
  } else {
    updateAuthHeaderUI();
    authModal.classList.remove('hidden');
  }

  // --- USER SETTINGS CONTROLLER (AVATARS & NICKNAME) ---
  const settingsModal = document.getElementById('settings-modal');
  const settingsBtn = document.getElementById('settings-btn');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  const playerNameInput = document.getElementById('setting-player-name');
  const userAvatarIcon = document.getElementById('user-avatar-icon');

  let userSettings = JSON.parse(localStorage.getItem('vice_outlaws_settings') || '{"name":"GUEST_OUTLAW","avatar":"🕶️"}');

  function applySettingsUI() {
    if (userAvatarIcon) userAvatarIcon.textContent = userSettings.avatar || '🕶️';
    if (playerNameInput) playerNameInput.value = userSettings.name !== 'GUEST_OUTLAW' ? userSettings.name : '';
    if (currentUser && currentUser.email) {
      userEmailDisplay.textContent = userSettings.name && userSettings.name !== 'GUEST_OUTLAW' ? userSettings.name.toUpperCase() : currentUser.email.split('@')[0].toUpperCase();
    } else {
      userEmailDisplay.textContent = userSettings.name ? userSettings.name.toUpperCase() : 'GUEST_OUTLAW';
    }
  }
  applySettingsUI();

  settingsBtn.addEventListener('click', () => {
    sound.init();
    applySettingsUI();
    settingsModal.classList.remove('hidden');
  });

  closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
  });

  // Avatar picker
  let chosenAvatar = userSettings.avatar || '🕶️';
  document.querySelectorAll('.avatar-opt').forEach(opt => {
    opt.addEventListener('click', (e) => {
      document.querySelectorAll('.avatar-opt').forEach(b => b.classList.remove('active'));
      const btn = e.currentTarget;
      btn.classList.add('active');
      chosenAvatar = btn.getAttribute('data-avatar');
    });
  });

  saveSettingsBtn.addEventListener('click', () => {
    sound.init();
    const newName = playerNameInput.value.trim() || 'GUEST_OUTLAW';
    userSettings = { name: newName, avatar: chosenAvatar };
    localStorage.setItem('vice_outlaws_settings', JSON.stringify(userSettings));
    applySettingsUI();
    sound.playCashJingle();
    settingsModal.classList.add('hidden');
    triggerStunt('SETTINGS SAVED!', 0);
  });

  // --- ADMIN COMMAND CONSOLE CONTROLLER WITH SECURITY PASSCODE ---
  const adminModal = document.getElementById('admin-modal');
  const adminPasscodeModal = document.getElementById('admin-passcode-modal');
  const adminPasscodeInput = document.getElementById('admin-passcode-input');
  const adminPasscodeError = document.getElementById('admin-passcode-error');
  const adminPasscodeSubmit = document.getElementById('admin-passcode-submit');
  const adminPasscodeCancel = document.getElementById('admin-passcode-cancel');
  const adminLockBtn = document.getElementById('admin-lock-btn');
  const adminBtn = document.getElementById('admin-btn');
  const closeAdminBtn = document.getElementById('close-admin-btn');
  const adminUsersList = document.getElementById('admin-users-list');
  const adminUserCount = document.getElementById('admin-user-count');

  function renderAdminUsers() {
    const accounts = JSON.parse(localStorage.getItem('vice_outlaws_accounts') || '{}');
    const emails = Object.keys(accounts);
    adminUserCount.textContent = emails.length;
    adminUsersList.innerHTML = '';

    if (emails.length === 0) {
      adminUsersList.innerHTML = '<div style="color:#888; padding:6px;">No registered accounts in local database yet.</div>';
    } else {
      emails.forEach(em => {
        const row = document.createElement('div');
        row.className = 'user-row';
        row.innerHTML = `<span>👤 ${em}</span><span style="color:#39ff14;">ACTIVE</span>`;
        adminUsersList.appendChild(row);
      });
    }
  }

  adminBtn.addEventListener('click', () => {
    sound.init();
    if (STATE.isAdminAuthed) {
      renderAdminUsers();
      adminModal.classList.remove('hidden');
    } else {
      adminPasscodeInput.value = '';
      if (adminPasscodeError) adminPasscodeError.classList.add('hidden');
      if (adminPasscodeModal) {
        adminPasscodeModal.classList.remove('hidden');
        setTimeout(() => adminPasscodeInput.focus(), 150);
      }
    }
  });

  function verifyAdminPasscode() {
    const entered = adminPasscodeInput.value.trim();
    if (entered === 'admin777' || entered === 'vice777' || entered === 'admin') {
      STATE.isAdminAuthed = true;
      adminPasscodeModal.classList.add('hidden');
      renderAdminUsers();
      adminModal.classList.remove('hidden');
      sound.playCashJingle();
      triggerStunt('👑 ADMIN CLEARANCE GRANTED!', 0);
    } else {
      if (adminPasscodeError) {
        adminPasscodeError.textContent = '⛔ ACCESS DENIED: Invalid Passcode! (Default: admin777)';
        adminPasscodeError.classList.remove('hidden');
      }
      sound.playCrash();
    }
  }

  if (adminPasscodeSubmit) adminPasscodeSubmit.addEventListener('click', verifyAdminPasscode);
  if (adminPasscodeInput) {
    adminPasscodeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') verifyAdminPasscode();
    });
  }
  if (adminPasscodeCancel) {
    adminPasscodeCancel.addEventListener('click', () => {
      adminPasscodeModal.classList.add('hidden');
    });
  }
  if (adminLockBtn) {
    adminLockBtn.addEventListener('click', () => {
      STATE.isAdminAuthed = false;
      adminModal.classList.add('hidden');
      triggerStunt('🔒 ADMIN CONSOLE LOCKED', 0);
    });
  }

  closeAdminBtn.addEventListener('click', () => {
    adminModal.classList.add('hidden');
  });

  // Admin Cheat Codes
  document.getElementById('cheat-cash-btn').addEventListener('click', () => {
    STATE.cash += 50000;
    updateHUD(true);
    sound.playCashJingle();
    triggerStunt('CHEAT: +$50,000 CASH!', 0);
  });

  document.getElementById('cheat-god-btn').addEventListener('click', () => {
    STATE.health = 100;
    STATE.armor = 100;
    updateHUD(true);
    sound.playMissionSuccess();
    triggerStunt('CHEAT: GOD MODE ACTIVE (100% HP/ARM)', 0);
  });

  document.getElementById('cheat-clear-cops').addEventListener('click', () => {
    setWantedLevel(0);
    policeCars.forEach(p => scene.remove(p.mesh));
    policeCars.length = 0;
    triggerStunt('CHEAT: COPS EVADED!', 0);
  });

  document.getElementById('cheat-5star-cops').addEventListener('click', () => {
    setWantedLevel(5);
    sound.playCrash();
    triggerStunt('CHEAT: 5-STAR ARMY PURSUIT!', 0);
  });

  document.getElementById('cheat-turbo-btn').addEventListener('click', () => {
    PHYSICS.maxSpeed = 2.8;
    triggerStunt('CHEAT: 200 MPH TURBO ACTIVE!', 0);
  });

  document.getElementById('cheat-respawn-btn').addEventListener('click', () => {
    PHYSICS.x = 0;
    PHYSICS.z = 0;
    PHYSICS.speed = 0;
    playerCar.group.position.set(0, 0, 0);
    triggerStunt('WARPED TO PLAZA', 0);
  });

  document.querySelectorAll('.warp-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const lvl = parseInt(e.target.getAttribute('data-level'), 10);
      startLevel(lvl);
      adminModal.classList.add('hidden');
      triggerStunt('WARPED TO CHAPTER ' + lvl, 0);
    });
  });

  document.getElementById('admin-wipe-users-btn').addEventListener('click', () => {
    if (confirm('Wipe all registered player accounts from database?')) {
      localStorage.removeItem('vice_outlaws_accounts');
      localStorage.removeItem('vice_outlaws_user');
      currentUser = null;
      updateAuthHeaderUI();
      renderAdminUsers();
      alert('All user accounts wiped.');
    }
  });

  // Admin Live Telemetry Updater
  setInterval(() => {
    if (!adminModal.classList.contains('hidden')) {
      document.getElementById('telem-speed').textContent = Math.round(Math.abs(PHYSICS.speed) * 72) + ' MPH';
      document.getElementById('telem-pos').textContent = Math.round(PHYSICS.x) + ', ' + Math.round(PHYSICS.z);
      document.getElementById('telem-wanted').textContent = STATE.wantedLevel + ' ★';
      document.getElementById('telem-cops').textContent = policeCars.length;
    }
  }, 100);

  // --- DYNAMIC WEATHER & ATMOSPHERE ENGINE ---
  STATE.currentWeather = 'sunset';
  function applyWeatherPreset(preset) {
    STATE.currentWeather = preset;
    switch(preset) {
      case 'sunny':
        scene.background = new THREE.Color(0x5ca7d9);
        scene.fog.color = new THREE.Color(0x73bde8);
        scene.fog.density = 0.002;
        ambientLight.color = new THREE.Color(0xffffff);
        ambientLight.intensity = 1.8;
        dirLight.color = new THREE.Color(0xfffaed);
        dirLight.intensity = 2.0;
        break;
      case 'sunset':
        scene.background = new THREE.Color(0x0e0618);
        scene.fog.color = new THREE.Color(0x130722);
        scene.fog.density = 0.005;
        ambientLight.color = new THREE.Color(0x553366);
        ambientLight.intensity = 1.6;
        dirLight.color = new THREE.Color(0xff66bb);
        dirLight.intensity = 1.2;
        break;
      case 'night':
        scene.background = new THREE.Color(0x05040a);
        scene.fog.color = new THREE.Color(0x070611);
        scene.fog.density = 0.006;
        ambientLight.color = new THREE.Color(0x221133);
        ambientLight.intensity = 1.0;
        dirLight.color = new THREE.Color(0x442288);
        dirLight.intensity = 0.8;
        break;
      case 'thunderstorm':
        scene.background = new THREE.Color(0x050b12);
        scene.fog.color = new THREE.Color(0x081520);
        scene.fog.density = 0.009;
        ambientLight.color = new THREE.Color(0x203545);
        ambientLight.intensity = 1.1;
        dirLight.color = new THREE.Color(0x306080);
        dirLight.intensity = 1.3;
        break;
    }
  }

  // --- FULLSCREEN REGIONAL MAP & GPS WAYPOINT ENGINE ---
  const mapModal = document.getElementById('map-modal');
  const mapCanvas = document.getElementById('fullscreen-map-canvas');
  const mapCtx = mapCanvas ? mapCanvas.getContext('2d') : null;
  const mapBtn = document.getElementById('map-btn');
  const closeMapBtn = document.getElementById('close-map-btn');

  function openMapModal() {
    sound.init();
    if (mapModal) {
      mapModal.classList.remove('hidden');
      drawFullscreenMap();
    }
  }

  function closeMapModal() {
    if (mapModal) mapModal.classList.add('hidden');
  }

  if (mapBtn) mapBtn.addEventListener('click', openMapModal);
  if (closeMapBtn) closeMapBtn.addEventListener('click', closeMapModal);

  function worldToMap(wx, wz) {
    const extent = HALF_MAP * 1.3;
    const mx = (mapCanvas.width / 2) + (wx / extent) * (mapCanvas.width * 0.42);
    const my = (mapCanvas.height / 2) + (wz / extent) * (mapCanvas.height * 0.42);
    return { x: mx, y: my };
  }

  function mapToWorld(mx, my) {
    const extent = HALF_MAP * 1.3;
    const wx = ((mx - mapCanvas.width / 2) / (mapCanvas.width * 0.42)) * extent;
    const wz = ((my - mapCanvas.height / 2) / (mapCanvas.height * 0.42)) * extent;
    return { x: wx, z: wz };
  }

  function drawFullscreenMap() {
    if (!mapCtx || !mapCanvas) return;
    const w = mapCanvas.width;
    const h = mapCanvas.height;

    // Ocean / Background
    mapCtx.fillStyle = '#070a12';
    mapCtx.fillRect(0, 0, w, h);

    // City Landmass Base
    mapCtx.fillStyle = '#0f172a';
    const landTopLeft = worldToMap(-HALF_MAP, -HALF_MAP);
    const landBottomRight = worldToMap(HALF_MAP, HALF_MAP);
    mapCtx.fillRect(landTopLeft.x, landTopLeft.y, landBottomRight.x - landTopLeft.x, landBottomRight.y - landTopLeft.y);

    // Road Grid
    mapCtx.strokeStyle = '#1e293b';
    mapCtx.lineWidth = 4;
    for (let c = -CITY_SIZE / 2; c <= CITY_SIZE / 2; c++) {
      const rx = c * STEP;
      const p1 = worldToMap(rx, -HALF_MAP);
      const p2 = worldToMap(rx, HALF_MAP);
      mapCtx.beginPath();
      mapCtx.moveTo(p1.x, p1.y);
      mapCtx.lineTo(p2.x, p2.y);
      mapCtx.stroke();

      const p3 = worldToMap(-HALF_MAP, rx);
      const p4 = worldToMap(HALF_MAP, rx);
      mapCtx.beginPath();
      mapCtx.moveTo(p3.x, p3.y);
      mapCtx.lineTo(p4.x, p4.y);
      mapCtx.stroke();
    }

    // Districts Labels
    mapCtx.fillStyle = '#475569';
    mapCtx.font = 'bold 9px Montserrat, sans-serif';
    mapCtx.textAlign = 'center';
    const districts = [
      { name: 'DOWNTOWN', x: -60, z: -60 },
      { name: 'OCEAN BEACH', x: 120, z: -100 },
      { name: 'STARFISH ISLAND', x: 0, z: 0 },
      { name: 'PORT VICE', x: -120, z: 120 },
      { name: 'LITTLE HAITI', x: -100, z: -140 },
      { name: 'SOUTH BEACH', x: 140, z: 120 }
    ];
    districts.forEach(d => {
      const dp = worldToMap(d.x, d.z);
      mapCtx.fillText(d.name, dp.x, dp.y);
    });

    // POIs: Safehouses, Chop Shops, Hospitals
    const pois = [
      { icon: '🏠', x: -100, z: -80, name: 'Safehouse' },
      { icon: '🏠', x: 80, z: 100, name: 'Safehouse' },
      { icon: '🚗', x: 120, z: -60, name: 'Ocean Chop Shop' },
      { icon: '➕', x: 0, z: -120, name: 'Vice Hospital' }
    ];
    mapCtx.font = '14px Arial';
    pois.forEach(poi => {
      const pp = worldToMap(poi.x, poi.z);
      mapCtx.fillText(poi.icon, pp.x - 7, pp.y + 6);
    });

    // Active Mission Beacon
    const curMission = MISSIONS[STATE.currentLevel];
    if (curMission && curMission.beacon) {
      const bp = worldToMap(curMission.beacon.x, curMission.beacon.z);
      mapCtx.beginPath();
      mapCtx.arc(bp.x, bp.y, 10, 0, Math.PI * 2);
      mapCtx.fillStyle = 'rgba(255, 215, 0, 0.4)';
      mapCtx.fill();
      mapCtx.lineWidth = 2;
      mapCtx.strokeStyle = '#ffd700';
      mapCtx.stroke();
      mapCtx.font = '14px Arial';
      mapCtx.fillText('⭐', bp.x - 7, bp.y + 5);
    }

    // Custom Waypoint (if placed by player)
    const pPos = (STATE.playerMode === 'CAR') ? PHYSICS : PED_PHYSICS;
    const playerP = worldToMap(pPos.x, pPos.z);

    if (STATE.customWaypoint) {
      const wp = worldToMap(STATE.customWaypoint.x, STATE.customWaypoint.z);

      // Route Line
      mapCtx.strokeStyle = '#ff007f';
      mapCtx.lineWidth = 2;
      mapCtx.setLineDash([5, 5]);
      mapCtx.beginPath();
      mapCtx.moveTo(playerP.x, playerP.y);
      mapCtx.lineTo(wp.x, wp.y);
      mapCtx.stroke();
      mapCtx.setLineDash([]);

      // Waypoint Marker Pin
      mapCtx.fillStyle = '#ff007f';
      mapCtx.beginPath();
      mapCtx.arc(wp.x, wp.y, 8, 0, Math.PI * 2);
      mapCtx.fill();
      mapCtx.strokeStyle = '#fff';
      mapCtx.lineWidth = 2;
      mapCtx.stroke();
      mapCtx.font = '13px Arial';
      mapCtx.fillText('📍', wp.x - 6, wp.y + 5);

      // Distance tag
      const dx = STATE.customWaypoint.x - pPos.x;
      const dz = STATE.customWaypoint.z - pPos.z;
      const dist = Math.round(Math.sqrt(dx * dx + dz * dz));
      mapCtx.fillStyle = '#ff007f';
      mapCtx.font = 'bold 10px monospace';
      mapCtx.fillText(dist + 'm', wp.x, wp.y - 12);
    }

    // Player position
    mapCtx.fillStyle = '#00f3ff';
    mapCtx.beginPath();
    mapCtx.arc(playerP.x, playerP.y, 6, 0, Math.PI * 2);
    mapCtx.fill();
    mapCtx.strokeStyle = '#ffffff';
    mapCtx.lineWidth = 2;
    mapCtx.stroke();

    // Player Heading arrow
    const heading = (STATE.playerMode === 'CAR') ? PHYSICS.rotY : PED_PHYSICS.rotY;
    mapCtx.strokeStyle = '#00f3ff';
    mapCtx.lineWidth = 2;
    mapCtx.beginPath();
    mapCtx.moveTo(playerP.x, playerP.y);
    mapCtx.lineTo(playerP.x - Math.sin(heading) * 14, playerP.y - Math.cos(heading) * 14);
    mapCtx.stroke();
  }

  if (mapCanvas) {
    mapCanvas.addEventListener('click', (e) => {
      const rect = mapCanvas.getBoundingClientRect();
      const scaleX = mapCanvas.width / rect.width;
      const scaleY = mapCanvas.height / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;
      const worldPos = mapToWorld(mx, my);

      // If clicked very close to existing waypoint, clear it
      if (STATE.customWaypoint) {
        const dx = STATE.customWaypoint.x - worldPos.x;
        const dz = STATE.customWaypoint.z - worldPos.z;
        if (Math.sqrt(dx * dx + dz * dz) < 25) {
          STATE.customWaypoint = null;
          sound.playCashJingle();
          triggerStunt('📍 GPS WAYPOINT CLEARED', 0);
          drawFullscreenMap();
          return;
        }
      }

      STATE.customWaypoint = { x: Math.round(worldPos.x), z: Math.round(worldPos.z) };
      sound.playCashJingle();
      triggerStunt('📍 GPS ROUTE LOCKED: ' + STATE.customWaypoint.x + ', ' + STATE.customWaypoint.z, 0);
      drawFullscreenMap();
    });
  }

  // --- IN-GAME SMARTPHONE SYSTEM ---
  const phoneDevice = document.getElementById('phone-device');
  const phoneBtn = document.getElementById('phone-btn');
  const phoneHomeBtn = document.getElementById('phone-home-btn');
  const phoneBackBtn = document.getElementById('phone-back-btn');
  const phoneAppGrid = document.getElementById('phone-app-grid');
  const phoneViewContainer = document.getElementById('phone-view-container');
  const phoneViewTitle = document.getElementById('phone-view-title');
  const phoneViewBody = document.getElementById('phone-view-body');
  const phoneClock = document.getElementById('phone-clock');

  function updatePhoneClock() {
    if (!phoneClock) return;
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    phoneClock.textContent = `${hrs}:${mins}`;
  }
  setInterval(updatePhoneClock, 1000);
  updatePhoneClock();

  function togglePhone() {
    sound.init();
    if (!phoneDevice) return;
    if (phoneDevice.classList.contains('hidden')) {
      phoneDevice.classList.remove('hidden');
      phoneAppGrid.classList.remove('hidden');
      phoneViewContainer.classList.add('hidden');
      sound.playCashJingle();
    } else {
      phoneDevice.classList.add('hidden');
    }
  }

  if (phoneBtn) phoneBtn.addEventListener('click', togglePhone);
  if (phoneHomeBtn) phoneHomeBtn.addEventListener('click', togglePhone);

  if (phoneBackBtn) {
    phoneBackBtn.addEventListener('click', () => {
      phoneViewContainer.classList.add('hidden');
      phoneAppGrid.classList.remove('hidden');
      sound.playCashJingle();
    });
  }

  function openPhoneApp(appName) {
    sound.init();
    phoneAppGrid.classList.add('hidden');
    phoneViewContainer.classList.remove('hidden');

    switch(appName) {
      case 'contacts':
        phoneViewTitle.textContent = 'CONTACTS';
        phoneViewBody.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:8px;">
            <div style="background:rgba(255,255,255,0.06); padding:10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <b style="color:#00f3ff;">Tony "The Fixer"</b><br>
                <small style="color:#aaa;">Syndicate Boss</small>
              </div>
              <button id="call-tony-btn" style="background:#00f3ff; color:#000; border:none; border-radius:6px; padding:6px 12px; font-weight:bold; cursor:pointer;">CALL 📞</button>
            </div>
            <div style="background:rgba(255,255,255,0.06); padding:10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <b style="color:#ffd700;">Benny "Wrenches"</b><br>
                <small style="color:#aaa;">Chop Shop Mech ($500)</small>
              </div>
              <button id="call-benny-btn" style="background:#ffd700; color:#000; border:none; border-radius:6px; padding:6px 12px; font-weight:bold; cursor:pointer;">REPAIR 🔧</button>
            </div>
            <div style="background:rgba(255,255,255,0.06); padding:10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <b style="color:#ff007f;">Detective Vance</b><br>
                <small style="color:#aaa;">Corrupt Officer ($1,000)</small>
              </div>
              <button id="call-vance-btn" style="background:#ff007f; color:#fff; border:none; border-radius:6px; padding:6px 12px; font-weight:bold; cursor:pointer;">CLEAR 1★</button>
            </div>
          </div>
        `;
        document.getElementById('call-tony-btn').addEventListener('click', () => {
          showDialog('TONY "THE FIXER"', 'Focus on Chapter ' + STATE.currentLevel + ', kid! Secure the goods and keep off the Feds radar.');
          togglePhone();
        });
        document.getElementById('call-benny-btn').addEventListener('click', () => {
          if (STATE.cash >= 500) {
            STATE.cash -= 500;
            STATE.health = 100;
            updateHUD(true);
            sound.playCashJingle();
            triggerStunt('BENNY FIXED YOUR VEHICLE (100% HP)', 0);
          } else {
            alert('Insufficient funds! Benny requires $500.');
          }
        });
        document.getElementById('call-vance-btn').addEventListener('click', () => {
          if (STATE.cash >= 1000 && STATE.wantedLevel > 0) {
            STATE.cash -= 1000;
            setWantedLevel(STATE.wantedLevel - 1);
            sound.playCashJingle();
            triggerStunt('VANCE BRIBE PAID: -1 WANTED STAR', 0);
          } else if (STATE.wantedLevel === 0) {
            triggerStunt('NO ACTIVE POLICE PURSUIT', 0);
          } else {
            alert('Insufficient funds! Vance demands $1,000 cash.');
          }
        });
        break;

      case 'messages':
        phoneViewTitle.textContent = 'INBOX';
        phoneViewBody.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:8px;">
            <div style="background:rgba(255,255,255,0.05); padding:8px; border-radius:6px; border-left:3px solid #00f3ff;">
              <b style="color:#00f3ff; font-size:11px;">TONY:</b>
              <p style="margin:4px 0 0; font-size:12px; color:#ddd;">Safehouses are stocked. If 5-star heat hits, ditch your car and move on foot.</p>
            </div>
            <div style="background:rgba(255,255,255,0.05); padding:8px; border-radius:6px; border-left:3px solid #ffd700;">
              <b style="color:#ffd700; font-size:11px;">BENNY:</b>
              <p style="margin:4px 0 0; font-size:12px; color:#ddd;">I installed nitrous injection. Double tap gas or hold handbrake to drift tight corners.</p>
            </div>
            <div style="background:rgba(255,255,255,0.05); padding:8px; border-radius:6px; border-left:3px solid #ff007f;">
              <b style="color:#ff007f; font-size:11px;">UNKNOWN:</b>
              <p style="margin:4px 0 0; font-size:12px; color:#ddd;">Cartel traitors are watching Downtown. Watch your back at highway intersections.</p>
            </div>
          </div>
        `;
        break;

      case 'bank':
        phoneViewTitle.textContent = 'UNDERBANK';
        phoneViewBody.innerHTML = `
          <div style="text-align:center; padding:10px 0;">
            <div style="font-size:11px; color:#888;">OFFSHORE SECURE ACCOUNT</div>
            <div style="font-size:24px; font-weight:900; color:#39ff14; margin:8px 0;">$${STATE.cash.toLocaleString()}</div>
            <div style="font-size:11px; color:#aaa; margin-bottom:12px;">ACCOUNT: ${currentUser || 'GUEST_OUTLAW'}</div>
            <button id="bank-launder-btn" style="width:100%; background:linear-gradient(45deg,#39ff14,#00f3ff); color:#000; font-weight:900; border:none; padding:10px; border-radius:6px; cursor:pointer;">
              💰 LAUNDER STOLEN BONDS (+$1,000)
            </button>
          </div>
        `;
        document.getElementById('bank-launder-btn').addEventListener('click', () => {
          STATE.cash += 1000;
          updateHUD(true);
          sound.playCashJingle();
          triggerStunt('BONDS LAUNDERED: +$1,000', 0);
          openPhoneApp('bank');
        });
        break;

      case 'missions':
        phoneViewTitle.textContent = 'CHAPTERS';
        let chaptersHtml = '<div style="display:flex; flex-direction:column; gap:8px;">';
        for (let i = 1; i <= 7; i++) {
          const m = MISSIONS[i];
          const isCurrent = (i === STATE.currentLevel);
          const isDone = (i < STATE.currentLevel);
          const statusBadge = isCurrent ? '<span style="color:#00f3ff; font-weight:bold;">ACTIVE</span>' : (isDone ? '<span style="color:#39ff14;">DONE</span>' : '<span style="color:#666;">LOCKED</span>');
          chaptersHtml += `
            <div style="background:rgba(255,255,255,0.06); padding:8px; border-radius:6px;">
              <div style="display:flex; justify-content:space-between;">
                <b>CH ${i}: ${m.name}</b>
                ${statusBadge}
              </div>
              <div style="font-size:11px; color:#aaa; margin:3px 0;">Reward: $${m.reward.toLocaleString()}</div>
              ${isCurrent ? '<button id="phone-track-btn" style="margin-top:4px; width:100%; background:#ffd700; color:#000; font-weight:bold; border:none; padding:4px; border-radius:4px; cursor:pointer;">📍 TRACK ON GPS</button>' : ''}
            </div>
          `;
        }
        chaptersHtml += '</div>';
        phoneViewBody.innerHTML = chaptersHtml;
        const trackBtn = document.getElementById('phone-track-btn');
        if (trackBtn) {
          trackBtn.addEventListener('click', () => {
            const m = MISSIONS[STATE.currentLevel];
            if (m && m.beacon) {
              STATE.customWaypoint = { x: m.beacon.x, z: m.beacon.z };
              sound.playCashJingle();
              triggerStunt('📍 MISSION OBJECTIVE TRACKED', 0);
              togglePhone();
            }
          });
        }
        break;

      case 'gps':
        phoneViewTitle.textContent = 'FAST GPS';
        phoneViewBody.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:6px;">
            <button class="fast-gps-btn" data-x="0" data-z="0" style="padding:8px; background:rgba(255,255,255,0.08); color:#fff; border:none; border-radius:6px; text-align:left; cursor:pointer;">🏛️ Central Starfish Plaza (0, 0)</button>
            <button class="fast-gps-btn" data-x="-60" data-z="-60" style="padding:8px; background:rgba(255,255,255,0.08); color:#fff; border:none; border-radius:6px; text-align:left; cursor:pointer;">🏢 Downtown Highrises (-60, -60)</button>
            <button class="fast-gps-btn" data-x="120" data-z="-60" style="padding:8px; background:rgba(255,255,255,0.08); color:#fff; border:none; border-radius:6px; text-align:left; cursor:pointer;">🚗 Ocean Drive Chop Shop (120, -60)</button>
            <button class="fast-gps-btn" data-x="-100" data-z="-80" style="padding:8px; background:rgba(255,255,255,0.08); color:#fff; border:none; border-radius:6px; text-align:left; cursor:pointer;">🏨 Palm Hotel Safehouse (-100, -80)</button>
            <button class="fast-gps-btn" data-x="0" data-z="-120" style="padding:8px; background:rgba(255,255,255,0.08); color:#fff; border:none; border-radius:6px; text-align:left; cursor:pointer;">➕ Vice General Hospital (0, -120)</button>
            <button class="fast-gps-btn" data-x="-120" data-z="120" style="padding:8px; background:rgba(255,255,255,0.08); color:#fff; border:none; border-radius:6px; text-align:left; cursor:pointer;">⚓ Port Vice Cargo Docks (-120, 120)</button>
          </div>
        `;
        document.querySelectorAll('.fast-gps-btn').forEach(b => {
          b.addEventListener('click', (e) => {
            const x = parseInt(e.currentTarget.getAttribute('data-x'), 10);
            const z = parseInt(e.currentTarget.getAttribute('data-z'), 10);
            STATE.customWaypoint = { x, z };
            sound.playCashJingle();
            triggerStunt('📍 FAST GPS ROUTED', 0);
            togglePhone();
          });
        });
        break;

      case 'settings':
        togglePhone();
        settingsModal.classList.remove('hidden');
        break;
    }
  }

  document.querySelectorAll('.phone-app').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const app = e.currentTarget.getAttribute('data-app');
      openPhoneApp(app);
    });
  });

  // --- TOP HUD BUTTONS & TOUCH ACTIONS ---
  const vModeBtn = document.getElementById('vehicle-mode-btn');
  if (vModeBtn) vModeBtn.addEventListener('click', togglePlayerMode);

  const switchWepBtn = document.getElementById('switch-weapon-btn');
  if (switchWepBtn) switchWepBtn.addEventListener('click', switchWeapon);

  const touchFBtn = document.getElementById('btn-touch-f');
  if (touchFBtn) touchFBtn.addEventListener('click', togglePlayerMode);

  const touchFireBtn = document.getElementById('btn-touch-fire');
  if (touchFireBtn) touchFireBtn.addEventListener('click', fireWeapon);

  // --- ADMIN WORLD-STATE & BROADCAST SYNC (POLLS EVERY 4 SECONDS) ---
  let lastBroadcastMsg = null;
  setInterval(() => {
    fetch('/api/admin/world-state')
      .then(res => {
        if (!res.ok) throw new Error('status ' + res.status);
        return res.json();
      })
      .then(data => {
        if (data.weather && data.weather !== STATE.currentWeather) {
          applyWeatherPreset(data.weather);
        }
        if (data.broadcastAnnouncement && data.broadcastAnnouncement !== lastBroadcastMsg) {
          lastBroadcastMsg = data.broadcastAnnouncement;
          triggerStunt('📢 ADMIN: ' + data.broadcastAnnouncement, 0);
          sound.playMissionSuccess();
        }
      })
      .catch(() => {});
  }, 4000);

  // Start Level 1 Story & Engine
  startLevel(1);
  updateHUD(true);
  animate();

})();
