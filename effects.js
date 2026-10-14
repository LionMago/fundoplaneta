(() => {
  "use strict";

  const root = document.documentElement;
  const specks = document.getElementById("night-specks");
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  root.dataset.framing = window.self === window.top ? "standalone" : "embedded";
  let seed = 310;

  // A fixed seed keeps the composition quiet and stable on reload.
  function random() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  function updateMotion() {
    const paused = document.hidden || motionPreference.matches;
    root.dataset.motion = paused ? "paused" : "playing";
    // The requested slow smoke drift stays enabled while this artwork is visible.
    root.dataset.smokeMotion = document.hidden ? "paused" : "playing";
    window.PlanetaBats?.setPaused(paused);
  }

  if (specks) {
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < 34; i += 1) {
      const star = document.createElement("i");
      star.className = "star";
      // Most stars sit above the chat or along the outer edges.
      const topBand = i % 3 === 0;
      const x = topBand ? random() * 100 : (i % 2 === 0 ? random() * 17 : 83 + random() * 17);
      const y = topBand ? random() * 15 : 12 + random() * 55;
      star.style.cssText = `left:${x.toFixed(2)}%;top:${y.toFixed(2)}%;--size:${(0.8 + random() * 1.5).toFixed(2)}px;--duration:${(5 + random() * 7).toFixed(2)}s;--delay:${(-random() * 12).toFixed(2)}s`;
      fragment.append(star);
    }

    for (let i = 0; i < 14; i += 1) {
      const ember = document.createElement("i");
      ember.className = "ember";
      const x = i % 2 === 0 ? 2 + random() * 20 : 78 + random() * 20;
      ember.style.cssText = `left:${x.toFixed(2)}%;--size:${(1 + random() * 1.3).toFixed(2)}px;--duration:${(14 + random() * 14).toFixed(2)}s;--delay:${(-random() * 27).toFixed(2)}s;--drift:${(-18 + random() * 36).toFixed(2)}px`;
      fragment.append(ember);
    }

    specks.append(fragment);
  }

  document.addEventListener("visibilitychange", updateMotion);
  motionPreference.addEventListener("change", updateMotion);

  updateMotion();
})();
