/* =========================================================
   SQLingo — motor de lecciones estilo Duolingo
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- Normalización de respuestas escritas ---------- */
  const norm = (s) => String(s)
    .replace(/[‘’´`]/g, "'").replace(/[“”]/g, '"')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .replace(/\s*([(),=+\-*\/;<>])\s*/g, '$1')
    .replace(/;+$/, '')
    .trim();
  const prettyTokens = (words) => words.join(' ')
    .replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').replace(/\s+,/g, ',');

  /* ---------- Almacenamiento ---------- */
  const KEY = 'sqlingo-v1';
  const defaults = { xp: 0, streak: 0, lastDay: null, done: {}, missed: [], sound: true };
  let S = { ...defaults };
  try { S = { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (e) { /* sin storage */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } };

  /* ---------- Resaltado de SQL ---------- */
  const KW = new Set(('SELECT FROM WHERE INSERT INTO VALUES UPDATE SET DELETE CREATE OR ALTER PROCEDURE PROC FUNCTION TRIGGER VIEW AS BEGIN END TRY CATCH DECLARE IF ELSE EXISTS NOT AND WHILE OPEN FETCH CLOSE DEALLOCATE CURSOR FOR SCROLL FIRST LAST ABSOLUTE PRIOR NEXT RELATIVE RETURNS RETURN EXEC EXECUTE OUTPUT OUT PRINT GO ON INNER JOIN LEFT TRANSACTION TRAN COMMIT ROLLBACK SAVE CASE WHEN THEN NULL DROP TABLE DATABASE AFTER INSTEAD OF DISABLE ENABLE USE INT SMALLINT VARCHAR CHAR DECIMAL MONEY DATE DATETIME NUMERIC TEXT NOCOUNT DATEFORMAT DROP_TABLE BY ORDER GROUP IN IS LIKE TOP DISTINCT DEFAULT PRIMARY KEY REFERENCES YEAR MONTH HH DMY').split(' '));
  const FN = new Set(('CAST CONVERT ERROR_MESSAGE ERROR_NUMBER ERROR_LINE ERROR_SEVERITY ERROR_STATE ERROR_PROCEDURE RAISERROR SPACE REPLICATE LTRIM RTRIM TRIM STR UPPER LOWER MAX MIN AVG SUM COUNT GETDATE DATEPART DATEDIFF FORMAT HOST_NAME SUSER_SNAME SUSER_NAME APP_NAME SUBSTRING USER').split(' '));
  const TOK = /(--[^\n]*)|('(?:[^'\n]|'')*'?)|(@@?\w+)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)|([\s\S])/g;

  function highlight(code) {
    let out = '';
    code.replace(TOK, (m, com, str, v, num, word, other) => {
      if (com) out += `<span class="tk-c">${esc(com)}</span>`;
      else if (str) out += `<span class="tk-s">${esc(str)}</span>`;
      else if (v) out += `<span class="tk-v">${esc(v)}</span>`;
      else if (num) out += `<span class="tk-n">${num}</span>`;
      else if (word) {
        const u = word.toUpperCase();
        if (KW.has(u)) out += `<span class="tk-k">${esc(word)}</span>`;
        else if (FN.has(u)) out += `<span class="tk-f">${esc(word)}</span>`;
        else out += esc(word);
      } else out += esc(other);
      return m;
    });
    return out;
  }
  const codeBlock = (code) => { const p = el('pre', 'code'); p.innerHTML = highlight(code); return p; };
  const looksCode = (s) => /\n|^(SELECT|EXEC|EXECUTE|CALL|RUN|SET|DECLARE|FETCH|CREATE|SHOW|PRINT|DROP|SAVE|BEGIN|TRY|ON |RRHH|Compras|Ventas|@|dbo\.|sys\.|[A-Z_]+\(|'|[\d.]+$|[A-Z_]{4,}(\s|$))/.test(s) && !/^(Porque|Para|Por)/.test(s);

  /* ---------- Sonidos ---------- */
  let ac;
  function tone(freqs, dur = 0.09, type = 'sine', gap = 0.08, vol = 0.12) {
    if (!S.sound) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach((f, i) => {
        const o = ac.createOscillator(), g = ac.createGain();
        const t = ac.currentTime + i * gap;
        o.type = type; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.1);
        o.connect(g).connect(ac.destination);
        o.start(t); o.stop(t + dur + 0.12);
      });
    } catch (e) { /* sin audio */ }
  }
  const sfx = {
    ok: () => tone([660, 990], 0.1, 'sine', 0.09),
    bad: () => tone([220, 180], 0.14, 'square', 0.12, 0.05),
    tap: () => tone([520], 0.03, 'sine', 0, 0.05),
    win: () => tone([523, 659, 784, 1047], 0.14, 'triangle', 0.12),
  };

  /* ---------- Lecciones por unidad ---------- */
  const PER = 7;
  UNITS.forEach((u) => {
    u.qs.forEach((q, i) => { q.id = `${u.id}-${i}`; q.unit = u; });
    const n = Math.max(1, Math.round(u.qs.length / PER));
    u.lessons = [];
    for (let i = 0; i < n; i++) {
      const a = Math.floor(i * u.qs.length / n), b = Math.floor((i + 1) * u.qs.length / n);
      u.lessons.push(u.qs.slice(a, b));
    }
  });
  const ALL_Q = UNITS.flatMap((u) => u.qs);
  const Q_BY_ID = Object.fromEntries(ALL_Q.map((q) => [q.id, q]));
  const TOTAL_LESSONS = UNITS.reduce((s, u) => s + u.lessons.length, 0);

  // Historias: los diálogos vienen como arreglos ['personaje', 'texto', 'código?']
  STORIES.forEach((st) => {
    st.steps = st.steps.map((x, i) => {
      const step = Array.isArray(x) ? { t: 'say', s: x[0], text: x[1], code: x[2] } : x;
      step.id = `st-${st.id}-${i}`;
      return step;
    });
    st.nQs = st.steps.filter((x) => x.t !== 'say').length;
  });
  const TOTAL = TOTAL_LESSONS + STORIES.length;

  /* =========================================================
     HOME
     ========================================================= */
  const OFFSETS = [0, 52, 78, 52, 0, -52, -78, -52];

  function renderHome() {
    $('#xp').textContent = S.xp;
    $('#streak').textContent = S.streak;
    $('#soundBtn').textContent = S.sound ? '🔊' : '🔇';

    const doneCount = Object.keys(S.done).length;
    const pct = Math.min(100, Math.round(doneCount / TOTAL * 100));
    $('#overallBar').style.width = pct + '%';
    $('#overallTxt').textContent = pct + '%';

    S.missed = S.missed.filter((id) => Q_BY_ID[id]);
    const rb = $('#reviewBtn');
    rb.disabled = S.missed.length === 0;
    $('#reviewTxt').textContent = S.missed.length
      ? `${S.missed.length} pregunta${S.missed.length > 1 ? 's' : ''} por reforzar`
      : 'Aún no tienes errores 😎';

    const grid = $('#storyGrid');
    grid.innerHTML = '';
    STORIES.forEach((st) => {
      const done = S.done['story:' + st.id];
      const b = el('button', `story-card c-${st.color}` + (done ? ' done' : ''),
        `<span class="st-ico">${st.icon}</span><b>${esc(st.title)}</b><small>${esc(st.topic)}</small>`);
      b.onclick = () => startStory(st);
      grid.appendChild(b);
    });

    const path = $('#path');
    path.innerHTML = '';
    let k = 0;
    UNITS.forEach((u) => {
      const row = el('div', 'unit-row');
      const head = el('div', `unit-header c-${u.color}`,
        `<div><small>${esc(u.sub)}</small><b>${u.icon} ${esc(u.title)}</b></div>`);
      const g = el('button', 'guide', '📖 Guía');
      g.onclick = () => openCheat(u);
      head.appendChild(g);
      row.appendChild(head);

      u.lessons.forEach((_, li) => {
        const key = `${u.id}:${li}`;
        const wrap = el('div', 'node-wrap');
        wrap.style.transform = `translateX(${OFFSETS[k++ % OFFSETS.length]}px)`;
        const btn = el('button', `node c-${u.color}` + (S.done[key] ? ' done' : ''), u.icon);
        btn.setAttribute('aria-label', `${u.title}, lección ${li + 1}`);
        btn.onclick = () => openPop(u, li);
        wrap.appendChild(btn);
        if (S.done[key]) wrap.appendChild(el('div', 'stars', '★'.repeat(S.done[key]) + '☆'.repeat(3 - S.done[key])));
        row.appendChild(wrap);
      });
      path.appendChild(row);
    });
  }

  function openPop(u, li) {
    sfx.tap();
    const card = $('#popCard');
    card.className = `pop-card c-${u.color}`;
    $('#popTitle').textContent = `${u.icon} ${u.title}`;
    $('#popSub').textContent = `Lección ${li + 1} de ${u.lessons.length} · ${u.lessons[li].length} ejercicios`;
    $('#popStart').onclick = () => { closePop(); startLesson(u.lessons[li], { mode: 'lesson', key: `${u.id}:${li}`, title: u.title }); };
    $('#popCheat').onclick = () => { closePop(); openCheat(u, li); };
    $('#pop').classList.remove('hidden');
  }
  const closePop = () => $('#pop').classList.add('hidden');
  $('#pop').addEventListener('click', (e) => { if (e.target.id === 'pop') closePop(); });

  function openCheat(u, li = 0) {
    $('#cheatTitle').textContent = `${u.icon} ${u.title}`;
    const body = $('#cheatBody');
    body.innerHTML = '';
    u.cheat.forEach((c) => {
      body.appendChild(el('h4', null, esc(c.h)));
      if (c.p) body.appendChild(el('p', null, c.p));
      if (c.code) body.appendChild(codeBlock(c.code));
    });
    body.scrollTop = 0;
    $('#cheatStart').onclick = () => {
      $('#cheat').classList.add('hidden');
      startLesson(u.lessons[li], { mode: 'lesson', key: `${u.id}:${li}`, title: u.title });
    };
    $('#cheat').classList.remove('hidden');
  }
  $('#cheatClose').onclick = () => $('#cheat').classList.add('hidden');
  $('#cheat').addEventListener('click', (e) => { if (e.target.id === 'cheat') $('#cheat').classList.add('hidden'); });

  $('#soundBtn').onclick = () => { S.sound = !S.sound; save(); renderHome(); sfx.tap(); };
  $('#examBtn').onclick = () => startLesson(shuffle(ALL_Q.filter((q) => q.unit.id !== 'bd')).slice(0, 20), { mode: 'exam', title: 'Simulacro' });
  $('#reviewBtn').onclick = () => startLesson(shuffle(S.missed.map((id) => Q_BY_ID[id])).slice(0, 12), { mode: 'review', title: 'Repaso' });
  $('#resetBtn').onclick = () => {
    if (confirm('¿Borrar todo tu progreso (XP, racha y lecciones)?')) { S = { ...defaults, done: {}, missed: [] }; save(); renderHome(); }
  };

  /* =========================================================
     LECCIÓN
     ========================================================= */
  let L = null;     // sesión actual
  let cur = null;   // controlador de la pregunta actual

  function show(id) {
    ['home', 'lesson', 'result'].forEach((s) => $('#' + s).classList.toggle('hidden', s !== id));
    window.scrollTo(0, 0);
  }

  function startStory(st) {
    sfx.tap();
    startLesson(st.steps, { mode: 'story', key: 'story:' + st.id, title: st.title, story: st });
  }

  function startLesson(qs, opts) {
    if (!qs.length) return;
    L = {
      ...opts,
      source: qs,
      queue: opts.mode === 'story' ? qs.slice() : shuffle(qs),
      total: qs.length,
      correct: 0,
      firstTry: 0,
      answered: 0,
      requeued: new Set(),
      hearts: opts.mode === 'exam' || opts.mode === 'story' ? Infinity : 5,
      combo: 0,
      start: Date.now(),
      wrongList: [],
    };
    $('.hearts').classList.toggle('hidden', opts.mode === 'exam' || opts.mode === 'story');
    $('#hearts').textContent = 5;
    show('lesson');
    if (opts.mode === 'story') {
      const area = $('#qArea');
      area.innerHTML = '';
      area.appendChild(el('div', `st-title c-${opts.story.color}`,
        `<span>${opts.story.icon}</span><div><small>Historia · ${esc(opts.story.topic)}</small><b>${esc(opts.story.title)}</b></div>`));
    }
    nextQuestion();
  }

  function updateBar() {
    $('#lessonBar').style.width = (L.correct / L.total * 100) + '%';
  }

  function nextQuestion() {
    $('#sheet').classList.remove('show', 'bad');
    $('#combo').classList.add('hidden');
    updateBar();
    if (!L.queue.length) return finish(true);
    const q = L.queue[0];
    const area = $('#qArea');
    if (L.mode === 'story') return nextStoryStep(q, area);
    area.innerHTML = '';
    area.style.animation = 'none'; void area.offsetWidth; area.style.animation = '';
    cur = RENDER[q.t](q, area);
    cur.q = q;
    $('#checkBtn').disabled = true;
    $('#checkBtn').textContent = 'Comprobar';
    $('#skipBtn').classList.remove('hidden');
  }

  const setReady = (v) => { $('#checkBtn').disabled = !v; };

  function sayBubble(step) {
    const c = CAST[step.s] || CAST.nar;
    if (step.s === 'nar') {
      const n = el('div', 'st-nar', esc(step.text));
      if (step.code) n.appendChild(codeBlock(step.code));
      return n;
    }
    const row = el('div', 'st-row' + (step.s === 'tu' ? ' me' : ''));
    row.appendChild(el('div', `st-av c-${c.color}`, c.emoji));
    const b = el('div', 'st-bubble', `<b class="st-name">${esc(c.name)}</b><span>${esc(step.text)}</span>`);
    if (step.code) b.appendChild(codeBlock(step.code));
    row.appendChild(b);
    return row;
  }

  function nextStoryStep(q, area) {
    area.querySelectorAll('.story-q').forEach((w) => w.classList.add('frozen'));
    if (q.t === 'say') {
      area.appendChild(sayBubble(q));
      cur = { q, say: true, check: () => ({ ok: true }) };
      $('#checkBtn').disabled = false;
      $('#checkBtn').textContent = 'Continuar';
      $('#skipBtn').classList.add('hidden');
    } else {
      const wrap = el('div', 'story-q');
      area.appendChild(wrap);
      cur = RENDER[q.t](q, wrap);
      cur.q = q;
      $('#checkBtn').disabled = true;
      $('#checkBtn').textContent = 'Comprobar';
      $('#skipBtn').classList.remove('hidden');
    }
    requestAnimationFrame(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
  }

  function doCheck() {
    if ($('#checkBtn').disabled || !cur || cur.checked) return;
    cur.checked = true;
    const q = cur.q;
    if (cur.say) {
      sfx.tap();
      L.queue.shift();
      L.correct++;
      return nextQuestion();
    }
    const res = cur.check();
    L.queue.shift();
    L.answered++;

    const sheet = $('#sheet');
    const body = $('#sheetBody');
    body.innerHTML = '';

    if (res.ok) {
      L.correct++;
      if (!L.requeued.has(q.id)) L.firstTry++;
      L.combo++;
      S.missed = S.missed.filter((id) => id !== q.id);
      sfx.ok();
      const praise = ['¡Excelente!', '¡Bien hecho!', '¡Correcto!', '¡Genial!', '¡Así se hace!', '¡Perfecto!'];
      $('#sheetIcon').textContent = '✔️';
      $('#sheetTitle').textContent = praise[Math.floor(Math.random() * praise.length)];
      if (L.combo >= 3) {
        const c = $('#combo');
        c.textContent = `🔥 ${L.combo} seguidas`;
        c.classList.remove('hidden');
      }
    } else {
      L.combo = 0;
      if (L.mode !== 'story' && !S.missed.includes(q.id)) S.missed.push(q.id);
      L.wrongList.push(q);
      sfx.bad();
      sheet.classList.add('bad');
      $('#sheetIcon').textContent = '✖️';
      $('#sheetTitle').textContent = 'Respuesta correcta:';
      if (res.answer) {
        const pre = el('pre');
        pre.textContent = res.answer;
        body.appendChild(pre);
      }
      if (L.mode !== 'exam' && L.mode !== 'story') {
        L.hearts--;
        $('#hearts').textContent = L.hearts;
        const h = $('.hearts'); h.classList.remove('hit'); void h.offsetWidth; h.classList.add('hit');
        if (!L.requeued.has(q.id)) { L.requeued.add(q.id); L.queue.push(q); L.total++; }
      } else {
        L.correct++; // en el simulacro y en las historias avanzamos igual
      }
    }
    if (q.ex) body.appendChild(el('div', 'ex', '💡 ' + q.ex));
    save();
    updateBar();
    sheet.classList.add('show');
    $('#skipBtn').classList.add('hidden');
    setTimeout(() => $('#nextBtn').focus({ preventScroll: true }), 50);
  }

  $('#checkBtn').onclick = doCheck;
  $('#skipBtn').onclick = () => {
    if (!cur || cur.checked) return;
    cur.check = ((orig) => () => ({ ...orig(), ok: false }))(cur.check);
    $('#checkBtn').disabled = false;
    doCheck();
  };
  $('#nextBtn').onclick = () => {
    if (L.mode !== 'exam' && L.hearts <= 0) return finish(false);
    nextQuestion();
  };
  $('#quitBtn').onclick = () => {
    if (L && L.answered > 0 && !confirm('¿Salir de la lección? Perderás el progreso de esta lección.')) return;
    L = null; renderHome(); show('home');
  };
  document.addEventListener('keydown', (e) => {
    if ($('#lesson').classList.contains('hidden')) return;
    if (e.key !== 'Enter' || e.shiftKey) return;
    if ($('#sheet').classList.contains('show')) { e.preventDefault(); $('#nextBtn').click(); }
    else if (!$('#checkBtn').disabled) { e.preventDefault(); doCheck(); }
  });

  /* ---------- Resultado ---------- */
  function finish(completed) {
    const secs = Math.round((Date.now() - L.start) / 1000);
    const unique = L.source.length;
    let acc, xp = 0, title, emoji, msg;

    if (L.mode === 'story') {
      const n = L.story.nQs;
      const good = n - L.wrongList.length;
      acc = Math.round(good / n * 100);
      xp = good * 10 + 10;
      title = '¡Historia completada!';
      emoji = acc === 100 ? '🏆' : acc >= 70 ? '🎉' : '📖';
      msg = acc === 100 ? '¡Resolviste todos los problemas de la historia!' : `Acertaste ${good} de ${n}. Léela otra vez para afianzar.`;
      S.done[L.key] = Math.max(S.done[L.key] || 0, acc === 100 ? 3 : acc >= 70 ? 2 : 1);
    } else if (L.mode === 'exam') {
      const good = unique - L.wrongList.length;
      acc = Math.round(good / unique * 100);
      xp = good * 5;
      const nota = Math.round(good / unique * 20);
      title = `Nota: ${nota} / 20`;
      emoji = nota >= 17 ? '🏆' : nota >= 13 ? '🎉' : nota >= 11 ? '👍' : '📚';
      msg = nota >= 13 ? '¡Estás listo para el examen!' : 'Repasa la chuleta de los temas donde fallaste y vuelve a intentarlo.';
      if (L.wrongList.length) msg += ` Fallaste en: ${[...new Set(L.wrongList.map((q) => q.unit.title))].join(', ')}.`;
    } else if (!completed) {
      acc = Math.round(L.firstTry / Math.max(1, L.answered) * 100);
      title = 'Te quedaste sin vidas 💔';
      emoji = '😵';
      msg = 'No pasa nada: lee la guía y vuelve a intentarlo.';
    } else {
      acc = Math.round(L.firstTry / unique * 100);
      xp = L.firstTry * 10 + 5;
      title = L.mode === 'review' ? '¡Repaso completado!' : '¡Lección completada!';
      emoji = acc === 100 ? '🏆' : acc >= 80 ? '🎉' : '💪';
      msg = acc === 100 ? '¡Perfecto, sin errores!' : acc >= 80 ? '¡Muy bien! Casi perfecto.' : 'Completado. Repite para mejorar tu precisión.';
      if (L.key) {
        const stars = acc === 100 ? 3 : acc >= 70 ? 2 : 1;
        S.done[L.key] = Math.max(S.done[L.key] || 0, stars);
      }
    }

    if (xp > 0 || completed) bumpStreak();
    S.xp += xp;
    save();

    $('#resEmoji').textContent = emoji;
    $('#resTitle').textContent = title;
    $('#resXp').textContent = '+' + xp;
    $('#resAcc').textContent = acc + '%';
    $('#resTime').textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
    $('#resMsg').textContent = msg;
    const last = { source: L.source, opts: { mode: L.mode, key: L.key, title: L.title, story: L.story } };
    $('#resRetry').onclick = () => startLesson(last.opts.mode === 'exam' ? shuffle(ALL_Q.filter((q) => q.unit.id !== 'bd')).slice(0, 20) : last.source, last.opts);
    show('result');
    if (completed && acc >= 60) { sfx.win(); confetti(); } else sfx.bad();
  }
  $('#resContinue').onclick = () => { L = null; renderHome(); show('home'); };

  function bumpStreak() {
    const d = new Date();
    const today = d.toISOString().slice(0, 10);
    if (S.lastDay === today) return;
    const y = new Date(d.getTime() - 864e5).toISOString().slice(0, 10);
    S.streak = S.lastDay === y ? S.streak + 1 : 1;
    S.lastDay = today;
  }

  function confetti() {
    const cv = $('#confetti');
    const ctx = cv.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    ctx.scale(dpr, dpr);
    const colors = ['#58cc02', '#1cb0f6', '#ffc800', '#ff4b4b', '#ce82ff', '#ff9600'];
    const P = Array.from({ length: 140 }, () => ({
      x: innerWidth / 2 + (Math.random() - .5) * 80, y: innerHeight * .35,
      vx: (Math.random() - .5) * 12, vy: -Math.random() * 13 - 4,
      r: Math.random() * 6 + 4, a: Math.random() * 6.28, va: (Math.random() - .5) * .3,
      c: colors[Math.floor(Math.random() * colors.length)],
    }));
    const t0 = performance.now();
    (function frame(t) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      P.forEach((p) => {
        p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
        ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
        ctx.restore();
      });
      if (t - t0 < 3200) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, innerWidth, innerHeight);
    })(t0);
  }

  /* =========================================================
     RENDERERS POR TIPO
     ========================================================= */
  const KIND = {
    mc: '🎯 Elige la respuesta',
    tf: '🤔 ¿Verdadero o falso?',
    fill: '✏️ Completa el código',
    write: '⌨️ Escribe el código',
    build: '🧩 Arma la instrucción',
    order: '🔀 Ordena las líneas',
    match: '🔗 Une las parejas',
  };
  function header(q, area) {
    area.appendChild(el('div', 'q-kind', KIND[q.t] + (L.requeued.has(q.id) ? ' · <span style="color:var(--red)">repaso</span>' : '')));
    area.appendChild(el('p', 'q-text', q.q));
  }

  const RENDER = {
    /* ---- opción múltiple ---- */
    mc(q, area) {
      header(q, area);
      if (q.code) area.appendChild(codeBlock(q.code));
      const box = el('div', 'options');
      const order = shuffle(q.o.map((_, i) => i));
      let sel = null;
      const btns = order.map((oi, n) => {
        const b = el('button', 'opt');
        b.innerHTML = `<span class="num">${n + 1}</span><span class="txt${looksCode(q.o[oi]) ? ' mono' : ''}">${esc(q.o[oi])}</span>`;
        b.onclick = () => {
          if (ctl.checked) return;
          sfx.tap();
          btns.forEach((x) => x.classList.remove('sel'));
          b.classList.add('sel'); sel = oi; setReady(true);
        };
        box.appendChild(b);
        return b;
      });
      area.appendChild(box);
      const ctl = {
        check() {
          const ok = sel === q.a;
          btns.forEach((b, n) => {
            if (order[n] === q.a) b.classList.add('ok');
            else if (order[n] === sel) b.classList.add('bad');
            b.classList.remove('sel');
          });
          return { ok, answer: q.o[q.a] };
        },
      };
      return ctl;
    },

    /* ---- verdadero / falso ---- */
    tf(q, area) {
      header(q, area);
      if (q.code) area.appendChild(codeBlock(q.code));
      const box = el('div', 'options tf');
      let sel = null;
      const mk = (label, val) => {
        const b = el('button', 'opt', `<span class="txt">${label}</span>`);
        b.onclick = () => {
          if (ctl.checked) return;
          sfx.tap();
          box.querySelectorAll('.opt').forEach((x) => x.classList.remove('sel'));
          b.classList.add('sel'); sel = val; setReady(true);
        };
        b.dataset.val = val;
        box.appendChild(b);
      };
      mk('✅ Verdadero', true);
      mk('❌ Falso', false);
      area.appendChild(box);
      const ctl = {
        check() {
          box.querySelectorAll('.opt').forEach((b) => {
            const v = b.dataset.val === 'true';
            b.classList.remove('sel');
            if (v === q.a) b.classList.add('ok'); else if (v === sel) b.classList.add('bad');
          });
          return { ok: sel === q.a, answer: q.a ? 'Verdadero' : 'Falso' };
        },
      };
      return ctl;
    },

    /* ---- completar huecos ---- */
    fill(q, area) {
      header(q, area);
      const pre = el('pre', 'code');
      const parts = q.code.split('___');
      const inputs = [];
      parts.forEach((p, i) => {
        pre.insertAdjacentHTML('beforeend', highlight(p));
        if (i < parts.length - 1) {
          const inp = el('input', 'blank');
          Object.assign(inp, { type: 'text', autocomplete: 'off', spellcheck: false });
          inp.setAttribute('autocapitalize', 'off');
          inp.setAttribute('autocorrect', 'off');
          inp.setAttribute('aria-label', `Hueco ${i + 1}`);
          const base = Math.max(6, (q.a[i][0] || '').length + 2);
          inp.style.width = base + 'ch';
          inp.oninput = () => {
            inp.style.width = Math.max(base, inp.value.length + 2) + 'ch';
            setReady(inputs.every((x) => x.value.trim()));
          };
          inputs.push(inp);
          pre.appendChild(inp);
        }
      });
      area.appendChild(pre);
      area.appendChild(el('div', 'hint', 'Toca el hueco azul y escribe. No importan mayúsculas.'));
      setTimeout(() => inputs[0] && inputs[0].focus({ preventScroll: true }), 250);
      return {
        check() {
          let ok = true;
          inputs.forEach((inp, i) => {
            const good = q.a[i].some((a) => norm(a) === norm(inp.value));
            inp.classList.add(good ? 'ok' : 'bad');
            inp.readOnly = true;
            if (!good) ok = false;
          });
          let n = 0;
          const answer = q.code.replace(/___/g, () => q.a[n++][0]);
          return { ok, answer };
        },
      };
    },

    /* ---- escribir línea ---- */
    write(q, area) {
      header(q, area);
      const ta = el('textarea', 'write');
      ta.placeholder = 'Escribe aquí tu código…';
      ta.setAttribute('autocapitalize', 'off');
      ta.setAttribute('autocorrect', 'off');
      ta.spellcheck = false;
      ta.oninput = () => setReady(ta.value.trim().length > 0);
      area.appendChild(ta);
      if (q.hint) area.appendChild(el('div', 'hint', '💡 Pista: <code>' + esc(q.hint) + '</code>'));
      setTimeout(() => ta.focus({ preventScroll: true }), 250);
      return {
        check() {
          ta.readOnly = true;
          const ok = q.a.some((a) => norm(a) === norm(ta.value));
          ta.style.borderColor = ok ? 'var(--green)' : 'var(--red)';
          return { ok, answer: q.a[0] };
        },
      };
    },

    /* ---- banco de palabras ---- */
    build(q, area) {
      header(q, area);
      const line = el('div', 'answer-line');
      const bank = el('div', 'bank');
      const tokens = shuffle([...q.words, ...(q.extra || [])].map((w, i) => ({ w, i })));
      const chosen = [];
      const refresh = () => setReady(chosen.length > 0);
      tokens.forEach((t) => {
        const b = el('button', 'chip');
        b.textContent = t.w;
        b.onclick = () => {
          if (ctl.checked || b.classList.contains('used')) return;
          sfx.tap();
          b.classList.add('used');
          const c = el('button', 'chip');
          c.textContent = t.w;
          c.onclick = () => {
            if (ctl.checked) return;
            sfx.tap();
            chosen.splice(chosen.indexOf(t), 1);
            c.remove(); b.classList.remove('used'); refresh();
          };
          chosen.push(t);
          line.appendChild(c);
          refresh();
        };
        bank.appendChild(b);
      });
      area.appendChild(line);
      area.appendChild(bank);
      const ctl = {
        check() {
          const ok = norm(chosen.map((t) => t.w).join(' ')) === norm(q.words.join(' '));
          return { ok, answer: prettyTokens(q.words) };
        },
      };
      return ctl;
    },

    /* ---- ordenar líneas ---- */
    order(q, area) {
      header(q, area);
      const ans = el('div', 'order-answer');
      const bank = el('div', 'order-bank');
      let idx = q.lines.map((_, i) => i);
      do { idx = shuffle(idx); } while (q.lines.length > 1 && idx.every((v, i) => v === i));
      const chosen = [];
      idx.forEach((i) => {
        const b = el('button', 'line-chip');
        b.innerHTML = highlight(q.lines[i]);
        b.onclick = () => {
          if (ctl.checked || b.classList.contains('used')) return;
          sfx.tap();
          b.classList.add('used');
          const c = el('button', 'line-chip');
          c.innerHTML = highlight(q.lines[i]);
          c.onclick = () => {
            if (ctl.checked) return;
            sfx.tap();
            chosen.splice(chosen.indexOf(i), 1);
            c.remove(); b.classList.remove('used');
            setReady(chosen.length === q.lines.length);
          };
          chosen.push(i);
          ans.appendChild(c);
          setReady(chosen.length === q.lines.length);
        };
        bank.appendChild(b);
      });
      area.appendChild(ans);
      area.appendChild(bank);
      const ctl = {
        check() {
          let ok = true;
          [...ans.children].forEach((c, n) => {
            const good = norm(q.lines[chosen[n]]) === norm(q.lines[n]);
            c.classList.add(good ? 'ok' : 'bad');
            if (!good) ok = false;
          });
          return { ok, answer: q.lines.join('\n') };
        },
      };
      return ctl;
    },

    /* ---- unir parejas ---- */
    match(q, area) {
      header(q, area);
      const box = el('div', 'match');
      const L1 = el('div', 'col'), R1 = el('div', 'col');
      let selL = null, selR = null, left = q.pairs.length, mistakes = 0;
      const mkItem = (txt, side, pairIdx) => {
        const b = el('button', 'm-item' + (looksCode(txt) ? ' mono' : ''));
        b.textContent = txt;
        b.dataset.side = side; b.dataset.p = pairIdx;
        b.onclick = () => {
          if (b.classList.contains('gone') || ctl.checked) return;
          sfx.tap();
          const col = side === 'L' ? L1 : R1;
          col.querySelectorAll('.m-item').forEach((x) => x.classList.remove('sel', 'bad'));
          b.classList.add('sel');
          if (side === 'L') selL = b; else selR = b;
          if (selL && selR) tryPair();
        };
        return b;
      };
      const tryPair = () => {
        const lp = +selL.dataset.p;
        const good = q.pairs[lp][1] === selR.textContent;
        const a = selL, b = selR;
        selL = selR = null;
        if (good) {
          [a, b].forEach((x) => { x.classList.remove('sel'); x.classList.add('ok'); });
          sfx.ok();
          setTimeout(() => [a, b].forEach((x) => { x.classList.remove('ok'); x.classList.add('gone'); }), 450);
          if (--left === 0) setTimeout(() => { setReady(true); doCheck(); }, 500);
        } else {
          mistakes++;
          [a, b].forEach((x) => { x.classList.remove('sel'); x.classList.add('bad'); });
          sfx.bad();
          setTimeout(() => [a, b].forEach((x) => x.classList.remove('bad')), 500);
        }
      };
      shuffle(q.pairs.map((p, i) => [p[0], i])).forEach(([t, i]) => L1.appendChild(mkItem(t, 'L', i)));
      shuffle(q.pairs.map((p, i) => [p[1], i])).forEach(([t, i]) => R1.appendChild(mkItem(t, 'R', i)));
      box.append(L1, R1);
      area.appendChild(box);
      const ctl = {
        check() {
          return { ok: left === 0, answer: q.pairs.map((p) => `${p[0]}  →  ${p[1]}`).join('\n') };
        },
      };
      return ctl;
    },
  };

  /* ---------- Inicio ---------- */
  renderHome();
  show('home');

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
