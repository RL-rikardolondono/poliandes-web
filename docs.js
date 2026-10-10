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
