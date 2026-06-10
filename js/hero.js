/* =========================================================
   Hero WebGL — flowing-noise fluid gradient (Three.js r128)
   Minimal visual, rich motion. Mouse-reactive warp.
   Falls back gracefully when WebGL / motion is unavailable.
   ========================================================= */
(function () {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasWebGL = (function () {
    try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl"))); }
    catch (e) { return false; }
  })();

  // theme color helper -> [r,g,b] 0..1
  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    const toRGB = (v) => {
      const d = document.createElement("div"); d.style.color = v.trim(); document.body.appendChild(d);
      const m = getComputedStyle(d).color.match(/\d+(\.\d+)?/g); d.remove();
      return m ? [m[0] / 255, m[1] / 255, m[2] / 255] : [0, 0, 0];
    };
    return {
      bg: toRGB(cs.getPropertyValue("--bg")),
      elev: toRGB(cs.getPropertyValue("--bg-elev-2")),
      accent: toRGB(cs.getPropertyValue("--accent")),
      isLight: document.documentElement.getAttribute("data-theme") === "light"
    };
  }

  if (!window.THREE || !hasWebGL) {
    // CSS fallback: soft animated gradient handled by class
    canvas.style.background = "radial-gradient(60% 80% at 30% 30%, var(--accent-soft), transparent 70%)";
    return;
  }

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const c = readColors();
  const uniforms = {
    u_time: { value: 0 },
    u_res: { value: new THREE.Vector2(1, 1) },
    u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
    u_mvel: { value: 0 },
    u_bg: { value: new THREE.Color().fromArray(c.bg) },
    u_elev: { value: new THREE.Color().fromArray(c.elev) },
    u_accent: { value: new THREE.Color().fromArray(c.accent) },
    u_light: { value: c.isLight ? 1 : 0 }
  };

  const frag = `
    precision highp float;
    uniform float u_time; uniform vec2 u_res; uniform vec2 u_mouse; uniform float u_mvel;
    uniform vec3 u_bg; uniform vec3 u_elev; uniform vec3 u_accent; uniform float u_light;
    varying vec2 vUv;

    vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
    float snoise(vec2 v){
      const vec4 C=vec4(0.211324865,0.366025403,-0.577350269,0.024390243);
      vec2 i=floor(v+dot(v,C.yy)); vec2 x0=v-i+dot(i,C.xx);
      vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
      vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1; i=mod289(i);
      vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
      vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
      m=m*m; m=m*m;
      vec3 x=2.0*fract(p*C.www)-1.0; vec3 h=abs(x)-0.5; vec3 ox=floor(x+0.5); vec3 a0=x-ox;
      m*=1.79284291-0.85373472*(a0*a0+h*h);
      vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
      return 130.0*dot(m,g);
    }
    float fbm(vec2 p){
      float s=0.0, a=0.5;
      for(int i=0;i<5;i++){ s+=a*snoise(p); p*=2.02; a*=0.5; }
      return s;
    }
    void main(){
      vec2 uv=vUv;
      vec2 p=(gl_FragCoord.xy*2.0-u_res)/min(u_res.x,u_res.y);
      float t=u_time*0.13;

      vec2 m=(u_mouse-0.5)*2.0;
      float md=distance(p, m*1.1);
      // domain warp — extra drift terms so it always flows, even without the mouse
      vec2 q=vec2(fbm(p*1.15+vec2(sin(t*0.6)*0.4,t)), fbm(p*1.15+vec2(5.2,t*1.3)));
      vec2 r=vec2(fbm(p*1.15+q*1.6+vec2(1.7,9.2)+t*0.55), fbm(p*1.15+q*1.6+vec2(8.3,2.8)-t*0.35));
      float f=fbm(p*1.25+r*1.35 - m*0.35);

      f=f*0.5+0.5;
      float ripple=smoothstep(0.62,0.0,md)*(0.16+u_mvel*0.7);
      f+=ripple;
      // slow breathing pulse keeps the field alive at rest
      f+=0.04*sin(t*1.8+f*6.2831);

      vec3 col=mix(u_bg,u_elev, smoothstep(0.16,0.92,f));
      float acc=smoothstep(0.66,1.0,f+r.x*0.18);
      acc*= (0.32 + u_mvel*1.7);
      acc*= smoothstep(0.95,0.10,md)*0.85+0.20;
      col=mix(col,u_accent, clamp(acc,0.0,1.0)*0.62);

      // gentle vignette
      float vig=smoothstep(1.4,0.2,length(p));
      col*=mix(0.86,1.04,vig);

      // per-theme exposure — lift the dark theme (was too dark), settle the light theme (was too bright)
      col=mix(col*1.24+0.030, col*0.80, u_light);

      // grain
      float g=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);
      col+=(g-0.5)*0.025;

      gl_FragColor=vec4(col,1.0);
    }
  `;

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.0); }",
    fragmentShader: frag
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    uniforms.u_res.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
  }
  window.addEventListener("resize", resize);
  resize();

  // mouse
  let tmx = 0.5, tmy = 0.5, mx = 0.5, my = 0.5, vel = 0, tvel = 0, lastX = 0.5;
  window.addEventListener("pointermove", (e) => {
    tmx = e.clientX / window.innerWidth;
    tmy = 1 - e.clientY / window.innerHeight;
    tvel = Math.min(1, Math.abs(tmx - lastX) * 18);
    lastX = tmx;
  });

  let raf, running = true, t0 = performance.now();
  function loop(now) {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - t0) / 1000); t0 = now;
    mx += (tmx - mx) * 0.06; my += (tmy - my) * 0.06;
    tvel *= 0.92; vel += (tvel - vel) * 0.1;
    uniforms.u_mouse.value.set(mx, my);
    uniforms.u_mvel.value = vel;
    uniforms.u_time.value += reduce ? 0 : dt;
    renderer.render(scene, camera);
  }
  if (reduce) { uniforms.u_time.value = 12.0; renderer.render(scene, camera); }
  else loop(performance.now());

  // pause when hero off-screen (perf)
  const hero = canvas.closest(".hero");
  if (hero && "IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting && !reduce) { if (!running) { running = true; t0 = performance.now(); loop(t0); } }
        else { running = false; cancelAnimationFrame(raf); }
      });
    }, { threshold: 0.02 }).observe(hero);
  }

  window.HeroFX = {
    setTheme() {
      const cc = readColors();
      uniforms.u_bg.value.fromArray(cc.bg);
      uniforms.u_elev.value.fromArray(cc.elev);
      uniforms.u_accent.value.fromArray(cc.accent);
      uniforms.u_light.value = cc.isLight ? 1 : 0;
      renderer.render(scene, camera); // always paint one frame so colours update
    }
  };
})();
