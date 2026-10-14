(() => {
  'use strict';
  const stage = document.getElementById('flying-bats');
  if (!stage) return;
  const ns = 'http://www.w3.org/2000/svg';
  const open = 'M75 43 C61 31 28 13 4 18 C14 29 16 39 17 49 C24 38 32 43 34 56 C42 44 49 52 53 64 C61 54 69 60 76 59 Z';
  const up = 'M75 43 C63 27 53 7 36 1 C37 18 38 30 39 41 C44 34 49 41 51 49 C57 40 62 46 64 54 C68 48 72 52 76 59 Z';
  const down = 'M75 43 C60 44 31 53 5 71 C19 69 28 71 36 81 C38 70 45 67 53 77 C51 65 61 64 65 73 C65 61 71 58 76 59 Z';
  const settings = [
    {size:88, lane:.11, amplitude:.028, duration:15.8, phase:.14, flap:.26, reverse:false},
    {size:54, lane:.055, amplitude:.018, duration:13.2, phase:.76, flap:.22, reverse:true},
    {size:38, lane:.18, amplitude:.03, duration:20.4, phase:.42, flap:.20, reverse:false},
    {size:66, lane:.085, amplitude:.035, duration:18.1, phase:.60, flap:.29, reverse:true},
    {size:49, lane:.88, amplitude:.024, duration:17.5, phase:.26, flap:.24, reverse:false, low:true}
  ];
  function svgNode(name, attrs) {
    const e = document.createElementNS(ns, name);
    for (const [key,value] of Object.entries(attrs)) e.setAttribute(key, String(value));
    return e;
  }
  function makeWing(svg, mirrored, config) {
    const group = svgNode('g', mirrored ? {transform:'translate(160 0) scale(-1 1)'} : {});
    const path = svgNode('path', {class:'wing', d:open});
    const animation = svgNode('animate', {
      attributeName:'d', values:[open,up,down,open,open].join(';'),
      keyTimes:'0;0.22;0.56;0.82;1', dur:`${config.flap}s`,
      begin:`-${config.phase * config.flap + (mirrored ? .008 : 0)}s`,
      repeatCount:'indefinite', calcMode:'spline',
      keySplines:'.35 0 .65 1;.35 0 .65 1;.35 0 .65 1;0 0 1 1'
    });
    path.append(animation);
    group.append(path);
    svg.append(group);
  }
  const bats = settings.map(config => {
    const element = document.createElement('div');
    element.className = 'living-bat';
    element.style.setProperty('--bat-size', `${config.size}px`);
    const svg = svgNode('svg', {viewBox:'0 0 160 90', focusable:'false'});
    makeWing(svg, false, config);
    makeWing(svg, true, config);
    svg.append(
      svgNode('path', {class:'body',d:'M75 36 Q70 42 73 54 Q72 61 80 70 Q88 61 87 54 Q90 42 85 36 Z'}),
      svgNode('path', {class:'ear',d:'M73 41 L73 27 L79 35 L81 35 L87 27 L87 41 Z'}),
      svgNode('ellipse', {class:'body',cx:80,cy:40,rx:8,ry:8}),
      svgNode('ellipse', {class:'eye',cx:77,cy:39,rx:1,ry:.6}),
      svgNode('ellipse', {class:'eye',cx:83,cy:39,rx:1,ry:.6})
    );
    element.append(svg);
    stage.append(element);
    return {...config,element,svg};
  });
  let width = stage.clientWidth;
  let height = stage.clientHeight;
  let elapsed = 0;
  let lastTime = null;
  let frame = 0;
  let paused = true;
  function resize() { width = stage.clientWidth; height = stage.clientHeight; render(); }
  function render() {
    for (const bat of bats) {
      if (bat.low && width < 1000) { bat.element.style.opacity = '0'; continue; }
      const u = (elapsed / bat.duration + bat.phase) % 1;
      const travel = width + 220;
      const direction = bat.reverse ? -1 : 1;
      const x = bat.reverse ? width + 110 - u * travel : -110 + u * travel;
      const curve = u * Math.PI * 2 + bat.phase * Math.PI * 2;
      const y = height * (bat.lane + Math.sin(curve) * bat.amplitude + Math.sin(curve * 2.3) * .007);
      const slope = height * (Math.cos(curve) * bat.amplitude + Math.cos(curve * 2.3) * .0161) * Math.PI * 2 / travel;
      const angle = Math.atan(slope * direction) * 180 / Math.PI;
      const bank = .78 + .18 * Math.cos(curve + .4);
      const depth = .88 + .12 * Math.sin(curve - .6);
      const bob = Math.sin(elapsed / bat.flap * Math.PI * 2) * 1.3;
      const fade = Math.min(1,u/.06,(1-u)/.06);
      bat.element.style.opacity = String(Math.max(0,fade) * (bat.low ? .72 : .96));
      bat.element.style.transform = `translate3d(${x.toFixed(2)}px,${(y+bob).toFixed(2)}px,0) rotate(${angle.toFixed(2)}deg) scale(${(depth*bank).toFixed(3)},${depth.toFixed(3)})`;
    }
  }
  function tick(time) {
    if (paused) return;
    if (lastTime !== null) elapsed += Math.min((time-lastTime)/1000,.05);
    lastTime = time;
    render();
    frame = requestAnimationFrame(tick);
  }
  function setPaused(value) {
    paused = Boolean(value);
    cancelAnimationFrame(frame);
    lastTime = null;
    for (const bat of bats) {
      if (paused) bat.svg.pauseAnimations(); else bat.svg.unpauseAnimations();
    }
    if (!paused) frame = requestAnimationFrame(tick);
  }
  window.PlanetaBats = {setPaused};
  window.addEventListener('resize',resize,{passive:true});
  render();
  setPaused(document.documentElement.dataset.motion !== 'playing');
})();
