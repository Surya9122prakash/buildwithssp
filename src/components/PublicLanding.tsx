import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, BadgeCheck, Blocks, Braces, Check,
  Code2, Compass, Globe2, LockKeyhole,
  MonitorSmartphone, MoveUpRight, Rocket, ShieldCheck, Sparkles,
  Workflow, Zap
} from "lucide-react";
import styles from "./PublicLanding.module.css";

type PublicLandingProps = {
  onSignIn: () => void;
};

const services = [
  {
    number: "01",
    icon: MonitorSmartphone,
    title: "Business websites",
    description: "Modern, mobile-first websites and landing pages built to make your business easier to discover and contact.",
    deliverables: ["Responsive design", "Contact & enquiry forms", "Performance-focused builds"],
  },
  {
    number: "02",
    icon: Blocks,
    title: "Web apps & client portals",
    description: "Custom dashboards, internal tools, and secure client experiences that fit the way your team works.",
    deliverables: ["Custom dashboards", "Authentication & roles", "Project management features"],
  },
  {
    number: "03",
    icon: Braces,
    title: "API & AI integrations",
    description: "Connect existing services, streamline workflows, and add practical AI-powered features where they make sense.",
    deliverables: ["Third-party integrations", "Workflow automation", "AI-assisted experiences"],
  },
  {
    number: "04",
    icon: Zap,
    title: "Improvements & support",
    description: "Need an existing website polished, fixed, or extended? Get focused development support without a full rebuild.",
    deliverables: ["UI improvements", "Bug fixes & new features", "Ongoing enhancements"],
  },
];

const steps = [
  { n: "01", title: "Tell us what you need", description: "Share your project goals and the problem you want to solve." },
  { n: "02", title: "Agree on a clear scope", description: "Discuss deliverables, timeline, and pricing before work starts." },
  { n: "03", title: "Build and collaborate", description: "Follow progress, review deliverables, and give feedback through your workspace." },
  { n: "04", title: "Launch with confidence", description: "Review the finished work and agree on handover or future support." },
];

export default function PublicLanding({ onSignIn }: PublicLandingProps) {
  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a className={styles.brand} href="#top" aria-label="BuildWithSSP home">
            <span className={styles.brandMark}><Code2 size={22} strokeWidth={2.2} /></span>
            <span>buildwith<span className={styles.brandAccent}>ssp</span><span className={styles.brandDot}>.</span></span>
          </a>
          <nav className={styles.nav} aria-label="Main navigation">
            <a href="#services">Services</a>
            <a href="#how-it-works">How it works</a>
            <Link href="/about">About</Link>
          </nav>
          <div className={styles.navActions}>
            <button className={styles.signIn} onClick={onSignIn} type="button">Client login</button>
            <Link className={styles.navCta} href="/register">Start a project <ArrowUpRight size={16} /></Link>
          </div>
        </div>
      </header>

      <main id="top">
        <section className={styles.hero} aria-labelledby="hero-heading">
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}><span className={styles.pulse} /> AVAILABLE FOR REMOTE PROJECTS <span className={styles.eyebrowLine} /> WORLDWIDE</div>
            <h1 id="hero-heading">Your ideas deserve<br /><span>better digital</span><br />experiences<span className={styles.period}>.</span></h1>
            <p className={styles.heroLead}>We design and develop websites, custom web applications, and smart integrations for ambitious businesses—wherever they are.</p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryCta} href="/register">Start your project <ArrowUpRight size={19} /></Link>
              <a className={styles.secondaryCta} href="#services">Explore services <ArrowRight size={18} /></a>
            </div>
            <div className={styles.heroFoot}>
              <span><Check size={15} /> Remote-friendly collaboration</span>
              <span><Check size={15} /> Clear milestones</span>
              <span><Check size={15} /> Direct developer communication</span>
            </div>
          </div>
          <div className={styles.heroVisual} aria-label="Preview of our web development workflow">
            <div className={styles.orbit} aria-hidden="true" />
            <div className={styles.visualCaption}><span className={styles.captionDot} /> BUILT FOR THE WEB</div>
            <div className={styles.browser}>
              <div className={styles.browserBar}>
                <div className={styles.browserDots}><i /><i /><i /></div>
                <div className={styles.address}><LockKeyhole size={11} /> buildwithssp.com</div>
                <span className={styles.browserMenu}>•••</span>
              </div>
              <div className={styles.browserBody}>
                <div className={styles.browserSmallLabel}><span /> DIGITAL EXPERIENCES / 2026</div>
                <div className={styles.browserTitle}>Build.<br /><em>Create.</em><br />Grow.</div>
                <div className={styles.browserGraphic}>
                  <div className={styles.graphicCircle} />
                  <div className={styles.graphicGrid} />
                  <div className={styles.graphicPill}><Sparkles size={13} /> Made for what's next</div>
                </div>
                <div className={styles.browserBottom}><span>CREATIVE DEVELOPMENT STUDIO</span><ArrowUpRight size={18}/></div>
              </div>
            </div>
            <div className={styles.floatingCard}><span className={styles.cardIcon}><BadgeCheck size={20} /></span><span><strong>Built around your goals</strong><small>From first idea to launch</small></span></div>
            <div className={styles.visualBottom}>DESIGN <span>✳</span> DEVELOP <span>✳</span> DELIVER</div>
          </div>
        </section>

        <div className={styles.marquee} aria-label="Our capabilities"><span>MODERN WEBSITES</span><span className={styles.asterisk}>✳</span><span>CUSTOM APPLICATIONS</span><span className={styles.asterisk}>✳</span><span>API INTEGRATIONS</span><span className={styles.asterisk}>✳</span><span>CLIENT EXPERIENCES</span><span className={styles.asterisk}>✳</span><span>LONG-TERM SUPPORT</span></div>

        <section id="services" className={styles.servicesSection} aria-labelledby="services-heading">
          <div className={styles.sectionTop}>
            <div><div className={styles.sectionLabel}><span>01 / WHAT WE DO</span></div><h2 id="services-heading">Services built for <em>real-world</em> needs.</h2></div>
            <p>Whether you're starting from scratch or improving an existing product, we focus on thoughtful, maintainable solutions.</p>
          </div>
          <div className={styles.serviceGrid}>
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <article className={styles.serviceCard} key={service.number}>
                  <div className={styles.serviceTop}><span className={styles.serviceNumber}>{service.number} / SERVICE</span><span className={styles.serviceIcon}><Icon size={26} strokeWidth={1.65}/></span></div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <ul>{service.deliverables.map(item => <li key={item}><Check size={14}/>{item}</li>)}</ul>
                  <Link href="/register" className={styles.serviceLink}>Discuss this service <ArrowUpRight size={17}/></Link>
                </article>
              );
            })}
          </div>
          <p className={styles.serviceNote}>Not sure which service fits? Start with your goal. We can help define the scope before development begins.</p>
        </section>

        <section className={styles.whySection} aria-labelledby="why-heading">
          <div className={styles.whyIntro}><div className={styles.sectionLabel}><span>02 / WHY WORK WITH US</span></div><h2 id="why-heading">A development partner,<br /><em>not just a handoff.</em></h2><p>Great projects come from clear communication, practical technology, and a process that keeps everyone aligned.</p><Link href="/about" className={styles.aboutLink}>Meet the developer <MoveUpRight size={18} /></Link></div>
          <div className={styles.whyGrid}>
            <div><span className={styles.whyIcon}><Globe2 size={24}/></span><h3>Work from anywhere</h3><p>Collaborate remotely across time zones with clear updates and shared project information.</p></div>
            <div><span className={styles.whyIcon}><Compass size={24}/></span><h3>Clarity from day one</h3><p>Align on requirements, deliverables, and next steps before moving into development.</p></div>
            <div><span className={styles.whyIcon}><Workflow size={24}/></span><h3>Visible progress</h3><p>Track milestones, review deliverables, and keep project conversations in one workspace.</p></div>
            <div><span className={styles.whyIcon}><ShieldCheck size={24}/></span><h3>Client-first workflow</h3><p>Signed-in clients access their assigned project areas, with public and private views kept separate.</p></div>
          </div>
        </section>

        <section id="how-it-works" className={styles.processSection} aria-labelledby="process-heading">
          <div className={styles.sectionTop}><div><div className={styles.sectionLabel}><span>03 / OUR PROCESS</span></div><h2 id="process-heading">Simple process.<br /><em>Meaningful results.</em></h2></div><p>Know what happens next, from the first conversation through to handover.</p></div>
          <div className={styles.steps}>{steps.map(step => <div className={styles.step} key={step.n}><span>{step.n}</span><h3>{step.title}</h3><p>{step.description}</p><ArrowUpRight size={18} className={styles.stepArrow}/></div>)}</div>
        </section>

        <section className={styles.ctaSection} aria-labelledby="cta-heading">
          <div className={styles.ctaOrb} aria-hidden="true"/>
          <div className={styles.ctaContent}>
            <div className={styles.ctaKicker}><Rocket size={16}/> YOUR NEXT PROJECT STARTS HERE</div>
            <h2 id="cta-heading">Have something<br /><em>great in mind?</em></h2>
            <p>Tell us what you're building. Let's turn the brief into a clear plan and a product your users will enjoy.</p>
            <div className={styles.ctaButtons}><Link className={styles.ctaWhite} href="/register">Create a client account <ArrowUpRight size={19}/></Link><button type="button" onClick={onSignIn}>Already a client? Sign in <ArrowRight size={17}/></button></div>
            <small>Creating an account lets you submit a project brief and access your client workspace.</small>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerTop}><a href="#top" className={styles.footerBrand}>buildwith<span>ssp</span>.</a><p>Thoughtful web development.<br/>Built for businesses everywhere.</p></div>
        <div className={styles.footerBottom}><span>© {new Date().getFullYear()} BuildWithSSP. All rights reserved.</span><div><a href="#services">Services</a><a href="#how-it-works">Process</a><Link href="/about">About</Link><button type="button" onClick={onSignIn}>Client login</button></div></div>
      </footer>
    </div>
  );
}
