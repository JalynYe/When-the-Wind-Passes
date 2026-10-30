"""Build the offline, Chrome 61 compatible Xiaohongshu mini-tool bundle."""

from pathlib import Path
import re
import shutil
import subprocess

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "dist"
TARGET = ROOT / "minitool-dist"


def replace_once(source, old, new):
    count = source.count(old)
    if count != 1:
        raise ValueError(f"Expected one occurrence of {old!r}; got {count}")
    return source.replace(old, new)


if TARGET.exists():
    shutil.rmtree(TARGET)
(TARGET / "assets").mkdir(parents=True)

html = (SOURCE / "index.html").read_text()
html = re.sub(r'href="style\.css(?:\?[^"]*)?"', 'href="./style.css"', html, count=1)
html = re.sub(r'<script type="module" src="app\.js(?:\?[^"]*)?"></script>', '<script src="./app.js"></script>', html, count=1)
(TARGET / "index.html").write_text(html)

css = (SOURCE / "style.css").read_text()
css = replace_once(css, 'height:100svh;', 'height:100vh;height:100svh;')
css = replace_once(css, 'inset:0;', 'top:0;right:0;bottom:0;left:0;')
css = re.sub(r'gap:\d+px', 'margin-left:0', css)
css = replace_once(css, 'place-items:center', 'align-items:center;justify-items:center') if css.count('place-items:center') == 1 else css.replace('place-items:center', 'align-items:center;justify-items:center')
css = css.replace('inset:auto;', 'top:auto;right:auto;bottom:auto;left:auto;')
css = css.replace('button:focus-visible', 'button:focus')
css = css.replace('right:max(24px,env(safe-area-inset-right))', 'right:24px;right:calc(24px + var(--safe-area-inset-right, 0px))')
css = css.replace('left:max(24px,env(safe-area-inset-left))', 'left:24px;left:calc(24px + var(--safe-area-inset-left, 0px))')
css = css.replace('bottom:max(24px,env(safe-area-inset-bottom))', 'bottom:24px;bottom:calc(24px + var(--safe-area-inset-bottom, 0px))')
css = css.replace('bottom:max(20px,env(safe-area-inset-bottom))', 'bottom:20px;bottom:calc(20px + var(--safe-area-inset-bottom, 0px))')
css = css.replace('bottom:max(88px,calc(env(safe-area-inset-bottom) + 72px))', 'bottom:88px;bottom:calc(88px + var(--safe-area-inset-bottom, 0px))')
css = re.sub(r'#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})(?![0-9a-fA-F])',
             lambda match: 'rgba({},{},{},{:.3f})'.format(*(int(match.group(i), 16) for i in range(1, 4)), int(match.group(4), 16) / 255), css)
css += '\n#tool-actions button+button{margin-top:8px}@media(max-width:720px){#tool-actions button+button{margin-top:0;margin-left:8px}}nav button+button{margin-left:20px}.species-picker button+button{margin-left:8px}@media(max-width:720px){.species-picker button+button{margin-left:4px}}@media(max-width:360px){.species-picker button+button{margin-left:0}}@media(min-width:721px) and (max-width:850px){.species-picker button+button{margin-left:0}}@media(max-height:480px) and (min-width:540px){.species-picker button+button{margin-left:0}}\n'
(TARGET / "style.css").write_text(css)

parts = []
for name in ("tree-model", "simulation", "audio", "branch-instrument", "muhly-field", "grass-canopy", "grass-mesh", "needle-grass", "soft-layer", "rain", "moon", "leaf-water", "fireflies", "swipe-hint", "app"):
    js = (SOURCE / f"{name}.js").read_text()
    js = re.sub(r'^import .*?;\n', '', js, flags=re.MULTILINE)
    js = re.sub(r'^export ', '', js, flags=re.MULTILINE)
    if name == "grass-canopy":
        js = "const CanopySurface=(()=>{\n" + js + "\nreturn CanopySurface;})();"
    if name == "needle-grass":
        js = js.replace("groundY??height*.8", "(groundY==null?height*.8:groundY)")
        js = "const NeedleGrassField=(()=>{\n" + js + "\nreturn NeedleGrassField;})();"
    parts.append(js)
js = '\n'.join(parts)
js = js.replace("this.gl.getExtension('WEBGL_lose_context')?.loseContext()", "(function(gl){const extension=gl.getExtension('WEBGL_lose_context');if(extension)extension.loseContext()})(this.gl)")
js = re.sub(r'\{\.\.\.source,([\s\S]*?)\}\)', r'Object.assign({},source,{\1}))', js)
js = js.replace('this.tufts.at(-1)', 'this.tufts[this.tufts.length-1]')
js = js.replace('origin:{...p}', 'origin:Object.assign({},p)')
js = js.replace('origin:{...root}', 'origin:Object.assign({},root)')
js = js.replace('b.origin={...b.restOrigin}', 'b.origin=Object.assign({},b.restOrigin)')
js = js.replace('{...b.restOrigin}', 'Object.assign({},b.restOrigin)')
js = js.replace('prev:{...p}', 'prev:Object.assign({},p)')
js = js.replace('{a:{...a},b:{...b},v:{...v},time:this.time}', '{a:Object.assign({},a),b:Object.assign({},b),v:Object.assign({},v),time:this.time}')
js = js.replace('p=>[...p]', 'p=>p.slice()')
js = js.replace('[...sides[0].slice(1),...sides[1].reverse()]', 'sides[0].slice(1).concat(sides[1].reverse())')
js = js.replace('catch{', 'catch(e){')
js = js.replace('ginkgoTones[l.sprite]?.[l.tone]', '(ginkgoTones[l.sprite]&&ginkgoTones[l.sprite][l.tone])')
js = js.replace('cherryTones[visualState===\'falling\'?1:l.sprite]?.[l.tone]', '(cherryTones[visualState===\'falling\'?1:l.sprite]&&cherryTones[visualState===\'falling\'?1:l.sprite][l.tone])')
js = replace_once(js, "media.addEventListener('change',e=>{treeDirty=true;if(e.matches)swipeHint.dismiss();sim.setReduced(e.matches);trail=[];wake()});", "const onMotionChange=e=>{treeDirty=true;if(e.matches)swipeHint.dismiss();sim.setReduced(e.matches);trail=[];wake()};if(media.addEventListener)media.addEventListener('change',onMotionChange);else if(media.addListener)media.addListener(onMotionChange);")
js = replace_once(js, 'new ResizeObserver(resize).observe(canvas);resize();', "if(typeof ResizeObserver==='function')new ResizeObserver(resize).observe(canvas);else window.addEventListener('resize',resize);resize();")
# Lower optional access used by the newer grass renderers for older mini-tool hosts.
for old, new in {
    "groundY??height*(portrait?.73:.83)": "(groundY==null?height*(portrait?.73:.83):groundY)",
    "layer?.spec[3]??.5": "(layer?layer.spec[3]:.5)",
    "a.sx??b.sx": "(a.sx==null?b.sx:a.sx)", "a.sy??b.sy": "(a.sy==null?b.sy:a.sy)",
    "velocity?.x??dx*30": "(velocity&&velocity.x!=null?velocity.x:dx*30)",
    "velocity?.y??dy*30": "(velocity&&velocity.y!=null?velocity.y:dy*30)",
    "this.meshRenderer?.gl": "(this.meshRenderer&&this.meshRenderer.gl)",
    "gl.getExtension('WEBGL_lose_context')?.loseContext()": "(function(){const extension=gl.getExtension('WEBGL_lose_context');if(extension)extension.loseContext()})()",
    "this.gl.getExtension('WEBGL_lose_context')?.loseContext()": "(function(gl){const extension=gl.getExtension('WEBGL_lose_context');if(extension)extension.loseContext()})(this.gl)",
    "t.bankX??this.ribbonX(t.x/900,t.z)": "(t.bankX==null?this.ribbonX(t.x/900,t.z):t.bankX)",
    "t.bankW??.17": "(t.bankW==null?.17:t.bankW)",
}.items():
    js = js.replace(old, new)
if re.search(r'(^|\n)\s*(?:import|export)\s|\?\.(?!\d)|\?\?|catch\s*\{|\{\.\.\.', js):
    raise ValueError('Modern module or syntax left in bundle')
(TARGET / "app.js").write_text("(async function(){\n" + js + "\n})().catch(function(error){console.error(error)});\n")

assets = {
    "cherry-blossom.png", "cherry-side.png", "cherry-bud.png", "cherry-petal.png",
    "ginkgo-leaf.png", "ginkgo-deep.png", "ginkgo-folded.png",
    "jacaranda-cluster-muted-stems.png", "jacaranda-flower-light.png",
    "willow-leaf.png", "willow-sprig-icon.png", "maple-selector-front.png",
    "willow-tone-0.png", "willow-tone-1.png", "willow-tone-2.png", "willow-tone-3.png",
    "leaf-01.png", "leaf-04.png", "leaf-07.png", "leaf-11.png", "leaf-18.png", "sky-grain.png",
    "muhly-icon.svg", "muhly-panicles-v1.png", "muhly-panicles-open-v1.png",
    "needle-tuft-image-v4.png", "needle-canopy-v3.png", "needle-silver-spray-v3.png", "needle-panicles-v2.png", "needle-foliage-v2.png", "needle-icon.svg",
}
# Include newly referenced local images as the scene evolves.
assets.update(re.findall(r"['\"]assets/([^'\"]+\.(?:png|svg))['\"]", (SOURCE / "app.js").read_text()))
assets.update(re.findall(r'assets/([^"<>]+\.(?:png|svg))', (SOURCE / "index.html").read_text()))
for name in sorted(assets):
    shutil.copy2(SOURCE / "assets" / name, TARGET / "assets" / name)
for name in ("jacaranda-cluster-muted-stems.png", "maple-selector-front.png", "willow-sprig-icon.png"):
    subprocess.run(["sips", "-Z", "512", str(TARGET / "assets" / name)], check=True, stdout=subprocess.DEVNULL)
print(TARGET)
