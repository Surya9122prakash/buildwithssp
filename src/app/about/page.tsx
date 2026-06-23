"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
import { ParticleImage, ParticleImageRef } from "../ParticleImage";
import {
  Atom,
  Cpu,
  Braces,
  Server,
  Palette,
  FileCode,
  GitBranch,
  Database,
  ExternalLink,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  XCircle,
  Shield,
  Zap,
  Search,
  PenTool,
  Rocket,
  CheckCircle,
  Lightbulb,
  Users,
  BarChart3,
  Clock,
  DollarSign,
  Target,
  MonitorSmartphone,
  LayoutDashboard,
  Cloud,
  Code,
  Loader2
} from "lucide-react";

// Custom SVG components for brand icons missing in local registry package
interface CustomIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

const Github = ({ size = 20, ...props }: CustomIconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = ({ size = 20, ...props }: CustomIconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// 8 primary orbiting tech stack badges
const techStacks = [
  { name: "React", icon: Atom, color: "#00d8ff" },
  { name: "Next.js", icon: Cpu, color: "#ffffff" },
  { name: "Vue.js", icon: Palette, color: "#41b883" },
  { name: "TypeScript", icon: Braces, color: "#3178c6" },
  { name: "Node.js", icon: Server, color: "#339933" },
  { name: "AWS", icon: Cpu, color: "#ff9900" },
  { name: "Socket.io", icon: GitBranch, color: "#ffffff" },
  { name: "MongoDB", icon: Database, color: "#47a248" },
];

// Technical Skills Categories
const skillCategories = [
  {
    title: "Languages",
    skills: ["JavaScript", "TypeScript"]
  },
  {
    title: "Frontend",
    skills: ["React.js", "Next.js", "Vue.js", "Nuxt.js", "HTML/CSS", "Single-SPA", "Micro-frontends"]
  },
  {
    title: "Backend & APIS",
    skills: ["Node.js", "Express.js", "FastAPI", "REST APIs", "Socket.io"]
  },
  {
    title: "Databases",
    skills: ["MongoDB", "SQL"]
  },
  {
    title: "Cloud & DevOps",
    skills: ["AWS EC2", "AWS S3", "AWS Lambda", "AWS API Gateway"]
  }
];

interface TimelineItem {
  id: string;
  type: "Work Experience" | "Featured Project";
  title: string;
  subtitle?: string | null;
  period: string;
  details: string[];
  tags: string[];
  image: string;
  link: string;
  order: number;
}

// Academic History
const educationList = [
  {
    degree: "Bachelor of Engineering",
    subject: "Computer Science and Engineering",
    school: "Kumaraguru College of Technology, Coimbatore",
    period: "2020 - 2024",
    score: "84.3% CGPA"
  },
  {
    degree: "12th Grade (HSC)",
    subject: "Computer Science & Mathematics",
    school: "SSM Lakshmi Ammal Matriculation Higher Secondary School",
    period: "2019 - 2020",
    score: "69.83%"
  },
  {
    degree: "10th Grade (SSLC)",
    subject: "General Studies",
    school: "SSM Lakshmi Ammal Matriculation Higher Secondary School",
    period: "2017 - 2018",
    score: "83.80%"
  }
];

export default function About() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const imageGlowRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement[]>([]);
  const particleImageRef = useRef<ParticleImageRef>(null);

  const timelineSectionRef = useRef<HTMLDivElement>(null);
  const timelineProgressRef = useRef<HTMLDivElement>(null);
  const timelineItemsRef = useRef<HTMLDivElement[]>([]);

  // Section Refs for Smooth Scrolling
  const servicesRef = useRef<HTMLElement>(null);
  const skillsRef = useRef<HTMLElement>(null);
  const experienceRef = useRef<HTMLElement>(null);
  const educationRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);

  // Dynamic database timeline data
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTimeline() {
      try {
        const res = await fetch("/api/timeline");
        if (res.ok) {
          const data = await res.json();
          setTimelineItems(data);
        }
      } catch (err) {
        console.error("Failed to load timeline items", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTimeline();
  }, []);

  // 1. STICKY HERO SCROLL TIMELINE (SECTION 1 + 2)
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add({
      isDesktop: "(min-width: 769px)",
      isMobile: "(max-width: 768px)"
    }, (context) => {
      const { isMobile } = context.conditions as { isMobile: boolean, isDesktop: boolean };

      const xOffset = isMobile ? 0 : () => -(Math.min(1280, window.innerWidth) / 4);
      const yOffset = isMobile ? "-50vh" : 0;

      const mainTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=180%",
          scrub: 1.5,
          pin: true,
          invalidateOnRefresh: true,
        }
      });

      // Phase 1: Left content fades out & slides left; Image centers & scales up
      mainTimeline.to(leftColRef.current, {
        opacity: 0,
        x: -120,
        duration: 1.5,
        ease: "power2.inOut"
      });

      mainTimeline.to(imageWrapperRef.current, {
        x: xOffset,
        y: yOffset,
        scale: isMobile ? 1.15 : 1.35,
        duration: 1.8,
        ease: "power2.inOut"
      }, "<");

      mainTimeline.to(imageGlowRef.current, {
        x: xOffset,
        y: yOffset,
        scale: isMobile ? 1.15 : 1.35,
        duration: 1.8,
        ease: "power2.inOut"
      }, "<");

      // Object to track particle dispersion progress
      const particleAnim = { progress: 0 };

      // Scatter particles fully as image moves out of initial position (max progress = 1.0 for a clear explosion effect)
      mainTimeline.to(particleAnim, {
        progress: 1.0,
        duration: 0.9,
        ease: "power2.inOut",
        onUpdate: () => {
          particleImageRef.current?.setProgress(particleAnim.progress);
        }
      }, "<");

      // Reassemble particles as image settles in the center
      mainTimeline.to(particleAnim, {
        progress: 0,
        duration: 0.9,
        ease: "power2.inOut",
        onUpdate: () => {
          particleImageRef.current?.setProgress(particleAnim.progress);
        }
      }, "<+=0.9");

      // Phase 2: Tech stack icons fly out from behind the image to form the orbit ring
      const radius = isMobile ? 110 : 190;
      const numBadges = techStacks.length;

      badgesRef.current.forEach((badge, index) => {
        if (!badge) return;

        const angle = (index * (360 / numBadges)) * (Math.PI / 180);
        const targetX = Math.cos(angle) * radius;
        const targetY = Math.sin(angle) * radius;

        mainTimeline.fromTo(badge,
          {
            opacity: 0,
            scale: 0,
            x: 0,
            y: 0,
            xPercent: -50,
            yPercent: -50,
          },
          {
            opacity: 1,
            scale: 1,
            x: targetX,
            y: targetY,
            duration: 1.2,
            ease: "back.out(1.4)"
          },
          `-=${index === 0 ? 0 : 0.8}`
        );
      });

      mainTimeline.to({}, { duration: 1.5 });
    });

    return () => mm.revert();
  }, []);

  // 2. TIMELINE ROW ANIMATIONS
  useEffect(() => {
    if (loading || timelineItems.length === 0) return;

    const mm = gsap.matchMedia();

    mm.add({
      isDesktop: "(min-width: 769px)",
      isMobile: "(max-width: 768px)"
    }, (context) => {
      const { isMobile } = context.conditions as { isMobile: boolean, isDesktop: boolean };

      gsap.fromTo(timelineProgressRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: timelineSectionRef.current,
            start: "top 30%",
            end: "bottom 90%",
            scrub: true,
          }
        }
      );

      timelineItemsRef.current.forEach((item) => {
        if (!item) return;

        const leftSide = item.querySelector(".timeline-left-anim");
        const rightSide = item.querySelector(".timeline-right-anim");
        const dot = item.querySelector(".timeline-dot");

        const rowTl = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            end: "top 50%",
            scrub: 1,
          }
        });

        const slideOffset = isMobile ? 0 : 100;
        const yOffsetVal = isMobile ? 60 : 0;

        if (leftSide) {
          rowTl.fromTo(leftSide,
            { opacity: 0, x: -slideOffset, y: yOffsetVal },
            { opacity: 1, x: 0, y: 0, ease: "power2.out" }
          );
        }

        if (rightSide) {
          rowTl.fromTo(rightSide,
            { opacity: 0, x: slideOffset, y: yOffsetVal },
            { opacity: 1, x: 0, y: 0, ease: "power2.out" },
            "<"
          );
        }

        if (dot) {
          rowTl.fromTo(dot,
            { scale: 0, boxShadow: "0 0 0px var(--primary)" },
            { scale: 1, boxShadow: "0 0 20px var(--primary)", ease: "back.out(2)" },
            "<"
          );
        }
      });
    });

    return () => mm.revert();
  }, [loading, timelineItems]);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetRef: React.RefObject<HTMLElement | null> | null) => {
    e.preventDefault();
    setIsMenuOpen(false);

    if (targetRef && targetRef.current) {
      const offset = 80; // Navbar height offset
      gsap.to(window, {
        duration: 1,
        scrollTo: { y: targetRef.current, offsetY: offset },
        ease: "power3.inOut"
      });
    } else {
      // Top scroll fallback
      gsap.to(window, {
        duration: 1,
        scrollTo: { y: 0 },
        ease: "power3.inOut"
      });
    }
  };

  return (
    <>
      {/* Background canvas elements */}
      <div className="bg-canvas" />
      <div className="bg-grid" />

      {/* Sticky frosted glass navbar */}
      <header className="navbar">
        <div className="navbar-container">
          <a href="/" className="navbar-logo text-gradient">
            BUILDWITHSSP
          </a>

          <nav className="nav-desktop">
            <a href="/" style={{ color: "var(--primary)" }}>Dashboard</a>
            <a href="#" onClick={(e) => handleSmoothScroll(e, null)}>About</a>
            <a href="#" onClick={(e) => handleSmoothScroll(e, servicesRef)}>Services</a>
            <a href="#" onClick={(e) => handleSmoothScroll(e, skillsRef)}>Skills</a>
            <a href="#" onClick={(e) => handleSmoothScroll(e, timelineSectionRef)}>Experience & Projects</a>
            <a href="#" onClick={(e) => handleSmoothScroll(e, educationRef)}>Education</a>
            <a href="#" className="nav-contact-btn" onClick={(e) => handleSmoothScroll(e, contactRef)}>Get In Touch</a>
          </nav>

          <button
            className={`nav-toggle ${isMenuOpen ? "active" : ""}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Navigation"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        <nav className={`nav-mobile ${isMenuOpen ? "open" : ""}`}>
          <a href="/">Dashboard</a>
          <a href="#" onClick={(e) => handleSmoothScroll(e, null)}>About</a>
          <a href="#" onClick={(e) => handleSmoothScroll(e, servicesRef)}>Services</a>
          <a href="#" onClick={(e) => handleSmoothScroll(e, skillsRef)}>Skills</a>
          <a href="#" onClick={(e) => handleSmoothScroll(e, timelineSectionRef)}>Experience & Projects</a>
          <a href="#" onClick={(e) => handleSmoothScroll(e, educationRef)}>Education</a>
          <a href="#" className="nav-contact-btn" onClick={(e) => handleSmoothScroll(e, contactRef)}>Get In Touch</a>
        </nav>
      </header>

      {/* Hero Section Container */}
      <div ref={containerRef} className="scroll-container" style={{ paddingTop: "70px" }}>
        <div className="sticky-wrapper">
          <div className="split-layout">

            {/* Left Column: Title and About Details */}
            <div ref={leftColRef} className="left-col">
              <span className="text-gradient" style={{ fontWeight: 700, letterSpacing: "1.5px", fontSize: "0.95rem", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                Full Stack Engineer
              </span>
              <h1 className="text-glow" style={{ fontSize: "3.5rem", fontWeight: 800, lineHeight: 1.1, marginBottom: "1.25rem" }}>
                Surya Prakash <span className="text-gradient">S</span>
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "1.02rem", lineHeight: 1.6, marginBottom: "2rem" }}>
                Experienced Full Stack Engineer specializing in scalable web applications, real-time systems, and enterprise scheduling platforms. Expertise in performance optimization, modular architecture, and delivering production-grade solutions that enable high concurrency, reusable systems, and global time-zone-aware workflows.
              </p>

              {/* Contact Information Pills */}
              <div className="contact-pills">
                <a href="mailto:sspsurya2002@gmail.com" className="contact-pill">
                  <Mail size={14} />
                  sspsurya2002@gmail.com
                </a>
                <a href="tel:+916383513214" className="contact-pill">
                  <Phone size={14} />
                  +91 63835 13214
                </a>
                <span className="contact-pill">
                  <MapPin size={14} />
                  Coimbatore, India
                </span>
              </div>

              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <a href="#" onClick={(e) => handleSmoothScroll(e, timelineSectionRef)} className="glass-panel" style={{ padding: "0.8rem 1.8rem", borderRadius: "30px", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem", border: "1px solid rgba(99, 102, 241, 0.3)", color: "white", textDecoration: "none" }}>
                  View Work
                  <ChevronDown size={18} />
                </a>

                <div style={{ display: "flex", gap: "0.8rem" }}>
                  <a href="https://github.com/surya9122prakash" target="_blank" rel="noopener noreferrer" className="glass-panel" style={{ width: "45px", height: "45px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                    <Github size={20} />
                  </a>
                  <a href="https://www.linkedin.com/in/surya-prakash-s-740a3222a/" target="_blank" rel="noopener noreferrer" className="glass-panel" style={{ width: "45px", height: "45px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                    <Linkedin size={20} />
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Profile Image + Tech Orbit container */}
            <div className="right-col">
              <div ref={imageGlowRef} className="image-glow-ring" />

              <div ref={imageWrapperRef} className="image-wrapper">
                <div className="image-inner" />
                <ParticleImage
                  ref={particleImageRef}
                  src="/images/profile.jfif"
                  className="profile-img"
                />

                <div className="tech-orbit-container">
                  {techStacks.map((tech, i) => {
                    const IconComponent = tech.icon;
                    return (
                      <div
                        key={tech.name}
                        ref={(el) => {
                          if (el) badgesRef.current[i] = el;
                        }}
                        className="orbit-badge glass-panel"
                        style={{
                          left: "50%",
                          top: "50%",
                          border: `1px solid ${tech.color}33`,
                          boxShadow: `0 4px 15px -3px ${tech.color}11`,
                        }}
                      >
                        <IconComponent size={16} style={{ color: tech.color }} />
                        <span style={{ color: "white" }}>{tech.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* NEW SECTION: The Problem & Solution */}
      <section id="problem" className="problem-section">
        <h2 className="section-title text-gradient" style={{ textAlign: "center", marginBottom: "1rem" }}>
          Your Business Deserves <br /> More Than Just A Website
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "4rem", fontSize: "1.1rem" }}>
          Most websites look good, but fail to solve real business problems.
        </p>

        <div className="problem-grid">
          {/* Left: Pain Points */}
          <div className="pain-points-list">
            {[
              { title: "Slow Loading Speed", desc: "Visitors leave before your site loads." },
              { title: "Not Mobile Optimized", desc: "You're losing 60%+ of potential customers." },
              { title: "Manual & Repetitive Work", desc: "Wasting time on tasks that can be automated." },
              { title: "Low Conversions", desc: "Poor UX and performance kill your growth." }
            ].map((item, i) => (
              <div key={i} className="pain-point-card">
                <div className="pain-icon">
                  <XCircle size={24} />
                </div>
                <div>
                  <h4 style={{ color: "white", fontWeight: 600, marginBottom: "0.25rem" }}>{item.title}</h4>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{item.desc}</p>
                </div>
              </div>
            ))}

            <div className="pain-point-card" style={{ background: "rgba(99, 102, 241, 0.15)", borderColor: "rgba(99, 102, 241, 0.3)", marginTop: "1rem" }}>
              <div className="pain-icon" style={{ background: "var(--primary)", color: "white" }}>
                <Lightbulb size={24} />
              </div>
              <div>
                <h4 style={{ color: "white", fontWeight: 700, marginBottom: "0.25rem" }}>I build web applications that solve</h4>
                <p style={{ color: "var(--accent)", fontSize: "1rem", fontWeight: 600 }}>real business problems.</p>
              </div>
            </div>
          </div>

          {/* Right: Solution Dashboard Mockup */}
          <div className="solution-dashboard">
            <div className="dashboard-header">
              <div className="dash-dot" style={{ background: "#ef4444" }}></div>
              <div className="dash-dot" style={{ background: "#eab308" }}></div>
              <div className="dash-dot" style={{ background: "#22c55e" }}></div>
              <div style={{ marginLeft: "1rem", color: "white", fontWeight: 600, fontSize: "0.9rem" }}>Dashboard</div>
            </div>
            <div className="dashboard-body">
              <div className="dash-stat">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Total Users</span>
                  <Users size={16} color="var(--primary)" />
                </div>
                <div style={{ color: "white", fontSize: "1.5rem", fontWeight: 700 }}>12,540</div>
                <div style={{ color: "#22c55e", fontSize: "0.75rem", marginTop: "0.5rem", fontWeight: 600 }}>+ 12.5%</div>
              </div>
              <div className="dash-stat">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Revenue</span>
                  <DollarSign size={16} color="var(--accent)" />
                </div>
                <div style={{ color: "white", fontSize: "1.5rem", fontWeight: 700 }}>$45,231</div>
                <div style={{ color: "#22c55e", fontSize: "0.75rem", marginTop: "0.5rem", fontWeight: 600 }}>+ 18.7%</div>
              </div>
              <div className="dash-stat" style={{ gridColumn: "1 / -1", height: "150px", display: "flex", alignItems: "flex-end", padding: "1rem" }}>
                {/* Minimal SVG Chart representation */}
                <svg width="100%" height="80" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <path d="M0,40 L0,30 C10,20 20,35 30,15 C40,-5 50,25 60,10 C70,-5 80,15 90,5 L100,20 L100,40 Z" fill="rgba(99, 102, 241, 0.2)" />
                  <path d="M0,30 C10,20 20,35 30,15 C40,-5 50,25 60,10 C70,-5 80,15 90,5 L100,20" fill="none" stroke="var(--primary)" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW SECTION: Services */}
      <section ref={servicesRef} className="services-section">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 className="section-title text-gradient">Services I Provide</h2>
        </div>
        <div className="services-grid">
          {[
            { title: "Web Applications", icon: <MonitorSmartphone size={24} />, desc: "Modern, fast and responsive web solutions." },
            { title: "Admin Dashboards", icon: <LayoutDashboard size={24} />, desc: "Powerful dashboards to manage your business with ease." },
            { title: "SaaS Products", icon: <Cloud size={24} />, desc: "Scalable SaaS platforms that grow with your users." },
            { title: "Custom Software", icon: <Code size={24} />, desc: "Tailored solutions built specifically for your unique needs." }
          ].map((srv, i) => (
            <div key={i} className="service-card glass-panel">
              <div style={{ background: "rgba(99, 102, 241, 0.15)", padding: "1rem", borderRadius: "16px", width: "fit-content", color: "var(--primary)" }}>
                {srv.icon}
              </div>
              <h3 style={{ color: "white", fontSize: "1.2rem", fontWeight: 700 }}>{srv.title}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>{srv.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Technical Skills Grid */}
      <section ref={skillsRef} className="skills-section">
        <div className="skills-header">
          <span className="text-gradient" style={{ fontWeight: 700, letterSpacing: "1.5px", fontSize: "0.85rem", textTransform: "uppercase" }}>
            Capabilities
          </span>
          <h2 className="text-glow" style={{ fontSize: "2.5rem", fontWeight: 800, marginTop: "0.5rem" }}>
            Technical Expertise
          </h2>
        </div>

        <div className="skills-grid">
          {skillCategories.map((category) => (
            <div key={category.title} className="skills-card glass-panel">
              <h3>
                <CodeIcon categoryTitle={category.title} />
                {category.title}
              </h3>
              <div className="skills-list">
                {category.skills.map((skill) => (
                  <div key={skill} className="skill-item">
                    <span className="skill-name">{skill}</span>
                    <span className="skill-dot" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Zig-Zag Experience & Projects Timeline */}
      <section ref={timelineSectionRef} className="timeline-section">
        <div className="timeline-header">
          <span className="text-gradient" style={{ fontWeight: 700, letterSpacing: "1.5px", fontSize: "0.85rem", textTransform: "uppercase" }}>
            Journey & Projects
          </span>
          <h2 className="text-glow" style={{ fontSize: "2.5rem", fontWeight: 800, marginTop: "0.5rem" }}>
            Experience & Work
          </h2>
        </div>

        <div className="timeline-container">
          <div className="timeline-track" />
          <div ref={timelineProgressRef} className="timeline-progress" />

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "6rem 2rem", gap: "1.5rem" }}>
              <Loader2 className="spinning-loader" size={48} style={{ color: "var(--primary)" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", fontWeight: 500 }}>Loading timeline from database...</p>
            </div>
          ) : (
            timelineItems.map((item, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={item.title}
                  ref={(el) => {
                    if (el) timelineItemsRef.current[idx] = el;
                  }}
                  className="timeline-item"
                >
                  <div className="timeline-dot" />

                  {/* Left Side: alternate between illustration and text content */}
                  <div className="timeline-left">
                    {isEven ? (
                      <div className="timeline-image-container timeline-left-anim">
                        <Image
                          src={item.image}
                          alt={`${item.title} Screenshot`}
                          fill
                          sizes="(max-width: 768px) 100vw, 460px"
                          className="timeline-image"
                        />
                      </div>
                    ) : (
                      <div className="project-card glass-panel timeline-left-anim">
                        <span className="text-gradient" style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "0.25rem" }}>
                          {item.type} • {item.period}
                        </span>
                        <h3>{item.title}</h3>
                        {item.subtitle && <h4 style={{ color: "var(--primary)", fontSize: "1rem", marginTop: "-0.5rem", marginBottom: "1rem", fontWeight: 600 }}>{item.subtitle}</h4>}
                        <div className="project-tags">
                          {item.tags.map((tag) => (
                            <span key={tag} className="project-tag">{tag}</span>
                          ))}
                        </div>
                        <ul style={{ color: "var(--text-secondary)", paddingLeft: "1.2rem", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "1.5rem" }}>
                          {item.details.map((pt, i) => (
                            <li key={i} style={{ marginBottom: "0.5rem" }}>{pt}</li>
                          ))}
                        </ul>
                        {item.link !== "#" && (
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="project-link">
                            Explore Project <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Side: alternate opposite to left side */}
                  <div className="timeline-right">
                    {!isEven ? (
                      <div className="timeline-image-container timeline-right-anim">
                        <Image
                          src={item.image}
                          alt={`${item.title} Screenshot`}
                          fill
                          sizes="(max-width: 768px) 100vw, 460px"
                          className="timeline-image"
                        />
                      </div>
                    ) : (
                      <div className="project-card glass-panel timeline-right-anim">
                        <span className="text-gradient" style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "0.25rem" }}>
                          {item.type} • {item.period}
                        </span>
                        <h3>{item.title}</h3>
                        {item.subtitle && <h4 style={{ color: "var(--primary)", fontSize: "1rem", marginTop: "-0.5rem", marginBottom: "1rem", fontWeight: 600 }}>{item.subtitle}</h4>}
                        <div className="project-tags">
                          {item.tags.map((tag) => (
                            <span key={tag} className="project-tag">{tag}</span>
                          ))}
                        </div>
                        <ul style={{ color: "var(--text-secondary)", paddingLeft: "1.2rem", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "1.5rem" }}>
                          {item.details.map((pt, i) => (
                            <li key={i} style={{ marginBottom: "0.5rem" }}>{pt}</li>
                          ))}
                        </ul>
                        {item.link !== "#" && (
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="project-link">
                            Explore Project <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Section 5: Academic History */}
      <section ref={educationRef} className="education-section">
        <div className="education-header">
          <span className="text-gradient" style={{ fontWeight: 700, letterSpacing: "1.5px", fontSize: "0.85rem", textTransform: "uppercase" }}>
            Academics
          </span>
          <h2 className="text-glow" style={{ fontSize: "2.5rem", fontWeight: 800, marginTop: "0.5rem" }}>
            Education Background
          </h2>
        </div>

        <div className="education-grid">
          {educationList.map((edu, i) => (
            <div key={i} className="education-card glass-panel">
              <div className="education-meta">
                <span>{edu.period}</span>
              </div>
              <h3>{edu.degree}</h3>
              {edu.subject && <h4 style={{ color: "var(--text-secondary)", fontSize: "0.95rem", fontWeight: 500, marginTop: "-0.5rem" }}>{edu.subject}</h4>}
              <p className="education-school">{edu.school}</p>
              <div className="education-score">
                <span>Grade: {edu.score}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NEW SECTION: How I Build Products */}
      <section id="process" className="process-section">
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h2 className="section-title text-gradient">How I Build Products</h2>
          <p style={{ color: "var(--text-muted)", marginTop: "1rem", fontSize: "1.1rem" }}>A proven process to turn your idea into a scalable digital product.</p>
        </div>

        <div className="process-list">
          {[
            { num: "1", title: "DISCOVERY", icon: <Search size={24} />, desc: "Understanding your goals, target audience, and project requirements." },
            { num: "2", title: "DESIGN", icon: <PenTool size={24} />, desc: "Creating user-friendly UI/UX designs that engage and convert." },
            { num: "3", title: "DEVELOPMENT", icon: <Code size={24} />, desc: "Writing clean, efficient code and building robust features." },
            { num: "4", title: "TESTING", icon: <Shield size={24} />, desc: "Testing for performance, security, and a bug-free experience." },
            { num: "5", title: "LAUNCH", icon: <Rocket size={24} />, desc: "Deploying your product and ensuring smooth go-live." }
          ].map((step, i) => (
            <div key={i} className="process-step">
              <div className="process-number">{step.num}</div>
              <div className="process-content" style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                <div style={{ background: "rgba(99, 102, 241, 0.1)", padding: "1rem", borderRadius: "12px", color: "var(--primary)" }}>
                  {step.icon}
                </div>
                <div>
                  <h3 style={{ color: "white", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>{step.title}</h3>
                  <p style={{ color: "var(--text-muted)" }}>{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NEW SECTION: Call To Action */}
      <section className="cta-section">
        <div className="cta-box">
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, color: "white", marginBottom: "1rem", lineHeight: 1.1 }}>
              READY TO BUILD <br /> YOUR <span className="text-gradient">NEXT APP?</span>
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", maxWidth: "600px", margin: "1rem auto 3rem" }}>
              I help businesses and startups turn ideas into powerful, scalable and beautifully crafted web applications.
            </p>

            <a href="mailto:sspsurya2002@gmail.com" className="glass-panel" style={{ display: "inline-flex", alignItems: "center", gap: "1rem", padding: "1.2rem 3rem", borderRadius: "30px", background: "var(--primary)", color: "white", fontWeight: 700, textDecoration: "none", fontSize: "1.1rem", boxShadow: "0 10px 30px rgba(99, 102, 241, 0.4)", transition: "transform 0.3s ease" }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <Mail size={20} />
              DM &quot;PROJECT&quot;
            </a>

            <div className="cta-guarantees">
              <div className="guarantee-item"><CheckCircle size={18} color="var(--primary)" /> Clean Code</div>
              <div className="guarantee-item"><Clock size={18} color="var(--primary)" /> On Time Delivery</div>
              <div className="guarantee-item"><Target size={18} color="var(--primary)" /> 100% Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Contact / Footer Section */}
      <footer ref={contactRef} style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)", padding: "5rem 2rem", textAlign: "center", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: "600px", margin: "0 auto 3rem auto" }}>
          <span className="text-gradient" style={{ fontWeight: 700, letterSpacing: "1.5px", fontSize: "0.85rem", textTransform: "uppercase" }}>
            Interests
          </span>
          <p style={{ color: "var(--text-primary)", fontSize: "1.2rem", fontWeight: 600, marginTop: "0.5rem", marginBottom: "1.5rem" }}>
            Web Development | Generative AI | SAAS Development
          </p>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Currently open to new projects and full-stack engineering roles. Let&apos;s build something exceptional together.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginBottom: "3rem" }}>
          <a href="https://github.com/surya9122prakash" target="_blank" rel="noopener noreferrer" className="glass-panel" style={{ width: "50px", height: "50px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", transition: "color 0.3s ease" }}>
            <Github size={20} />
          </a>
          <a href="https://www.linkedin.com/in/surya-prakash-s-740a3222a/" target="_blank" rel="noopener noreferrer" className="glass-panel" style={{ width: "50px", height: "50px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", transition: "color 0.3s ease" }}>
            <Linkedin size={20} />
          </a>
          <a href="mailto:sspsurya2002@gmail.com" className="glass-panel" style={{ width: "50px", height: "50px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", transition: "color 0.3s ease" }}>
            <Mail size={20} />
          </a>
        </div>

        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          © {new Date().getFullYear()} Surya Prakash S. All Rights Reserved. Built with Next.js & GSAP ScrollTrigger.
        </p>
      </footer>
    </>
  );
}

// Helper component for skill category icons
function CodeIcon({ categoryTitle }: { categoryTitle: string }) {
  switch (categoryTitle.toLowerCase()) {
    case "languages":
      return <Braces size={18} style={{ color: "var(--primary)" }} />;
    case "frontend":
      return <Atom size={18} style={{ color: "var(--accent)" }} />;
    case "backend & apis":
      return <Server size={18} style={{ color: "var(--secondary)" }} />;
    case "databases":
      return <Database size={18} style={{ color: "var(--primary)" }} />;
    default:
      return <Cpu size={18} style={{ color: "var(--accent)" }} />;
  }
}
