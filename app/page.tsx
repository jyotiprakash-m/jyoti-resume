"use client";

import { useState } from "react";
import ChatWindow from "../components/ChatWindow";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const navLinks = [
    { label: "About", href: "#about" },
    { label: "Experience", href: "#experience" },
    { label: "Projects", href: "#projects" },
    { label: "Expertise", href: "#skills" },
    { label: "Certifications", href: "#certifications" },
    { label: "Education", href: "#education" },
    { label: "Contact", href: "#contact" },
  ];

  const experience = [
    {
      role: "Full Stack Developer",
      company: "SettleMint India",
      period: "Jan 2023 — Present",
      location: "Delhi, India",
      highlights: [
        "Deliver full-stack products end-to-end, from requirements gathering to production operations, across blockchain, AI, and workflow domains.",
        "Pair with DevOps to refine CI/CD pipelines, ship proof-of-concepts into production, and mentor junior developers on modern delivery practices.",
        "Sustain continuous learning through professional programs while aligning emerging tooling with roadmap priorities and client outcomes.",
      ],
    },
    {
      role: "Junior Associate Technology",
      company: "Publicis Sapient",
      period: "May 2022 — Dec 2022",
      location: "Bengaluru, India",
      highlights: [
        "Completed immersive Java full-stack engineering program and contributed to Lloyds Bank deliverables within the first quarter.",
        "Authored API integrations and automated test coverage to improve backend service performance and reliability.",
        "Enabled stronger collaboration by facilitating open design and code discussions across the feature squad.",
      ],
    },
  ];

  const skills = [
    {
      category: "Frameworks",
      items: [
        "Next.js",
        "React",
        "React Native",
        "NestJS",
        "FastAPI",
        "Shadcn UI",
        "Tailwind CSS",
      ],
    },
    {
      category: "Languages",
      items: ["TypeScript", "Node.js", "Python", "Solidity"],
    },
    {
      category: "Data & AI",
      items: [
        "PostgreSQL",
        "MongoDB",
        "PgVector",
        "Chroma",
        "FAISS",
        "LangChain",
        "LangGraph",
        "LangSmith",
        "OpenAI",
        "Anthropic",
        "Azure AI",
        "Ollama",
      ],
    },
    {
      category: "Cloud & Tools",
      items: [
        "AWS",
        "Azure",
        "Docker",
        "WSO2",
        "Swagger",
        "Git",
        "GitHub Copilot",
        "Cursor",
        "Jira",
        "Microservice Architecture",
      ],
    },
  ];

  const skillMeta: Record<string, { icon: string; tagline: string; gradient: string; accent: string }> = {
    Frameworks: {
      icon: "🧩",
      tagline: "Product-ready UI foundations across web, mobile, and platforms.",
      gradient: "linear-gradient(135deg, rgba(255,106,61,0), rgba(255,106,61,0.22))",
      accent: "#ff6a3d",
    },
    Languages: {
      icon: "💻",
      tagline: "Typed, expressive, and battle-tested codebases that ship fast.",
      gradient: "linear-gradient(135deg, rgba(56,189,248,0), rgba(56,189,248,0.22))",
      accent: "#38bdf8",
    },
    "Data & AI": {
      icon: "🧠",
      tagline: "Pipelines, embeddings, and orchestration for agentic intelligence.",
      gradient: "linear-gradient(135deg, rgba(192,132,252,0), rgba(192,132,252,0.25))",
      accent: "#c084fc",
    },
    "Cloud & Tools": {
      icon: "🚀",
      tagline: "Infrastructure, automation, and rituals that scale teams sustainably.",
      gradient: "linear-gradient(135deg, rgba(45,212,191,0), rgba(45,212,191,0.22))",
      accent: "#2dd4bf",
    },
  };

  const accentPalette = ["#ff6a3d", "#38bdf8", "#c084fc", "#2dd4bf"];



  const projects = [
    {
      name: "Email Classification AI Platform",
      description:
        "Securely ingests Gmail inboxes, classifies mail by department, enriches with sentiment, and orchestrates agentic reply drafting via LangGraph.",
      year: "2024",
      stack: ["FastAPI", "PostgreSQL", "PgVector", "Next.js", "LangChain"],
      link: "https://github.com/jyotiprakash-m/email-classification",
    },
    {
      name: "RAG Notebook",
      description:
        "Multi-tenant knowledge base with social auth, multimodal ingestion, and AI-assisted querying for internal operations teams.",
      year: "2024",
      stack: ["FastAPI", "MongoDB", "LangGraph", "Next.js"],
      link: "https://github.com/jyotiprakash-m/rag-multimodel",
    },
    {
      name: "Document Summariser",
      description:
        "LangChain-powered pipeline that chunks large documents, synthesises layered summaries, and persists analytics for later review.",
      year: "2023",
      stack: ["LangChain", "Python", "FastAPI"],
      link: "https://github.com/jyotiprakash-m/genai-study/blob/main/document-summary/graph_test1.py",
    },
    {
      name: "Virtual Data Room Workflow",
      description:
        "Role-based workbench for State Bank of India enabling workflow orchestration, document insights, and AI-assisted support chats.",
      year: "2023",
      stack: ["Next.js", "Node.js", "PostgreSQL", "Docker", "WSO2"],
      link: "https://settlemint.com",
    },
  ];

  const education = [
    {
      school: "C.V Raman Global University",
      degree: "B.Tech, Computer Science & Engineering",
      period: "2018 — 2022",
      detail: "CGPA 8.2/10",
    },
  ];

  const certifications = [
    {
      name: "Microsoft Certified: Azure AI Engineer Associate",
      issuer: "Microsoft",
      issued: "Issued Jul 2025 • Expires Jul 2026",
      credentialId: "Credential ID 879CCF5B665E7269",
    },
  ];

  const contact = {
    email: "jyotiprakashmohanta32@gmail.com",
    phone: "+91 86589 63394",
    location: "Saidulajab, Saket, New Delhi",
    availability: "Open to full-time or consulting roles across full stack, AI platform, and agentic workflow initiatives.",
  };

  const handleLinkClick = () => setMenuOpen(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-slate-200">
      <div
        className="pointer-events-none absolute inset-x-0 rounded-full"
        style={{
          top: "-24rem",
          height: "38rem",
          background: "radial-gradient(circle at top, rgba(255,106,61,0.25), transparent 55%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 rounded-full"
        style={{
          right: "-15rem",
          width: "30rem",
          background: "radial-gradient(circle, rgba(56,189,248,0.18), transparent 60%)",
        }}
      />
      <header className="sticky top-0 z-30 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="text-base font-semibold uppercase tracking-[0.3em] text-slate-300">Jyoti Prakash Mohanta</span>
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-400 md:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="transition hover:text-slate-100">
                {link.label}
              </a>
            ))}
          </div>

          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen((previous) => !previous)}
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:border-[#ff6a3d] hover:text-white md:hidden"
          >
            <span className="sr-only">Toggle navigation</span>
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </nav>
      </header>

      {menuOpen ? (
        <div className="md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm"
          >
            <span className="sr-only">Close menu</span>
          </button>
          <div className="fixed left-1/2 top-24 z-30 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-3xl border border-white/10 bg-[#0f172a]/95 p-6 shadow-[0_30px_90px_rgba(2,6,23,0.65)]">
            <nav className="space-y-4 text-sm font-medium text-slate-200">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  className="block rounded-2xl border border-transparent px-4 py-3 transition hover:border-[#ff6a3d]/40 hover:bg-[#ff6a3d]/10"
                >
                  {link.label}
                </a>
              ))}
              <hr className="border-white/10" />

              <a
                href="tel:+918658963394"
                className="flex items-center justify-center rounded-2xl border border-white/10 px-4 py-3 text-slate-300 transition hover:border-[#ff6a3d]/40 hover:bg-[#ff6a3d]/10"
                onClick={handleLinkClick}
              >
                Call: +91 86589 63394
              </a>
            </nav>
          </div>
        </div>
      ) : null}

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <section id="hero" className="relative flex flex-col gap-12 pt-8 pb-20 md:flex-row md:items-center">
          <div className="flex-1">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-[#ff6a3d]">
              Full Stack AI Developer
            </p>
            <h1 className="max-w-2xl text-3xl font-semibold leading-tight text-white md:text-4xl lg:text-5xl">
              I craft immersive digital products that blend modern web craftsmanship with production-ready AI.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-400">
              From LangChain agents to blockchain-backed workflows, I help teams translate complex requirements into resilient experiences that launch fast and evolve even faster.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="https://cal.com/jyotiprakash-mohanta"
                className="inline-flex items-center justify-center rounded-full bg-[#ff6a3d] px-7 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_35px_rgba(255,106,61,0.35)] transition hover:bg-[#ff815b]"
              >
                Start a project
              </a>
              <a
                href="/resume.pdf"
                className="inline-flex items-center justify-center rounded-full border border-white/10 px-7 py-3 text-sm font-semibold text-slate-100 transition hover:border-[#ff6a3d] hover:text-white"
              >
                Download résumé
              </a>
              <div className="flex items-center gap-6 text-xs uppercase tracking-[0.4em] text-slate-500">
                <span>API Design</span>
                <span>Agentic AI</span>
                <span>Blockchain</span>
              </div>
            </div>
          </div>
          <aside className="relative flex h-full w-full flex-1 justify-center md:justify-end">
            <div className="relative w-full max-w-sm overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/10 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,106,61,0.25),transparent_65%)]" aria-hidden="true" />
              <div className="relative z-10 space-y-6">
                <span className="inline-flex rounded-full border border-[#ff6a3d]/40 bg-[#ff6a3d]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#ff6a3d]">
                  Profile Snapshot
                </span>
                <dl className="space-y-4 text-sm text-slate-300">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Role</dt>
                    <dd className="text-right text-white">Full Stack AI Developer</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Focus</dt>
                    <dd className="text-right text-white">API design, agentic AI flows, blockchain integrations</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Experience</dt>
                    <dd className="text-right text-white">3+ years</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Currently</dt>
                    <dd className="text-right text-white">SettleMint India</dd>
                  </div>
                </dl>
                <div className="rounded-2xl border border-[#ff6a3d]/30 bg-[#ff6a3d]/10 p-5 text-sm text-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ff6a3d]">Latest Win</p>
                  <p className="mt-3 leading-relaxed">
                    LangGraph-powered email intelligence platform automating classification, sentiment triage, and AI-crafted responses for cross-functional teams.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section id="about" className="scroll-mt-32 border-t border-white/5 py-16">
          <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-white">About</h2>
              <p className="mt-6 text-base leading-relaxed text-slate-400">
                I thrive on building high-impact applications that sit at the intersection of AI, blockchain, and modern web architecture. My work spans document intelligence, workflow platforms, and data-heavy dashboards that stay resilient at scale.
              </p>
              <p className="mt-4 text-base leading-relaxed text-slate-400">
                I am hands-on across the stack—architecting APIs, designing component systems, integrating multi-model AI, and delivering production-ready code. Beyond shipping features, I care about mentoring teams, strengthening collaboration, and aligning technology choices to measurable outcomes.
              </p>
            </div>
            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_24px_60px_rgba(2,6,23,0.45)] transition duration-300 hover:-translate-y-1 hover:border-white/20">
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
                style={{ background: "linear-gradient(135deg, transparent, #ff6a3d33)" }}
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -bottom-16 -right-14 h-44 w-44 rounded-full opacity-0 blur-3xl transition duration-500 group-hover:opacity-40"
                style={{ background: "#ff6a3d" }}
                aria-hidden="true"
              />
              <div className="relative z-10">
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#ff6a3d]">Highlights</h3>
                <ul className="mt-6 space-y-4 text-sm leading-relaxed text-slate-300">
                  <li className="leading-relaxed">Delivered LangChain and LangGraph powered agents for classification, summarisation, and contextual search across enterprise content.</li>
                  <li className="leading-relaxed">Implemented API platforms, microservices, and CI/CD improvements that shorten release cycles for blockchain and BFSI clients.</li>
                  <li className="leading-relaxed">Built live government portals and workflow POCs that handle high-volume document operations with robust auditability.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="experience" className="scroll-mt-32 border-t border-white/5 py-16">
          <div className="grid gap-10 md:grid-cols-[280px_1fr]">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-white">Experience</h2>
              <p className="mt-4 text-sm text-slate-500">
                A blend of product discovery, front-end architecture, and cross-functional leadership delivering outcomes at scale.
              </p>
            </div>
            <div className="relative space-y-10">
              <div className="absolute left-[0.7rem] top-0 h-full w-px bg-linear-to-b from-[#ff6a3d]/50 via-white/10 to-transparent" aria-hidden="true" />
              {experience.map((role, index) => {
                const accent = accentPalette[index % accentPalette.length];
                const accentGlow = `${accent}33`;

                return (
                  <article
                    key={role.company}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_24px_60px_rgba(2,6,23,0.45)] transition duration-300 hover:-translate-y-1 hover:border-white/20"
                  >
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
                      style={{ background: `linear-gradient(135deg, transparent, ${accentGlow})` }}
                      aria-hidden="true"
                    />
                    <div
                      className="pointer-events-none absolute -bottom-16 -right-16 h-44 w-44 rounded-full opacity-0 blur-3xl transition duration-500 group-hover:opacity-40"
                      style={{ background: accent }}
                      aria-hidden="true"
                    />
                    <span
                      className="absolute left-3 top-10 z-10 h-3 w-3 -translate-x-1/2 rounded-full border border-white/40"
                      style={{ background: accent }}
                      aria-hidden="true"
                    />
                    <div className="relative z-10">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-xl font-semibold text-white">{role.role}</h3>
                        <span className="rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">{role.period}</span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-400">{role.company} · {role.location}</p>
                      <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-300">
                        {role.highlights.map((highlight) => (
                          <li key={highlight} className="leading-relaxed">
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="projects" className="scroll-mt-32 border-t border-white/5 py-16">
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm">
              <h2 className="text-3xl font-semibold tracking-tight text-white">Selected Work</h2>
              <p className="mt-4 text-sm text-slate-500">
                Case studies that showcase product thinking, interaction design, and end-to-end execution.
              </p>
              <a
                href="mailto:jyotiprakashmohanta32@gmail.com?subject=Project%20Inquiry"
                className="mt-6 inline-flex items-center text-sm font-semibold text-[#ff6a3d] transition hover:text-[#ff815b]"
              >
                Request full portfolio →
              </a>
            </div>
            <div className="grid flex-1 gap-6">
              {projects.map((project, index) => {
                const accent = accentPalette[index % accentPalette.length];
                const accentGlow = `${accent}33`;

                return (
                  <article
                    key={project.name}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_rgba(2,6,23,0.45)] transition duration-300 hover:-translate-y-1 hover:border-white/20"
                  >
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
                      style={{ background: `linear-gradient(135deg, transparent, ${accentGlow})` }}
                      aria-hidden="true"
                    />
                    <div
                      className="pointer-events-none absolute -bottom-16 -right-16 h-44 w-44 rounded-full opacity-0 blur-3xl transition duration-500 group-hover:opacity-40"
                      style={{ background: accent }}
                      aria-hidden="true"
                    />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500">
                        <span>{project.year}</span>
                        <span>Case Study</span>
                      </div>
                      <h3 className="mt-4 text-xl font-semibold text-white">{project.name}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-400">{project.description}</p>
                    </div>
                    <div className="relative z-10 mt-6 flex flex-wrap gap-2 text-xs font-medium uppercase tracking-[0.3em] text-slate-400">
                      {project.stack.map((tool) => (
                        <span key={tool} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200">
                          {tool}
                        </span>
                      ))}
                    </div>
                    <a
                      href={project.link}
                      className="relative z-10 mt-6 inline-flex items-center text-sm font-semibold text-[#ff6a3d] transition hover:text-[#ff815b]"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View project ↗
                    </a>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="skills" className="scroll-mt-32 border-t border-white/5 py-16">
          <div className="grid gap-10 md:grid-cols-[280px_1fr]">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-white">Expertise</h2>
              <p className="mt-4 text-sm text-slate-500">
                Tools and practices that power scalable, AI-enabled products from prototype to production.
              </p>
            </div>
            <div className="grid gap-6">
              {skills.map((group) => {
                const meta =
                  skillMeta[group.category] ?? {
                    icon: "⚙️",
                    tagline: "",
                    gradient: "linear-gradient(135deg, rgba(148,163,184,0), rgba(148,163,184,0.22))",
                    accent: "#94a3b8",
                  };

                return (
                  <article
                    key={group.category}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_rgba(2,6,23,0.45)] transition duration-300 hover:-translate-y-1 hover:border-white/20"
                  >
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
                      style={{ background: meta.gradient }}
                      aria-hidden="true"
                    />
                    <div
                      className="pointer-events-none absolute -bottom-14 -right-10 h-40 w-40 rounded-full opacity-0 blur-3xl transition duration-500 group-hover:opacity-40"
                      style={{ background: meta.accent }}
                      aria-hidden="true"
                    />
                    <div className="relative z-10 flex h-full flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-3xl" aria-hidden="true">
                          {meta.icon}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-300">
                          {group.items.length} tools
                        </span>
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-white">{group.category}</h3>
                      {meta.tagline ? (
                        <p className="mt-2 text-sm leading-relaxed text-slate-300">{meta.tagline}</p>
                      ) : null}
                      <div className="mt-6 flex flex-wrap gap-2">
                        {group.items.map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.25em] text-slate-200"
                          >
                            <span
                              className="inline-block h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: meta.accent }}
                              aria-hidden="true"
                            />
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="certifications" className="scroll-mt-32 border-t border-white/5 py-16">
          <div className="grid gap-10 md:grid-cols-[280px_1fr]">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-white">Certifications</h2>
              <p className="mt-4 text-sm text-slate-500">
                Continuous learning and validation of AI expertise through industry credentials.
              </p>
            </div>
            <div className="space-y-6">
              {certifications.map((item, index) => {
                const accent = accentPalette[index % accentPalette.length];
                const accentGlow = `${accent}33`;

                return (
                  <article
                    key={item.name}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_rgba(2,6,23,0.45)] transition duration-300 hover:-translate-y-1 hover:border-white/20"
                  >
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
                      style={{ background: `linear-gradient(135deg, transparent, ${accentGlow})` }}
                      aria-hidden="true"
                    />
                    <div
                      className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition duration-500 group-hover:opacity-40"
                      style={{ background: accent }}
                      aria-hidden="true"
                    />
                    <div className="relative z-10">
                      <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                      <p className="mt-2 text-sm text-slate-400">{item.issuer}</p>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{item.issued}</p>
                      <p className="mt-2 text-xs font-medium uppercase tracking-[0.3em] text-slate-500">{item.credentialId}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="education" className="scroll-mt-32 border-t border-white/5 py-16">
          <div className="grid gap-10 md:grid-cols-[280px_1fr]">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-white">Education</h2>
              <p className="mt-4 text-sm text-slate-500">
                Strong engineering fundamentals, complemented by on-the-job experimentation and ongoing cohort-based learning.
              </p>
            </div>
            <div className="space-y-6">
              {education.map((item, index) => {
                const accent = accentPalette[(index + 1) % accentPalette.length];
                const accentGlow = `${accent}33`;

                return (
                  <article
                    key={item.school}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_rgba(2,6,23,0.45)] transition duration-300 hover:-translate-y-1 hover:border-white/20"
                  >
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
                      style={{ background: `linear-gradient(135deg, transparent, ${accentGlow})` }}
                      aria-hidden="true"
                    />
                    <div
                      className="pointer-events-none absolute -bottom-16 -right-16 h-44 w-44 rounded-full opacity-0 blur-3xl transition duration-500 group-hover:opacity-40"
                      style={{ background: accent }}
                      aria-hidden="true"
                    />
                    <div className="relative z-10">
                      <h3 className="text-lg font-semibold text-white">{item.school}</h3>
                      <p className="mt-2 text-sm text-slate-400">{item.degree}</p>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{item.period}</p>
                      {item.detail ? (
                        <p className="mt-2 text-xs font-medium uppercase tracking-[0.3em] text-slate-500">{item.detail}</p>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-32 border-t border-white/5 py-16">
          <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-white">Let’s build what’s next</h2>
              <p className="mt-4 text-base text-slate-400">
                Whether you’re shaping the next product narrative or refining an existing experience, I’d love to collaborate. I respond within two business days.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="mailto:jyotiprakashmohanta32@gmail.com"
                  className="inline-flex items-center justify-center rounded-full bg-[#ff6a3d] px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_35px_rgba(255,106,61,0.35)] transition hover:bg-[#ff815b]"
                >
                  Email me
                </a>
                <a
                  href="https://cal.com/jyotiprakash-mohanta"
                  // target="_blank"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-[#ff6a3d] hover:text-white"
                >
                  Schedule intro ↗
                </a>
              </div>
            </div>
            <aside className="space-y-6 rounded-3xl border border-white/10 bg-white/10 p-8 shadow-[0_24px_60px_rgba(2,6,23,0.45)]">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#ff6a3d]">Contact</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  <li>
                    <a href="mailto:jyotiprakashmohanta32@gmail.com" className="transition hover:text-[#ff6a3d]">
                      {contact.email}
                    </a>
                  </li>
                  <li>
                    <a href="tel:+918658963394" className="transition hover:text-[#ff6a3d]">
                      {contact.phone}
                    </a>
                  </li>
                  <li>{contact.location}</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#ff6a3d]">Availability</h3>
                <p className="mt-3 text-sm text-slate-300">{contact.availability}</p>
              </div>
            </aside>
          </div>
        </section>
      </main>

      {/* Floating chat action and modal entrypoint */}
      <button
        type="button"
        onClick={() => setChatOpen((previous) => !previous)}
        className="fixed bottom-8 right-6 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#ff6a3d]/40 bg-[#ff6a3d] text-slate-950 shadow-[0_0_35px_rgba(255,106,61,0.45)] transition hover:bg-[#ff815b] md:right-10"
        aria-label={chatOpen ? "Close chat" : "Open chat"}
      >
        {chatOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10a4 4 0 014 4v4a4 4 0 01-4 4H9l-5 5v-5H7a4 4 0 01-4-4V11a4 4 0 014-4z" />
          </svg>
        )}
      </button>

      {chatOpen ? (
        <>
          <button
            type="button"
            aria-label="Close chat"
            onClick={() => setChatOpen(false)}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] md:bg-black/20"
          />
          <div className="fixed bottom-24 right-6 z-40 h-[560px] w-[clamp(360px,40vw,520px)] overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0f172a]/95 p-5 shadow-[0_35px_90px_rgba(2,6,23,0.65)] md:right-10">
            <ChatWindow onClose={() => setChatOpen(false)} />
          </div>
        </>
      ) : null}

      <footer className="border-t border-white/5 bg-black/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p className="text-slate-500">© {new Date().getFullYear()} Jyoti Prakash. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="https://www.linkedin.com/in/jyotiprakash-mohanta" target="_blank" rel="noopener noreferrer" className="transition hover:text-[#ff6a3d]">
              LinkedIn
            </a>
            <a href="https://github.com/jyotiprakash-m" target="_blank" rel="noopener noreferrer" className="transition hover:text-[#ff6a3d]">
              GitHub
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="transition hover:text-[#ff6a3d]">
              X
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
