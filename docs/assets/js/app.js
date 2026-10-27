/* Los arquitectos del Estado — lector SPA (sin dependencias). */
(function () {
  "use strict";
  var LIBRO = window.LIBRO;
  var principal = document.getElementById("principal");
  var tocEl = document.getElementById("toc");
  var buscador = document.getElementById("buscar");
  var progreso = document.getElementById("progreso");
  var btnTema = document.getElementById("btn-tema");
  var btnMenu = document.getElementById("btn-menu");
  var sidebar = document.getElementById("sidebar");
  var velo = document.getElementById("velo");
  var tituloPagina = document.getElementById("titulo-pagina");
  var kicker = document.getElementById("kicker");

  /* ---------- utilidades ---------- */
  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
  }

  function strip(html) {
    var d = document.createElement("div");
    d.innerHTML = html;
    return d.textContent || "";
  }

  function capById(id) {
    for (var i = 0; i < LIBRO.capitulos.length; i++) {
      if (LIBRO.capitulos[i].id === id) return LIBRO.capitulos[i];
    }
    return null;
  }

  function capDeSeccion(sid) {
    for (var i = 0; i < LIBRO.capitulos.length; i++) {
      var c = LIBRO.capitulos[i];
      for (var j = 0; j < c.secciones.length; j++) {
        if (c.secciones[j].id === sid) return c;
      }
    }
    // Una nota vive dentro de la sección de notas, pero su id no es el de la
    // sección: `…--nota-7` pertenece al capítulo `…`.
    var nota = /^(.*)--nota-\d+$/.exec(sid);
    return nota ? capById(nota[1]) : null;
  }

  /* ---------- portada ---------- */
  function arteHtml(c, miniatura) {
    if (!c.arte) return "";
    var a = c.arte;
    var src = esc(a.src + "?v=transparent-20261028");
    if (miniatura) {
      return '<img class="indice-arte" src="' + src + '" alt="" width="1000" height="680" loading="lazy" decoding="async">';
    }
    return '<figure class="capitulo-figura">' +
      '<img src="' + src + '" alt="' + esc(a.alt) + '" width="1000" height="680" decoding="async">' +
      '<figcaption><span>' + esc(a.titulo) + '</span>' +
      (a.descripcion ? '<span>' + esc(a.descripcion) + '</span>' : '') + '</figcaption></figure>';
  }

  function buildPortada() {
    var m = LIBRO.meta;
    var capitulos = LIBRO.capitulos.filter(function (c) { return c.tipo === "capitulo" || c.tipo === "epilogo"; });
    return '<section class="portada" id="inicio" aria-labelledby="portada-titulo">' +
      '<div class="portada-grid">' +
        '<div class="portada-texto">' +
          '<div class="portada-fila">Una historia de Costa Rica</div>' +
          '<p class="portada-periodo">1821 <span aria-hidden="true">—</span> 2026</p>' +
          '<h1 id="portada-titulo"><span>Los arquitectos</span> <em>del Estado.</em></h1>' +
          '<p class="subtitulo">El liberalismo costarricense y el Estado que construyó sin querer.</p>' +
          '<p class="portada-autor"><a href="#autoria"><img class="autor-logo" src="assets/img/josoroma.svg" width="1000" height="200" alt="Josoroma"><span class="autor-colaborador"><span class="autor-mas">+</span> AI Corpus</span></a></p>' +
          '<div class="portada-cta">' +
            '<a class="btn-primario" href="#cap-01-el-pais-sin-estado">Comenzar a leer <span aria-hidden="true">↗</span></a>' +
            '<a class="btn-fantasma" href="#recorrido">Explorar el libro <span aria-hidden="true">↓</span></a>' +
          '</div>' +
          '<div class="firma-linea">' +
            '<span><b>' + m.capitulos + '</b> capítulos y un epílogo</span>' +
            '<span>Cada hecho, con su página</span>' +
          '</div>' +
        '</div>' +
        '<figure class="portada-figura">' +
          '<img class="portada-tapa" src="assets/img/portada.svg?v=transparent-20261028" width="1000" height="1100" alt="Ilustración isométrica de Costa Rica: arquitectura republicana, cafetales y documentos, una alegoría de la construcción del Estado." decoding="async" fetchpriority="high">' +
          '<figcaption><span>Los cimientos de una república</span><span>Costa Rica · 1821–2026</span></figcaption>' +
        '</figure>' +
      '</div>' +
    '</section>' +
    '<section class="tesis-portada" aria-label="La pregunta del libro">' +
      '<span class="editorial-etiqueta">La paradoja fundacional</span>' +
      '<p>El liberalismo costarricense no fue víctima del Estado: <em>fue su arquitecto.</em></p>' +
      '<a href="#cap-00-portada-y-nota-de-metodo">Leer la nota de método <span aria-hidden="true">↗</span></a>' +
    '</section>' +
    '<section class="recorrido" id="recorrido" aria-labelledby="recorrido-titulo">' +
      '<div class="recorrido-cabecera"><div><span class="editorial-etiqueta">El recorrido</span><h2 id="recorrido-titulo">Una república, pieza a pieza.</h2></div><span class="recorrido-periodo">Dos siglos de historia</span></div>' +
      '<div class="indice-portada">' + capitulos.map(function (c) {
        return '<a class="indice-capitulo" href="#' + c.id + '">' + arteHtml(c, true) +
          '<div><span class="indice-etiqueta">' + (c.tipo === "epilogo" ? 'Epílogo' : 'Capítulo ' + esc(c.etiqueta)) + '</span><h3>' + esc(c.corto.replace(/^Epílogo: /, '')) + '</h3></div><span class="indice-flecha" aria-hidden="true">↗</span></a>';
      }).join('') + '</div>' +
    '</section>' +
    '<section class="autoria" id="autoria" aria-labelledby="autoria-titulo">' +
      '<span class="editorial-etiqueta">Autoría</span>' +
      '<h2 id="autoria-titulo"><img class="firma-josoroma" src="assets/img/josoroma.svg" width="1000" height="200" alt="Josoroma"><span class="firma-colaborador"><span class="firma-mas">+</span><span class="firma-corpus">AI Corpus</span></span></h2>' +
      '<div class="autoria-enlaces"><a href="https://www.josoroma.com/" target="_blank" rel="noopener">josoroma.com ↗</a><a href="#cap-92-fuentes">Fuentes y bibliografía ↗</a></div>' +
    '</section>';
  }

  /* ---------- índice ---------- */
  function buildToc(activo) {
    var html = '<div class="toc-grupo">Contenido</div>';
    LIBRO.capitulos.forEach(function (c) {
      var num = c.etiqueta;
      var abierto = activo === c.id;
      html += '<a href="#' + c.id + '" data-ancla="' + c.id + '"' + (abierto ? ' class="activo" aria-current="page"' : '') + '>' +
        '<span class="toc-num">' + esc(num) + '</span> ' + esc(c.corto) +
      '</a>';
      if (abierto) {
        c.secciones.forEach(function (s) {
          // Las notas son aparato: acompañan al capítulo, no compiten en el índice.
          if (s.clase === "notas") return;
          html += '<a class="toc-sub" href="#' + s.id + '" data-ancla="' + s.id + '">' +
            esc(s.titulo) + '</a>';
        });
      }
    });
    tocEl.innerHTML = html;
  }

  /* ---------- render de un capítulo ---------- */
  function renderCapitulo(c) {
    var html = '<div class="contenido" data-capitulo="' + c.id + '">';
    html += '<div class="titulo-divisor" id="' + c.id + '">' +
              '<span class="romano">' + esc(c.etiqueta) + '</span>' +
              '<div><h1>' + esc(c.titulo) + '</h1>' +
              '<div class="subtitulo">' + esc(c.resumen) + '</div></div>' +
            '</div>';
    html += arteHtml(c, false);
    if (c.intro_html) {
      html += '<div class="prosa">' + c.intro_html + '</div>';
    }
    c.secciones.forEach(function (s) {
      html += '<section class="prosa' + (s.clase ? ' ' + s.clase : '') + '" id="' + s.id + '">' +
                '<h2>' + esc(s.titulo) + '</h2>' + s.html +
              '</section>';
    });
    html += pasoHtml(c);
    html += '</div>';
    return html;
  }

  function pasoHtml(c) {
    var i = LIBRO.capitulos.indexOf(c);
    var prev = i > 0 ? LIBRO.capitulos[i - 1] : null;
    var next = i < LIBRO.capitulos.length - 1 ? LIBRO.capitulos[i + 1] : null;
    var html = '<nav class="paso">';
    html += prev
      ? '<a href="#' + prev.id + '">← ' + esc(prev.corto) + '</a>'
      : '<span class="vacio"></span>';
    html += next
      ? '<a href="#' + next.id + '">' + esc(next.corto) + ' →</a>'
      : '<span class="vacio"></span>';
    html += '</nav>';
    return html;
  }

  function render() {
    principal.innerHTML = buildPortada();
    actualizarCabecera(LIBRO.capitulos[0]);
  }

  function actualizarCabecera(c) {
    if (!c) {
      tituloPagina.textContent = LIBRO.meta.titulo;
      kicker.textContent = "Ensayo histórico";
      return;
    }
    tituloPagina.textContent = c.corto;
    kicker.textContent = c.tipo === "capitulo" ? "Capítulo " + c.etiqueta
      : (c.tipo === "epilogo" ? "Epílogo" : (c.tipo === "preliminar" ? "Preliminar" : "Apéndice"));
  }

  /* ---------- búsqueda ---------- */
  function buscar(q) {
    q = q.trim().toLowerCase();
    if (q.length < 2) { activarAncla(); return; }
    var want = q.split(/\s+/).filter(Boolean);
    var hits = LIBRO.indice.filter(function (it) {
      return want.every(function (w) { return it.buscar.indexOf(w) !== -1; });
    });
    if (!hits.length) {
      tituloPagina.textContent = "Búsqueda";
      kicker.textContent = "En todo el libro";
      principal.innerHTML =
        '<div class="contenido"><div class="sin-resultados">Sin resultados para “' + esc(q) + '”.</div></div>';
      return;
    }
    tituloPagina.textContent = "Búsqueda";
    kicker.textContent = "En todo el libro";
    buildToc(null);
    var html = '<div class="contenido">' +
      '<div class="titulo-divisor"><span class="romano">' + hits.length + '</span>' +
      '<div><h2>' + hits.length + ' resultados</h2>' +
      '<div class="subtitulo">“' + esc(q) + '”</div></div></div>';
    hits.slice(0, 60).forEach(function (h) {
      var c = capDeSeccion(h.id);
      var i = h.buscar.indexOf(want[0]);
      var desde = Math.max(0, i - 90);
      if (desde > 0) {
        var espacio = h.texto.indexOf(" ", desde);
        if (espacio !== -1 && espacio < i) desde = espacio + 1;
      }
      var extracto = h.texto.slice(desde, desde + 220);
      if (desde + 220 < h.texto.length) {
        var corte = extracto.lastIndexOf(" ");
        if (corte > 120) extracto = extracto.slice(0, corte);
      }
      html += '<a class="resultado" href="#' + h.id + '">' +
                '<div class="r-cap">' + esc(c ? c.corto : "") + '</div>' +
                '<div class="r-tit">' + esc(h.titulo) + '</div>' +
                '<div class="r-txt">…' + esc(extracto) + '…</div>' +
              '</a>';
    });
    html += '</div>';
    principal.innerHTML = html;
  }

  /* ---------- navegación por anclas ---------- */
  function activarAncla() {
    var h = location.hash.replace("#", "");
    try { h = decodeURIComponent(h); } catch (e) {}
    principal.querySelectorAll(".destino").forEach(function (el) { el.classList.remove("destino"); });
    if (!h || h === "inicio" || h === "recorrido" || h === "autoria") {
      principal.innerHTML = buildPortada();
      // En la portada la cabecera anuncia el libro, no el primer capítulo.
      actualizarCabecera(null);
      buildToc(null);
      requestAnimationFrame(function () {
        var destino = document.getElementById(h || "inicio");
        if (destino) destino.scrollIntoView();
      });
      return;
    }
    var cap = capById(h);
    if (cap) {
      var visible = principal.querySelector("[data-capitulo]");
      if (!visible || visible.getAttribute("data-capitulo") !== cap.id) principal.innerHTML = renderCapitulo(cap);
      actualizarCabecera(cap);
      buildToc(cap.id);
      window.scrollTo({ top: 0 });
      return;
    }
    var dueno = capDeSeccion(h);
    if (dueno) {
      var visible = principal.querySelector("[data-capitulo]");
      if (!visible || visible.getAttribute("data-capitulo") !== dueno.id) principal.innerHTML = renderCapitulo(dueno);
      actualizarCabecera(dueno);
      buildToc(dueno.id);
      // `html { scroll-behavior: smooth }` convertiría el salto en una animación
      // que nunca termina de forma predecible; aquí se desactiva un instante.
      requestAnimationFrame(function () {
        var el = document.getElementById(h);
        if (!el) return;
        el.classList.add("destino");
        var raiz = document.documentElement;
        var previo = raiz.style.scrollBehavior;
        raiz.style.scrollBehavior = "auto";
        var aire = /--nota-\d+$/.test(h) ? 120 : 76;
        window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - aire);
        raiz.style.scrollBehavior = previo;
      });
      return;
    }
    principal.innerHTML = buildPortada();
    actualizarCabecera(LIBRO.capitulos[0]);
    buildToc(LIBRO.capitulos[0].id);
  }

  /* ---------- tema ---------- */
  // Reinicia la preferencia anterior una vez para estrenar el tema claro.
  var claveTema = "arquitectos-tema-v2";
  function aplicarTema(oscuro) {
    document.documentElement.classList.toggle("dark", oscuro);
    btnTema.setAttribute("aria-label", oscuro ? "Activar tema claro" : "Activar tema oscuro");
    btnTema.setAttribute("aria-pressed", String(oscuro));
    try { localStorage.setItem(claveTema, oscuro ? "dark" : "light"); } catch (e) {}
  }
  function toggleTema() { aplicarTema(!document.documentElement.classList.contains("dark")); }

  /* ---------- eventos ---------- */
  function cerrarIndice(devolverFoco) {
    sidebar.classList.remove("abierta");
    velo.classList.remove("mostrar");
    btnMenu.setAttribute("aria-expanded", "false");
    if (devolverFoco) btnMenu.focus();
  }
  document.querySelector(".saltar-contenido").addEventListener("click", function (e) {
    e.preventDefault();
    principal.focus({ preventScroll: true });
  });
  buscador.addEventListener("input", function () { buscar(buscador.value); });
  buscador.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { buscador.value = ""; activarAncla(); }
  });
  document.addEventListener("keydown", function (e) {
    if (sidebar.classList.contains("abierta")) {
      if (e.key === "Escape") { e.preventDefault(); cerrarIndice(true); return; }
      if (e.key === "Tab") {
        var enlaces = sidebar.querySelectorAll("a[href]");
        var primero = enlaces[0];
        var ultimo = enlaces[enlaces.length - 1];
        if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
      }
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); buscador.focus(); }
  });
  btnTema.addEventListener("click", toggleTema);
  btnMenu.addEventListener("click", function () {
    if (sidebar.classList.contains("abierta")) { cerrarIndice(true); return; }
    sidebar.classList.add("abierta");
    velo.classList.add("mostrar");
    btnMenu.setAttribute("aria-expanded", "true");
    var enlace = sidebar.querySelector("a.activo") || sidebar.querySelector("a");
    if (enlace) enlace.focus();
  });
  velo.addEventListener("click", function () { cerrarIndice(true); });
  window.addEventListener("scroll", function () {
    var st = window.scrollY;
    var dh = document.documentElement.scrollHeight - window.innerHeight;
    progreso.style.width = (dh > 0 ? (st / dh) * 100 : 0) + "%";
  });
  window.addEventListener("hashchange", function () {
    activarAncla();
    cerrarIndice(false);
    principal.focus({ preventScroll: true });
  });

  /* ---------- init ---------- */
  var guardado = null;
  try { guardado = localStorage.getItem(claveTema); } catch (e) {}
  aplicarTema(guardado === "dark");
  activarAncla();
})();
