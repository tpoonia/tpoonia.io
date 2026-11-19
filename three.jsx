import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { View, Float, Environment, Lightformer, RoundedBox, PerspectiveCamera, ContactShadows } from '@react-three/drei'
import { store } from './store'

export const C = { orange: '#FF5B1F', cobalt: '#2443FF', mint: '#12B886', butter: '#FFC43D', sky: '#8FD3FF', cream: '#F5EFE4', ink: '#15130F' }

/* Studio lighting built from light panels, so nothing is downloaded at runtime */
function Studio() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.6} />
      <directionalLight position={[-6, -2, -4]} intensity={0.5} color={C.sky} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 5, -6]} scale={[12, 4, 1]} />
        <Lightformer form="rect" intensity={2} color={C.butter} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={2} color={C.sky} position={[6, 0, 2]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="ring" intensity={2.5} position={[0, 0, 6]} scale={4} />
      </Environment>
    </>
  )
}

const gloss = { clearcoat: 1, clearcoatRoughness: 0.08, roughness: 0.18, metalness: 0.05 }

/* ---------- HERO: a 3D neural network; glowing signals flow from input to output ---------- */
const LAYERS = [4, 7, 8, 7, 3]
const LAYER_COLORS = [C.orange, C.cobalt, C.mint, C.cobalt, C.butter]
function NeuralNet() {
  const group = useRef(), nodeRefs = useRef([]), pulseMesh = useRef()
  const { nodes, edges, byLayer, linePos } = useMemo(() => {
    const nodes = [], byLayer = []
    const gap = 1.55, x0 = -((LAYERS.length - 1) * gap) / 2
    LAYERS.forEach((n, li) => {
      byLayer[li] = []
      for (let i = 0; i < n; i++) {
        const y = (i - (n - 1) / 2) * 0.78
        const z = Math.sin(i * 1.7 + li) * 0.55
        byLayer[li].push(nodes.length)
        nodes.push({ li, p: new THREE.Vector3(x0 + li * gap, y, z), color: LAYER_COLORS[li] })
      }
    })
    const edges = []
    for (let li = 0; li < LAYERS.length - 1; li++)
      byLayer[li].forEach(a => byLayer[li + 1].forEach(b => edges.push([a, b])))
    const linePos = new Float32Array(edges.length * 6)
    edges.forEach(([a, b], k) => { linePos.set([...nodes[a].p.toArray(), ...nodes[b].p.toArray()], k * 6) })
    return { nodes, edges, byLayer, linePos }
  }, [])
  // signals: each one walks from an input node to an output node, one layer at a time
  const P = store.small ? 14 : 26
  const pulses = useMemo(() => Array.from({ length: P }, () => {
    const from = byLayer[0][Math.floor(Math.random() * byLayer[0].length)]
    return { from, to: byLayer[1][Math.floor(Math.random() * byLayer[1].length)], t: Math.random(), speed: 0.7 + Math.random() * 0.6 }
  }), [])
  const act = useMemo(() => new Float32Array(nodes.length), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const pulseColor = useMemo(() => new THREE.Color(C.orange), [])
  useFrame((state, dt) => {
    const h = store.hero, still = store.reduced
    if (!still) pulses.forEach(p => {
      p.t += dt * p.speed
      if (p.t >= 1) {
        act[p.to] = 1
        const li = nodes[p.to].li
        p.t = 0
        if (li >= LAYERS.length - 1) { p.from = byLayer[0][Math.floor(Math.random() * byLayer[0].length)]; act[p.from] = 1 }
        else p.from = p.to
        const next = byLayer[nodes[p.from].li + 1]
        p.to = next[Math.floor(Math.random() * next.length)]
      }
    })
    pulses.forEach((p, i) => {
      dummy.position.lerpVectors(nodes[p.from].p, nodes[p.to].p, still ? 0.5 : p.t)
      dummy.scale.setScalar(store.reduced ? 0 : 1)
      dummy.updateMatrix(); pulseMesh.current.setMatrixAt(i, dummy.matrix)
    })
    pulseMesh.current.instanceMatrix.needsUpdate = true
    nodeRefs.current.forEach((m, i) => {
      if (!m) return
      act[i] = Math.max(0, act[i] - dt * 1.6)
      m.scale.setScalar(1 + act[i] * 0.55)
      m.material.emissiveIntensity = 0.1 + act[i] * 1.2
    })
    const px = still ? 0 : state.pointer.x, py = still ? 0 : state.pointer.y
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, -0.28 + px * 0.45 + h * 1.2 + (still ? 0 : Math.sin(state.clock.elapsedTime * 0.25) * 0.12), 4, dt)
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, 0.12 - py * 0.25, 4, dt)
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, h * 2, 5, dt)
    const s = (store.small ? 0.92 : 0.82) + h * 0.35
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, s, 5, dt))
  })
  return (
    <group ref={group}>
      <lineSegments>
        <bufferGeometry><bufferAttribute attach="attributes-position" array={linePos} count={linePos.length / 3} itemSize={3} /></bufferGeometry>
        <lineBasicMaterial color={C.cream} transparent opacity={0.2} />
      </lineSegments>
      {nodes.map((n, i) => (
        <mesh key={i} position={n.p} ref={el => (nodeRefs.current[i] = el)}>
          <sphereGeometry args={[n.li === 0 || n.li === LAYERS.length - 1 ? 0.22 : 0.17, 40, 40]} />
          <meshPhysicalMaterial color={n.color} emissive={n.color} emissiveIntensity={0.1} {...gloss} />
        </mesh>
      ))}
      <instancedMesh ref={pulseMesh} args={[null, null, P]}>
        <sphereGeometry args={[0.075, 16, 16]} />
        <meshBasicMaterial color={pulseColor} toneMapped={false} />
      </instancedMesh>
    </group>
  )
}

export function HeroScene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 9.2]} fov={42} />
      <Studio />
      <Float speed={store.reduced ? 0 : 1.2} rotationIntensity={0.15} floatIntensity={0.5}><NeuralNet /></Float>
    </>
  )
}

/* ---------- AML: alert travels through five agents along a glowing 3D path ---------- */
function AmlGraph() {
  const pts = useMemo(() => [
    new THREE.Vector3(-3.2, 1.6, 0), new THREE.Vector3(-1.6, 0.4, 0.8), new THREE.Vector3(0, 1.5, -0.4),
    new THREE.Vector3(1.4, 0.1, 0.6), new THREE.Vector3(0.2, -1.4, 0.2), new THREE.Vector3(2.6, -1.7, -0.2),
  ], [])
  const curve = useMemo(() => new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5), [pts])
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 200, 0.045, 12, false), [curve])
  const pulse = useRef(), nodes = useRef([]), group = useRef(), t = useRef(0)
  const colors = [C.orange, C.butter, C.mint, C.sky, C.butter, C.cream]
  useFrame((state, dt) => {
    if (!store.reduced) t.current = (t.current + dt * 0.12) % 1
    else t.current = 0.98
    const p = curve.getPointAt(t.current)
    pulse.current.position.copy(p)
    const active = Math.min(pts.length - 1, Math.round(t.current * (pts.length - 1)))
    store.amlStep = active
    nodes.current.forEach((n, i) => {
      if (!n) return
      const target = i === active ? 1.45 : 1
      n.scale.setScalar(THREE.MathUtils.damp(n.scale.x, target, 8, dt))
    })
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, state.pointer.x * 0.35, 3, dt)
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -state.pointer.y * 0.2, 3, dt)
  })
  return (
    <group ref={group} scale={0.8} position={[0, 0.7, 0]}>
      <mesh geometry={tube}><meshStandardMaterial color={C.cream} emissive={C.sky} emissiveIntensity={0.4} transparent opacity={0.55} /></mesh>
      {pts.map((p, i) => (
        <group key={i} position={p} ref={el => (nodes.current[i] = el)}>
          <mesh><sphereGeometry args={[0.32, 48, 48]} /><meshPhysicalMaterial color={colors[i]} {...gloss} emissive={colors[i]} emissiveIntensity={0.15} /></mesh>
        </group>
      ))}
      <mesh ref={pulse}><sphereGeometry args={[0.13, 24, 24]} /><meshBasicMaterial color={C.butter} /></mesh>
      <pointLight color={C.butter} intensity={6} distance={3} position={[0, 0, 1.5]} />
    </group>
  )
}

export function AmlScene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 9]} fov={45} />
      <Studio />
      <Float speed={store.reduced ? 0 : 1} floatIntensity={0.4} rotationIntensity={0.1}><AmlGraph /></Float>
    </>
  )
}

/* ---------- Q-TRACE: four qubit spheres whose arrows shake more as noise goes up ---------- */
function Qubit({ x, y = 0, phase, color }) {
  const arrow = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime, n = store.qNoise
    const wob = store.reduced ? 0 : n * 0.9
    arrow.current.rotation.z = Math.sin(t * 1.2 + phase) * 0.5 + Math.sin(t * 13 + phase * 3) * wob * 0.35
    arrow.current.rotation.x = Math.cos(t * 0.9 + phase) * 0.4 + Math.cos(t * 17 + phase) * wob * 0.35
  })
  return (
    <group position={[x, y, 0]}>
      <mesh><sphereGeometry args={[0.72, 24, 16]} /><meshBasicMaterial color={C.cream} wireframe transparent opacity={0.18} /></mesh>
      <mesh rotation-x={Math.PI / 2}><torusGeometry args={[0.72, 0.012, 8, 64]} /><meshBasicMaterial color={C.cream} transparent opacity={0.5} /></mesh>
      <group ref={arrow}>
        <mesh position={[0, 0.32, 0]}><cylinderGeometry args={[0.035, 0.035, 0.64, 12]} /><meshPhysicalMaterial color={color} {...gloss} /></mesh>
        <mesh position={[0, 0.7, 0]}><coneGeometry args={[0.1, 0.2, 20]} /><meshPhysicalMaterial color={color} {...gloss} /></mesh>
        <mesh><sphereGeometry args={[0.08, 16, 16]} /><meshPhysicalMaterial color={C.cream} {...gloss} /></mesh>
      </group>
    </group>
  )
}

export function QuantumScene() {
  const g = useRef()
  useFrame((state, dt) => {
    g.current.rotation.y = THREE.MathUtils.damp(g.current.rotation.y, state.pointer.x * 0.4 - 0.2, 3, dt)
    g.current.rotation.x = THREE.MathUtils.damp(g.current.rotation.x, 0.25 - state.pointer.y * 0.2, 3, dt)
  })
  const cols = [C.orange, C.butter, C.mint, C.sky]
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 7]} fov={45} />
      <Studio />
      <group ref={g}>
        {[[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([x, y], i) => <Qubit key={i} x={x} y={y} phase={i * 1.3} color={cols[i]} />)}
      </group>
    </>
  )
}

/* ---------- CONTACT: a glossy AI chip with glowing traces, tilting toward the mouse ---------- */
function AiChip() {
  const g = useRef(), traces = useRef()
  const pins = useMemo(() => {
    const out = [], n = 7, span = 2.0
    for (let i = 0; i < n; i++) {
      const o = -span / 2 + (i * span) / (n - 1)
      out.push([o, 1.45, 0], [o, -1.45, 0], [1.45, o, 0], [-1.45, o, 0])
    }
    return out
  }, [])
  const tracePos = useMemo(() => {
    const arr = []
    pins.forEach(([x, y]) => { const k = 2.2; arr.push(x, y, 0, x * k, y * k, 0) })
    return new Float32Array(arr)
  }, [pins])
  useFrame((state, dt) => {
    g.current.rotation.y = THREE.MathUtils.damp(g.current.rotation.y, -0.5 + state.pointer.x * 0.6, 3, dt)
    g.current.rotation.x = THREE.MathUtils.damp(g.current.rotation.x, 0.5 - state.pointer.y * 0.4, 3, dt)
    if (!store.reduced) traces.current.material.opacity = 0.35 + Math.sin(state.clock.elapsedTime * 3) * 0.25
  })
  return (
    <group ref={g} scale={0.95}>
      <RoundedBox args={[2.6, 2.6, 0.32]} radius={0.12} smoothness={6}><meshPhysicalMaterial color={C.ink} {...gloss} /></RoundedBox>
      <RoundedBox args={[1.7, 1.7, 0.2]} radius={0.1} smoothness={6} position={[0, 0, 0.22]}><meshPhysicalMaterial color={C.orange} {...gloss} emissive={C.orange} emissiveIntensity={0.15} /></RoundedBox>
      {[[-0.4, 0.4], [0.4, 0.4], [-0.4, -0.4], [0.4, -0.4]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.34]}><boxGeometry args={[0.5, 0.5, 0.06]} /><meshPhysicalMaterial color={i % 2 ? C.butter : C.cream} {...gloss} /></mesh>
      ))}
      {pins.map((p, i) => (
        <mesh key={i} position={p}><boxGeometry args={[Math.abs(p[0]) > 1.4 ? 0.3 : 0.1, Math.abs(p[1]) > 1.4 ? 0.3 : 0.1, 0.08]} /><meshPhysicalMaterial color={C.butter} metalness={0.6} roughness={0.25} /></mesh>
      ))}
      <lineSegments ref={traces}>
        <bufferGeometry><bufferAttribute attach="attributes-position" array={tracePos} count={tracePos.length / 3} itemSize={3} /></bufferGeometry>
        <lineBasicMaterial color={C.cobalt} transparent opacity={0.5} />
      </lineSegments>
    </group>
  )
}

export function ContactScene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 7]} fov={40} />
      <Studio />
      <Float speed={store.reduced ? 0 : 1.6} floatIntensity={0.8} rotationIntensity={0.2}><AiChip /></Float>
    </>
  )
}

/* One shared canvas for the whole page; each <View> draws into its own DOM box */
export function GlobalCanvas() {
  return (
    <Canvas
      className="gl"
      eventSource={document.getElementById('root')}
      eventPrefix="client"
      dpr={[1, store.small ? 1.5 : 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 3 }}
    >
      <View.Port />
    </Canvas>
  )
}

export { View }

/* ---------- FULL-PAGE BACKGROUND: neon grid floor, drifting particles, distant wireframes ---------- */
function BgParticles() {
  const ref = useRef()
  const { pos, col } = useMemo(() => {
    const n = store.small ? 900 : 2000, pos = new Float32Array(n * 3), col = new Float32Array(n * 3)
    const pal = [C.orange, C.cobalt, C.mint, C.butter, C.sky, C.cream].map(c => new THREE.Color(c))
    for (let i = 0; i < n; i++) {
      pos.set([(Math.random() - 0.5) * 60, Math.random() * 30 - 8, -Math.random() * 40 + 6], i * 3)
      const c = pal[i % pal.length]; col.set([c.r, c.g, c.b], i * 3)
    }
    return { pos, col }
  }, [])
  const tex = useMemo(() => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 64
    const x = cv.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = g; x.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t
  }, [])
  useFrame((s, dt) => { if (!store.reduced) ref.current.rotation.y += dt * 0.012 })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={pos} count={pos.length / 3} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={col} count={col.length / 3} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.16} map={tex} vertexColors transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
    </points>
  )
}

function NeonGrid() {
  const ref = useRef()
  const geo = useMemo(() => {
    const size = 120, step = 2, pts = []
    for (let i = -size / 2; i <= size / 2; i += step) { pts.push(i, 0, -size / 2, i, 0, size / 2, -size / 2, 0, i, size / 2, 0, i) }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); return g
  }, [])
  const mat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { cA: { value: new THREE.Color(C.cobalt) }, cB: { value: new THREE.Color(C.orange) } },
    vertexShader: 'varying float vD; varying float vX; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vD = -mv.z; vX = position.x; gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'uniform vec3 cA; uniform vec3 cB; varying float vD; varying float vX; void main(){ float f = smoothstep(46.0, 6.0, vD); vec3 c = mix(cA, cB, smoothstep(-30.0, 30.0, vX)); gl_FragColor = vec4(c, f*0.55); }',
  }), [])
  useFrame((s, dt) => { if (!store.reduced) ref.current.position.z = (ref.current.position.z + dt * 1.6) % 2 })
  return <lineSegments ref={ref} geometry={geo} material={mat} position={[0, -4.5, -20]} />
}

function FarShapes() {
  const a = useRef(), b = useRef(), c = useRef()
  useFrame((s, dt) => {
    if (store.reduced) return
    a.current.rotation.x += dt * 0.05; a.current.rotation.y += dt * 0.07
    b.current.rotation.z += dt * 0.04; b.current.rotation.x += dt * 0.03
    c.current.rotation.y -= dt * 0.06
  })
  return (
    <>
      <mesh ref={a} position={[-14, 6, -26]}><icosahedronGeometry args={[6, 1]} /><meshBasicMaterial color={C.orange} wireframe transparent opacity={0.12} /></mesh>
      <mesh ref={b} position={[16, 3, -30]}><torusGeometry args={[6, 0.06, 8, 120]} /><meshBasicMaterial color={C.mint} transparent opacity={0.35} /></mesh>
      <mesh ref={c} position={[12, 10, -34]}><octahedronGeometry args={[4, 0]} /><meshBasicMaterial color={C.cobalt} wireframe transparent opacity={0.22} /></mesh>
    </>
  )
}

function BgRig() {
  useFrame((state, dt) => {
    const sy = window.scrollY || 0, max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    const p = sy / max, cam = state.camera
    const mx = store.reduced ? 0 : store.mx, my = store.reduced ? 0 : store.my
    cam.position.x = THREE.MathUtils.damp(cam.position.x, mx * 1.6, 2, dt)
    cam.position.y = THREE.MathUtils.damp(cam.position.y, 1.2 - p * 6 - my * 0.8, 2, dt)
    cam.rotation.x = THREE.MathUtils.damp(cam.rotation.x, -0.08 + p * 0.25, 2, dt)
    cam.rotation.y = THREE.MathUtils.damp(cam.rotation.y, -mx * 0.05 + p * 0.6, 2, dt)
  })
  return null
}

export function BackgroundCanvas() {
  return (
    <Canvas
      className="bg-gl"
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.2, 8], fov: 60, near: 0.1, far: 120 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}
    >
      <fog attach="fog" args={['#0B1020', 18, 60]} />
      <BgRig />
      <BgParticles />
      <NeonGrid />
      <FarShapes />
    </Canvas>
  )
}
