#!/usr/bin/env python3
"""Genera dark.css (modo oscuro) a partir de styles.css y de los estilos inline de las pantallas.

Uso: python3 tools/generar-dark-css.py   (desde la raíz del repo; requiere tinycss2)

Cada color se convierte manteniendo su tono: los fondos claros pasan a oscuros, los textos
oscuros pasan a claros, y los colores de estado (rojo, verde, naranja...) se aclaran lo justo
para que se lean sobre fondo oscuro. Todo queda bajo html[data-theme="dark"] y @media screen
(al imprimir se mantiene claro).
"""
import colorsys, re, sys, pathlib
import tinycss2

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SEL = 'html[data-theme="dark"]'
COLOR_RE = re.compile(r'#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\([^)]*\)|\bwhite\b|\bblack\b')

def parse(c):
    c = c.strip().lower()
    if c == 'white': return (255, 255, 255, 1.0)
    if c == 'black': return (0, 0, 0, 1.0)
    if c.startswith('#'):
        h = c[1:]
        if len(h) == 3: h = ''.join(x * 2 for x in h)
        a = int(h[6:8], 16) / 255 if len(h) == 8 else 1.0
        return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)
    nums = [x.strip() for x in c[c.index('(') + 1:-1].split(',')]
    if len(nums) < 3 or any('%' in n or 'var' in n for n in nums[:3]): return None
    a = float(nums[3]) if len(nums) > 3 else 1.0
    return (int(float(nums[0])), int(float(nums[1])), int(float(nums[2])), a)

def fmt(r, g, b, a):
    r, g, b = (max(0, min(255, round(v))) for v in (r, g, b))
    return f'#{r:02x}{g:02x}{b:02x}' if a >= 0.999 else f'rgba({r},{g},{b},{round(a, 3)})'

def convertir(c, rol):
    p = parse(c)
    if not p: return c
    r, g, b, a = p
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    if rol == 'bg':
        if a < 0.5 and l > 0.9: return c                 # velos blancos sutiles (sobre la barra lateral)
        if a < 0.5:                                       # velos/tintes de color: un poco más visibles
            return fmt(r, g, b, min(1, a * 1.8))
        if l >= 0.6:                                      # fondos claros -> oscuros con el mismo tinte
            l2 = 0.12 + (1 - l) * 0.75
            s2 = min(s, 0.45) * (0.9 if s > 0.15 else 1)
            if s < 0.12: h, s2 = 0.58, 0.22               # blancos/grises -> gris azulado de la paleta
        else: return c                                    # fondos de color medio/oscuro (botones, barra) quedan
    elif rol == 'fg':
        if l >= 0.85 and s < 0.3: return c                # texto blanco sobre fondos de color
        if l >= 0.6: l2, s2 = l, s
        elif s < 0.25: l2, s2 = 0.95 - l * 0.55, s         # grises/azulados oscuros -> claros
        else: l2, s2 = max(0.68, min(0.8, 0.5 + l * 0.6)), min(1, s * 1.05)  # colores de estado
    elif rol == 'border':
        if a < 0.5: return fmt(r, g, b, min(1, a * 1.5)) if l < 0.9 else c
        if l >= 0.6:
            l2, s2 = 0.22 + (1 - l) * 0.6, min(s, 0.35)
            if s < 0.12: h, s2 = 0.58, 0.2
        else: return c
    else:
        return c
    r2, g2, b2 = colorsys.hls_to_rgb(h, max(0, min(1, l2)), max(0, min(1, s2)))
    return fmt(r2 * 255, g2 * 255, b2 * 255, a)

def rol_de(prop):
    prop = prop.lower()
    if prop.startswith('--'): return None
    if prop in ('background', 'background-color', 'background-image', 'fill'): return 'bg'
    if prop in ('color', 'caret-color', 'stroke', '-webkit-text-fill-color'): return 'fg'
    if prop.startswith('border') or prop.startswith('outline') or prop == 'column-rule' or prop == 'text-decoration-color': return 'border'
    return None

def convertir_valor(valor, rol):
    return COLOR_RE.sub(lambda m: convertir(m.group(0), rol), valor)

def prefijar(selectores):
    out = []
    for sel in selectores.split(','):
        sel = sel.strip()
        if not sel: continue
        if sel in (':root', 'html'): out.append(SEL)
        elif sel.startswith('html'): out.append(SEL + sel[4:])
        elif sel.startswith('body'): out.append(f'{SEL} {sel}')
        else: out.append(f'{SEL} {sel}')
    return ','.join(out)

def procesar_reglas(reglas):
    salida = []
    for regla in reglas:
        if regla.type == 'qualified-rule':
            selector = tinycss2.serialize(regla.prelude).strip()
            # La barra lateral ya es oscura en el modo claro: se deja igual.
            if all(any(k in parte for k in ('.nav-', '.sidebar', '.brand')) for parte in selector.split(',')): continue
            decls = tinycss2.parse_declaration_list(regla.content, skip_whitespace=True, skip_comments=True)
            nuevas = []
            for d in decls:
                if d.type != 'declaration': continue
                rol = rol_de(d.name)
                if not rol: continue
                valor = tinycss2.serialize(d.value).strip()
                nuevo = convertir_valor(valor, rol)
                if nuevo != valor:
                    nuevas.append(f'{d.name}:{nuevo}{" !important" if d.important else ""}')
            if nuevas:
                salida.append(f'{prefijar(selector)}{{{";".join(nuevas)}}}')
        elif regla.type == 'at-rule' and regla.lower_at_keyword == 'media' and regla.content is not None:
            internas = procesar_reglas(tinycss2.parse_rule_list(regla.content, skip_whitespace=True, skip_comments=True))
            if internas:
                cond = tinycss2.serialize(regla.prelude).strip()
                if 'print' in cond: continue
                salida.append(f'@media {cond}{{\n' + '\n'.join(internas) + '\n}')
    return salida

# --- Estilos inline (style="..." en el HTML y en las pantallas generadas por JS) ---
INLINE_RE = re.compile(r'(background-color|background|color|border(?:-top|-bottom|-left|-right)?)\s*:\s*([^;"`\']*?(?:#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|\bwhite\b))')
def reglas_inline(archivos):
    pares = set()
    for f in archivos:
        texto = (RAIZ / f).read_text(encoding='utf-8')
        for estilo in re.findall(r'style=\\?["\']([^"\']*)', texto) + re.findall(r'style\.(?:background|color|borderColor)\s*=\s*["\']([^"\']*)', texto):
            for prop, valor in INLINE_RE.findall(estilo):
                pares.add((prop, valor.strip()))
    salida = []
    for prop, valor in sorted(pares):
        if 'var(' in valor or '${' in valor: continue
        rol = rol_de(prop)
        nuevo = convertir_valor(valor, rol)
        if nuevo == valor: continue
        for sep in (':', ': '):
            patron = f'{prop}{sep}{valor}'.replace('"', '\\"')
            # 'color:' también aparece dentro de 'background-color:'; ese caso lo cubre su propia regla.
            salida.append(f'{SEL} [style*="{patron}"]{{{prop}:{nuevo} !important}}')
    return salida

def main():
    css = (RAIZ / 'styles.css').read_text(encoding='utf-8')
    reglas = tinycss2.parse_stylesheet(css, skip_whitespace=True, skip_comments=True)
    base = f'''/* GENERADO por tools/generar-dark-css.py a partir de styles.css: no editar a mano.
   Lo que haya que ajustar a mano va en el bloque "Ajustes manuales" de styles.css o al final de este generador. */
@media screen {{
{SEL}{{color-scheme:dark}}
'''
    cuerpo = procesar_reglas(reglas)
    inline = reglas_inline(['index.html', 'app.js', 'tablero.js', 'auditorias.js', 'juridico.js', 'usuarios.js'])
    manuales = (RAIZ / 'tools' / 'dark-manual.css').read_text(encoding='utf-8') if (RAIZ / 'tools' / 'dark-manual.css').exists() else ''
    salida = base + '\n'.join(cuerpo) + '\n/* Estilos inline */\n' + '\n'.join(inline) + '\n/* Ajustes manuales (tools/dark-manual.css) */\n' + manuales + '\n}\n'
    (RAIZ / 'dark.css').write_text(salida, encoding='utf-8')
    print(f'dark.css: {len(cuerpo)} reglas de styles.css, {len(inline)} reglas inline')

if __name__ == '__main__':
    main()
