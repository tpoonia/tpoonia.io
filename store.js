// Plain mutable values shared between GSAP (writes) and the 3D scenes (reads in useFrame).
// Using a plain object avoids React re-renders every frame.
export const store = {
  hero: 0,        // 0..1 scroll progress through the hero
  qNoise: 0.2,    // 0..1 noise level shown in the Q-TRACE scene
  amlStep: 0,     // which AML node is active
  reduced: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  mx: 0, my: 0,   // pointer position, -0.5..0.5, for the background camera
  small: typeof window !== 'undefined' && window.innerWidth < 760,
}

if (typeof window !== 'undefined') window.addEventListener('pointermove', e => { store.mx = e.clientX / window.innerWidth - 0.5; store.my = e.clientY / window.innerHeight - 0.5 }, { passive: true })
