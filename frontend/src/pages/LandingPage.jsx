import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Calendar,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Sparkles,
  Smartphone
} from 'lucide-react'

/* ─── Canvas wallpaper hook ─────────────────────────────────────────────── */
function useCanvasWallpaper() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationId
    let width = 0
    let height = 0

    const config = { count: 70, maxDistance: 110, speed: 0.18 }
    const particles = []
    const rand = (min, max) => Math.random() * (max - min) + min

    const resize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    const createParticle = () => ({
      x: rand(0, width),
      y: rand(0, height),
      vx: rand(-config.speed, config.speed),
      vy: rand(-config.speed, config.speed),
      radius: rand(1, 2),
      alpha: rand(0.18, 0.5),
      pulse: rand(0, Math.PI * 2),
      pulseSpeed: rand(0.01, 0.025)
    })

    const init = () => {
      particles.length = 0
      for (let i = 0; i < config.count; i++) particles.push(createParticle())
    }

    const drawBackground = () => {
      ctx.clearRect(0, 0, width, height)
      const bg = ctx.createLinearGradient(0, 0, 0, height)
      bg.addColorStop(0, '#000000')
      bg.addColorStop(1, '#050505')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, width, height)

      const glow1 = ctx.createRadialGradient(width * 0.22, height * 0.18, 0, width * 0.22, height * 0.18, width * 0.28)
      glow1.addColorStop(0, 'rgba(34,211,238,0.08)')
      glow1.addColorStop(1, 'rgba(34,211,238,0)')
      ctx.fillStyle = glow1
      ctx.fillRect(0, 0, width, height)

      const glow2 = ctx.createRadialGradient(width * 0.82, height * 0.78, 0, width * 0.82, height * 0.78, width * 0.24)
      glow2.addColorStop(0, 'rgba(255,255,255,0.04)')
      glow2.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = glow2
      ctx.fillRect(0, 0, width, height)
    }

    const animate = () => {
      drawBackground()

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < config.maxDistance) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(34,211,238,${((1 - dist / config.maxDistance) * 0.08).toFixed(3)})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }

      particles.forEach((p) => {
        p.pulse += p.pulseSpeed
        const glowScale = 0.8 + Math.sin(p.pulse) * 0.35

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${p.alpha.toFixed(3)})`
        ctx.fill()

        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 6)
        glow.addColorStop(0, `rgba(34,211,238,${(p.alpha * 0.18).toFixed(3)})`)
        glow.addColorStop(1, 'rgba(34,211,238,0)')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius * 6 * glowScale, 0, Math.PI * 2)
        ctx.fill()

        p.x += p.vx
        p.y += p.vy
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10
        if (p.y < -10) p.y = height + 10
        if (p.y > height + 10) p.y = -10
      })

      animationId = requestAnimationFrame(animate)
    }

    resize()
    init()
    animate()

    const handleResize = () => { resize(); init() }
    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return canvasRef
}

/* ─── 3D Scroll Reveal hook ─────────────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible')
            entry.target.classList.remove('reveal-hidden')
          } else {
            // re-trigger when scrolling back up
            entry.target.classList.remove('reveal-visible')
            entry.target.classList.add('reveal-hidden')
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    elements.forEach((el) => {
      el.classList.add('reveal-hidden')
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])
}

/* ─── Individual reveal wrapper ─────────────────────────────────────────── */
function Reveal({ children, delay = 0, direction = 'up', className = '' }) {
  const dirMap = {
    up:    'reveal-from-up',
    down:  'reveal-from-down',
    left:  'reveal-from-left',
    right: 'reveal-from-right',
  }
  return (
    <div
      data-reveal
      className={`${dirMap[direction]} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/* ─── LandingPage ────────────────────────────────────────────────────────── */
const LandingPage = () => {
  const { isAuthenticated } = useAuth()
  const canvasRef = useCanvasWallpaper()
  useScrollReveal()

  const [stats] = useState({
    totalEvents: 150,
    totalStudents: 2500,
    completedEvents: 120,
    upcomingEvents: 30
  })

  const features = [
    {
      icon: Calendar,
      title: 'Event Management',
      description: 'Create, manage, and organize college events without juggling spreadsheets and scattered approvals.'
    },
    {
      icon: Users,
      title: 'Community Engagement',
      description: 'Bring students, faculty, clubs, and organizers into one platform with better visibility and coordination.'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Keep everyone informed with instant notifications for approvals, registrations, and schedule changes.'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Protect workflows and user data with a system built for trust, control, and consistency.'
    }
  ]

  const howItWorks = [
    {
      step: 1,
      title: 'Sign up & choose your role',
      description: 'Students, organizers, and admins get dedicated spaces and tools tailored to their responsibilities.'
    },
    {
      step: 2,
      title: 'Create or discover events',
      description: 'Organizers publish events while students browse experiences that match their interests.'
    },
    {
      step: 3,
      title: 'Register, join, and track',
      description: 'Participants register quickly, receive updates, and organizers track what works best.'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Student Council President',
      content: 'CampusSync made our event planning smoother. Registrations, approvals, and promotion all live in one place.',
      avatar: 'SJ'
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Faculty Coordinator',
      content: 'The approval flow is simple and transparent. I can review requests quickly without losing control.',
      avatar: 'MC'
    },
    {
      name: 'Alex Rivera',
      role: 'Event Organizer',
      content: 'Managing registrations and understanding attendance patterns has never been this easy.',
      avatar: 'AR'
    }
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* CSS for 3D scroll reveal */}
      <style>{`
        .reveal-hidden {
          opacity: 0;
          transition: opacity 0.75s cubic-bezier(0.16,1,0.3,1),
                      transform 0.75s cubic-bezier(0.16,1,0.3,1);
        }
        .reveal-from-up.reveal-hidden    { transform: perspective(800px) rotateX(18deg) translateY(48px) scale(0.97); }
        .reveal-from-down.reveal-hidden  { transform: perspective(800px) rotateX(-18deg) translateY(-48px) scale(0.97); }
        .reveal-from-left.reveal-hidden  { transform: perspective(800px) rotateY(-18deg) translateX(-48px) scale(0.97); }
        .reveal-from-right.reveal-hidden { transform: perspective(800px) rotateY(18deg) translateX(48px) scale(0.97); }
        .reveal-visible {
          opacity: 1;
          transform: perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px) translateX(0px) scale(1);
          transition: opacity 0.75s cubic-bezier(0.16,1,0.3,1),
                      transform 0.75s cubic-bezier(0.16,1,0.3,1);
        }
      `}</style>

      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
        <div className="absolute top-[-120px] left-[-120px] h-[360px] w-[360px] rounded-full bg-cyan-400/18 blur-[120px]" />
        <div className="absolute top-[18%] right-[-100px] h-[320px] w-[320px] rounded-full bg-blue-500/16 blur-[110px]" />
        <div className="absolute bottom-[12%] left-[8%] h-[280px] w-[280px] rounded-full bg-fuchsia-500/12 blur-[120px]" />
        <div className="absolute bottom-[-120px] right-[10%] h-[340px] w-[340px] rounded-full bg-cyan-300/12 blur-[130px]" />
        <div className="absolute left-1/2 top-1/3 h-[260px] w-[260px] -translate-x-1/2 rounded-full bg-sky-400/10 blur-[100px]" />
        <div className="absolute top-[10%] left-[12%] h-[300px] w-[340px] rounded-[45%] rotate-12 bg-cyan-400/14 blur-[120px]" />
        <div className="absolute bottom-[8%] right-[12%] h-[280px] w-[360px] rounded-[40%] -rotate-12 bg-indigo-500/12 blur-[130px]" />
      </div>

      <canvas ref={canvasRef} className="fixed inset-0 -z-10 h-full w-full" />

      <main>
        {/* ── HERO ── */}
        <section
          id="home"
          className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pt-16"
        >
          <Reveal direction="up">
            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-16 -left-10 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
              </div>

              <div className="grid items-center gap-10 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-2 lg:px-14 lg:py-16">
                <div className="max-w-xl">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.25em] text-cyan-200 transition duration-300 hover:border-cyan-300 hover:bg-cyan-400/15">
                    <Sparkles className="h-3.5 w-3.5" />
                    Smart campus events
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[0.95] tracking-tight text-white">
                    CampusSync
                    <span className="mt-3 block text-lg sm:text-xl lg:text-2xl font-medium text-cyan-300">
                      Your smart event platform for college life
                    </span>
                  </h1>

                  <p className="mt-6 max-w-md text-sm sm:text-base leading-7 text-white/60">
                    Manage approvals, registrations, notices, gallery updates, and student
                    participation from one modern platform built for campuses.
                  </p>

                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    {isAuthenticated ? (
                      <Link
                        to="/dashboard"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-black transition duration-300 hover:-translate-y-1 hover:bg-cyan-300 hover:shadow-[0_10px_30px_rgba(34,211,238,0.35)]"
                      >
                        Go to Dashboard <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/register"
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-black transition duration-300 hover:-translate-y-1 hover:bg-cyan-300 hover:shadow-[0_10px_30px_rgba(34,211,238,0.35)]"
                        >
                          Get Started <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                          to="/events"
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-white/10"
                        >
                          Explore Events
                        </Link>
                      </>
                    )}
                  </div>

                  <div className="mt-10 flex flex-wrap gap-6">
                    {[
                      { value: `${stats.totalEvents}+`, label: 'Events' },
                      { value: `${stats.totalStudents}+`, label: 'Students' },
                      { value: `${stats.upcomingEvents}+`, label: 'Upcoming' }
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 transition duration-300 hover:-translate-y-2 hover:scale-105 hover:border-cyan-300/40 hover:bg-white/10 hover:shadow-[0_12px_35px_rgba(34,211,238,0.12)]"
                      >
                        <p className="text-2xl font-bold text-white">{item.value}</p>
                        <p className="text-xs uppercase tracking-[0.22em] text-white/40">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-wrap gap-4 text-xs text-slate-300">
                    {['Role-based access', 'Faster approvals', 'Better tracking'].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-white/10"
                      >
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-x-10 bottom-0 h-24 rounded-[999px] bg-white/5 blur-2xl" />
                  <div className="relative w-full max-w-xl transition duration-500 hover:scale-[1.02]">
                    <div className="absolute top-10 right-6 h-56 w-56 rounded-[45%] bg-cyan-300/12 blur-sm" />
                    <div className="absolute top-20 left-12 h-44 w-44 rounded-[42%] border border-white/10 bg-indigo-400/10" />
                    <div className="absolute top-6 left-20 right-12 bottom-16 rounded-[42%] border border-cyan-300/15 bg-gradient-to-br from-cyan-400/10 via-slate-700/40 to-indigo-500/10" />

                    <div className="relative z-10 flex min-h-[420px] items-center justify-center">
                      <div className="relative">
                        <div className="mx-auto h-[260px] w-[140px] rounded-[30px] border border-white/15 bg-neutral-900 shadow-[0_15px_50px_rgba(0,0,0,0.45)] transition duration-500 hover:-translate-y-2 hover:rotate-1 hover:shadow-[0_20px_60px_rgba(34,211,238,0.15)]">
                          <div className="px-3 pt-3">
                            <div className="mb-3 h-2 w-10 rounded-full bg-white/20" />
                            <div className="rounded-2xl bg-gradient-to-br from-fuchsia-400 to-cyan-400 p-3">
                              <div className="h-16 rounded-xl bg-white/80" />
                            </div>
                          </div>
                          <div className="px-4 pt-4 space-y-3">
                            <div className="rounded-xl border border-white/10 bg-white/5 p-3 transition duration-300 hover:bg-white/10">
                              <Users className="mb-2 h-4 w-4 text-cyan-300" />
                              <div className="h-2 w-16 rounded bg-white/20" />
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/5 p-3 transition duration-300 hover:bg-white/10">
                              <Calendar className="mb-2 h-4 w-4 text-cyan-300" />
                              <div className="h-2 w-20 rounded bg-white/20" />
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/5 p-3 transition duration-300 hover:bg-white/10">
                              <Smartphone className="mb-2 h-4 w-4 text-cyan-300" />
                              <div className="h-2 w-14 rounded bg-white/20" />
                            </div>
                          </div>
                        </div>

                        <div className="absolute -left-16 bottom-6 rounded-2xl border border-white/10 bg-[#181818] px-4 py-3 shadow-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-[#202020]">
                          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Clubs</p>
                          <p className="mt-1 text-lg font-bold text-white">50+</p>
                        </div>

                        <div className="absolute -right-14 top-10 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 shadow-xl transition duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-cyan-400/15">
                          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">Live</p>
                          <p className="mt-1 text-lg font-bold text-white">RSVP Open</p>
                        </div>
                      </div>
                    </div>

                    <div className="absolute left-10 bottom-2 h-16 w-16 rounded-full bg-white/6" />
                    <div className="absolute left-28 bottom-8 h-8 w-8 rounded-full bg-white/6" />
                    <div className="absolute left-44 bottom-0 h-10 w-10 rounded-full bg-white/6" />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── STATS ── */}
        <section id="about" className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {[
                { label: 'Total Events', value: `${stats.totalEvents}+` },
                { label: 'Active Students', value: `${stats.totalStudents}+` },
                { label: 'Completed Events', value: `${stats.completedEvents}+` },
                { label: 'Upcoming Events', value: `${stats.upcomingEvents}+` }
              ].map((item, idx) => (
                <Reveal key={idx} direction="up" delay={idx * 80}>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-left backdrop-blur-sm transition duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-cyan-300/40 hover:bg-white/10 hover:shadow-[0_14px_40px_rgba(34,211,238,0.12)]">
                    <p className="mb-1 text-xs uppercase tracking-[0.2em] text-white/40">{item.label}</p>
                    <p className="text-2xl lg:text-3xl font-semibold text-white">{item.value}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="services" className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal direction="up">
              <div className="max-w-3xl mb-12">
                <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-200">
                  Why CampusSync
                </span>
                <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  Built for modern campus operations
                </h2>
                <p className="mt-4 text-base text-white/60 max-w-2xl">
                  Instead of a generic portal, give your institution an organized way to plan,
                  approve, and host events with complete visibility.
                </p>
              </div>
            </Reveal>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Reveal key={index} direction={index % 2 === 0 ? 'left' : 'right'} delay={index * 100}>
                  <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-cyan-300/40 hover:bg-white/10 hover:shadow-[0_14px_40px_rgba(34,211,238,0.12)]">
                    <feature.icon className="h-6 w-6 text-cyan-300" />
                    <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-white/60">{feature.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal direction="up">
              <div className="max-w-3xl mb-12">
                <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-200">
                  How it works
                </span>
                <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  Simple flow, better coordination
                </h2>
              </div>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-6">
              {howItWorks.map((item, index) => (
                <Reveal key={item.step} direction="up" delay={index * 120}>
                  <div className="rounded-[28px] border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-cyan-300/40 hover:bg-white/10 hover:shadow-[0_14px_40px_rgba(34,211,238,0.12)]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-cyan-200 font-semibold transition duration-300 hover:scale-110">
                      {item.step}
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/60">{item.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal direction="up">
              <div className="max-w-3xl mb-12">
                <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-200">
                  What teams say
                </span>
                <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  Trusted around the campus
                </h2>
              </div>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Reveal key={index} direction={index === 1 ? 'up' : index === 0 ? 'left' : 'right'} delay={index * 100}>
                  <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-cyan-300/40 hover:bg-white/10 hover:shadow-[0_14px_40px_rgba(34,211,238,0.12)]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm font-semibold text-white transition duration-300 hover:scale-110 hover:bg-cyan-400/15">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                        <p className="text-xs text-white/40">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="mt-5 text-sm leading-7 text-white/70 italic">"{testimonial.content}"</p>
                    <div className="mt-4 flex gap-1 text-cyan-300">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current transition duration-300 hover:scale-125" />
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section id="contact" className="py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Reveal direction="up">
              <div className="rounded-[34px] border border-cyan-400/15 bg-gradient-to-br from-cyan-400/10 via-white/5 to-white/0 px-6 py-14 text-center backdrop-blur-xl transition duration-300 hover:border-cyan-300/30 hover:shadow-[0_18px_50px_rgba(34,211,238,0.12)]">
                <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white/70">
                  Start now
                </span>
                <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                  Ready to launch better campus events?
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-base text-white/65">
                  Bring planning, approvals, registrations, and participation into one elegant
                  platform designed for your college.
                </p>

                {!isAuthenticated && (
                  <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-black transition duration-300 hover:-translate-y-1 hover:bg-cyan-300 hover:shadow-[0_10px_30px_rgba(34,211,238,0.35)]"
                    >
                      Get Started Free <ArrowRight className="h-5 w-5" />
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-white/10"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </div>
  )
}

export default LandingPage
