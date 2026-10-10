// Contenido editable desde el panel /admin: noticias, eventos, videos y galería.
// Lee /datos/contenido.json y vuelve a dibujar los bloques marcados con data-bloque.
// Los videos solo se cargan cuando alguien pulsa reproducir (no pesan en la página).
(function () {
  var MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  function e(s) { return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;"); }
  function fechaTxt(f) { var p = String(f || "").split("-"); return p.length === 3 ? parseInt(p[2], 10) + " " + MESES[parseInt(p[1], 10) - 1] + " " + p[0] : (f || ""); }
  function ordenar(l, desc) { return l.slice().sort(function (a, b) { var x = a.fecha || "", y = b.fecha || ""; return desc ? (x < y ? 1 : x > y ? -1 : 0) : (x < y ? -1 : x > y ? 1 : 0); }); }
  function resumen(t, n) { n = n || 170; t = String(t || "").replace(/\s+/g, " ").trim(); if (t.length <= n) return t; t = t.slice(0, n); return t.slice(0, t.lastIndexOf(" ")) + "…"; }
  function hoy() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }

  function tarjetaNoticia(n) {
    var img = n.foto ? '<img class="post-img" src="' + e(n.foto) + '" alt="" loading="lazy">' : "";
    return '<a class="box post" href="/noticias.html#n-' + e(n.id) + '" style="text-decoration:none;margin:0">' + img +
      '<time>' + fechaTxt(n.fecha) + '</time><h3 style="margin:0">' + e(n.titulo) + '</h3>' +
      '<p style="margin:0;color:var(--suave)">' + e(resumen(n.texto)) + '</p><span class="mas">Leer más →</span></a>';
  }
  function eventosHtml(evs) {
    var h = hoy();
    evs = ordenar(evs, false).filter(function (x) { return (x.fecha || "") >= h; });
    if (!evs.length) return '<p style="color:var(--suave)">Pronto anunciaremos nuevos eventos.</p>';
    return evs.map(function (x) {
      var p = String(x.fecha).split("-"), dd = p[2] ? String(parseInt(p[2], 10)) : "", mm = p[1] ? MESES[parseInt(p[1], 10) - 1] : "";
      mm = mm.charAt(0).toUpperCase() + mm.slice(1);
      var tag = x.enlace ? "a" : "div", href = x.enlace ? ' href="' + e(x.enlace) + '"' : "";
      return '<' + tag + ' class="evento"' + href + ' style="text-decoration:none;color:inherit"><div class="fecha"><b>' + dd + '</b><small>' + mm + '</small></div>' +
        '<div><b style="color:var(--azul)">' + e(x.titulo) + '</b><br><span style="color:var(--suave);font-size:.92rem">' + e(x.detalle) + '</span></div></' + tag + '>';
    }).join("");
  }
  function galeriaHtml(g) { return g.map(function (x) { return '<img src="' + e(x.foto) + '" alt="' + e(x.texto) + '" title="' + e(x.texto) + '" loading="lazy">'; }).join(""); }

  function videoInfo(url) {
    url = String(url || "").trim(); var m;
    if ((m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/)))
      return { tipo: "YouTube", vertical: url.indexOf("/shorts/") >= 0, img: "https://i.ytimg.com/vi/" + m[1] + "/hqdefault.jpg", src: "https://www.youtube-nocookie.com/embed/" + m[1] + "?autoplay=1&rel=0" };
    if ((m = url.match(/tiktok\.com\/.*\/video\/(\d+)/))) return { tipo: "TikTok", vertical: true, img: "", src: "https://www.tiktok.com/embed/v2/" + m[1] };
    if ((m = url.match(/instagram\.com\/(?:reel|p|tv)\/([\w-]+)/))) return { tipo: "Instagram", vertical: true, img: "", src: "https://www.instagram.com/reel/" + m[1] + "/embed" };
    if (/facebook\.com|fb\.watch/.test(url)) return { tipo: "Facebook", vertical: url.indexOf("/reel") >= 0, img: "", src: "https://www.facebook.com/plugins/video.php?show_text=false&autoplay=1&href=" + encodeURIComponent(url) };
    return null;
  }
  function videoHtml(v) {
    var i = videoInfo(v.url); if (!i) return "";
    var fondo = i.img ? '<img src="' + e(i.img) + '" alt="" loading="lazy">' : '<span class="video-red">' + i.tipo + '</span>';
    return '<figure class="video' + (i.vertical ? " vertical" : "") + '"><button type="button" class="video-tapa" data-src="' + e(i.src) + '" aria-label="Reproducir: ' + e(v.titulo) + '">' +
      fondo + '<span class="video-play">▶</span></button><figcaption>' + e(v.titulo) + '</figcaption></figure>';
  }
  function parrafos(t) {
    return String(t || "").trim().split(/\n\s*\n/).filter(function (b) { return b.trim(); }).map(function (b) {
      b = e(b).replace(/\n/g, "<br>").replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
      return "<p>" + b + "</p>";
    }).join("");
  }
  function articulo(n) {
    var img = n.foto ? '<img class="post-full-img" src="' + e(n.foto) + '" alt="" loading="lazy">' : "";
    var vid = n.video ? '<div class="videos" style="margin-top:12px">' + videoHtml({ titulo: n.titulo, url: n.video }) + '</div>' : "";
    var btn = n.enlace ? '<div class="btns"><a class="btn b-az" href="' + e(n.enlace) + '">' + e(n.textoEnlace || "Ver más") + '</a></div>' : "";
    return '<article class="box post-full" id="n-' + e(n.id) + '">' + img + '<time>' + fechaTxt(n.fecha) + '</time><h2>' + e(n.titulo) + '</h2>' + parrafos(n.texto) + vid + btn + '</article>';
  }

  var BLOQUES = {
    "noticias-inicio": function (d) { return ordenar(d.noticias || [], true).slice(0, 4).map(tarjetaNoticia).join(""); },
    "noticias-todas": function (d) { return ordenar(d.noticias || [], true).map(articulo).join(""); },
    "eventos": function (d) { return eventosHtml(d.eventos || []); },
    "videos-inicio": function (d) { return (d.videos || []).slice(0, 6).map(videoHtml).join(""); },
    "videos-todos": function (d) { return (d.videos || []).map(videoHtml).join(""); },
    "galeria": function (d) { return galeriaHtml(d.galeria || []); }
  };

  // Reproducir un video al pulsarlo (se carga solo en ese momento)
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest && ev.target.closest(".video-tapa"); if (!b) return;
    var f = document.createElement("iframe");
    f.src = b.getAttribute("data-src"); f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen"; f.allowFullscreen = true;
    f.title = b.getAttribute("aria-label") || "Video";
    b.parentNode.replaceChild(f, b);
  });

  var marcados = document.querySelectorAll("[data-bloque]");
  if (!marcados.length) return;
  fetch("/datos/contenido.json?t=" + Date.now(), { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
    if (!d) return;
    marcados.forEach(function (el) { var f = BLOQUES[el.getAttribute("data-bloque")]; if (f) el.innerHTML = f(d); });
    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
  }).catch(function () {});
})();
