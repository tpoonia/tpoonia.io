import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useSpring, useMotionValue, useMotionValueEvent, useInView, animate, useReducedMotion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LocomotiveScroll from 'locomotive-scroll'
import VanillaTilt from 'vanilla-tilt'
import { GlobalCanvas, BackgroundCanvas, View, HeroScene, AmlScene, QuantumScene, ContactScene } from './three'
import { store } from './store'
import { links, stats, jobs, amlNodes, sideProjects, skills, education, SPLINE_SCENE } from './data'

gsap.registerPlugin(ScrollTrigger)
const Spline = SPLINE_SCENE ? lazy(() => import('@splinetool/react-spline')) : null
const fine = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
let loco = null
const go = (e, id) => { e.preventDefault(); const el = document.querySelector(id); if (!el) return; if (loco) loco.scrollTo(el, { offset: -70 }); else el.scrollIntoView({ behavior: store.reduced ? 'auto' : 'smooth' }) }

/* ---------- small helpers ---------- */
const ease = [0.22, 1, 0.36, 1]
const up = { hidden: { opacity: 0, y: 50 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } }

function Words({ text, className, delay = 0 }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <span key={i} className="w" aria-hidden="true">
          <motion.span initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 1, ease, delay: delay + i * 0.08 }}>{w}</motion.span>{' '}
        </span>
      ))}
    </span>
  )
}

function Heading({ kicker, children, light }) {
  return (
    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-15%' }} className={'head' + (light ? ' light' : '')}>
      <motion.p variants={up} className="kicker">{kicker}</motion.p>
      <motion.h2 variants={up}>{children}</motion.h2>
    </motion.div>
  )
}

function useTilt(opts = {}) {
  const ref = useRef()
  useEffect(() => {
    if (!fine || store.reduced || !ref.current) return
    const el = ref.current
    VanillaTilt.init(el, { max: 10, speed: 700, glare: true, 'max-glare': 0.25, scale: 1.02, ...opts })
    return () => el.vanillaTilt && el.vanillaTilt.destroy()
  }, [])
  return ref
}

function Magnetic({ children, className, href, onClick, ...rest }) {
  const x = useMotionValue(0), y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 15 }), sy = useSpring(y, { stiffness: 220, damping: 15 })
  const move = e => { if (!fine) return; const r = e.currentTarget.getBoundingClientRect(); x.set((e.clientX - r.left - r.width / 2) * 0.3); y.set((e.clientY - r.top - r.height / 2) * 0.4) }
  return (
    <motion.a href={href} onClick={onClick} className={className} style={{ x: sx, y: sy }} onMouseMove={move} onMouseLeave={() => { x.set(0); y.set(0) }} whileTap={{ scale: 0.94 }} {...rest}>
      {children}
    </motion.a>
  )
}

function Counter({ to, suffix }) {
  const ref = useRef(), inView = useInView(ref, { once: true, margin: '-10%' }), [v, setV] = useState(store.reduced ? to : 0)
  useEffect(() => { if (inView && !store.reduced) { const c = animate(0, to, { duration: 1.8, ease: 'easeOut', onUpdate: n => setV(Math.round(n)) }); return () => c.stop() } }, [inView])
  return <b ref={ref}>{v}{suffix}</b>
}

function Cursor() {
  const x = useMotionValue(-100), y = useMotionValue(-100), [big, setBig] = useState(false)
  const sx = useSpring(x, { stiffness: 500, damping: 40 }), sy = useSpring(y, { stiffness: 500, damping: 40 })
  useEffect(() => {
    const m = e => { x.set(e.clientX); y.set(e.clientY); setBig(!!e.target.closest('a,button,[data-tilt-card]')) }
    addEventListener('pointermove', m, { passive: true }); return () => removeEventListener('pointermove', m)
  }, [])
  return <motion.div className="cursor" aria-hidden="true" style={{ x: sx, y: sy }} animate={{ scale: big ? 2.4 : 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} />
}

const Arrow = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>

/* ---------- NAV ---------- */
function Nav() {
  const [hidden, setHidden] = useState(false), [open, setOpen] = useState(false), [solid, setSolid] = useState(false)
  const { scrollY, scrollYProgress } = useScroll(), bar = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  useMotionValueEvent(scrollY, 'change', v => { const p = scrollY.getPrevious() ?? 0; setHidden(v > p && v > 300 && !open); setSolid(v > 30) })
  const items = [['#about', 'About'], ['#experience', 'Experience'], ['#projects', 'Projects'], ['#skills', 'Skills'], ['#education', 'Education'], ['#contact', 'Contact']]
  return (
    <>
      <motion.div className="bar" style={{ scaleX: bar }} aria-hidden="true" />
      <motion.header className={'nav' + (solid ? ' solid' : '')} animate={{ y: hidden ? -100 : 0 }} transition={{ duration: 0.35, ease }}>
        <a href="#top" onClick={e => go(e, '#top')} className="logo" aria-label="Tushar Poonia, back to top"><span>TP</span></a>
        <nav aria-label="Main"><ul className="links">{items.map(([h, t]) => <li key={h}><a href={h} onClick={e => go(e, h)}>{t}</a></li>)}</ul></nav>
        <Magnetic className="pill dark small" href={links.resume} target="_blank" rel="noopener">Resume</Magnetic>
        <button className="burger" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}><span /><span /></button>
      </motion.header>
      <AnimatePresence>
        {open && (
          <motion.div className="sheet" initial={{ clipPath: 'circle(0% at 92% 4%)' }} animate={{ clipPath: 'circle(150% at 92% 4%)' }} exit={{ clipPath: 'circle(0% at 92% 4%)' }} transition={{ duration: 0.6, ease }}>
            <motion.ul variants={stagger} initial="hidden" animate="show">
              {items.map(([h, t]) => <motion.li key={h} variants={up}><a href={h} onClick={e => { setOpen(false); go(e, h) }}>{t}</a></motion.li>)}
              <motion.li variants={up}><a href={links.resume} target="_blank" rel="noopener">Resume</a></motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ---------- HERO ---------- */
const roles = ['AI agents', 'RAG systems', 'ML pipelines', 'quantum ML tools']
function Hero() {
  const [ri, setRi] = useState(0)
  useEffect(() => { if (store.reduced) return; const t = setInterval(() => setRi(i => (i + 1) % roles.length), 2400); return () => clearInterval(t) }, [])
  return (
    <section id="top" className="hero">
      <div className="hero-bg" aria-hidden="true"><span className="sun" data-scroll data-scroll-speed="-0.3" /><span className="ring" data-scroll data-scroll-speed="0.2" /></div>
      <div className="hero-copy">
        <motion.p className="tag" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8, ease }}><i />AI Engineer in New York, open to work</motion.p>
        <h1><Words text="Tushar" className="l1" delay={0.3} /><br /><Words text="Poonia" className="l2" delay={0.45} /></h1>
        <motion.p className="hero-sub" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8, ease }}>
          I build AI that works in real products, not just in demos. Right now that means{' '}
          <span className="swap"><AnimatePresence mode="wait"><motion.b key={ri} initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '-100%', opacity: 0 }} transition={{ duration: 0.45, ease }}>{roles[ri]}</motion.b></AnimatePresence></span>.
        </motion.p>
        <motion.div className="cta" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8, ease }}>
          <Magnetic className="pill orange" href="#projects" onClick={e => go(e, '#projects')}>See my work <Arrow /></Magnetic>
          <Magnetic className="pill ghost" href={links.resume} target="_blank" rel="noopener">Download resume</Magnetic>
        </motion.div>
        <motion.div className="socials" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
          <a href={links.github} target="_blank" rel="noopener">GitHub</a><a href={links.linkedin} target="_blank" rel="noopener">LinkedIn</a><a href={'mailto:' + links.email}>Email</a>
        </motion.div>
      </div>
      {Spline ? (
        <div className="hero-3d"><Suspense fallback={null}><Spline scene={SPLINE_SCENE} /></Suspense></div>
      ) : (
        <View className="hero-3d"><HeroScene /></View>
      )}
      <div className="scroll-cue" aria-hidden="true"><span>scroll</span><i /></div>
    </section>
  )
}

/* ---------- MARQUEE ---------- */
function Marquee({ words, dark }) {
  return (
    <div className={'marquee' + (dark ? ' dark' : '')} aria-hidden="true">
      <div className="track">{[...words, ...words].map((w, i) => <span key={i}>{w}<em>✦</em></span>)}</div>
    </div>
  )
}

/* ---------- ABOUT ---------- */
function Stat({ s, i }) {
  const ref = useTilt()
  return (
    <motion.div ref={ref} data-tilt-card className={'stat c' + i} variants={up}>
      <Counter to={s.n} suffix={s.suffix} /><span>{s.label}</span>
    </motion.div>
  )
}
function About() {
  return (
    <section id="about" className="about">
      <span className="ghost-word" data-scroll data-scroll-speed="0.6" aria-hidden="true">ABOUT</span>
      <div className="wrap grid2">
        <div>
          <Heading kicker="About me">From bank systems <br />to <span className="hl">AI agents.</span></Heading>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-10%' }} className="about-copy">
            <motion.p variants={up}>I spent <b>3+ years at Tata Consultancy Services</b> building ML pipelines and backend systems for <b>CTBC Bank</b> in Taiwan and <b>ING Bank</b> in the Netherlands. That taught me how to make models fast, reliable and useful for the people who depend on them.</motion.p>
            <motion.p variants={up}>Now I'm doing an <b>M.S. in Artificial Intelligence at Yeshiva University</b> (GPA 3.8), building AI agents that review anti-money laundering alerts and a tool that cuts the cost of running quantum ML models.</motion.p>
          </motion.div>
        </div>
        <motion.div className="stats" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-10%' }}>
          {stats.map((s, i) => <Stat key={i} s={s} i={i} />)}
        </motion.div>
      </div>
    </section>
  )
}

/* ---------- EXPERIENCE ---------- */
function Job({ j }) {
  return (
    <motion.article className={'job ' + j.color} initial={{ opacity: 0, x: 60, rotate: 1.5 }} whileInView={{ opacity: 1, x: 0, rotate: 0 }} viewport={{ once: true, margin: '-12%' }} transition={{ duration: 1, ease }}>
      <div className="job-top"><h3>{j.role}</h3><span className="when">{j.when}</span></div>
      <p className="where">{j.where}</p>
      <ul>{j.points.map((p, i) => <li key={i}>{p.map((s, k) => (k % 2 ? <b key={k}>{s}</b> : <span key={k}>{s}</span>))}</li>)}</ul>
      <div className="job-foot"><span className="award">★ {j.award}</span><div className="chips">{j.tags.map(t => <span key={t} className="chip">{t}</span>)}</div></div>
    </motion.article>
  )
}
function Experience() {
  return (
    <section id="experience" className="experience">
      <div className="wrap">
        <Heading kicker="Experience">Where I've <span className="hl">shipped.</span></Heading>
        <div className="timeline"><div className="tl-line" aria-hidden="true"><i className="tl-fill" /></div>{jobs.map(j => <Job key={j.role} j={j} />)}</div>
      </div>
    </section>
  )
}

/* ---------- PROJECTS ---------- */
function Pick({ options, active, id }) {
  return (
    <div className="pick" role="list">
      {options.map((o, i) => (
        <span key={o} role="listitem" className={i === active ? 'on' : ''}>
          {i === active && <motion.i layoutId={id} className="pick-bg" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
          <em>{o}</em>
        </span>
      ))}
    </div>
  )
}
function AmlProject() {
  const [d, setD] = useState(1), [step, setStep] = useState(0)
  useEffect(() => { const t = setInterval(() => setStep(store.amlStep), 150); return () => clearInterval(t) }, [])
  useEffect(() => { if (store.reduced) return; const t = setInterval(() => setD(Math.floor(Math.random() * 3)), 2600); return () => clearInterval(t) }, [])
  return (
    <article className="feature">
      <motion.div className="f-copy" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-10%' }}>
        <motion.span variants={up} className="badge">Main project 01</motion.span>
        <motion.h3 variants={up}>AI Agents for Anti-Money Laundering (AML) Alert Review</motion.h3>
        <motion.p variants={up}>Banks get flooded with money laundering alerts, and analysts check each one by hand. Most tools only give an alert a score. This one actually looks into it.</motion.p>
        <motion.ul variants={up}>
          <li>A team of AI agents in LangGraph looks into each alert the way a bank analyst would.</li>
          <li>Five agents each have one job: spot risk signs, find customer (KYC) and policy records with RAG, check transactions, combine findings and explain the result.</li>
          <li>Every alert gets a short risk report and a suggestion. A human analyst always makes the final call.</li>
        </motion.ul>
        <motion.div variants={up}><Pick options={['Close', 'Review', 'Escalate']} active={d} id="aml" /></motion.div>
        <motion.div variants={up} className="chips">{['LangGraph', 'LLMs', 'RAG', 'FastAPI', 'Python'].map(t => <span key={t} className="chip">{t}</span>)}</motion.div>
      </motion.div>
      <div className="f-3d-wrap">
        <View className="f-3d"><AmlScene /></View>
        <ol className="steps" aria-label="How an alert moves through the agents">
          {amlNodes.map((n, i) => <li key={n.name} className={i === step ? 'on' : ''}><b>{n.name}</b><span>{n.sub}</span></li>)}
        </ol>
      </div>
    </article>
  )
}
function QProject() {
  const states = [[0.15, 'Low', 0], [0.45, 'Medium', 1], [0.7, 'High', 2], [0.95, 'Very high', 3]]
  const [qi, setQi] = useState(1)
  useEffect(() => { store.qNoise = states[qi][0] }, [qi])
  useEffect(() => { if (store.reduced) return; const t = setInterval(() => setQi(i => (i + 1) % 4), 2600); return () => clearInterval(t) }, [])
  return (
    <article className="feature flip">
      <View className="f-3d"><QuantumScene /></View>
      <motion.div className="f-copy" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-10%' }}>
        <motion.span variants={up} className="badge">Main project 02</motion.span>
        <motion.h3 variants={up}>Q-TRACE: Lower-Cost Quantum Error Mitigation for Fraud Detection</motion.h3>
        <motion.p variants={up}>Quantum computers are noisy. Fixing that noise works, but every fix costs extra runs on the machine. Q-TRACE decides when the fix is actually worth paying for.</motion.p>
        <motion.ul variants={up}>
          <li>Built for a 4-qubit quantum classifier that spots credit-card fraud (ULB dataset).</li>
          <li>Quick test circuits measure the noise without needing fraud labels, then the tool picks a fix.</li>
          <li>Tested with a pre-planned study on held-back data, so the results are honest.</li>
        </motion.ul>
        <motion.div variants={up} className="noise">Measured noise: <b>{states[qi][1]}</b><div className="meter"><motion.i animate={{ width: states[qi][0] * 100 + '%' }} transition={{ duration: 0.7, ease }} /></div></motion.div>
        <motion.div variants={up}><Pick options={['No fix', 'Readout', 'ZNE', 'Both']} active={states[qi][2]} id="q" /></motion.div>
        <motion.div variants={up} className="mini"><div><b>0.03%</b><span>from the best possible Brier score</span></div><div><b>0.6%</b><span>more shots used</span></div></motion.div>
        <motion.div variants={up} className="chips">{['Qiskit', 'Quantum ML', 'Python'].map(t => <span key={t} className="chip">{t}</span>)}</motion.div>
      </motion.div>
    </article>
  )
}
function SideCard({ p }) {
  const ref = useTilt()
  return (
    <motion.article ref={ref} data-tilt-card className={'side ' + p.color} variants={up}>
      <div className="side-in"><span className="side-k">{p.kicker}</span><h3>{p.title}</h3><p>{p.text}</p><div className="big">{p.big}<small>{p.bigLabel}</small></div><div className="chips">{p.tags.map(t => <span key={t} className="chip">{t}</span>)}</div></div>
    </motion.article>
  )
}
function Projects() {
  return (
    <section id="projects" className="projects">
      <span className="ghost-word light" data-scroll data-scroll-speed="0.5" aria-hidden="true">BUILT</span>
      <div className="wrap">
        <Heading kicker="Projects" light>Things I've <span className="hl2">built.</span></Heading>
        <AmlProject />
        <QProject />
        <motion.div className="sides" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-10%' }}>{sideProjects.map(p => <SideCard key={p.title} p={p} />)}</motion.div>
      </div>
    </section>
  )
}

/* ---------- SKILLS: horizontal scroll on desktop (GSAP pin) ---------- */
function Skills() {
  return (
    <section id="skills" className="skills">
      <div className="wrap"><Heading kicker="Skills">What I <span className="hl">work with.</span></Heading></div>
      <div className="h-wrap"><div className="h-track">
        {skills.map((s, i) => (
          <motion.div key={s.title} className={'skill ' + s.color} whileHover={{ y: -10, rotate: i % 2 ? 1.5 : -1.5 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}>
            <span className="num">0{i + 1}</span><h3>{s.title}</h3><div className="chips">{s.items.map(t => <span key={t} className="chip">{t}</span>)}</div>
          </motion.div>
        ))}
      </div></div>
    </section>
  )
}

/* ---------- EDUCATION ---------- */
function Edu({ e }) {
  const ref = useTilt({ max: 8 })
  return (
    <motion.article ref={ref} data-tilt-card className="edu" variants={up}>
      <span className="when">{e.when}</span><h3>{e.degree}</h3><p>{e.school}</p>{e.extra && <p className="extra">{e.extra}</p>}<div className="gpa">{e.gpa}<small>GPA</small></div>
    </motion.article>
  )
}
function Education() {
  return (
    <section id="education" className="education">
      <div className="wrap">
        <Heading kicker="Education">Always <span className="hl">learning.</span></Heading>
        <motion.div className="edus" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-10%' }}>{education.map(e => <Edu key={e.degree} e={e} />)}</motion.div>
      </div>
    </section>
  )
}

/* ---------- CONTACT ---------- */
function Contact() {
  return (
    <section id="contact" className="contact">
      <View className="contact-3d"><ContactScene /></View>
      <div className="wrap contact-in">
        <Heading kicker="Contact">Let's build <span className="hl">something.</span></Heading>
        <motion.p className="lead" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease }}>I'm looking for AI Engineer roles. If you're hiring or just want to talk about AI agents, send me a message.</motion.p>
        <motion.div className="cta" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease, delay: 0.1 }}>
          <Magnetic className="pill orange big" href={'mailto:' + links.email}>{links.email}</Magnetic>
          <Magnetic className="pill ghost" href={links.linkedin} target="_blank" rel="noopener">LinkedIn</Magnetic>
          <Magnetic className="pill ghost" href={links.github} target="_blank" rel="noopener">GitHub</Magnetic>
        </motion.div>
      </div>
      <footer><span>© 2026 Tushar Poonia</span><span>Built with React Three Fiber, GSAP, Motion and Locomotive Scroll</span></footer>
    </section>
  )
}

/* ---------- APP: smooth scroll + scroll-driven timelines ---------- */
export default function App() {
  const reduced = useReducedMotion()
  useEffect(() => {
    store.reduced = !!reduced
    if (!reduced) loco = new LocomotiveScroll({ lenisOptions: { lerp: 0.09, smoothWheel: true }, scrollCallback: () => ScrollTrigger.update() })
    const ctx = gsap.context(() => {
      ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', onUpdate: s => (store.hero = s.progress) })
      gsap.to('.hero-copy', { y: -120, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 15%', scrub: true } })
      gsap.fromTo('.tl-fill', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 60%', scrub: true } })
      gsap.fromTo('.projects', { borderRadius: '0px' }, { borderRadius: '48px', ease: 'none', scrollTrigger: { trigger: '.projects', start: 'bottom bottom', end: 'bottom top', scrub: true } })
      const mm = gsap.matchMedia()
      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        const track = document.querySelector('.h-track')
        const dist = () => track.scrollWidth - window.innerWidth + 80
        gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.h-wrap', start: 'center center', end: () => '+=' + dist(), pin: '.skills', scrub: 1, invalidateOnRefresh: true } })
      })
    })
    const r = () => ScrollTrigger.refresh()
    window.addEventListener('load', r)
    return () => { ctx.revert(); loco && loco.destroy(); loco = null; window.removeEventListener('load', r) }
  }, [reduced])

  return (
    <>
      <BackgroundCanvas />
      <a className="skip" href="#about">Skip to content</a>
      {fine && !reduced && <Cursor />}
      <Nav />
      <main>
        <Hero />
        <Marquee words={['AI Agents', 'RAG', 'LangGraph', 'ML Pipelines', 'Quantum ML', 'FastAPI', 'PyTorch', 'Kafka']} />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Marquee dark words={['Open to AI Engineer roles', 'Based in New York', 'Ships to production']} />
        <Education />
        <Contact />
      </main>
      <GlobalCanvas />
    </>
  )
}
