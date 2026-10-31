# Saca el texto de los PDF de documentos/ para que Dayana (el chat de la página) pueda consultarlos.
# Lo corre solo la tarea "Textos de los PDF para Dayana" cada vez que cambia un PDF. Resultado: documentos/textos.json
import json, os, re, subprocess, sys, unicodedata

RAIZ = sys.argv[1] if len(sys.argv) > 1 else "."
SALIDA = os.path.join(RAIZ, "documentos", "textos.json")
docs = []
for carpeta, _, archivos in sorted(os.walk(os.path.join(RAIZ, "documentos"))):
    for a in sorted(archivos):
        if not a.lower().endswith(".pdf"):
            continue
        ruta = os.path.join(carpeta, a)
        try:
            txt = subprocess.run(["pdftotext", "-enc", "UTF-8", "-nopgbrk", ruta, "-"], capture_output=True, text=True, timeout=120).stdout
        except Exception as e:
            print("No se pudo leer", ruta, e); continue
        txt = unicodedata.normalize("NFC", txt).replace("­", "")
        lineas = [re.sub(r"[ \t]+", " ", l).strip() for l in txt.splitlines()]
        txt = re.sub(r"\n{3,}", "\n\n", "\n".join(lineas)).strip()
        letras = sum(c.isalpha() for c in txt)
        if letras < 80:   # PDF escaneado (imagen) o vacío: no sirve
            print("Sin texto útil:", ruta); continue
        rel = os.path.relpath(ruta, RAIZ).replace(os.sep, "/")
        docs.append({"nombre": os.path.splitext(a)[0], "ruta": "https://www.poliandes.com/" + rel, "texto": txt[:60000]})
nuevo = {"generado_por": "tarea de GitHub textos-pdf.yml", "documentos": docs}
viejo = None
if os.path.exists(SALIDA):
    try: viejo = json.load(open(SALIDA, encoding="utf-8"))
    except Exception: pass
if viejo and viejo.get("documentos") == docs:
    print("Sin cambios"); sys.exit(0)
json.dump(nuevo, open(SALIDA, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(docs), "documentos con texto")
