/* Ingreso con correo y contraseña para los paneles /admin de las webs de SkyNet Genesis.
   La llave de GitHub de la web se guarda CIFRADA (AES-GCM) en admin/accesos.json, una copia por usuario,
   bloqueada con la contraseña de esa persona (PBKDF2-SHA256, 600.000 vueltas). El correo se guarda como huella (SHA-256),
   no en claro. Sin la contraseña correcta, el archivo no sirve para nada. Mismo archivo en todas las webs. */
(function () {
  var ITER = 600000;
  var te = new TextEncoder(), td = new TextDecoder();
  function b64(buf) { var s = '', a = new Uint8Array(buf); for (var i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s); }
  function deB64(t) { var s = atob(t), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; }
  function normalizar(correo) { return String(correo || '').trim().toLowerCase(); }

  function idCorreo(correo) {
    return crypto.subtle.digest('SHA-256', te.encode('skynetgenesis:' + normalizar(correo))).then(function (h) {
      return Array.prototype.map.call(new Uint8Array(h), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    });
  }
  function derivar(clave, sal, iter) {
    return crypto.subtle.importKey('raw', te.encode(clave), 'PBKDF2', false, ['deriveKey']).then(function (base) {
      return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: sal, iterations: iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    });
  }
  // Devuelve el registro que se guarda en accesos.json
  function cifrar(llaveGithub, nombre, correo, clave) {
    var sal = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    return Promise.all([idCorreo(correo), derivar(clave, sal, ITER)]).then(function (r) {
      return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, r[1], te.encode(llaveGithub)).then(function (c) {
        return { id: r[0], nombre: String(nombre || '').trim(), sal: b64(sal), iv: b64(iv), iter: ITER, datos: b64(c), creado: new Date().toISOString().slice(0, 10) };
      });
    });
  }
  // Busca al usuario y abre la llave; si la contraseña no es correcta, falla
  function abrir(accesos, correo, clave) {
    return idCorreo(correo).then(function (id) {
      var reg = (accesos.usuarios || []).filter(function (u) { return u.id === id; })[0];
      if (!reg) throw new Error('Correo o contraseña incorrectos.');
      return derivar(clave, deB64(reg.sal), reg.iter || ITER).then(function (k) {
        return crypto.subtle.decrypt({ name: 'AES-GCM', iv: deB64(reg.iv) }, k, deB64(reg.datos));
      }).then(function (p) { return { llave: td.decode(p), nombre: reg.nombre, id: id }; },
        function () { throw new Error('Correo o contraseña incorrectos.'); });
    });
  }
  function leer() {
    return fetch('/admin/accesos.json?v=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : { usuarios: [] }; })
      .catch(function () { return { usuarios: [] }; });
  }
  function claveValida(clave) {
    if (String(clave || '').length < 12) return 'La contraseña debe tener al menos 12 caracteres (puede ser una frase, ej.: «Fundacion Santa Marta 2026»).';
    return '';
  }
  window.Acceso = { idCorreo: idCorreo, cifrar: cifrar, abrir: abrir, leer: leer, claveValida: claveValida, normalizar: normalizar, ITER: ITER };
})();
