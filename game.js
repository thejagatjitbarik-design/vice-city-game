// VICE OUTLAWS - 3D Open World Web & Mobile Game Engine
// Built with Three.js & Web Audio API

(function() {
  'use strict';

  // --- AUDIO SYNTHESIZER (ZERO ASSET DEPENDENCY) ---
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.initialized = false;
      this.radioPlaying = true;
      this.radioStep = 0;
      this.radioInterval = null;
      this.engineOsc = null;
      this.engineGain = null;
      this.sirenOsc = null;
      this.sirenGain = null;
      this.sirenStep = 0;
    }

    init() {
      if (this.initialized) return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.initialized = true;

        // Engine sound synth
        this.engineOsc = this.ctx.createOscillator();
        this.engineOsc.type = 'sawtooth';
        this.engineGain = this.ctx.createGain();
        this.engineGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

        const engineFilter = this.ctx.createBiquadFilter();
        engineFilter.type = 'lowpass';
        engineFilter.frequency.setValueAtTime(350, this.ctx.currentTime);

        this.engineOsc.connect(engineFilter);
        engineFilter.connect(this.engineGain);
        this.engineGain.connect(this.ctx.destination);
        this.engineOsc.start();

        // Start Synthwave Radio
        this.startRadio();
      } catch (e) {
        console.warn('Audio not allowed or supported yet', e);
      }
    }

    setEngineSpeed(speedRatio) {
      if (!this.initialized || !this.engineOsc) return;
      const baseFreq = 45;
      const targetFreq = baseFreq + speedRatio * 180;
      this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.08);
      this.engineGain.gain.setTargetAtTime(0.03 + speedRatio * 0.05, this.ctx.currentTime, 0.08);
    }

    playTireScreech() {
      if (!this.initialized) return;
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
      filter.Q.setValueAtTime(5, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      whiteNoise.start();
    }

    playCrash() {
      if (!this.initialized) return;
      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    }

    playCashJingle() {
      if (!this.initialized) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.06 + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.06);
        osc.stop(this.ctx.currentTime + idx * 0.06 + 0.22);
      });
    }

    playHorn() {
      if (!this.initialized) return;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc1.frequency.setValueAtTime(349.23, this.ctx.currentTime); // F4
      osc2.frequency.setValueAtTime(440.00, this.ctx.currentTime); // A4
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);
      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 0.4);
      osc2.stop(this.ctx.currentTime + 0.4);
    }

    startRadio() {
      if (!this.ctx) return;
      const bassNotes = [110, 110, 130.81, 146.83, 110, 110, 164.81, 146.83]; // 80s Synth bassline
      const leadNotes = [440, 0, 523.25, 0, 659.25, 587.33, 440, 0];

      this.radioInterval = setInterval(() => {
        if (!this.radioPlaying || !this.initialized) return;

        // Bass synth beat
        const bassFreq = bassNotes[this.radioStep % bassNotes.length];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bassFreq, this.ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.16);

        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);

        // Synth lead note
        const leadFreq = leadNotes[this.radioStep % leadNotes.length];
        if (leadFreq > 0) {
          const lOsc = this.ctx.createOscillator();
          const lGain = this.ctx.createGain();
          lOsc.type = 'square';
          lOsc.frequency.setValueAtTime(leadFreq, this.ctx.currentTime);
          lGain.gain.setValueAtTime(0.025, this.ctx.currentTime);
          lGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
          lOsc.connect(lGain);
          lGain.connect(this.ctx.destination);
          lOsc.start();
          lOsc.stop(this.ctx.currentTime + 0.32);
        }

        this.radioStep++;
      }, 160);
    }

    toggleRadio() {
      this.radioPlaying = !this.radioPlaying;
      return this.radioPlaying;
    }
  }

  // --- GAME STATE ---
  const STATE = {
    cash: 5000,
    health: 100,
    armor: 100,
    wantedLevel: 0,
    wantedTimer: 0,
    isEvading: false,
    evadeTimer: 0,
    speedMPH: 0,
    driftScore: 0,
    cameraMode: 0, // 0: Close Chase, 1: High Chase, 2: Top-Down Classic GTA
    carColor: 0xff0055,
    neonColor: 0x00f0ff,
    busted: false
  };

  // --- CONTROLS INPUT ---
  const INPUT = {
    gas: false,
    brake: false,
    left: false,
    right: false,
    drift: false
  };

  // --- INITIALIZE THREE.JS ENGINE ---
  const container = document.getElementById('game-container');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x10061e);
  scene.fog = new THREE.FogExp2(0x18092c, 0.004);

  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  container.appendChild(renderer.domElement);

  const sound = new SoundEngine();

  // --- LIGHTING (VICE CITY NEON AESTHETIC) ---
  const ambientLight = new THREE.AmbientLight(0x402555, 1.4);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xff66cc, 1.0);
  dirLight.position.set(60, 100, 40);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.near = 10;
  dirLight.shadow.camera.far = 300;
  dirLight.shadow.camera.left = -120;
  dirLight.shadow.camera.right = 120;
  dirLight.shadow.camera.top = 120;
  dirLight.shadow.camera.bottom = -120;
  scene.add(dirLight);

  // --- CITY WORLD GENERATOR ---
  const CITY_SIZE = 12; // 12x12 grid of blocks
  const BLOCK_SIZE = 45;
  const ROAD_WIDTH = 18;
  const HALF_MAP = (CITY_SIZE * (BLOCK_SIZE + ROAD_WIDTH)) / 2;

  const colliders = []; // Array of { box: THREE.Box3, type: string, obj: mesh }
  const policeCars = [];
  const skidmarks = [];
  const particles = [];

  // Ground plane (Asphalt)
  const groundGeo = new THREE.PlaneGeometry(HALF_MAP * 2.5, HALF_MAP * 2.5);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x111116,
    roughness: 0.85,
    metalness: 0.2
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Road grid and City blocks builder
  const buildingMats = [
    new THREE.MeshStandardMaterial({ color: 0x181a24, roughness: 0.4, metalness: 0.5 }),
    new THREE.MeshStandardMaterial({ color: 0x22182e, roughness: 0.3, metalness: 0.6 }),
    new THREE.MeshStandardMaterial({ color: 0x101b2b, roughness: 0.5, metalness: 0.4 }),
    new THREE.MeshStandardMaterial({ color: 0x2b1520, roughness: 0.4, metalness: 0.5 })
  ];

  // Window emissive textures (procedurally generated on canvas)
  function createBuildingTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#11131a';
    ctx.fillRect(0, 0, 128, 256);

    const colors = ['#00f0ff', '#ff007f', '#ffd700', '#ffffff', '#222233'];
    for (let y = 10; y < 250; y += 18) {
      for (let x = 8; x < 120; x += 16) {
        if (Math.random() > 0.4) {
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          ctx.fillRect(x, y, 9, 11);
        }
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }
  const windowTexture = createBuildingTexture();

  // Palm Tree Generator
  function createPalmTree(x, z) {
    const group = new THREE.Group();
    // Curved trunk
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 9, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 4.5;
    trunk.rotation.z = (Math.random() - 0.5) * 0.15;
    trunk.castShadow = true;
    group.add(trunk);

    // Palm leaves
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x00cc66, roughness: 0.6, side: THREE.DoubleSide });
    for (let i = 0; i < 7; i++) {
      const leafGeo = new THREE.ConeGeometry(1.6, 6, 4);
      const leaf = new THREE.Mesh(leafGeo, leavesMat);
      leaf.position.y = 9;
      leaf.rotation.x = Math.PI / 2.6;
      leaf.rotation.y = (i * Math.PI * 2) / 7;
      group.add(leaf);
    }
    group.position.set(x, 0, z);
    scene.add(group);
  }

  // Street Light Generator with real PointLight
  function createStreetLight(x, z, rotY) {
    const group = new THREE.Group();
    const poleGeo = new THREE.CylinderGeometry(0.12, 0.15, 8, 6);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x333344, metalness: 0.8 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 4;
    group.add(pole);

    // Lamp arm
    const armGeo = new THREE.BoxGeometry(0.15, 0.15, 2.2);
    const arm = new THREE.Mesh(armGeo, poleMat);
    arm.position.set(0, 7.9, 0.9);
    group.add(arm);

    // Glowing bulb
    const bulbGeo = new THREE.SphereGeometry(0.35, 8, 8);
    const isCyan = Math.random() > 0.5;
    const glowColor = isCyan ? 0x00f0ff : 0xff9900;
    const bulbMat = new THREE.MeshBasicMaterial({ color: glowColor });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(0, 7.8, 1.8);
    group.add(bulb);

    // PointLight (only on selected lights for high FPS performance)
    if (Math.random() > 0.65) {
      const light = new THREE.PointLight(glowColor, 1.2, 22);
      light.position.set(0, 7.5, 1.8);
      group.add(light);
    }

    group.position.set(x, 0, z);
    group.rotation.y = rotY;
    scene.add(group);
  }

  // Build the city grid
  const step = BLOCK_SIZE + ROAD_WIDTH;
  for (let ix = -CITY_SIZE / 2; ix < CITY_SIZE / 2; ix++) {
    for (let iz = -CITY_SIZE / 2; iz < CITY_SIZE / 2; iz++) {
      const cx = ix * step + step / 2;
      const cz = iz * step + step / 2;

      // Skip center block for an open plaza / spawn intersection
      if (Math.abs(ix) <= 1 && Math.abs(iz) <= 1) continue;

      // Building height
      const height = 25 + Math.random() * 65;
      const bGeo = new THREE.BoxGeometry(BLOCK_SIZE, height, BLOCK_SIZE);
      const bMat = buildingMats[Math.floor(Math.random() * buildingMats.length)].clone();
      bMat.map = windowTexture;
      bMat.emissiveMap = windowTexture;
      bMat.emissive = new THREE.Color(0x332244);
      bMat.emissiveIntensity = 0.5;

      const building = new THREE.Mesh(bGeo, bMat);
      building.position.set(cx, height / 2, cz);
      building.castShadow = true;
      building.receiveShadow = true;
      scene.add(building);

      // Add collider box for physics
      const box = new THREE.Box3().setFromObject(building);
      colliders.push({ box, type: 'building', obj: building });

      // Add palm trees along sidewalks
      createPalmTree(cx + BLOCK_SIZE / 2 + 3, cz);
      createPalmTree(cx - BLOCK_SIZE / 2 - 3, cz);

      // Add streetlights
      createStreetLight(cx + BLOCK_SIZE / 2 + 2, cz + 10, -Math.PI / 2);
      createStreetLight(cx - BLOCK_SIZE / 2 - 2, cz - 10, Math.PI / 2);
    }
  }

  // Road lane markings
  const roadMarkingMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
  const markingGeo = new THREE.PlaneGeometry(0.5, 3);
  markingGeo.rotateX(-Math.PI / 2);

  for (let i = -HALF_MAP; i < HALF_MAP; i += 7) {
    for (let r = -CITY_SIZE / 2; r <= CITY_SIZE / 2; r++) {
      const roadCoord = r * step;
      // Horizontal road markings
      const mH = new THREE.Mesh(markingGeo, roadMarkingMat);
      mH.position.set(i, 0.05, roadCoord);
      mH.rotation.y = Math.PI / 2;
      scene.add(mH);

      // Vertical road markings
      const mV = new THREE.Mesh(markingGeo, roadMarkingMat);
      mV.position.set(roadCoord, 0.05, i);
      scene.add(mV);
    }
  }

  // --- PLAYER VEHICLE (VICEROY TURBO SUPERCAR) ---
  function buildCarModel(colorHex, neonHex) {
    const carGroup = new THREE.Group();

    // Main Chassis / Wedge Body
    const bodyMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      metalness: 0.8,
      roughness: 0.2
    });

    const bodyGeo = new THREE.BoxGeometry(2.3, 0.75, 4.8);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.65;
    body.castShadow = true;
    carGroup.add(body);

    // Tapered Nose
    const noseGeo = new THREE.ConeGeometry(1.6, 1.4, 4);
    const nose = new THREE.Mesh(noseGeo, bodyMat);
    nose.rotation.x = -Math.PI / 2;
    nose.rotation.y = Math.PI / 4;
    nose.position.set(0, 0.45, 2.7);
    nose.scale.set(1.2, 0.5, 1);
    carGroup.add(nose);

    // Cabin Roof & Windshield
    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0x050508,
      roughness: 0.1,
      metalness: 0.95
    });
    const cabinGeo = new THREE.BoxGeometry(1.9, 0.65, 2.4);
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.25, -0.2);
    carGroup.add(cabin);

    // Rear Spoiler
    const spoilerMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 });
    const spoilerWing = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 0.6), spoilerMat);
    spoilerWing.position.set(0, 1.45, -2.2);
    const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5), spoilerMat);
    postL.position.set(-0.8, 1.2, -2.2);
    const postR = postL.clone();
    postR.position.x = 0.8;
    carGroup.add(spoilerWing, postL, postR);

    // 4 Wheels
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.8 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.9, roughness: 0.2 });
    const wheelGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.4, 16);
    wheelGeo.rotateZ(Math.PI / 2);

    const wheels = [];
    const wheelPositions = [
      { x: -1.2, y: 0.44, z: 1.5, front: true },
      { x: 1.2, y: 0.44, z: 1.5, front: true },
      { x: -1.2, y: 0.44, z: -1.5, front: false },
      { x: 1.2, y: 0.44, z: -1.5, front: false }
    ];

    wheelPositions.forEach((pos) => {
      const wGroup = new THREE.Group();
      const tire = new THREE.Mesh(wheelGeo, wheelMat);
      tire.castShadow = true;
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.42, 12), rimMat);
      rim.rotateZ(Math.PI / 2);
      wGroup.add(tire, rim);
      wGroup.position.set(pos.x, pos.y, pos.z);
      carGroup.add(wGroup);
      wheels.push({ mesh: wGroup, front: pos.front });
    });

    // Headlights (3D Emissive + SpotLights)
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const hlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.1), headlightMat);
    hlLeft.position.set(-0.8, 0.65, 2.4);
    const hlRight = hlLeft.clone();
    hlRight.position.x = 0.8;
    carGroup.add(hlLeft, hlRight);

    // Front Spotlights projecting on road
    const spotL = new THREE.SpotLight(0xfff5e6, 2.5, 45, Math.PI / 7, 0.4, 1);
    spotL.position.set(-0.8, 0.8, 2.5);
    const spotTargetL = new THREE.Object3D();
    spotTargetL.position.set(-0.8, 0, 25);
    carGroup.add(spotL, spotTargetL);
    spotL.target = spotTargetL;

    const spotR = new THREE.SpotLight(0xfff5e6, 2.5, 45, Math.PI / 7, 0.4, 1);
    spotR.position.set(0.8, 0.8, 2.5);
    const spotTargetR = new THREE.Object3D();
    spotTargetR.position.set(0.8, 0, 25);
    carGroup.add(spotR, spotTargetR);
    spotR.target = spotTargetR;

    // Glowing Neon Taillights
    const taillightMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
    const tl = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.18, 0.1), taillightMat);
    tl.position.set(0, 0.7, -2.4);
    carGroup.add(tl);

    // Neon Underglow Light
    const underglow = new THREE.PointLight(neonHex, 3.5, 9);
    underglow.position.set(0, 0.2, 0);
    carGroup.add(underglow);

    return { group: carGroup, wheels, bodyMat, underglow, taillightMat };
  }

  const playerCar = buildCarModel(STATE.carColor, STATE.neonColor);
  playerCar.group.position.set(0, 0, 0);
  scene.add(playerCar.group);

  // Player Physics Variables
  const PHYSICS = {
    x: 0,
    z: 0,
    rotY: 0,
    speed: 0,
    maxSpeed: 1.6, // ~115 MPH
    reverseMax: -0.6,
    accel: 0.024,
    brakeDecel: 0.045,
    naturalDecel: 0.01,
    steerAngle: 0,
    steerSpeed: 0.045,
    steerMax: 0.042,
    driftSlip: 0.94,
    lateralVelocity: 0
  };

  // --- POLICE CAR GENERATOR & AI SYSTEM ---
  function spawnPoliceCar(spawnNearX, spawnNearZ) {
    const pGroup = new THREE.Group();

    // Black & white cruiser body
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.6, roughness: 0.3 });
    const doorMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.5, roughness: 0.3 });

    const base = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.8, 4.8), bodyMat);
    base.position.y = 0.65;
    pGroup.add(base);

    const doorL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.75, 2.0), doorMat);
    doorL.position.set(-1.18, 0.65, 0);
    const doorR = doorL.clone();
    doorR.position.x = 1.18;
    pGroup.add(doorL, doorR);

    // Cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.7, 2.3), new THREE.MeshStandardMaterial({ color: 0x050508 }));
    cabin.position.set(0, 1.3, -0.2);
    pGroup.add(cabin);

    // Lightbar (Red & Blue)
    const redLight = new THREE.PointLight(0xff0033, 0, 18);
    redLight.position.set(-0.6, 1.85, -0.2);
    const blueLight = new THREE.PointLight(0x0066ff, 0, 18);
    blueLight.position.set(0.6, 1.85, -0.2);

    const redBar = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.25), new THREE.MeshBasicMaterial({ color: 0xff0033 }));
    redBar.position.set(-0.6, 1.75, -0.2);
    const blueBar = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.25), new THREE.MeshBasicMaterial({ color: 0x0066ff }));
    blueBar.position.set(0.6, 1.75, -0.2);

    pGroup.add(redLight, blueLight, redBar, blueBar);

    // Spawn location 60-90 units away from player
    const angle = Math.random() * Math.PI * 2;
    const dist = 65 + Math.random() * 25;
    const posX = spawnNearX + Math.cos(angle) * dist;
    const posZ = spawnNearZ + Math.sin(angle) * dist;

    pGroup.position.set(posX, 0, posZ);
    scene.add(pGroup);

    policeCars.push({
      mesh: pGroup,
      x: posX,
      z: posZ,
      rotY: angle + Math.PI,
      speed: 0,
      maxSpeed: 1.1 + STATE.wantedLevel * 0.15,
      redLight,
      blueLight,
      flashTimer: 0,
      pinTime: 0
    });
  }

  // --- SKIDMARKS & SMOKE PARTICLES ---
  function addSkidmark(x, z, rotY) {
    const geo = new THREE.PlaneGeometry(0.45, 1.4);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.65 });
    const mark = new THREE.Mesh(geo, mat);
    mark.position.set(x, 0.03, z);
    mark.rotation.y = rotY;
    scene.add(mark);
    skidmarks.push({ mesh: mark, life: 180 });
  }

  function addSmokeParticle(x, y, z) {
    const geo = new THREE.SphereGeometry(0.35 + Math.random() * 0.3, 5, 5);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xcccccc,
      transparent: true,
      opacity: 0.5
    });
    const p = new THREE.Mesh(geo, mat);
    p.position.set(x + (Math.random() - 0.5) * 0.4, y, z + (Math.random() - 0.5) * 0.4);
    scene.add(p);
    particles.push({
      mesh: p,
      life: 25,
      maxLife: 25,
      vx: (Math.random() - 0.5) * 0.08,
      vy: 0.04 + Math.random() * 0.04,
      vz: (Math.random() - 0.5) * 0.08
    });
  }

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
    stuntTimeout = setTimeout(() => {
      popup.classList.add('hidden');
    }, 1800);
  }

  // --- WANTED LEVEL MANAGEMENT ---
  function setWantedLevel(stars) {
    if (stars === STATE.wantedLevel) return;
    STATE.wantedLevel = Math.max(0, Math.min(5, stars));
    updateWantedStars();

    // Adjust police active count
    while (policeCars.length < STATE.wantedLevel) {
      spawnPoliceCar(PHYSICS.x, PHYSICS.z);
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

  // --- HUD UPDATE LOOP ---
  function updateHUD() {
    // Format cash: $0005000
    const formattedCash = String(Math.floor(STATE.cash)).padStart(7, '0');
    document.getElementById('cash-display').textContent = formattedCash;

    // Health & Armor
    document.getElementById('health-bar').style.width = STATE.health + '%';
    document.getElementById('armor-bar').style.width = STATE.armor + '%';

    // Speedometer
    const speedMPH = Math.round(Math.abs(PHYSICS.speed) * 72);
    document.getElementById('speed-display').textContent = speedMPH;

    // Gear indicator
    const gearEl = document.getElementById('gear-display');
    if (PHYSICS.speed < -0.05) gearEl.textContent = 'REV';
    else if (speedMPH === 0) gearEl.textContent = 'N';
    else if (speedMPH < 35) gearEl.textContent = '1ST';
    else if (speedMPH < 65) gearEl.textContent = '2ND';
    else if (speedMPH < 95) gearEl.textContent = '3RD';
    else gearEl.textContent = 'TOP';
  }

  // --- RADAR / MINI-MAP (CANVAS) ---
  const radarCanvas = document.getElementById('radar-canvas');
  const radarCtx = radarCanvas.getContext('2d');

  function drawRadar() {
    radarCtx.clearRect(0, 0, radarCanvas.width, radarCanvas.height);
    const cx = radarCanvas.width / 2;
    const cy = radarCanvas.height / 2;
    const scale = 0.55;

    radarCtx.save();
    radarCtx.translate(cx, cy);
    radarCtx.rotate(-PHYSICS.rotY);

    // Draw simplified grid roads
    radarCtx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
    radarCtx.lineWidth = 6;
    const mapRange = 90;

    for (let r = -CITY_SIZE / 2; r <= CITY_SIZE / 2; r++) {
      const coord = r * step;
      // Horiz
      radarCtx.beginPath();
      radarCtx.moveTo((-coord - -PHYSICS.x) * scale, (-mapRange) * scale);
      radarCtx.lineTo((-coord - -PHYSICS.x) * scale, (mapRange) * scale);
      radarCtx.stroke();
    }

    // Draw police car blips (flashing red/blue dots)
    policeCars.forEach((cop, idx) => {
      const relX = (cop.x - PHYSICS.x) * scale;
      const relZ = (cop.z - PHYSICS.z) * scale;

      radarCtx.fillStyle = (Date.now() % 400 < 200) ? '#ff0033' : '#0066ff';
      radarCtx.beginPath();
      radarCtx.arc(relX, relZ, 4.5, 0, Math.PI * 2);
      radarCtx.fill();
    });

    radarCtx.restore();

    // Center player blip (always pointing UP in radar)
    radarCtx.fillStyle = '#00f0ff';
    radarCtx.beginPath();
    radarCtx.moveTo(cx, cy - 7);
    radarCtx.lineTo(cx - 5, cy + 6);
    radarCtx.lineTo(cx, cy + 3);
    radarCtx.lineTo(cx + 5, cy + 6);
    radarCtx.closePath();
    radarCtx.fill();
  }

  // --- BUSTED / RESPAWN SYSTEM ---
  function triggerBusted() {
    if (STATE.busted) return;
    STATE.busted = true;
    sound.playCrash();

    const screen = document.getElementById('busted-screen');
    screen.classList.remove('hidden');

    // Deduct cash penalty
    STATE.cash = Math.max(0, STATE.cash - 1000);
    updateHUD();
  }

  function respawnPlayer() {
    STATE.busted = false;
    document.getElementById('busted-screen').classList.add('hidden');

    // Reset position to center intersection
    PHYSICS.x = 0;
    PHYSICS.z = 0;
    PHYSICS.speed = 0;
    PHYSICS.rotY = 0;
    STATE.health = 100;
    STATE.armor = 100;
    setWantedLevel(0);

    // Remove active police
    policeCars.forEach(p => scene.remove(p.mesh));
    policeCars.length = 0;

    updateHUD();
  }

  document.getElementById('respawn-btn').addEventListener('click', respawnPlayer);

  // --- MAIN PHYSICS & VEHICLE UPDATE ---
  function updateVehicle() {
    if (STATE.busted) return;

    // Acceleration & Braking
    if (INPUT.gas) {
      PHYSICS.speed = Math.min(PHYSICS.maxSpeed, PHYSICS.speed + PHYSICS.accel);
    } else if (INPUT.brake) {
      if (PHYSICS.speed > 0.05) {
        PHYSICS.speed = Math.max(0, PHYSICS.speed - PHYSICS.brakeDecel);
        playerCar.taillightMat.color.setHex(0xffffff); // Reversing/brake white glow
      } else {
        PHYSICS.speed = Math.max(PHYSICS.reverseMax, PHYSICS.speed - PHYSICS.accel * 0.7);
        playerCar.taillightMat.color.setHex(0xffffff);
      }
    } else {
      playerCar.taillightMat.color.setHex(0xff0044); // Normal taillight
      // Natural friction
      if (PHYSICS.speed > 0) PHYSICS.speed = Math.max(0, PHYSICS.speed - PHYSICS.naturalDecel);
      else if (PHYSICS.speed < 0) PHYSICS.speed = Math.min(0, PHYSICS.speed + PHYSICS.naturalDecel);
    }

    // Steering
    if (INPUT.left) {
      PHYSICS.steerAngle = Math.min(PHYSICS.steerMax, PHYSICS.steerAngle + PHYSICS.steerSpeed);
    } else if (INPUT.right) {
      PHYSICS.steerAngle = Math.max(-PHYSICS.steerMax, PHYSICS.steerAngle - PHYSICS.steerSpeed);
    } else {
      PHYSICS.steerAngle *= 0.7; // Auto-center
    }

    // Apply rotation based on speed and steering angle
    const speedFactor = (PHYSICS.speed / PHYSICS.maxSpeed);
    const turnAmount = PHYSICS.steerAngle * (PHYSICS.speed >= 0 ? 1 : -1) * (0.4 + Math.abs(speedFactor) * 0.8);
    PHYSICS.rotY += turnAmount;

    // Drifting physics
    const isDrifting = INPUT.drift && Math.abs(PHYSICS.speed) > 0.4 && Math.abs(PHYSICS.steerAngle) > 0.015;
    if (isDrifting) {
      PHYSICS.lateralVelocity = PHYSICS.steerAngle * PHYSICS.speed * 1.5;
      sound.playTireScreech();

      // Spawn skidmarks & smoke
      const leftRearX = PHYSICS.x - Math.cos(PHYSICS.rotY) * 1.1 - Math.sin(PHYSICS.rotY) * 1.5;
      const leftRearZ = PHYSICS.z + Math.sin(PHYSICS.rotY) * 1.1 - Math.cos(PHYSICS.rotY) * 1.5;
      addSkidmark(leftRearX, leftRearZ, PHYSICS.rotY);
      addSmokeParticle(leftRearX, 0.4, leftRearZ);

      // Accumulate drift points
      STATE.driftScore += Math.floor(Math.abs(PHYSICS.speed) * 18);
      if (STATE.driftScore > 300) {
        triggerStunt('SICK DRIFT!', Math.min(1000, STATE.driftScore));
        STATE.driftScore = 0;
      }
    } else {
      PHYSICS.lateralVelocity *= 0.8;
      if (STATE.driftScore > 0) STATE.driftScore = 0;
    }

    // Next proposed position
    const nextX = PHYSICS.x + Math.sin(PHYSICS.rotY) * PHYSICS.speed + Math.cos(PHYSICS.rotY) * PHYSICS.lateralVelocity;
    const nextZ = PHYSICS.z + Math.cos(PHYSICS.rotY) * PHYSICS.speed - Math.sin(PHYSICS.rotY) * PHYSICS.lateralVelocity;

    // Collision detection with buildings
    const playerRadius = 2.0;
    let collided = false;

    for (let i = 0; i < colliders.length; i++) {
      const col = colliders[i];
      // Quick distance check before box test
      if (Math.abs(col.obj.position.x - nextX) < BLOCK_SIZE / 2 + playerRadius &&
          Math.abs(col.obj.position.z - nextZ) < BLOCK_SIZE / 2 + playerRadius) {
        collided = true;
        break;
      }
    }

    if (!collided) {
      PHYSICS.x = nextX;
      PHYSICS.z = nextZ;
    } else {
      // Bounce recoil and speed loss
      PHYSICS.speed = -PHYSICS.speed * 0.4;
      sound.playCrash();

      // Minor damage on hard impact
      if (Math.abs(PHYSICS.speed) > 0.3) {
        if (STATE.armor > 0) STATE.armor = Math.max(0, STATE.armor - 10);
        else STATE.health = Math.max(0, STATE.health - 10);

        // Crashing alerts police if wanted level is 0
        if (STATE.wantedLevel === 0 && Math.random() > 0.5) {
          setWantedLevel(1);
        }
      }
    }

    // Update 3D car position & orientation
    playerCar.group.position.set(PHYSICS.x, 0, PHYSICS.z);
    playerCar.group.rotation.y = PHYSICS.rotY;

    // Animate wheels
    playerCar.wheels.forEach(w => {
      w.mesh.rotation.x += PHYSICS.speed * 1.4;
      if (w.front) {
        w.mesh.rotation.y = PHYSICS.steerAngle * 8;
      }
    });

    // Audio engine pitch
    sound.setEngineSpeed(Math.abs(PHYSICS.speed) / PHYSICS.maxSpeed);
  }

  // --- POLICE AI UPDATE LOOP ---
  function updatePolice() {
    if (policeCars.length === 0) return;

    let closestDist = 9999;

    policeCars.forEach((cop, idx) => {
      // Siren flashing lights
      cop.flashTimer += 0.15;
      cop.redLight.intensity = Math.sin(cop.flashTimer) > 0 ? 3.5 : 0;
      cop.blueLight.intensity = Math.sin(cop.flashTimer) <= 0 ? 3.5 : 0;

      // Distance to player
      const dx = PHYSICS.x - cop.x;
      const dz = PHYSICS.z - cop.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < closestDist) closestDist = dist;

      // Desired angle towards player
      const targetAngle = Math.atan2(dx, dz);
      let angleDiff = targetAngle - cop.rotY;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

      // Turn towards player smoothly
      cop.rotY += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), 0.035);

      // Accelerate towards player
      cop.speed = Math.min(cop.maxSpeed, cop.speed + 0.02);

      // Move cop
      cop.x += Math.sin(cop.rotY) * cop.speed;
      cop.z += Math.cos(cop.rotY) * cop.speed;
      cop.mesh.position.set(cop.x, 0, cop.z);
      cop.mesh.rotation.y = cop.rotY;

      // Police Car vs Player Collision
      if (dist < 4.2) {
        // Ramming collision
        sound.playCrash();
        PHYSICS.speed *= 0.6;
        cop.pinTime += 0.016;

        // If pinned for 3 seconds -> Busted!
        if (cop.pinTime > 2.8) {
          triggerBusted();
        }
      } else {
        cop.pinTime = Math.max(0, cop.pinTime - 0.02);
      }
    });

    // Check evasion status
    if (closestDist > 65 && STATE.wantedLevel > 0) {
      if (!STATE.isEvading) {
        STATE.isEvading = true;
        STATE.evadeTimer = 0;
        updateWantedStars();
      }
      STATE.evadeTimer += 0.016;
      if (STATE.evadeTimer > 8.0) {
        // Escaped!
        setWantedLevel(0);
        STATE.isEvading = false;
        triggerStunt('POLICE EVADED!', 1500);
        policeCars.forEach(p => scene.remove(p.mesh));
        policeCars.length = 0;
        updateWantedStars();
      }
    } else {
      if (STATE.isEvading) {
        STATE.isEvading = false;
        updateWantedStars();
      }
    }
  }

  // --- CAMERA UPDATE ---
  function updateCamera() {
    if (STATE.cameraMode === 0) {
      // Close 3rd person chase camera (Action GTA style)
      const dist = 11.0;
      const height = 4.2;
      const targetCamX = PHYSICS.x - Math.sin(PHYSICS.rotY) * dist;
      const targetCamZ = PHYSICS.z - Math.cos(PHYSICS.rotY) * dist;

      camera.position.x += (targetCamX - camera.position.x) * 0.12;
      camera.position.y += (height - camera.position.y) * 0.12;
      camera.position.z += (targetCamZ - camera.position.z) * 0.12;
      camera.lookAt(PHYSICS.x, 1.2, PHYSICS.z);

    } else if (STATE.cameraMode === 1) {
      // High cinematic chase camera
      const dist = 22.0;
      const height = 12.0;
      const targetCamX = PHYSICS.x - Math.sin(PHYSICS.rotY) * dist;
      const targetCamZ = PHYSICS.z - Math.cos(PHYSICS.rotY) * dist;

      camera.position.x += (targetCamX - camera.position.x) * 0.08;
      camera.position.y += (height - camera.position.y) * 0.08;
      camera.position.z += (targetCamZ - camera.position.z) * 0.08;
      camera.lookAt(PHYSICS.x, 1.0, PHYSICS.z);

    } else if (STATE.cameraMode === 2) {
      // Classic Top-Down Camera (GTA 1 / GTA 2 / Chinatown Wars)
      camera.position.x += (PHYSICS.x - camera.position.x) * 0.15;
      camera.position.y = 48.0;
      camera.position.z += (PHYSICS.z - camera.position.z) * 0.15;
      camera.lookAt(PHYSICS.x, 0, PHYSICS.z);
    }
  }

  // --- UPDATE PARTICLES & SKIDMARKS ---
  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life--;
      p.mesh.position.x += p.vx;
      p.mesh.position.y += p.vy;
      p.mesh.position.z += p.vz;
      p.mesh.scale.multiplyScalar(1.03);
      p.mesh.material.opacity = (p.life / p.maxLife) * 0.5;

      if (p.life <= 0) {
        scene.remove(p.mesh);
        particles.splice(i, 1);
      }
    }

    for (let i = skidmarks.length - 1; i >= 0; i--) {
      const s = skidmarks[i];
      s.life--;
      if (s.life < 40) s.mesh.material.opacity = (s.life / 40) * 0.6;
      if (s.life <= 0) {
        scene.remove(s.mesh);
        skidmarks.splice(i, 1);
      }
    }
  }

  // --- MAIN ANIMATION LOOP ---
  function animate() {
    requestAnimationFrame(animate);

    updateVehicle();
    updatePolice();
    updateCamera();
    updateParticles();
    drawRadar();
    updateHUD();

    renderer.render(scene, camera);
  }

  // --- KEYBOARD CONTROLS (DESKTOP) ---
  window.addEventListener('keydown', (e) => {
    sound.init(); // Audio unlock on user interaction

    switch(e.code) {
      case 'KeyW':
      case 'ArrowUp':
        INPUT.gas = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        INPUT.brake = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        INPUT.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        INPUT.right = true;
        break;
      case 'Space':
        INPUT.drift = true;
        break;
      case 'KeyC':
        STATE.cameraMode = (STATE.cameraMode + 1) % 3;
        break;
      case 'KeyR':
        PHYSICS.speed = 0;
        PHYSICS.rotY = 0;
        playerCar.group.rotation.set(0, 0, 0);
        break;
      case 'KeyH':
        sound.playHorn();
        break;
    }
  });

  window.addEventListener('keyup', (e) => {
    switch(e.code) {
      case 'KeyW':
      case 'ArrowUp':
        INPUT.gas = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        INPUT.brake = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        INPUT.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        INPUT.right = false;
        break;
      case 'Space':
        INPUT.drift = false;
        break;
    }
  });

  // --- TOUCH CONTROLS (MOBILE) ---
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

    // Also support mouse for testing in desktop responsive mode
    btn.addEventListener('mousedown', () => { sound.init(); INPUT[inputKey] = true; });
    btn.addEventListener('mouseup', () => { INPUT[inputKey] = false; });
  }

  setupTouchBtn('btn-gas', 'gas');
  setupTouchBtn('btn-brake', 'brake');
  setupTouchBtn('btn-left', 'left');
  setupTouchBtn('btn-right', 'right');
  setupTouchBtn('btn-drift', 'drift');

  // --- UI BUTTONS (CAM, RADIO, GARAGE) ---
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

  // Garage Customization & Rewarded Ad Business Simulation
  const garageModal = document.getElementById('garage-modal');
  document.getElementById('close-garage-btn').addEventListener('click', () => {
    garageModal.classList.add('hidden');
  });

  // Double click logo or district to open garage
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
      playerCar.underglow.color.setStyle(neon);
    });
  });

  // Rewarded Ad Simulation Button (Demonstrates Google AdMob / Web Portal Monetization)
  document.getElementById('ad-cash-btn').addEventListener('click', () => {
    const btn = document.getElementById('ad-cash-btn');
    btn.textContent = '⏳ SIMULATING 5s REWARDED VIDEO AD...';
    btn.disabled = true;

    setTimeout(() => {
      STATE.cash += 5000;
      sound.playCashJingle();
      updateHUD();
      btn.textContent = '📺 WATCH AD: FREE +$5,000';
      btn.disabled = false;
      alert('🎉 Rewarded Ad Completed! You earned +$5,000 cash for your ride.');
    }, 2500);
  });

  // Window Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Start game engine
  updateHUD();
  animate();

})();
