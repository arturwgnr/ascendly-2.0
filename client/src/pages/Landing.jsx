import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Target,
  Clock,
  Trophy,
  BookOpen,
  LayoutDashboard,
  PenLine,
  Zap,
  ArrowRight,
} from "lucide-react";
import Button from "../components/common/Button.jsx";
import "../styles/components/landing.css";
import "../styles/components/gamification.css";

const PAIN_POINTS = [
  {
    icon: Target,
    title: "Progression Paralysis",
    desc: "You study for hours but never know if you are actually moving toward your goal.",
  },
  {
    icon: Clock,
    title: "Vanishing Time",
    desc: "Your days slip by without a clear record of what you built or what you learned.",
  },
  {
    icon: Trophy,
    title: "Habit Disconnect",
    desc: "Your goals sound great. Your daily actions just do not reflect them yet.",
  },
];

const FEATURES = [
  {
    icon: BookOpen,
    title: "Study Tracker",
    desc: "Log deep work sessions, visualize intensity heatmaps, and hit monthly targets with full clarity.",
  },
  {
    icon: Target,
    title: "Daily Growth",
    desc: "Structured morning and evening missions. Habit tracking that actually builds identity.",
  },
  {
    icon: LayoutDashboard,
    title: "Task Board",
    desc: "Integrated backlog with weekly drag-and-drop allocation. Prioritize by size and impact.",
  },
  {
    icon: PenLine,
    title: "AI Journaling",
    desc: "Daily entries with AI pattern analysis. Discover how your mood correlates with your habits.",
  },
];

const HOW_STEPS = [
  {
    num: "01",
    title: "Set your pillars",
    desc: "Define your core morning and evening rituals. Ascendly seeds them as daily missions automatically.",
  },
  {
    num: "02",
    title: "Track everything",
    desc: "Log study sessions, check off habits, capture journal entries. One screen per domain, one source of truth.",
  },
  {
    num: "03",
    title: "See the patterns",
    desc: "Heatmaps, analytics, AI insights. Review trends weekly and compound your growth month over month.",
  },
];

function PreviewHeatmap() {
  const cells = Array.from({ length: 7 * 20 }, (_, i) => {
    const r = Math.random();
    if (r > 0.85) return 4;
    if (r > 0.65) return 3;
    if (r > 0.45) return 2;
    if (r > 0.25) return 1;
    return 0;
  });

  const levels = [
    "heatmap-cell-empty",
    "heatmap-cell-l1",
    "heatmap-cell-l2",
    "heatmap-cell-l3",
    "heatmap-cell-l4",
  ];
  const rows = [];
  for (let r = 0; r < 7; r++) {
    rows.push(
      <div key={r} className="landing-preview-heatmap-row">
        {cells.slice(r * 20, (r + 1) * 20).map((lv, i) => (
          <div
            key={i}
            className={`landing-preview-heatmap-cell ${levels[lv]}`}
            style={{ width: 10, height: 10, borderRadius: 2 }}
          />
        ))}
      </div>,
    );
  }
  return <>{rows}</>;
}

export default function Landing() {
  const navigate = useNavigate();
  const navRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="landing">
      <div className="landing-bg">
        <div className="landing-bg-blob landing-bg-blob-1" />
        <div className="landing-bg-blob landing-bg-blob-2" />
      </div>

      {/* Navbar */}
      <nav ref={navRef} className={`landing-nav ${scrolled ? "scrolled" : ""}`}>
        <a href="/" className="landing-nav-logo">
          <span className="landing-nav-symbol">ᨒ</span>
          <span className="gradient-text">Ascendly</span>
        </a>
        <div className="landing-nav-links">
          <a href="#features" className="landing-nav-link">
            Features
          </a>
          <a href="#how" className="landing-nav-link">
            How it works
          </a>
        </div>
        <div className="landing-nav-actions">
          <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
            Login
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/register")}
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <header className="landing-hero">
        <div className="landing-hero-eyebrow">
          <Zap size={11} />
          Premium self-improvement tracking
        </div>
        <h1>
          Stop guessing.
          <br />
          <span className="gradient-text">Start growing.</span>
        </h1>
        <p className="landing-hero-sub">
          Ascendly tracks your study sessions, daily habits, tasks, and journal
          entries so you always know where your time goes and where you are
          headed.
        </p>
        <div className="landing-hero-ctas">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate("/register")}
          >
            Start for free <ArrowRight size={15} />
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() =>
              document
                .getElementById("how")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            See how it works
          </Button>
        </div>
      </header>

      {/* Pain points */}
      <section className="landing-pain">
        {PAIN_POINTS.map((p) => (
          <div key={p.title} className="landing-pain-item">
            <div className="landing-pain-icon-wrap">
              <p.icon size={22} />
            </div>
            <h3>{p.title}</h3>
            <p>{p.desc}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="landing-features" id="features">
        <div className="landing-features-header">
          <p className="landing-section-eyebrow">Capabilities</p>
          <h2>Everything you need to level up</h2>
          <p>A unified command center for your high-performance life.</p>
        </div>
        <div className="landing-features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="landing-feature-card">
              <div className="landing-feature-icon">
                <f.icon size={18} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="landing-how" id="how">
        <div className="landing-how-header">
          <p className="landing-section-eyebrow">Process</p>
          <h2>Built around consistency</h2>
          <p>Three steps. One compound effect.</p>
        </div>
        <div className="landing-steps">
          {HOW_STEPS.map((s, i) => (
            <div key={i} className="landing-step">
              <div className="landing-step-number">{s.num}</div>
              <div className="landing-step-content">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* App preview */}
      <section className="landing-preview">
        <div className="landing-preview-shell">
          <div className="landing-preview-bar">
            <div className="landing-preview-dots">
              <div
                className="landing-preview-dot"
                style={{ background: "rgba(224,92,92,0.4)" }}
              />
              <div
                className="landing-preview-dot"
                style={{ background: "rgba(240,165,0,0.4)" }}
              />
              <div
                className="landing-preview-dot"
                style={{ background: "rgba(109,191,130,0.4)" }}
              />
            </div>
            <span className="landing-preview-label">Your command center</span>
          </div>
          <div className="landing-preview-content">
            <div className="landing-preview-sidebar">
              <div
                className="landing-preview-sidebar-item"
                style={{ width: "60%", height: 18, marginBottom: 12 }}
              />
              <div className="landing-preview-sidebar-item active" />
              <div
                className="landing-preview-sidebar-item"
                style={{ width: "75%" }}
              />
              <div
                className="landing-preview-sidebar-item"
                style={{ width: "65%" }}
              />
              <div
                className="landing-preview-sidebar-item"
                style={{ width: "70%" }}
              />
              <div
                className="landing-preview-sidebar-item"
                style={{ width: "60%" }}
              />
            </div>
            <div className="landing-preview-main">
              <div className="landing-preview-cards">
                <div className="landing-preview-card" />
                <div className="landing-preview-card" />
              </div>
              <div className="landing-preview-heatmap">
                <PreviewHeatmap />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div>
            <div className="landing-footer-logo">
              <span>ᨒ</span>
              <span className="gradient-text">Ascendly</span>
            </div>
            <p className="landing-footer-tagline">
              Stop guessing. Start growing. The ultimate companion for builders,
              students, and high performers.
            </p>
            <p className="landing-footer-copy">
              © 2026 Ascendly. Built for those who choose to grow.
            </p>
          </div>
          <div className="landing-footer-col">
            <h4>Platform</h4>
            <ul>
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#how">How it works</a>
              </li>
              <li>
                <a href="/register">Get Started</a>
              </li>
            </ul>
          </div>
          <div className="landing-footer-col">
            <h4>Account</h4>
            <ul>
              <li>
                <a href="/login">Login</a>
              </li>
              <li>
                <a href="/register">Register</a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
