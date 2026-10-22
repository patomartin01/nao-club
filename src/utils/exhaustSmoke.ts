// Canvas-based Motorcycle Exhaust Smoke Burst Animation + Acoustic Engine Synthesis
// Multi-category authentic engine sound synthesis via Web Audio API & particle dynamics

export type MotoSoundCategory = 
  | 'urbana'         // Urbanas y Scooters (125-150cc, CVT)
  | 'deportiva'      // Deportivas y Naked (Tetracilíndricas, Tricilíndricas, Screamer)
  | 'adventure'      // Doble Propósito y Adventure (Boxer Twin, Parallel Twin)
  | 'crucero'        // Cruceros y Turismo (Heavy V-Twin, Potato-Potato)
  | 'offroad'        // Off-Road (Todo Terreno, Enduro, Motocross 2T/4T)
  | 'thumper';       // Monocilíndricos Carrera Larga / Royal Enfield (Himalayan 411, Dug-Dug-Dug, Thumper)

export function detectMotoCategory(info?: string | { motoModel?: string; discipline?: string }): MotoSoundCategory {
  if (!info) return 'adventure';
  const text = (typeof info === 'string' ? info : `${info.motoModel || ''} ${info.discipline || ''}`).toLowerCase();

  // 0. Monocilíndricos de Carrera Larga / Royal Enfield Thumper (Himalayan 411, Scram 411, etc.)
  if (
    text.includes('himalayan') || 
    text.includes('royal enfield') || 
    text.includes('enfield') || 
    text.includes('411') || 
    text.includes('thumper') || 
    text.includes('scram') || 
    text.includes('bullet') || 
    text.includes('classic 350') || 
    text.includes('meteor')
  ) {
    return 'thumper';
  }

  // 1. Urbanas y Scooters
  if (
    text.includes('scooter') || 
    text.includes('urbana') || 
    text.includes('vespa') || 
    text.includes('ciudad') || 
    text.includes('125') || 
    text.includes('150') || 
    text.includes('nmax') || 
    text.includes('pcx') || 
    text.includes('italika') || 
    text.includes('commuting')
  ) {
    return 'urbana';
  }

  // 2. Off-Road (Todo Terreno: Enduro, Motocross, Cross)
  if (
    text.includes('off-road') || 
    text.includes('offroad') || 
    text.includes('enduro') || 
    text.includes('motocross') || 
    text.includes('cross') || 
    text.includes('2t') || 
    text.includes('dirt') || 
    text.includes('crf250') || 
    text.includes('crf450') || 
    text.includes('exc') || 
    text.includes('wr250') || 
    text.includes('wr450') || 
    text.includes('yz') || 
    text.includes('kx') || 
    text.includes('klx')
  ) {
    return 'offroad';
  }

  // 3. Cruceros y Turismo
  if (
    text.includes('crucero') || 
    text.includes('cruiser') || 
    text.includes('harley') || 
    text.includes('indian') || 
    text.includes('chopper') || 
    text.includes('custom') || 
    text.includes('turismo') || 
    text.includes('touring') || 
    text.includes('goldwing') || 
    text.includes('rebel') || 
    text.includes('shadow') || 
    text.includes('bobber') || 
    text.includes('sportster') || 
    text.includes('road king')
  ) {
    return 'crucero';
  }

  // 4. Deportivas y Naked
  if (
    text.includes('deportiva') || 
    text.includes('sport') || 
    text.includes('pista') || 
    text.includes('naked') || 
    text.includes('mt-0') || 
    text.includes('mt-09') || 
    text.includes('mt-07') || 
    text.includes('r1') || 
    text.includes('r6') || 
    text.includes('r3') || 
    text.includes('cbr') || 
    text.includes('ninja') || 
    text.includes('zx-') || 
    text.includes('ducati') || 
    text.includes('panigale') || 
    text.includes('monster') || 
    text.includes('s1000rr') || 
    text.includes('z900') || 
    text.includes('duke') || 
    text.includes('superduke') || 
    text.includes('speed triple') || 
    text.includes('street triple')
  ) {
    return 'deportiva';
  }

  // 5. Doble Propósito y Adventure (Default: GS, Africa Twin, Tenere, Tiger, Transalp, etc.)
  return 'adventure';
}

interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  maxSize: number;
  alpha: number;
  decay: number;
  growth: number;
  rgb: [number, number, number];
}

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
}

let activeCanvas: HTMLCanvasElement | null = null;
let activeCtx: CanvasRenderingContext2D | null = null;
let activeParticles: SmokeParticle[] = [];
let activeSparks: SparkParticle[] = [];
let animFrameId: number | null = null;

function getCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  if (activeCanvas && activeCanvas.parentElement && activeCtx) {
    return { canvas: activeCanvas, ctx: activeCtx };
  }

  const canvas = document.createElement('canvas');
  canvas.id = 'exhaust-smoke-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '999999';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  document.body.appendChild(canvas);
  activeCanvas = canvas;
  activeCtx = canvas.getContext('2d', { alpha: true });

  const handleResize = () => {
    if (activeCanvas) {
      activeCanvas.width = window.innerWidth;
      activeCanvas.height = window.innerHeight;
    }
  };
  window.addEventListener('resize', handleResize, { passive: true });

  return { canvas, ctx: activeCtx! };
}

function animate() {
  if (!activeCtx || !activeCanvas) return;

  activeCtx.clearRect(0, 0, activeCanvas.width, activeCanvas.height);

  // Update & Draw Smoke Particles (Billowing exhaust clouds)
  for (let i = activeParticles.length - 1; i >= 0; i--) {
    const p = activeParticles[i];

    p.x += p.vx;
    p.y += p.vy;
    p.size = Math.min(p.maxSize, p.size + p.growth);
    p.alpha -= p.decay;

    // High-pressure horizontal exhaust jet dynamics:
    // Rapidly decelerates horizontally from air resistance, expands, and gently curls/rises
    p.vx *= 0.93;
    p.vy = (p.vy * 0.93) - 0.04;

    if (p.alpha <= 0 || p.size >= p.maxSize) {
      activeParticles.splice(i, 1);
      continue;
    }

    const [r, g, b] = p.rgb;
    const grad = activeCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.75})`);
    grad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.5})`);
    grad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.18})`);
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    activeCtx.fillStyle = grad;
    activeCtx.beginPath();
    activeCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    activeCtx.fill();
  }

  // Update & Draw Hot Embers / Exhaust Sparks (Lateral backfire sparks)
  for (let i = activeSparks.length - 1; i >= 0; i--) {
    const s = activeSparks[i];
    s.x += s.vx;
    s.y += s.vy;
    s.vx *= 0.93;
    s.vy += 0.08; // gentle gravity on sparks
    s.alpha -= s.decay;

    if (s.alpha <= 0) {
      activeSparks.splice(i, 1);
      continue;
    }

    activeCtx.fillStyle = s.color;
    activeCtx.globalAlpha = s.alpha;
    activeCtx.beginPath();
    activeCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    activeCtx.fill();
    activeCtx.globalAlpha = 1.0;
  }

  if (activeParticles.length > 0 || activeSparks.length > 0) {
    animFrameId = requestAnimationFrame(animate);
  } else {
    // Done animating: clean up
    if (activeCanvas && activeCanvas.parentElement) {
      activeCanvas.remove();
      activeCanvas = null;
      activeCtx = null;
    }
    animFrameId = null;
  }
}

let sharedAudioCtx: AudioContext | null = null;

function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch (_) {
    return null;
  }
}

/**
 * Procedural Audio Synthesizer via Web Audio API
 * Generates bespoke engine rumble, scream, thud, or braap per motorcycle category
 */
function playMotorcycleAudio(category: MotoSoundCategory) {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const t = Math.max(ctx.currentTime, 0.005) + 0.015;

    if (category === 'deportiva') {
      // 1. DEPORTIVAS Y NAKED (Yamaha MT-09 SP / CP3 Crossplane / Sportbike):
      // Rugido profundo y gutural de aceleración real, ráfaga de gas a presión y petardeo grave Akrapovič (sin pitidos agudos)

      // A) Ráfaga de gas de escape a presión (Textura de aire real comprimido en silenciador)
      try {
        const bufferSize = Math.floor(ctx.sampleRate * 0.35);
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.16));
        }
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(280, t);
        noiseFilter.frequency.linearRampToValueAtTime(450, t + 0.10);
        noiseFilter.frequency.linearRampToValueAtTime(200, t + 0.32);
        noiseFilter.Q.value = 1.6;

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.14, t);
        noiseGain.gain.linearRampToValueAtTime(0.001, t + 0.34);

        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noiseSource.start(t);
      } catch (_) {}

      // B) Motor Crossplane CP3 / Tetracilíndrico en rango fundamental grave (85 Hz a 210 Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const oscSub = ctx.createOscillator();
      const engineFilter = ctx.createBiquadFilter();
      const engineGain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';
      oscSub.type = 'sine';

      // Golpe de acelerador grave y ronco
      osc1.frequency.setValueAtTime(86, t);
      osc1.frequency.exponentialRampToValueAtTime(210, t + 0.11);
      osc1.frequency.exponentialRampToValueAtTime(92, t + 0.35);

      // Armónico cálido desfasado
      osc2.frequency.setValueAtTime(130, t);
      osc2.frequency.exponentialRampToValueAtTime(280, t + 0.11);
      osc2.frequency.exponentialRampToValueAtTime(138, t + 0.35);

      // Sub-punch de desplazamiento (50 Hz - 85 Hz)
      oscSub.frequency.setValueAtTime(52, t);
      oscSub.frequency.exponentialRampToValueAtTime(88, t + 0.08);
      oscSub.frequency.exponentialRampToValueAtTime(44, t + 0.32);

      // Filtro paso-bajo para cuerpo de titanio metálico (corta frecuencias chillonas)
      engineFilter.type = 'lowpass';
      engineFilter.frequency.setValueAtTime(360, t);
      engineFilter.frequency.linearRampToValueAtTime(620, t + 0.11);
      engineFilter.frequency.linearRampToValueAtTime(280, t + 0.38);
      engineFilter.Q.value = 2.0;

      engineGain.gain.setValueAtTime(0.18, t);
      engineGain.gain.linearRampToValueAtTime(0.24, t + 0.09);
      engineGain.gain.linearRampToValueAtTime(0.001, t + 0.40);

      osc1.connect(engineFilter);
      osc2.connect(engineFilter);
      oscSub.connect(engineFilter);
      engineFilter.connect(engineGain);
      engineGain.connect(ctx.destination);

      osc1.start(t);
      osc2.start(t);
      oscSub.start(t);
      osc1.stop(t + 0.42);
      osc2.stop(t + 0.42);
      oscSub.stop(t + 0.42);

      // C) Petardeo grave de escape al corte (Pop sordo de combustión)
      const popOsc = ctx.createOscillator();
      const popFilter = ctx.createBiquadFilter();
      const popGain = ctx.createGain();

      popOsc.type = 'sawtooth';
      popOsc.frequency.setValueAtTime(68, t + 0.14);
      popOsc.frequency.exponentialRampToValueAtTime(32, t + 0.25);

      popFilter.type = 'lowpass';
      popFilter.frequency.setValueAtTime(200, t + 0.14);

      popGain.gain.setValueAtTime(0.14, t + 0.14);
      popGain.gain.linearRampToValueAtTime(0.001, t + 0.28);

      popOsc.connect(popFilter);
      popFilter.connect(popGain);
      popGain.connect(ctx.destination);

      popOsc.start(t + 0.14);
      popOsc.stop(t + 0.29);

    } else if (category === 'crucero') {
      // 2. CRUCEROS Y TURISMO:
      // Golpe sordo y gutural "potato-potato-potato" de gran V-Twin americano
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const masterGain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(46, t);
      osc.frequency.linearRampToValueAtTime(70, t + 0.16);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.46);

      // LFO for potato-potato rhythmic pulse (13 Hz)
      lfo.type = 'sawtooth';
      lfo.frequency.setValueAtTime(13, t);
      lfoGain.gain.setValueAtTime(18, t);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, t);
      filter.Q.value = 2.0;

      masterGain.gain.setValueAtTime(0.18, t);
      masterGain.gain.linearRampToValueAtTime(0.24, t + 0.14);
      masterGain.gain.linearRampToValueAtTime(0.001, t + 0.49);

      osc.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      osc.start(t);
      lfo.start(t);
      osc.stop(t + 0.5);
      lfo.stop(t + 0.5);

    } else if (category === 'offroad') {
      // 3. OFF-ROAD (TODO TERRENO):
      // Golpe de gas rabioso, percusivo y estridente ("BRAAAA-AP!") de 2T / 4T
      const osc = ctx.createOscillator();
      const buzzOsc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(390, t + 0.09);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.32);

      buzzOsc.type = 'square';
      buzzOsc.frequency.setValueAtTime(290, t);
      buzzOsc.frequency.exponentialRampToValueAtTime(450, t + 0.09);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, t);
      filter.frequency.linearRampToValueAtTime(820, t + 0.09);
      filter.Q.value = 2.8;

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.35);

      osc.connect(filter);
      buzzOsc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      buzzOsc.start(t);
      osc.stop(t + 0.36);
      buzzOsc.stop(t + 0.36);

    } else if (category === 'urbana') {
      // 4. URBANAS Y SCOOTERS:
      // Zumbido suave continuo de variador CVT (125-150cc), sin detonaciones
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.linearRampToValueAtTime(255, t + 0.16);
      osc.frequency.linearRampToValueAtTime(180, t + 0.38);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, t);

      gain.gain.setValueAtTime(0.07, t);
      gain.gain.linearRampToValueAtTime(0.10, t + 0.15);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.42);

    } else if (category === 'thumper') {
      // 5. MONOCILÍNDRICOS DE CARRERA LARGA / ROYAL ENFIELD HIMALAYAN 411:
      // El icónico "DUG-DUG-DUG-DUG" / "THUMP-THUMP-THUMP" de carrera larga (86mm).
      // Diseñado con armónicos audibles en cualquier bocina (laptops, celulares y monitores).

      const strokeCount = 4; // 4 detonaciones marcadas y rítmicas
      const strokeInterval = 0.105; // Cadencia pesada de monocilíndrico a ralentí vivo

      for (let s = 0; s < strokeCount; s++) {
        const strokeTime = t + (s * strokeInterval);

        // A) Golpe fundamental del pistón (Sawtooth con armónicos de 85 Hz a 280 Hz - 100% audible)
        const pistonOsc = ctx.createOscillator();
        const pistonGain = ctx.createGain();
        const pistonFilter = ctx.createBiquadFilter();

        pistonOsc.type = 'sawtooth';
        pistonOsc.frequency.setValueAtTime(130, strokeTime);
        pistonOsc.frequency.linearRampToValueAtTime(78, strokeTime + 0.06);

        pistonFilter.type = 'lowpass';
        pistonFilter.frequency.setValueAtTime(340, strokeTime);
        pistonFilter.Q.value = 2.2;

        pistonGain.gain.setValueAtTime(0.28, strokeTime);
        pistonGain.gain.linearRampToValueAtTime(0.001, strokeTime + 0.075);

        pistonOsc.connect(pistonFilter);
        pistonFilter.connect(pistonGain);
        pistonGain.connect(ctx.destination);

        pistonOsc.start(strokeTime);
        pistonOsc.stop(strokeTime + 0.08);

        // B) Bocanada y golpe seco de escape en el silenciador largo (POF / CHUG percusivo)
        const puffOsc = ctx.createOscillator();
        const puffGain = ctx.createGain();
        const puffFilter = ctx.createBiquadFilter();

        puffOsc.type = 'triangle';
        puffOsc.frequency.setValueAtTime(190, strokeTime);
        puffOsc.frequency.linearRampToValueAtTime(95, strokeTime + 0.05);

        puffFilter.type = 'bandpass';
        puffFilter.frequency.setValueAtTime(290, strokeTime);
        puffFilter.Q.value = 1.8;

        puffGain.gain.setValueAtTime(0.22, strokeTime);
        puffGain.gain.linearRampToValueAtTime(0.001, strokeTime + 0.055);

        puffOsc.connect(puffFilter);
        puffFilter.connect(puffGain);
        puffGain.connect(ctx.destination);

        puffOsc.start(strokeTime);
        puffOsc.stop(strokeTime + 0.06);

        // C) Chasquido mecánico característico de balancín y válvula Royal Enfield
        const tickOsc = ctx.createOscillator();
        const tickGain = ctx.createGain();
        const tickFilter = ctx.createBiquadFilter();

        tickOsc.type = 'square';
        tickOsc.frequency.setValueAtTime(860, strokeTime);

        tickFilter.type = 'bandpass';
        tickFilter.frequency.setValueAtTime(980, strokeTime);
        tickFilter.Q.value = 3.2;

        tickGain.gain.setValueAtTime(0.06, strokeTime);
        tickGain.gain.linearRampToValueAtTime(0.001, strokeTime + 0.022);

        tickOsc.connect(tickFilter);
        tickFilter.connect(tickGain);
        tickGain.connect(ctx.destination);

        tickOsc.start(strokeTime);
        tickOsc.stop(strokeTime + 0.025);
      }

      // D) Resonancia general de fondo del silenciador de acero (cuerpo metálico sostenido)
      const bodyOsc = ctx.createOscillator();
      const bodyGain = ctx.createGain();
      const bodyFilter = ctx.createBiquadFilter();

      bodyOsc.type = 'sawtooth';
      bodyOsc.frequency.setValueAtTime(82, t);
      bodyOsc.frequency.linearRampToValueAtTime(105, t + 0.18);
      bodyOsc.frequency.linearRampToValueAtTime(65, t + 0.44);

      bodyFilter.type = 'lowpass';
      bodyFilter.frequency.setValueAtTime(260, t);
      bodyFilter.Q.value = 1.6;

      bodyGain.gain.setValueAtTime(0.18, t);
      bodyGain.gain.linearRampToValueAtTime(0.001, t + 0.48);

      bodyOsc.connect(bodyFilter);
      bodyFilter.connect(bodyGain);
      bodyGain.connect(ctx.destination);

      bodyOsc.start(t);
      bodyOsc.stop(t + 0.49);

    } else {
      // 6. DOBLE PROPÓSITO Y ADVENTURE (Bicilíndricos Boxer / Paralelo: GS, Africa Twin, KTM 890, Tenere)
      // Rugido grave y musculoso de dos cilindros
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(62, t);
      osc1.frequency.exponentialRampToValueAtTime(175, t + 0.12);
      osc1.frequency.exponentialRampToValueAtTime(55, t + 0.35);

      osc2.frequency.setValueAtTime(124, t);
      osc2.frequency.exponentialRampToValueAtTime(245, t + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(90, t + 0.35);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, t);
      filter.frequency.linearRampToValueAtTime(680, t + 0.12);
      filter.Q.value = 2.2;

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.linearRampToValueAtTime(0.19, t + 0.12);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.38);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.4);
      osc2.stop(t + 0.4);
    }
  } catch (_) {
    // Non-critical audio
  }
}

export function triggerExhaustSmoke(
  target?: React.MouseEvent | HTMLElement | { clientX: number; clientY: number },
  motoInfo?: MotoSoundCategory | { motoModel?: string; discipline?: string } | string
) {
  if (typeof window === 'undefined') return;

  const category = (typeof motoInfo === 'string' && ['urbana', 'deportiva', 'adventure', 'crucero', 'offroad', 'thumper'].includes(motoInfo))
    ? (motoInfo as MotoSoundCategory)
    : detectMotoCategory(motoInfo);

  let originX = window.innerWidth / 2;
  let originY = window.innerHeight * 0.75;

  if (target) {
    if ('clientX' in target && typeof target.clientX === 'number') {
      originX = target.clientX;
      originY = target.clientY;
    } else if ('getBoundingClientRect' in target && typeof target.getBoundingClientRect === 'function') {
      const rect = target.getBoundingClientRect();
      originX = rect.left + rect.width / 2;
      originY = rect.top + rect.height / 2;
    }
  }

  getCanvas();

  // Color palette tailored by motorcycle discipline & exhaust temperature
  let smokePalettes: [number, number, number][] = [];
  let sparkColors: string[] = [];
  let puffCount = 40;
  let sparkCount = 14;

  if (category === 'deportiva') {
    // Titanium blueish haze + high-heat sparks
    smokePalettes = [
      [65, 70, 85],     // Deep titanium carbon
      [105, 115, 135],  // Blueish exhaust gas
      [155, 165, 185],  // Ash smoke
      [185, 205, 225]   // Titanium vapor
    ];
    sparkColors = ['#00e5ff', '#ff5500', '#ff9900', '#ffffff'];
    puffCount = 44;
    sparkCount = 18;
  } else if (category === 'crucero') {
    // Dense, rich charcoal carbon black
    smokePalettes = [
      [35, 30, 28],
      [55, 48, 44],
      [80, 72, 68],
      [110, 100, 95]
    ];
    sparkColors = ['#ff4400', '#ff7700', '#ffbb00'];
    puffCount = 48;
    sparkCount = 12;
  } else if (category === 'offroad') {
    // Dusty earth & dry terrain exhaust
    smokePalettes = [
      [90, 80, 70],
      [135, 125, 110],
      [175, 160, 140],
      [205, 195, 180]
    ];
    sparkColors = ['#ff4400', '#ffaa00', '#ffffff'];
    puffCount = 38;
    sparkCount = 16;
  } else if (category === 'urbana') {
    // Light clean vapor
    smokePalettes = [
      [170, 175, 180],
      [200, 205, 210],
      [225, 230, 235]
    ];
    sparkColors = ['#ffaa00', '#ffffff'];
    puffCount = 26;
    sparkCount = 5;
  } else if (category === 'thumper') {
    // Royal Enfield Himalayan: Humo terroso de terracería, carbón denso y chispas ámbar cálidas
    smokePalettes = [
      [55, 50, 45],     // Carbón denso
      [85, 75, 65],     // Humo tostado
      [145, 130, 115],  // Polvo de brecha / terracería
      [180, 140, 95],   // Ocre cálido de escape
      [215, 205, 195]   // Ceniza suave
    ];
    sparkColors = ['#ff7700', '#ff9900', '#ffcc00', '#ffffff'];
    puffCount = 36;
    sparkCount = 12;
  } else {
    // Doble Propósito & Adventure: Carbon, heavy gray, and warm bronze manifold heat
    smokePalettes = [
      [48, 45, 42],
      [82, 78, 75],
      [125, 120, 115],
      [175, 115, 75],   // Warm bronze heat
      [205, 200, 195]
    ];
    sparkColors = ['#ff4400', '#ff6b00', '#ff9900', '#ffbb00', '#ffffff'];
    puffCount = 40;
    sparkCount = 15;
  }

  // Direction: if button is near right edge, fire towards left; otherwise towards right
  const blowLeft = originX > (window.innerWidth * 0.6);
  const baseAngle = blowLeft ? Math.PI : 0; // 180° (left) or 0° (right)

  // Spawn billowing smoke puffs in a lateral exhaust jet
  for (let i = 0; i < puffCount; i++) {
    const angle = baseAngle + ((Math.random() - 0.5) * 0.48);
    const speed = Math.random() * 7.5 + 4.5;

    activeParticles.push({
      x: originX + (blowLeft ? -10 : 10) + (Math.random() - 0.5) * 8,
      y: originY + (Math.random() - 0.5) * 10,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed * 0.6,
      size: Math.random() * 10 + 6,
      maxSize: Math.random() * 75 + 50,
      alpha: Math.random() * 0.4 + 0.55,
      decay: Math.random() * 0.014 + 0.01,
      growth: Math.random() * 1.6 + 1.1,
      rgb: smokePalettes[Math.floor(Math.random() * smokePalettes.length)]
    });
  }

  // Spawn glowing backfire embers/sparks shooting straight out of the exhaust tip
  for (let i = 0; i < sparkCount; i++) {
    const angle = baseAngle + ((Math.random() - 0.5) * 0.32);
    const speed = Math.random() * 11 + 6.5;

    activeSparks.push({
      x: originX + (blowLeft ? -12 : 12),
      y: originY + (Math.random() - 0.5) * 6,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed * 0.5,
      size: Math.random() * 2.2 + 1.2,
      alpha: 1.0,
      decay: Math.random() * 0.04 + 0.025,
      color: sparkColors[Math.floor(Math.random() * sparkColors.length)]
    });
  }

  // Trigger category-specific acoustic engine sound
  playMotorcycleAudio(category);

  if (!animFrameId) {
    animFrameId = requestAnimationFrame(animate);
  }
}
