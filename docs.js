// Lista automáticamente los archivos de cada carpeta de "documentos" del repositorio en GitHub.
(function(){
  var REPO="RL-rikardolondono/poliandes-web";
  var listas=document.querySelectorAll("ul.docs[data-carpeta]");
  listas.forEach(function(ul){
    var c=ul.getAttribute("data-carpeta"), k="pd_"+c, cache=null;
    try{cache=JSON.parse(sessionStorage.getItem(k)||"null")}catch(e){}
    if(cache&&Date.now()-cache.t<600000){pintar(ul,cache.d);return}
    fetch("https://api.github.com/repos/"+REPO+"/contents/documentos/"+c+"?ref=main").then(function(r){return r.ok?r.json():null}).then(function(j){
      if(!Array.isArray(j))return;
      var d=j.filter(function(x){return x.type==="file"&&!/^(LEEME|README)/i.test(x.name)&&x.name.charAt(0)!=="."}).map(function(x){return x.name});
      try{sessionStorage.setItem(k,JSON.stringify({t:Date.now(),d:d}))}catch(e){}
      pintar(ul,d);
    }).catch(function(){});
  });
  function pintar(ul,nombres){
    if(!nombres.length){ul.innerHTML='<li style="color:var(--suave)">Pronto publicaremos documentos en esta sección.</li>';return}
    var c=ul.getAttribute("data-carpeta");
    ul.innerHTML=nombres.map(function(n){
      var ext=(n.split(".").pop()||"").toUpperCase().slice(0,4);
      var t=n.replace(/\.[^.]+$/,"").replace(/[_]+/g," ");
      var u="/documentos/"+c+"/"+encodeURIComponent(n);
      return '<li><a href="'+u+'" target="_blank" rel="noopener"><span class="ic">'+ext+'</span><span>'+t.replace(/</g,"&lt;")+'</span></a></li>';
    }).join("");
  }
})();
// Carga también el contenido editable (noticias, eventos, videos y galería).
(function(){if(document.querySelector("[data-bloque]")||document.querySelector(".video-tapa")){var s=document.createElement("script");s.src="/contenido.js";s.defer=true;document.head.appendChild(s)}})();
// Enlace de ingreso del equipo al panel, al final del pie de página (si la página aún no lo tiene).
(function(){var c=document.querySelector("footer .cred");if(!c)return;if(!c.querySelector('a[href="/admin/"]')){c.insertAdjacentHTML("beforeend",' · © 2026 POLIANDES · <a class="ingresar" href="/admin/" rel="nofollow">Ingresar (equipo)</a>')}if(!c.querySelector('a[href*="agenda-ia"]')){c.insertAdjacentHTML("beforeend",' · <a class="ingresar" href="https://agenda-ia.skynetgenesis.com/" target="_blank" rel="nofollow noopener">Agenda-IA (funcionarios)</a>')}})();

// Enlace a la Biblioteca Real (Fundación Reina Elizabeth) en el menú y en el pie.
(function(){var B="https://biblioteca.fundacionreinaelizabeth.com/";var m=document.getElementById("menu");if(m&&!m.querySelector('a[href*="biblioteca.fundacionreinaelizabeth"]')){var a=document.createElement("a");a.href=B;a.target="_blank";a.rel="noopener";a.textContent="Biblioteca";m.insertBefore(a,m.querySelector(".dd.der"))}var c=document.querySelector("footer .cred");if(c&&!c.querySelector('a[href*="biblioteca.fundacionreinaelizabeth"]')){c.insertAdjacentHTML("beforeend",' · <a class="ingresar" href="'+B+'" target="_blank" rel="noopener">Biblioteca Real</a>')}})();

// Enlace a la Biblioteca Digital de la Real Academia Española (RAE) en el pie.
(function(){var R="https://rae.es/biblioteca-digital";var c=document.querySelector("footer .cred");if(c&&!c.querySelector('a[href*="rae.es/biblioteca-digital"]')){c.insertAdjacentHTML("beforeend",' · <a class="ingresar" href="'+R+'" target="_blank" rel="noopener">Biblioteca Digital RAE</a>')}})();
