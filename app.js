/**
 * VERITY W MROCZNYM LESIE MINECRAFT (3D THREE.JS EXPERIENCE)
 * Kompletna aplikacja 3D z proceduralnymi teksturami, modelami i dźwiękiem
 */

// ============================================================
// 1. ZARZĄDZANIE DŹWIĘKIEM (WEB AUDIO API SYNTHESIZER)
// ============================================================
class HorrorAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.windGain = null;
    this.droneGain = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.setupAmbience();
      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio API niedostępne:", e);
    }
  }

  setupAmbience() {
    if (!this.ctx) return;

    // Szum wiatru w mrocznym lesie (filtered noise)
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 320;
    windFilter.Q.value = 3.0;

    // Modulacja filtra wiatru (LFO)
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.15;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain);
    lfoGain.connect(windFilter.frequency);
    lfo.start();

    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = this.isMuted ? 0 : 0.08;

    whiteNoise.connect(windFilter);
    windFilter.connect(this.windGain);
    this.windGain.connect(this.ctx.destination);
    whiteNoise.start();

    // Mroczny horror drone (niskie częstotliwości)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'sine';
    osc1.frequency.value = 55.0; // A1
    osc2.frequency.value = 55.8; // subtelne dudnienie

    const droneFilter = this.ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 120;

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.value = this.isMuted ? 0 : 0.12;

    osc1.connect(droneFilter);
    osc2.connect(droneFilter);
    droneFilter.connect(this.droneGain);
    this.droneGain.connect(this.ctx.destination);
    osc1.start();
    osc2.start();
  }

  toggleMute() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isMuted = !this.isMuted;
    if (this.windGain && this.droneGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.windGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.08, now, 0.2);
      this.droneGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.12, now, 0.2);
    }
    return !this.isMuted;
  }

  playJumpSwoosh() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.45);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.46);
    } catch (e) {}
  }

  playThunder() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 1.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.4));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, now);
      filter.frequency.exponentialRampToValueAtTime(60, now + 1.2);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 1.5);
    } catch (e) {}
  }
}

// ============================================================
// 2. GENERATOR PROCEDURALNYCH TEKSTUR MINECRAFT (PIXEL ART)
// ============================================================
class TextureGenerator {
  static createPixelCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return { canvas, ctx };
  }

  static canvasToTexture(canvas) {
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    return texture;
  }

  // Twarz Verity na płaszczyznę sześcianu Minecraft (32x32)
  static getVerityFaceTexture() {
    const { canvas, ctx } = this.createPixelCanvas(32, 32);

    // Baza - intensywny żółty z gradientem niepokoju i ziarnem
    for (let x = 0; x < 32; x++) {
      for (let y = 0; y < 32; y++) {
        const edgeDist = Math.max(Math.abs(x - 15.5), Math.abs(y - 15.5)) / 16;
        const noise = (Math.random() - 0.5) * 16;
        const r = Math.min(255, Math.max(220, 255 - edgeDist * 35 + noise));
        const g = Math.min(225, Math.max(180, 215 - edgeDist * 45 + noise));
        const b = Math.min(60, Math.max(10, 25 - edgeDist * 20));
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Puste, czarne owalne oczy (void black eyes)
    ctx.fillStyle = '#050505';
    // Lewe oko
    ctx.fillRect(8, 10, 4, 6);
    ctx.fillRect(7, 11, 6, 4);
    // Prawe oko
    ctx.fillRect(20, 10, 4, 6);
    ctx.fillRect(19, 11, 6, 4);

    // Cienie pod oczami (analog horror look)
    ctx.fillStyle = 'rgba(180, 140, 20, 0.4)';
    ctx.fillRect(7, 17, 6, 1);
    ctx.fillRect(19, 17, 6, 1);

    // Szeroki, niepokojący uśmiech (signature Verity smile)
    ctx.fillStyle = '#020202';
    // Dolna linia uśmiechu
    ctx.fillRect(10, 24, 12, 3);
    // Kąciki unoszące się w górę z "dołeczkami"
    ctx.fillRect(8, 22, 2, 3);
    ctx.fillRect(22, 22, 2, 3);
    ctx.fillRect(6, 19, 2, 4);
    ctx.fillRect(24, 19, 2, 4);
    ctx.fillRect(5, 18, 2, 2);
    ctx.fillRect(25, 18, 2, 2);

    return this.canvasToTexture(canvas);
  }

  // Twarz Verity zmapowana na sferę (dla formy kuli / pierwotnego bytu)
  static getVeritySphereTexture() {
    const { canvas, ctx } = this.createPixelCanvas(64, 32);

    // Tło żółte z delikatnym cieniowaniem
    for (let x = 0; x < 64; x++) {
      for (let y = 0; y < 32; y++) {
        const noise = (Math.random() - 0.5) * 12;
        ctx.fillStyle = `rgb(${250 + noise}, ${205 + noise}, ${20 + noise * 0.4})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Oczy wycentrowane z przodu (okolice x = 32)
    ctx.fillStyle = '#050505';
    // Lewe oko
    ctx.fillRect(26, 10, 4, 6);
    ctx.fillRect(25, 11, 6, 4);
    // Prawe oko
    ctx.fillRect(34, 10, 4, 6);
    ctx.fillRect(33, 11, 6, 4);

    // Uśmiech
    ctx.fillRect(27, 23, 10, 3);
    ctx.fillRect(25, 21, 2, 3);
    ctx.fillRect(37, 21, 2, 3);
    ctx.fillRect(23, 18, 2, 3);
    ctx.fillRect(39, 18, 2, 3);

    return this.canvasToTexture(canvas);
  }

  // Boki i tył głowy Verity
  static getVerityYellowSkinTexture() {
    const { canvas, ctx } = this.createPixelCanvas(16, 16);
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const n = (Math.random() - 0.5) * 16;
        ctx.fillStyle = `rgb(${250 + n}, ${205 + n}, ${20 + n * 0.5})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    return this.canvasToTexture(canvas);
  }

  // Twarz potworna / Nightmare Verity (szeroki uśmiech z ostrymi zębami)
  static getVerityMonsterFaceTexture() {
    const { canvas, ctx } = this.createPixelCanvas(32, 32);

    // Ciemniejsza, brudno-żółta skóra
    for (let x = 0; x < 32; x++) {
      for (let y = 0; y < 32; y++) {
        const noise = (Math.random() - 0.5) * 20;
        ctx.fillStyle = `rgb(${200 + noise}, ${160 + noise}, ${30 + noise * 0.5})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Puste czarne oczodoły z krwistoczerwonymi punkcikami w środku
    ctx.fillStyle = '#000000';
    ctx.fillRect(7, 8, 6, 8);
    ctx.fillRect(19, 8, 6, 8);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(10, 11, 2, 2);
    ctx.fillRect(21, 11, 2, 2);

    // Otwarta paszcza z ostrymi zębami
    ctx.fillStyle = '#080202';
    ctx.fillRect(6, 18, 20, 10);
    // Zęby góra
    ctx.fillStyle = '#fef08a';
    for (let i = 7; i < 25; i += 2) {
      ctx.fillRect(i, 18, 1, 3);
    }
    // Zęby dół
    for (let i = 8; i < 24; i += 2) {
      ctx.fillRect(i, 25, 1, 3);
    }

    return this.canvasToTexture(canvas);
  }

  // Tułów i ubranie Verity - PRZÓD (Mroczna bluza ze zszyciami i żółtą buźką pomocnika)
  static getVerityTorsoFrontTexture() {
    const { canvas, ctx } = this.createPixelCanvas(16, 24);
    // Mroczny antracyt / zniszczona czerń
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 24; y++) {
        const n = Math.floor(Math.random() * 12);
        ctx.fillStyle = `rgb(${24 + n}, ${26 + n}, ${32 + n})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Zszycia i akcenty żółte (Verity thread)
    ctx.fillStyle = '#facc15';
    ctx.fillRect(3, 4, 1, 1);
    ctx.fillRect(4, 5, 1, 1);
    ctx.fillRect(12, 6, 1, 1);
    ctx.fillRect(11, 7, 1, 1);

    // Naszywka "Your personal helper friend" na klatce piersiowej
    ctx.fillStyle = '#facc15';
    ctx.fillRect(6, 8, 4, 4);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(7, 9, 1, 1);
    ctx.fillRect(9, 9, 1, 1);
    ctx.fillRect(7, 10, 3, 1);

    return this.canvasToTexture(canvas);
  }

  // Tułów i ubranie Verity - TYŁ I BOKI
  static getVerityTorsoPlainTexture() {
    const { canvas, ctx } = this.createPixelCanvas(16, 24);
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 24; y++) {
        const n = Math.floor(Math.random() * 12);
        ctx.fillStyle = `rgb(${22 + n}, ${24 + n}, ${30 + n})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Ciemny kaptur z tyłu
    ctx.fillStyle = '#111827';
    ctx.fillRect(4, 1, 8, 6);
    return this.canvasToTexture(canvas);
  }

  // Ręce Verity (ciemne rękawy z żółtymi dłońmi na dole)
  static getVerityArmTexture() {
    const { canvas, ctx } = this.createPixelCanvas(8, 20);
    // Ciemny rękaw
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 16; y++) {
        const n = Math.floor(Math.random() * 10);
        ctx.fillStyle = `rgb(${20 + n}, ${22 + n}, ${28 + n})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Żółte dłonie Verity
    for (let x = 0; x < 8; x++) {
      for (let y = 16; y < 20; y++) {
        const n = (Math.random() - 0.5) * 14;
        ctx.fillStyle = `rgb(${250 + n}, ${205 + n}, ${20 + n * 0.4})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    return this.canvasToTexture(canvas);
  }

  // Nogi Verity (ciemne spodnie)
  static getDarkLegTexture() {
    const { canvas, ctx } = this.createPixelCanvas(8, 20);
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 20; y++) {
        const n = Math.floor(Math.random() * 10);
        ctx.fillStyle = `rgb(${16 + n}, ${18 + n}, ${24 + n})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Buty
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 17, 8, 3);
    return this.canvasToTexture(canvas);
  }

  // Kora Ciemnego Dębu (Dark Oak Bark)
  static getDarkOakBarkTexture() {
    const { canvas, ctx } = this.createPixelCanvas(16, 16);
    const colors = ['#22160d', '#2c1e13', '#38281a', '#1e130b', '#180e08'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const vLine = (x % 4 === 0 || (x + y) % 7 === 0) ? 0 : 2;
        const colorIdx = (Math.floor(Math.random() * 3) + vLine) % colors.length;
        ctx.fillStyle = colors[colorIdx];
        ctx.fillRect(x, y, 1, 1);
      }
    }
    return this.canvasToTexture(canvas);
  }

  // Przekrój drewna ciemnego dębu (Tree top)
  static getDarkOakTopTexture() {
    const { canvas, ctx } = this.createPixelCanvas(16, 16);
    ctx.fillStyle = '#422f1f';
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#22160d';
    ctx.strokeRect(0.5, 0.5, 15, 15);
    ctx.strokeStyle = '#322316';
    ctx.strokeRect(3.5, 3.5, 9, 9);
    ctx.fillStyle = '#2a1d12';
    ctx.fillRect(7, 7, 2, 2);
    return this.canvasToTexture(canvas);
  }

  // Liście Ciemnego Lasu (Dark Oak Leaves)
  static getDarkOakLeavesTexture() {
    const { canvas, ctx } = this.createPixelCanvas(16, 16);
    const greens = ['#132b13', '#1b3b1b', '#0f240f', '#091a09', '#1f441f'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        if (Math.random() < 0.12) {
          ctx.clearRect(x, y, 1, 1);
          continue;
        }
        ctx.fillStyle = greens[Math.floor(Math.random() * greens.length)];
        ctx.fillRect(x, y, 1, 1);
      }
    }
    return this.canvasToTexture(canvas);
  }

  // Gleba mrocznego lasu: Podzol / Grzybowa ziemia z ciemnym mchem
  static getDarkPodzolTopTexture() {
    const { canvas, ctx } = this.createPixelCanvas(16, 16);
    const shades = ['#3d2817', '#4a331e', '#2e1c0e', '#23381e', '#1c2e17'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        ctx.fillStyle = shades[Math.floor(Math.random() * shades.length)];
        ctx.fillRect(x, y, 1, 1);
      }
    }
    return this.canvasToTexture(canvas);
  }

  static getDarkPodzolSideTexture() {
    const { canvas, ctx } = this.createPixelCanvas(16, 16);
    ctx.fillStyle = '#2e1c0e';
    ctx.fillRect(0, 0, 16, 16);
    for (let x = 0; x < 16; x++) {
      const depth = 3 + Math.floor(Math.random() * 3);
      ctx.fillStyle = '#4a331e';
      ctx.fillRect(x, 0, 1, depth);
      if (Math.random() < 0.3) {
        ctx.fillStyle = '#23381e';
        ctx.fillRect(x, 0, 1, 1);
      }
    }
    return this.canvasToTexture(canvas);
  }

  // Brukowiec / Skała mroczna
  static getCobbleTexture() {
    const { canvas, ctx } = this.createPixelCanvas(16, 16);
    const stones = ['#334155', '#1e293b', '#0f172a', '#475569'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        ctx.fillStyle = stones[Math.floor(Math.random() * stones.length)];
        ctx.fillRect(x, y, 1, 1);
      }
    }
    return this.canvasToTexture(canvas);
  }

  // Dynia Jack O'Lantern
  static getPumpkinFaceTexture() {
    const { canvas, ctx } = this.createPixelCanvas(16, 16);
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#9a3412';
    for (let y = 0; y < 16; y++) {
      ctx.fillRect(4, y, 1, 1);
      ctx.fillRect(8, y, 1, 1);
      ctx.fillRect(12, y, 1, 1);
    }
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(3, 4, 3, 3);
    ctx.fillRect(10, 4, 3, 3);
    ctx.fillRect(7, 7, 2, 2);
    ctx.fillRect(3, 11, 10, 2);
    ctx.fillRect(5, 10, 2, 1);
    ctx.fillRect(9, 10, 2, 1);
    ctx.fillRect(7, 13, 2, 1);
    return this.canvasToTexture(canvas);
  }
}

// ============================================================
// 3. GŁÓWNA APLIKACJA 3D (THREE.JS SCENA I LOGIKA)
// ============================================================
class VerityApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.audio = new HorrorAudioEngine();

    // Parametry stanu
    this.currentForm = 'humanoid'; // 'humanoid', 'monster', 'sphere'
    this.jumpMode = 'freeze';     // 'freeze', 'cycle'
    this.isJumping = false;
    this.jumpProgress = 0;
    this.jumpSpeed = 1.0;
    this.jumpHeight = 3.6;
    this.autoRotate = false;
    this.analogHorror = false;
    this.rainEnabled = true;
    this.torchEnabled = true;

    // Kolekcje obiektów
    this.models = {};
    this.characterGroup = null;
    this.jumpPivots = {};
    this.particleSystems = [];
    this.treeEyes = [];
    this.lightningTimer = 0;
    this.nextLightningTime = 8 + Math.random() * 10;

    this.initThree();
    this.buildLighting();
    this.buildForestEnvironment();
    this.buildAllVerityModels();
    this.buildJumpActionEffects();
    this.buildAtmosphericParticles();
    this.buildRainSystem();
    this.setupCameraPresets();
    this.setupEventListeners();
    this.setJumpMode('freeze');

    this.clock = new THREE.Clock();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    // Scena z gęstą mgłą
    this.scene = new THREE.Scene();
    this.fogColor = 0x030712;
    this.scene.background = new THREE.Color(this.fogColor);
    this.scene.fog = new THREE.FogExp2(this.fogColor, 0.038);

    // Kamera
    this.camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      0.1,
      120
    );
    this.camera.position.set(4.2, 2.8, 6.8);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.container.appendChild(this.renderer.domElement);

    // Kontrola kamery (OrbitControls)
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.05;
    this.controls.minDistance = 1.5;
    this.controls.maxDistance = 25;
    this.controls.target.set(0, 3.2, 0.4);
  }

  buildLighting() {
    // Mroczne nocne światło lasu
    this.ambientLight = new THREE.AmbientLight(0x0a1224, 0.28);
    this.scene.add(this.ambientLight);

    // Zimne blade światło księżyca przebijające przez gałęzie ciemnego dębu
    this.moonLight = new THREE.DirectionalLight(0x64748b, 0.75);
    this.moonLight.position.set(12, 22, -10);
    this.moonLight.castShadow = true;
    this.moonLight.shadow.mapSize.width = 2048;
    this.moonLight.shadow.mapSize.height = 2048;
    this.moonLight.shadow.camera.near = 0.5;
    this.moonLight.shadow.camera.far = 50;
    const d = 16;
    this.moonLight.shadow.camera.left = -d;
    this.moonLight.shadow.camera.right = d;
    this.moonLight.shadow.camera.top = d;
    this.moonLight.shadow.camera.bottom = -d;
    this.moonLight.shadow.bias = -0.0005;
    this.scene.add(this.moonLight);

    // Złotawo-żółte światło akcentujące sylwetkę Verity (Rim light)
    this.verityRimLight = new THREE.PointLight(0xfacc15, 1.4, 9.0);
    this.verityRimLight.position.set(-1.8, 4.2, 2.5);
    this.scene.add(this.verityRimLight);

    // Pochodnia gracza (Player Torch)
    this.torchLight = new THREE.PointLight(0xfde047, 1.0, 10.0);
    this.torchLight.position.copy(this.camera.position);
    this.scene.add(this.torchLight);

    // Światło błyskawicy (początkowo wyłączone)
    this.lightningLight = new THREE.PointLight(0x93c5fd, 0, 70);
    this.lightningLight.position.set(0, 18, 0);
    this.scene.add(this.lightningLight);

    // Ciepłe złote światło od dyni Jack O'Lantern w tle
    const pumpkinLight = new THREE.PointLight(0xf97316, 1.5, 6.0);
    pumpkinLight.position.set(-5.0, 1.0, -4.5);
    this.scene.add(pumpkinLight);
  }

  createMinecraftBlock(w, h, d, materials) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  buildForestEnvironment() {
    this.forestGroup = new THREE.Group();
    this.scene.add(this.forestGroup);

    // Materiały bloków
    const podzolTopMat = new THREE.MeshStandardMaterial({
      map: TextureGenerator.getDarkPodzolTopTexture(),
      roughness: 0.95
    });
    const podzolSideMat = new THREE.MeshStandardMaterial({
      map: TextureGenerator.getDarkPodzolSideTexture(),
      roughness: 0.95
    });
    const podzolMaterials = [
      podzolSideMat, podzolSideMat,
      podzolTopMat, podzolSideMat,
      podzolSideMat, podzolSideMat
    ];

    const barkMat = new THREE.MeshStandardMaterial({
      map: TextureGenerator.getDarkOakBarkTexture(),
      roughness: 0.9
    });
    const woodTopMat = new THREE.MeshStandardMaterial({
      map: TextureGenerator.getDarkOakTopTexture(),
      roughness: 0.9
    });
    const woodMaterials = [barkMat, barkMat, woodTopMat, woodTopMat, barkMat, barkMat];

    const leavesMat = new THREE.MeshStandardMaterial({
      map: TextureGenerator.getDarkOakLeavesTexture(),
      roughness: 0.8,
      transparent: true,
      alphaTest: 0.25
    });

    const cobbleMat = new THREE.MeshStandardMaterial({
      map: TextureGenerator.getCobbleTexture(),
      roughness: 0.85
    });

    // 1. Podłoże w stylu wokseli Minecraft (teren z naturalnymi falami)
    const groundSize = 36;
    for (let x = -groundSize / 2; x <= groundSize / 2; x += 2) {
      for (let z = -groundSize / 2; z <= groundSize / 2; z += 2) {
        const distFromCenter = Math.sqrt(x * x + z * z);
        let height = Math.sin(x * 0.2) * Math.cos(z * 0.2) * 0.4;
        if (distFromCenter > 10) {
          height += (distFromCenter - 10) * 0.15;
        }
        height = Math.round(height * 2) / 2;

        const block = this.createMinecraftBlock(2, 1, 2, podzolMaterials);
        block.position.set(x, height - 0.5, z);
        this.forestGroup.add(block);
      }
    }

    // 2. Punkt wybicia do skoku (Takeoff Ledge): Powalony pień i omszałe głazy
    const logBaseZ = -2.2;
    for (let i = -3; i <= 3; i++) {
      const logPiece = this.createMinecraftBlock(1, 1, 1, woodMaterials);
      logPiece.position.set(i * 0.9, 0.5, logBaseZ);
      logPiece.rotation.z = Math.PI / 2;
      this.forestGroup.add(logPiece);
    }

    // Głazy przy punkcie wybicia
    const rock1 = this.createMinecraftBlock(1.4, 1.2, 1.4, cobbleMat);
    rock1.position.set(-1.8, 0.6, -1.8);
    this.forestGroup.add(rock1);

    const rock2 = this.createMinecraftBlock(1.8, 1.5, 1.6, cobbleMat);
    rock2.position.set(2.0, 0.75, -2.5);
    this.forestGroup.add(rock2);

    // 3. Dynia Jack O'Lantern ukryta w korzeniach
    const pumpkinFace = new THREE.MeshStandardMaterial({ map: TextureGenerator.getPumpkinFaceTexture() });
    const pumpkinSide = new THREE.MeshStandardMaterial({ map: TextureGenerator.getPumpkinFaceTexture() });
    const pumpkinMats = [pumpkinSide, pumpkinSide, pumpkinSide, pumpkinSide, pumpkinFace, pumpkinSide];
    const jack = this.createMinecraftBlock(1, 1, 1, pumpkinMats);
    jack.position.set(-5.0, 0.5, -4.5);
    jack.rotation.y = 0.4;
    this.forestGroup.add(jack);

    // 4. Potężne drzewa Ciemnego Lasu (Dark Oak) - gęste korony blokujące niebo
    const treePositions = [
      { x: -5, z: -3, h: 8 },
      { x: 5, z: -4, h: 9 },
      { x: -7, z: 2, h: 9 },
      { x: 6, z: 4, h: 8 },
      { x: -3, z: 8, h: 10 },
      { x: 4, z: 9, h: 9 },
      { x: -10, z: -8, h: 11 },
      { x: 9, z: -9, h: 10 },
      { x: -11, z: 7, h: 10 },
      { x: 11, z: 8, h: 11 },
      { x: 0, z: -11, h: 10 },
      { x: -14, z: -1, h: 12 },
      { x: 13, z: -1, h: 12 },
      { x: -7, z: -12, h: 11 },
      { x: 8, z: -13, h: 11 }
    ];

    treePositions.forEach((pos, idx) => {
      this.buildDarkOakTree(pos.x, pos.z, pos.h, woodMaterials, leavesMat);
      if (idx % 3 === 0) {
        this.addCreepyEyesToTree(pos.x, pos.z, pos.h * 0.45);
      }
    });

    // 5. Czerwone świecące grzyby w ściółce leśnej
    this.addMushrooms();
  }

  buildDarkOakTree(x, z, height, woodMats, leavesMat) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, 0, z);

    // Pień 2x2 bloki (szeroki pień Dark Oak)
    const trunkW = 1.4;
    const trunkMesh = this.createMinecraftBlock(trunkW, height, trunkW, woodMats);
    trunkMesh.position.y = height / 2;
    treeGroup.add(trunkMesh);

    // Korzenie wystające z ziemi
    for (let r = 0; r < 4; r++) {
      const angle = (r * Math.PI) / 2 + 0.3;
      const rx = Math.cos(angle) * 1.1;
      const rz = Math.sin(angle) * 1.1;
      const root = this.createMinecraftBlock(0.8, 0.7, 0.8, woodMats);
      root.position.set(rx, 0.35, rz);
      treeGroup.add(root);
    }

    // Warstwy gęstych liści Dark Oak tworzące mroczny daszek
    const canopyY = height - 1;
    const layers = [
      { y: 0, radius: 4.0, h: 1.5 },
      { y: 1.2, radius: 3.5, h: 1.5 },
      { y: 2.4, radius: 2.5, h: 1.5 },
      { y: 3.4, radius: 1.6, h: 1.0 }
    ];

    layers.forEach(layer => {
      const leafLayer = new THREE.Mesh(
        new THREE.BoxGeometry(layer.radius * 2, layer.h, layer.radius * 2),
        leavesMat
      );
      leafLayer.position.set(0, canopyY + layer.y, 0);
      leafLayer.castShadow = true;
      leafLayer.receiveShadow = true;
      treeGroup.add(leafLayer);
    });

    this.forestGroup.add(treeGroup);
  }

  addCreepyEyesToTree(x, z, y) {
    const eyesGroup = new THREE.Group();
    eyesGroup.position.set(x, y, z + 0.75);

    const eyeGeo = new THREE.PlaneGeometry(0.12, 0.08);
    const eyeMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide
    });

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.x = -0.15;
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.x = 0.15;

    eyesGroup.add(leftEye);
    eyesGroup.add(rightEye);
    eyesGroup.lookAt(0, 3, 0);

    this.scene.add(eyesGroup);
    this.treeEyes.push({
      group: eyesGroup,
      blinkTimer: Math.random() * 5,
      isBlinking: false
    });
  }

  addMushrooms() {
    const shroomGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.08, 6);
    const stemGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 6);
    const redMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const stemMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 });

    const spots = [
      { x: -1.2, z: -0.5 },
      { x: -1.5, z: -0.8 },
      { x: 1.8, z: -1.2 },
      { x: -3.5, z: 2.5 },
      { x: 3.2, z: 1.8 }
    ];

    spots.forEach(pt => {
      const shroom = new THREE.Group();
      shroom.position.set(pt.x, 0.2, pt.z);
      const cap = new THREE.Mesh(shroomGeo, redMat);
      cap.position.y = 0.4;
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 0.2;
      shroom.add(cap);
      shroom.add(stem);
      this.forestGroup.add(shroom);
    });
  }

  // ============================================================
  // 4. BUDOWA MODELI POSTACI VERITY (3 FORMY W JEDNYM)
  // ============================================================
  buildAllVerityModels() {
    this.characterGroup = new THREE.Group();
    this.characterGroup.position.set(0, this.jumpHeight, 0.4);
    this.scene.add(this.characterGroup);

    // 1. FORMA HUMANOID (Standardowy mob / postać Minecraft Verity podczas skoku)
    this.models.humanoid = this.createHumanoidVerityModel();
    this.characterGroup.add(this.models.humanoid);

    // 2. FORMA POTWÓR (Towering Stalker Nightmare Form)
    this.models.monster = this.createMonsterVerityModel();
    this.models.monster.visible = false;
    this.characterGroup.add(this.models.monster);

    // 3. FORMA PIERWOTNY BYT (Kultowa żółta kula z analog horroru)
    this.models.sphere = this.createSphereVerityModel();
    this.models.sphere.visible = false;
    this.characterGroup.add(this.models.sphere);
  }

  createHumanoidVerityModel() {
    const group = new THREE.Group();

    // Przygotowanie materiałów
    const faceTex = TextureGenerator.getVerityFaceTexture();
    const skinTex = TextureGenerator.getVerityYellowSkinTexture();
    const torsoFrontTex = TextureGenerator.getVerityTorsoFrontTexture();
    const torsoPlainTex = TextureGenerator.getVerityTorsoPlainTexture();
    const armTex = TextureGenerator.getVerityArmTexture();
    const legTex = TextureGenerator.getDarkLegTexture();

    const faceMat = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.6 });
    const skinMat = new THREE.MeshStandardMaterial({ map: skinTex, roughness: 0.7 });
    const torsoFrontMat = new THREE.MeshStandardMaterial({ map: torsoFrontTex, roughness: 0.85 });
    const torsoPlainMat = new THREE.MeshStandardMaterial({ map: torsoPlainTex, roughness: 0.85 });
    const armMat = new THREE.MeshStandardMaterial({ map: armTex, roughness: 0.85 });
    const legMat = new THREE.MeshStandardMaterial({ map: legTex, roughness: 0.85 });

    // Materiały głowy: +X, -X, +Y, -Y, +Z (twarz z kultowym uśmiechem Verity), -Z
    const headMats = [skinMat, skinMat, skinMat, skinMat, faceMat, skinMat];

    // Materiały tułowia: boki, góra, dół, przód (z naszywką pomocnika), tył (z kapturem)
    const torsoMats = [torsoPlainMat, torsoPlainMat, torsoPlainMat, torsoPlainMat, torsoFrontMat, torsoPlainMat];

    // Materiały rąk i nóg
    const armMats = [armMat, armMat, armMat, skinMat, armMat, armMat];
    const legMats = [legMat, legMat, legMat, legMat, legMat, legMat];

    // --- Korpus / Tułów ---
    const torsoGeo = new THREE.BoxGeometry(1.0, 1.4, 0.55);
    const torsoMesh = new THREE.Mesh(torsoGeo, torsoMats);
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    group.add(torsoMesh);

    // --- Głowa (z pivotem do obracania i pochylania) ---
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 0.7, 0);
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.95, 0.95), headMats);
    headMesh.position.set(0, 0.48, 0);
    headMesh.castShadow = true;
    headPivot.add(headMesh);
    group.add(headPivot);

    // --- Prawa ręka (wyciągnięta agresywnie w skoku w stronę kamery) ---
    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(-0.75, 0.6, 0);
    const rightArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.48, 1.4, 0.48), armMats);
    rightArmMesh.position.set(0, -0.65, 0);
    rightArmMesh.castShadow = true;
    rightArmPivot.add(rightArmMesh);
    group.add(rightArmPivot);

    // --- Lewa ręka (odchylona w tył / pod kątem równoważącym skok) ---
    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(0.75, 0.6, 0);
    const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.48, 1.4, 0.48), armMats);
    leftArmMesh.position.set(0, -0.65, 0);
    leftArmMesh.castShadow = true;
    leftArmPivot.add(leftArmMesh);
    group.add(leftArmPivot);

    // --- Prawa noga (podciągnięta w locie do przodu) ---
    const rightLegPivot = new THREE.Group();
    rightLegPivot.position.set(-0.28, -0.7, 0);
    const rightLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.48, 1.4, 0.48), legMats);
    rightLegMesh.position.set(0, -0.65, 0);
    rightLegMesh.castShadow = true;
    rightLegPivot.add(rightLegMesh);
    group.add(rightLegPivot);

    // --- Lewa noga (odrzucona w tył za postacią w powietrzu) ---
    const leftLegPivot = new THREE.Group();
    leftLegPivot.position.set(0.28, -0.7, 0);
    const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.48, 1.4, 0.48), legMats);
    leftLegMesh.position.set(0, -0.65, 0);
    leftLegMesh.castShadow = true;
    leftLegPivot.add(leftLegMesh);
    group.add(leftLegPivot);

    this.jumpPivots.humanoid = {
      group,
      torso: torsoMesh,
      head: headPivot,
      rightArm: rightArmPivot,
      leftArm: leftArmPivot,
      rightLeg: rightLegPivot,
      leftLeg: leftLegPivot
    };

    return group;
  }

  createMonsterVerityModel() {
    const group = new THREE.Group();

    const monsterFaceTex = TextureGenerator.getVerityMonsterFaceTexture();
    const monsterFaceMat = new THREE.MeshStandardMaterial({ map: monsterFaceTex, roughness: 0.5 });
    const darkSkinMat = new THREE.MeshStandardMaterial({
      color: 0x947814,
      roughness: 0.8
    });
    const blackLimbMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      roughness: 0.9
    });

    const headMats = [darkSkinMat, darkSkinMat, darkSkinMat, darkSkinMat, monsterFaceMat, darkSkinMat];

    // Wydłużony, kościsty korpus
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.8, 0.5), blackLimbMat);
    torso.castShadow = true;
    group.add(torso);

    // Głowa z otwartą paszczą
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 0.9, 0);
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.1), headMats);
    headMesh.position.set(0, 0.6, 0);
    headPivot.add(headMesh);
    group.add(headPivot);

    // Długie, nienaturalne ręce z ostrymi pazurami
    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(-0.7, 0.7, 0);
    const rightArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.4, 0.3), blackLimbMat);
    rightArmMesh.position.set(0, -1.1, 0);
    rightArmPivot.add(rightArmMesh);

    // Szpony
    for (let c = -0.12; c <= 0.12; c += 0.12) {
      const claw = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 0.06), darkSkinMat);
      claw.position.set(c, -2.4, 0.1);
      rightArmPivot.add(claw);
    }
    group.add(rightArmPivot);

    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(0.7, 0.7, 0);
    const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.4, 0.3), blackLimbMat);
    leftArmMesh.position.set(0, -1.1, 0);
    leftArmPivot.add(leftArmMesh);
    group.add(leftArmPivot);

    // Wydłużone nogi
    const rightLegPivot = new THREE.Group();
    rightLegPivot.position.set(-0.3, -0.9, 0);
    const rightLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 2.4, 0.32), blackLimbMat);
    rightLegMesh.position.set(0, -1.1, 0);
    rightLegPivot.add(rightLegMesh);
    group.add(rightLegPivot);

    const leftLegPivot = new THREE.Group();
    leftLegPivot.position.set(0.3, -0.9, 0);
    const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 2.4, 0.32), blackLimbMat);
    leftLegMesh.position.set(0, -1.1, 0);
    leftLegPivot.add(leftLegMesh);
    group.add(leftLegPivot);

    this.jumpPivots.monster = {
      group,
      torso,
      head: headPivot,
      rightArm: rightArmPivot,
      leftArm: leftArmPivot,
      rightLeg: rightLegPivot,
      leftLeg: leftLegPivot
    };

    return group;
  }

  createSphereVerityModel() {
    const group = new THREE.Group();

    // Ikoniczna żółta kula Verity
    const sphereGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const faceTex = TextureGenerator.getVeritySphereTexture();
    const sphereMat = new THREE.MeshStandardMaterial({
      map: faceTex,
      roughness: 0.4,
      emissive: 0x3d2800
    });

    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    sphereMesh.rotation.y = -Math.PI / 2; // wyrównanie twarzy w stronę kamery (+Z)
    sphereMesh.castShadow = true;
    group.add(sphereMesh);

    // Otaczające lewitujące bloki cienia / wokselowe cząsteczki
    const orbitGroup = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const block = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.25, 0.25),
        new THREE.MeshBasicMaterial({ color: 0x050505 })
      );
      const angle = (i / 8) * Math.PI * 2;
      block.position.set(Math.cos(angle) * 1.8, Math.sin(angle) * 0.5, Math.sin(angle) * 1.8);
      orbitGroup.add(block);
    }
    group.add(orbitGroup);

    this.jumpPivots.sphere = {
      group,
      sphere: sphereMesh,
      orbitGroup
    };

    return group;
  }

  // ============================================================
  // 5. EFEKTY SKOKU: DYNAMIKA POWIETRZA, SMUGI I PYŁ WYBICIA
  // ============================================================
  buildJumpActionEffects() {
    // Smugi prędkości powietrza bezpośrednio za postacią
    this.speedLines = [];
    const lineMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < 7; i++) {
      const length = 1.6 + Math.random() * 1.4;
      const streakGeo = new THREE.PlaneGeometry(0.06, length);
      const streak = new THREE.Mesh(streakGeo, lineMat);
      streak.position.set(
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.6,
        -0.8 - Math.random() * 1.5
      );
      streak.rotation.x = Math.PI / 2.3;
      streak.rotation.z = (Math.random() - 0.5) * 0.2;
      this.characterGroup.add(streak);
      this.speedLines.push(streak);
    }

    // Odłamki ziemi / pył wyrzucony przy wybiciu z kłody
    const dirtGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const dirtMat = new THREE.MeshStandardMaterial({
      map: TextureGenerator.getDarkPodzolSideTexture()
    });
    this.dirtParticles = [];

    for (let i = 0; i < 24; i++) {
      const p = new THREE.Mesh(dirtGeo, dirtMat);
      p.position.set(
        (Math.random() - 0.5) * 1.6,
        0.8 + Math.random() * 1.2,
        -1.8 + (Math.random() - 0.5) * 1.0
      );
      p.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      this.scene.add(p);
      this.dirtParticles.push({
        mesh: p,
        initY: p.position.y,
        speedY: 0.4 + Math.random() * 0.6
      });
    }
  }

  // Atmosferyczne unoszące się cząstki zarodników i mrocznej mgły
  buildAtmosphericParticles() {
    const particleCount = 280;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 32;
      positions[i * 3 + 1] = Math.random() * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 32;

      // Złote i zielonkawo-mroczne zarodniki lasu
      if (Math.random() < 0.3) {
        colors[i * 3] = 0.98;
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 0.1;
      } else {
        colors[i * 3] = 0.2;
        colors[i * 3 + 1] = 0.45;
        colors[i * 3 + 2] = 0.3;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.65
    });

    this.sporesSystem = new THREE.Points(geometry, material);
    this.scene.add(this.sporesSystem);
  }

  // System deszczu w mrocznym lesie
  buildRainSystem() {
    const dropCount = 1200;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(dropCount * 3);

    for (let i = 0; i < dropCount; i++) {
      rainPos[i * 3] = (Math.random() - 0.5) * 40;
      rainPos[i * 3 + 1] = Math.random() * 25;
      rainPos[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));

    const rainMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.1,
      transparent: true,
      opacity: 0.55
    });

    this.rainSystem = new THREE.Points(rainGeo, rainMat);
    this.scene.add(this.rainSystem);
  }

  // ============================================================
  // 6. USTAWIENIE POZ I ANIMACJI SKOKU
  // ============================================================
  applyFreezeJumpPose() {
    this.characterGroup.position.set(0, this.jumpHeight, 0.4);

    // 1. Postać Minecraft
    const h = this.jumpPivots.humanoid;
    if (h) {
      h.group.rotation.set(0.28, -0.15, 0.08); // dynamiczne pochylenie ciała w przód w skoku
      h.head.rotation.set(-0.25, 0.2, -0.05);  // głowa patrzy wprost na gracza z uśmiechem
      // Ręce w geście drapieżnego ataku / wybicia
      h.rightArm.rotation.set(-1.35, 0.1, 0.35); // prawa ręka mocno wyciągnięta do przodu
      h.leftArm.rotation.set(0.55, -0.1, -0.45); // lewa ręka odrzucona w tył dla balansu
      // Nogi zgięte dynamicznie w powietrzu
      h.rightLeg.rotation.set(-0.95, 0.05, 0.15); // prawe kolano uniesione wysoko
      h.leftLeg.rotation.set(0.85, -0.05, -0.1);  // lewa noga wyciągnięta w tył za ciałem
    }

    // 2. Potwór Verity
    const m = this.jumpPivots.monster;
    if (m) {
      m.group.rotation.set(0.35, -0.1, 0.05);
      m.head.rotation.set(-0.2, 0.15, 0);
      m.rightArm.rotation.set(-1.6, 0.2, 0.4);
      m.leftArm.rotation.set(0.7, -0.2, -0.4);
      m.rightLeg.rotation.set(-1.1, 0.1, 0.2);
      m.leftLeg.rotation.set(1.0, -0.1, -0.15);
    }

    // 3. Kula
    const s = this.jumpPivots.sphere;
    if (s) {
      s.group.rotation.set(0.25, -0.3, 0);
    }
  }

  updateJumpCycle(delta) {
    if (this.jumpMode === 'freeze' && !this.isJumping) {
      // Subtelny oddech / lewitacja w powietrzu podczas stop-klatki
      const t = Date.now() * 0.002;
      this.characterGroup.position.y = this.jumpHeight + Math.sin(t) * 0.08;
      this.characterGroup.position.x = Math.cos(t * 0.7) * 0.05;
      return;
    }

    // Pętla dynamicznego skoku
    this.jumpProgress += delta * this.jumpSpeed * 1.4;
    const p = this.jumpProgress % Math.PI;

    // Parabola skoku (wyskok z kłody na ziemię)
    const arcHeight = Math.sin(p) * this.jumpHeight;
    const forwardZ = (p / Math.PI) * 4.5 - 2.0;

    this.characterGroup.position.y = Math.max(0.7, arcHeight + 0.6);
    this.characterGroup.position.z = forwardZ;

    // Kinematyka kończyn w trakcie fazy lotu
    const airProgress = Math.sin(p);
    const h = this.jumpPivots.humanoid;
    if (h) {
      h.group.rotation.x = 0.15 + (1 - airProgress) * 0.2;
      h.rightArm.rotation.x = -0.5 - airProgress * 1.0;
      h.leftArm.rotation.x = 0.3 + airProgress * 0.4;
      h.rightLeg.rotation.x = -0.3 - airProgress * 0.7;
      h.leftLeg.rotation.x = 0.3 + airProgress * 0.6;
    }

    const m = this.jumpPivots.monster;
    if (m) {
      m.rightArm.rotation.x = -0.6 - airProgress * 1.1;
      m.leftArm.rotation.x = 0.4 + airProgress * 0.5;
    }

    if (this.isJumping && this.jumpProgress >= Math.PI) {
      this.isJumping = false;
      this.setJumpMode('freeze');
    }
  }

  triggerSingleJump() {
    this.audio.init();
    this.audio.playJumpSwoosh();
    this.isJumping = true;
    this.jumpProgress = 0;
    this.jumpMode = 'cycle';

    const flashEl = document.getElementById('jump-flash');
    if (flashEl) {
      flashEl.style.opacity = '0.35';
      setTimeout(() => { flashEl.style.opacity = '0'; }, 80);
    }
  }

  setJumpMode(mode) {
    this.jumpMode = mode;
    if (mode === 'freeze') {
      this.applyFreezeJumpPose();
    }
  }

  setForm(formKey) {
    this.currentForm = formKey;
    Object.keys(this.models).forEach(k => {
      this.models[k].visible = (k === formKey);
    });
    if (this.jumpMode === 'freeze') {
      this.applyFreezeJumpPose();
    }
  }

  // ============================================================
  // 7. PRESETY KAMERY I INTERAKCJA
  // ============================================================
  setupCameraPresets() {
    this.cameraPresets = {
      cinematic: {
        pos: new THREE.Vector3(4.2, 2.4, 5.8),
        target: new THREE.Vector3(0, 3.2, 0.4)
      },
      closeup: {
        pos: new THREE.Vector3(0.5, 3.7, 2.2),
        target: new THREE.Vector3(0, 3.8, 0.4)
      },
      side: {
        pos: new THREE.Vector3(6.5, 3.2, 0.4),
        target: new THREE.Vector3(0, 3.2, 0.4)
      },
      canopy: {
        pos: new THREE.Vector3(2.0, 11.5, 7.0),
        target: new THREE.Vector3(0, 2.5, 0)
      },
      pov: {
        pos: new THREE.Vector3(0, 1.8, 3.2),
        target: new THREE.Vector3(0, 3.4, 0.4)
      }
    };
  }

  setCameraPreset(name) {
    const preset = this.cameraPresets[name];
    if (!preset) return;

    const startPos = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    const startTime = performance.now();
    const duration = 750;

    const animateTransition = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 0.5 - Math.cos(progress * Math.PI) / 2;

      this.camera.position.lerpVectors(startPos, preset.pos, ease);
      this.controls.target.lerpVectors(startTarget, preset.target, ease);
      this.controls.update();

      if (progress < 1) {
        requestAnimationFrame(animateTransition);
      }
    };
    requestAnimationFrame(animateTransition);
  }

  // ============================================================
  // 8. PĘTLA RENDEROWANIA I ANIMACJA CZĄSTEK
  // ============================================================
  animate() {
    requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    if (this.autoRotate) {
      this.controls.autoRotate = true;
      this.controls.autoRotateSpeed = 1.2;
    } else {
      this.controls.autoRotate = false;
    }
    this.controls.update();

    // Pozycja pochodni gracza śledzi kamerę
    if (this.torchLight) {
      this.torchLight.position.copy(this.camera.position);
    }

    // Aktualizacja skoku
    this.updateJumpCycle(delta);

    // Obrót i unoszenie kuli w formie pierwotnej
    if (this.currentForm === 'sphere' && this.jumpPivots.sphere) {
      this.jumpPivots.sphere.sphere.rotation.y += delta * 0.8;
      this.jumpPivots.sphere.orbitGroup.rotation.y -= delta * 1.5;
    }

    // Animacja zarodników w lesie
    if (this.sporesSystem) {
      const positions = this.sporesSystem.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += Math.sin(time + positions[i - 1]) * 0.008;
      }
      this.sporesSystem.geometry.attributes.position.needsUpdate = true;
    }

    // Animacja deszczu
    if (this.rainEnabled && this.rainSystem) {
      const positions = this.rainSystem.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= delta * 24;
        if (positions[i] < 0) {
          positions[i] = 25;
        }
      }
      this.rainSystem.geometry.attributes.position.needsUpdate = true;
    }

    // Animacja mrugania przerażających oczu w pniach drzew
    this.treeEyes.forEach(item => {
      item.blinkTimer -= delta;
      if (item.blinkTimer <= 0) {
        item.group.visible = !item.group.visible;
        item.blinkTimer = item.group.visible ? 3 + Math.random() * 5 : 0.18;
      }
    });

    // Losowe błyskawice i grzmoty w mrocznym lesie
    this.lightningTimer += delta;
    if (this.lightningTimer >= this.nextLightningTime) {
      this.triggerLightning();
      this.lightningTimer = 0;
      this.nextLightningTime = 10 + Math.random() * 15;
    }

    // Render sceny
    this.renderer.render(this.scene, this.camera);
  }

  triggerLightning() {
    this.audio.playThunder();
    this.lightningLight.intensity = 3.5;
    this.scene.fog.color.setHex(0x1e293b);

    setTimeout(() => {
      this.lightningLight.intensity = 0.5;
      setTimeout(() => {
        this.lightningLight.intensity = 4.0;
        setTimeout(() => {
          this.lightningLight.intensity = 0;
          this.scene.fog.color.setHex(this.fogColor);
        }, 80);
      }, 60);
    }, 70);
  }

  takeScreenshot() {
    this.renderer.render(this.scene, this.camera);
    const dataUrl = this.renderer.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `Minecraft_Verity_Mroczny_Las_${Date.now()}.png`;
    a.click();

    const flash = document.getElementById('flash-notify');
    if (flash) {
      flash.classList.add('show');
      setTimeout(() => flash.classList.remove('show'), 1500);
    }
  }

  // ============================================================
  // 9. OBSŁUGA INTERFEJSU UŻYTKOWNIKA (UI LISTENERS)
  // ============================================================
  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Klawisz Spacja = Natychmiastowy skok
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.triggerSingleJump();
      } else if (e.key === 'h' || e.key === 'H') {
        const ui = document.getElementById('ui-layer');
        if (ui) ui.classList.toggle('hidden');
      }
    });

    // Przycisk Skoku
    const jumpBtn = document.getElementById('btn-jump-action');
    if (jumpBtn) {
      jumpBtn.addEventListener('click', () => this.triggerSingleJump());
    }

    // Wybór formy Verity
    document.querySelectorAll('[data-form]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-form]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.setForm(e.target.dataset.form);
      });
    });

    // Wybór trybu skoku (Stop-klatka vs Pętla)
    document.querySelectorAll('[data-jump-mode]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-jump-mode]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.setJumpMode(e.target.dataset.jumpMode);
      });
    });

    // Presety kamery
    document.querySelectorAll('[data-cam]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-cam]').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.setCameraPreset(e.currentTarget.dataset.cam);
      });
    });

    // Suwaki: Mgła, Księżyc, Prędkość
    const fogSlider = document.getElementById('slider-fog');
    if (fogSlider) {
      fogSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.scene.fog.density = val;
        document.getElementById('val-fog').textContent = `${Math.round(val * 1000)}`;
      });
    }

    const moonSlider = document.getElementById('slider-moon');
    if (moonSlider) {
      moonSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.moonLight.intensity = val;
        document.getElementById('val-moon').textContent = `${Math.round(val * 100)}%`;
      });
    }

    const speedSlider = document.getElementById('slider-speed');
    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.jumpSpeed = val;
        document.getElementById('val-speed').textContent = `${val.toFixed(1)}x`;
      });
    }

    // Przycisk Pochodni gracza
    const torchBtn = document.getElementById('btn-torch');
    if (torchBtn) {
      torchBtn.addEventListener('click', () => {
        this.torchEnabled = !this.torchEnabled;
        this.torchLight.intensity = this.torchEnabled ? 1.0 : 0;
        torchBtn.classList.toggle('active', this.torchEnabled);
      });
    }

    // Przycisk Dźwięku
    const audioBtn = document.getElementById('btn-audio');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const unmuted = this.audio.toggleMute();
        audioBtn.classList.toggle('active', unmuted);
        audioBtn.querySelector('span').textContent = unmuted ? 'Dźwięk: WŁ' : 'Dźwięk: WYŁ';
      });
    }

    // Przycisk Autootaczania
    const autoRotateBtn = document.getElementById('btn-autorotate');
    if (autoRotateBtn) {
      autoRotateBtn.addEventListener('click', () => {
        this.autoRotate = !this.autoRotate;
        autoRotateBtn.classList.toggle('active', this.autoRotate);
      });
    }

    // Przycisk Analog Horror (VHS)
    const vhsBtn = document.getElementById('btn-vhs');
    if (vhsBtn) {
      vhsBtn.addEventListener('click', () => {
        this.analogHorror = !this.analogHorror;
        vhsBtn.classList.toggle('active', this.analogHorror);
        document.getElementById('scanlines').classList.toggle('active', this.analogHorror);
      });
    }

    // Przycisk Błyskawicy
    const stormBtn = document.getElementById('btn-storm');
    if (stormBtn) {
      stormBtn.addEventListener('click', () => this.triggerLightning());
    }

    // Przycisk Zrzutu ekranu
    const screenshotBtn = document.getElementById('btn-screenshot');
    if (screenshotBtn) {
      screenshotBtn.addEventListener('click', () => this.takeScreenshot());
    }
  }
}

// Inicjalizacja po załadowaniu drzewa DOM
window.addEventListener('DOMContentLoaded', () => {
  window.app = new VerityApp();
});
