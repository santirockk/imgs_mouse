document.addEventListener('DOMContentLoaded', () => {
  /* ============================================================
     CONFIGURACIÓN
     ============================================================ */
  const CONFIG = {
    total: 14,
    folder: 'images',
    ext: 'jpg',
    pad: false,
    cols: 7,
    rows: 2,
  };

  /* ============================================================
     REFERENCIAS
     ============================================================ */
  const viewer = document.getElementById('viewer');
  if (!viewer) {
    console.error('[error] No se encontró <img id="viewer"> en el DOM.');
    return;
  }

  function buildSrc(i) {
    const n = CONFIG.pad ? String(i).padStart(2, '0') : String(i);
    return `${CONFIG.folder}/img_${n}.${CONFIG.ext}`;
  }

  /* Precarga en memoria (no en el DOM) */
  const cache = [];
  for (let i = 1; i <= CONFIG.total; i++) {
    const im = new Image();
    im.src = buildSrc(i);
    cache.push(im);
  }

  /* ============================================================
     ÍNDICE POR CUADRÍCULA (7 × 2)
     ============================================================ */
  function indexFromGrid(x, y) {
    const { cols, rows, total } = CONFIG;
    let col = Math.floor((x / window.innerWidth)  * cols);
    let row = Math.floor((y / window.innerHeight) * rows);

    // clamp por seguridad (bordes, scroll, etc.)
    if (col < 0) col = 0;
    else if (col >= cols) col = cols - 1;
    if (row < 0) row = 0;
    else if (row >= rows) row = rows - 1;

    const idx = row * cols + col;
    return idx >= total ? total - 1 : idx;
  }

  /* ============================================================
     CAMBIO DIRECTO (sin transición)
     ============================================================ */
  let currentIndex = -1;

  function setIndex(i) {
    if (i === currentIndex) return;
    currentIndex = i;
    viewer.src = cache[i].src;
  }

  /* Throttle con requestAnimationFrame */
  let rafId = null;
  let px = 0, py = 0;

  function schedule(x, y) {
    px = x; py = y;
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      setIndex(indexFromGrid(px, py));
    });
  }

  window.addEventListener('mousemove', (e) => schedule(e.clientX, e.clientY), { passive: true });
  window.addEventListener(
    'touchmove',
    (e) => { if (e.touches.length) schedule(e.touches[0].clientX, e.touches[0].clientY); },
    { passive: true }
  );

  /* Inicio */
  setIndex(0);
});