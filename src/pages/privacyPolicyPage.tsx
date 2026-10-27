import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/seo";
import {
  ShieldCheck,
  Lock,
  FileCode2,
  Users2,
  Cookie,
  Server,
  Trash2,
  Mail,
  ChevronRight,
  Eye,
  CheckCircle2,
  Sparkles,
  ArrowUp,
  Cpu,
  Layers,
} from "lucide-react";

interface SectionItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SECTIONS: SectionItem[] = [
  { id: "overview", title: "1. Overview & Commitment", icon: ShieldCheck },
  { id: "information-collected", title: "2. Information We Collect", icon: Eye },
  { id: "code-execution", title: "3. Code Execution & Sandboxing", icon: Cpu },
  { id: "collaboration", title: "4. Real-Time Collaboration Rooms", icon: Users2 },
  { id: "snippets-embeds", title: "5. Snippets & Public Embeds", icon: FileCode2 },
  { id: "cookies-storage", title: "6. Cookies & Local Storage", icon: Cookie },
  { id: "third-party", title: "7. Third-Party Services & Analytics", icon: Layers },
  { id: "data-retention", title: "8. Retention, Security & Deletion", icon: Server },
  { id: "user-rights", title: "9. Your Privacy Rights (GDPR / CCPA)", icon: Trash2 },
  { id: "contact", title: "10. Contact & Privacy Inquiries", icon: Mail },
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Toggle back to top button
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }

      // Detect active section based on scroll position
      const scrollPosition = window.scrollY + 200;
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <SEO
        title="Privacy Policy | CodesRoom"
        description="Read the CodesRoom Privacy Policy. Learn how we safeguard your source code, personal information, real-time collaboration sessions, and developer workspace data."
        keywords="CodesRoom privacy policy, developer privacy, code security, sandbox privacy, data protection, privacy policy codesroom"
        canonical="https://codesroom.in/privacy-policy"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Privacy Policy", url: "/privacy-policy" },
        ]}
        structuredData={{
          "@type": "WebPage",
          "name": "Privacy Policy | CodesRoom",
          "url": "https://codesroom.in/privacy-policy",
          "description": "CodesRoom Privacy Policy detailing code handling, encryption, user data, and privacy rights.",
          "publisher": {
            "@type": "Organization",
            "name": "CodesRoom",
            "url": "https://codesroom.in",
          },
        }}
      />

      {/* Ambient background glow & grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-full max-w-4xl rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute top-1/3 -left-40 h-80 w-80 rounded-full bg-indigo-500/10 blur-[100px]" />
        <div className="absolute top-2/3 -right-40 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:py-12 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">Privacy Policy</span>
        </nav>

        {/* Hero Section */}
        <header className="mb-12 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary backdrop-blur-md mb-4 shadow-xs">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Trust & Data Transparency</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-3xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            At <strong>CodesRoom</strong> (accessible at{" "}
            <a href="https://codesroom.in" className="text-primary hover:underline font-medium">
              https://codesroom.in
            </a>
            ), we respect your privacy and are committed to protecting your personal information and intellectual property. This Privacy Policy outlines what data we collect, how your code is processed, and your rights as a developer.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span>Last Updated: <strong>October 27, 2026</strong></span>
            <span>•</span>
            <span>Effective Date: <strong>October 2026</strong></span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-emerald-500 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> GDPR & CCPA Compliant
            </span>
          </div>
        </header>

        {/* Highlights Cards */}
        <section aria-label="Privacy Highlights" className="mb-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-xl shadow-xs transition hover:border-primary/50 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary mb-3.5 transition group-hover:scale-110">
              <FileCode2 className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Your Code is Yours</h2>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              We never claim intellectual property rights to your source code, algorithms, snippets, or project logic.
            </p>
          </div>

          <div className="group rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-xl shadow-xs transition hover:border-primary/50 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-500 mb-3.5 transition group-hover:scale-110">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Encrypted in Transit</h2>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              All communications, room sockets, and API calls are secured via strong TLS/SSL HTTPS and WSS protocols.
            </p>
          </div>

          <div className="group rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-xl shadow-xs transition hover:border-primary/50 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-500 mb-3.5 transition group-hover:scale-110">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">No Selling of Data</h2>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              We do not sell, rent, or trade your personal data, workspace code, or email addresses to data brokers or advertisers.
            </p>
          </div>

          <div className="group rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-xl shadow-xs transition hover:border-primary/50 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500 mb-3.5 transition group-hover:scale-110">
              <Trash2 className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Full Data Control</h2>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Delete your account, code rooms, or public snippets at any time directly through your dashboard or support request.
            </p>
          </div>
        </section>

        {/* Content Layout with Floating TOC */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Table of Contents - Desktop Sticky */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24">
            <div className="rounded-2xl border border-border/70 bg-card/70 p-5 backdrop-blur-xl shadow-xs">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/60">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Table of Contents
                </h2>
              </div>
              <nav className="space-y-1" aria-label="Privacy Policy Sections">
                {SECTIONS.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                      <span className="truncate">{section.title}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-6 pt-4 border-t border-border/60">
                <p className="text-[11px] text-muted-foreground">
                  Need clarification on a clause? Reach our team at{" "}
                  <a href="mailto:support@codesroom.in" className="text-primary hover:underline font-medium">
                    support@codesroom.in
                  </a>
                </p>
              </div>
            </div>
          </aside>

          {/* Policy Detail Sections */}
          <article className="lg:col-span-8 space-y-8">
            {/* Section 1 */}
            <section
              id="overview"
              className="scroll-mt-28 rounded-2xl border border-border/70 bg-card/60 p-6 sm:p-8 backdrop-blur-xl shadow-xs"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  1. Overview & Commitment
                </h2>
              </div>
              <div className="space-y-3.5 text-sm text-muted-foreground leading-relaxed">
                <p>
                  CodesRoom is a developer productivity platform offering an online compiler, collaborative coding rooms, a front-end Web Pen editor, and a JSON formatting toolkit.
                </p>
                <p>
                  Our guiding principle is simple: <strong>developers should write and share code with complete confidence</strong>. We collect only the minimum data required to authenticate your account, synchronize your collaborative rooms, deliver compiler outputs, and ensure service reliability.
                </p>
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-foreground text-xs leading-relaxed">
                  <p className="font-semibold text-primary mb-1">Key Principle:</p>
                  We treat source code uploaded or executed in CodesRoom as private and proprietary to you, unless you explicitly choose to publish or embed it publicly.
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section
              id="information-collected"
              className="scroll-mt-28 rounded-2xl border border-border/70 bg-card/60 p-6 sm:p-8 backdrop-blur-xl shadow-xs"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                  <Eye className="h-5 w-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  2. Information We Collect
                </h2>
              </div>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <div>
                  <h3 className="font-semibold text-foreground text-base mb-1.5">A. Account Credentials</h3>
                  <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                    <li>
                      <strong>Direct Sign-Up:</strong> If you create an account using email and password, we store your email address and an encrypted (bcrypt-hashed) version of your password. We never have access to plain-text passwords.
                    </li>
                    <li>
                      <strong>OAuth Authentication (Google):</strong> If you authenticate via Google OAuth, we receive your verified email address, full name, and avatar profile picture provided by Google. We never receive or store your Google account password.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground text-base mb-1.5">B. Workspace & Code Information</h3>
                  <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                    <li>
                      <strong>Saved Code Snippets:</strong> Code content, programming language, title, and optional tags you choose to save or publish.
                    </li>
                    <li>
                      <strong>Collaborative Coding Rooms:</strong> Room titles, participant lists, and real-time buffer state during active live collaboration sessions.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground text-base mb-1.5">C. Technical & Diagnostic Logs</h3>
                  <p className="text-xs sm:text-sm">
                    To maintain uptime and prevent denial-of-service or bot abuses, our servers automatically log standard network metadata including IP address, browser type, operating system, timestamp of requests, and execution run duration.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section
              id="code-execution"
              className="scroll-mt-28 rounded-2xl border border-border/70 bg-card/60 p-6 sm:p-8 backdrop-blur-xl shadow-xs"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <Cpu className="h-5 w-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  3. Code Execution & Sandboxing
                </h2>
              </div>
              <div className="space-y-3.5 text-sm text-muted-foreground leading-relaxed">
                <p>
                  CodesRoom provides instant code compilation and execution across 15+ languages. Here is how your code is handled during execution:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
                  <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                    <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">
                      Ephemeral Sandboxes
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Backend compilation runs in isolated, ephemeral sandboxes with restricted network access and strict CPU/memory timeouts. Once execution completes, temporary containers and files are destroyed.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                    <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">
                      In-Browser Execution (Pyodide & Web Pen)
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Client-side tools (Web Pen HTML/CSS/JS and Python Pyodide runtime) execute directly within your local browser environment. Code entered in these tools never hits our execution servers.
                    </p>
                  </div>
                </div>
                <p className="text-xs pt-1">
                  We do not train automated AI models or public datasets on your private code execution runs.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section
              id="collaboration"
              className="scroll-mt-28 rounded-2xl border border-border/70 bg-card/60 p-6 sm:p-8 backdrop-blur-xl shadow-xs"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Users2 className="h-5 w-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  4. Real-Time Collaboration Rooms
                </h2>
              </div>
              <div className="space-y-3.5 text-sm text-muted-foreground leading-relaxed">
                <p>
                  When you invite teammates to a live room, real-time code edits, cursor positions, and chat signals are transmitted between peers via secure WebSockets (WSS).
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>
                    <strong>Access Control:</strong> Room owners have full control over who joins. Only authorized invited members or approved join requests can view or edit room contents.
                  </li>
                  <li>
                    <strong>Session Transience:</strong> Cursor movements and peer awareness updates are transient and not retained after a collaborative session concludes.
                  </li>
                  <li>
                    <strong>Room Deletion:</strong> Room owners may permanently delete a room at any time, purging associated room state from our database.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section
              id="snippets-embeds"
              className="scroll-mt-28 rounded-2xl border border-border/70 bg-card/60 p-6 sm:p-8 backdrop-blur-xl shadow-xs"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                  <FileCode2 className="h-5 w-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  5. Snippets & Public Embeds
                </h2>
              </div>
              <div className="space-y-3.5 text-sm text-muted-foreground leading-relaxed">
                <p>
                  CodesRoom allows developers to create shareable code snippets and interactive embed iframes (e.g., for developer blogs, tutorials, or documentation).
                </p>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-foreground leading-relaxed">
                  <span className="font-semibold text-amber-500">Notice Regarding Public Snippets: </span>
                  Any snippet you deliberately mark as public or share via a public URL (<code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">/s/:id</code> or <code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">/embed/s/:id</code>) is accessible to anyone with the link. Do not include API keys, credentials, or proprietary secrets in public snippets.
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section
              id="cookies-storage"
              className="scroll-mt-28 rounded-2xl border border-border/70 bg-card/60 p-6 sm:p-8 backdrop-blur-xl shadow-xs"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                  <Cookie className="h-5 w-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  6. Cookies & Local Storage
                </h2>
              </div>
              <div className="space-y-3.5 text-sm text-muted-foreground leading-relaxed">
                <p>
                  We prioritize your privacy by keeping cookie usage strictly functional:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>
                    <strong>Authentication Session:</strong> Secure HTTP-only cookies or JSON Web Tokens (JWT) stored to verify your logged-in state without re-prompting credentials.
                  </li>
                  <li>
                    <strong>Editor Preferences (Local Storage):</strong> We store your editor theme (Dark/Light mode), font size, tab sizing, and auto-completion preferences locally in your browser. This information is never transmitted to our marketing or third-party servers.
                  </li>
                  <li>
                    <strong>No Ad-Tracking Cookies:</strong> CodesRoom does not deploy cross-site tracking pixels or third-party advertising cookies.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 7 */}
            <section
              id="third-party"
              className="scroll-mt-28 rounded-2xl border border-border/70 bg-card/60 p-6 sm:p-8 backdrop-blur-xl shadow-xs"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
                  <Layers className="h-5 w-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  7. Third-Party Services & Analytics
                </h2>
              </div>
              <div className="space-y-3.5 text-sm text-muted-foreground leading-relaxed">
                <p>
                  To deliver a robust cloud IDE, we rely on trusted industry infrastructure partners:
                </p>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="rounded-lg border border-border/50 bg-background/50 p-3">
                    <span className="font-semibold text-foreground">Google OAuth:</span> Used exclusively for optional sign-in. Subject to Google's Privacy Policy.
                  </div>
                  <div className="rounded-lg border border-border/50 bg-background/50 p-3">
                    <span className="font-semibold text-foreground">Google Analytics (Anonymized):</span> Helps us gauge aggregate platform performance, page load latencies, and compiler usage patterns. IP anonymization is enforced.
                  </div>
                  <div className="rounded-lg border border-border/50 bg-background/50 p-3">
                    <span className="font-semibold text-foreground">Cloud Infrastructure & CDN (Vercel / MongoDB):</span> Hosts encrypted backend data clusters and edge CDN routing.
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section
              id="data-retention"
              className="scroll-mt-28 rounded-2xl border border-border/70 bg-card/60 p-6 sm:p-8 backdrop-blur-xl shadow-xs"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                  <Server className="h-5 w-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  8. Retention, Security & Deletion
                </h2>
              </div>
              <div className="space-y-3.5 text-sm text-muted-foreground leading-relaxed">
                <p>
                  We store your account and snippet data only as long as you maintain an active account with CodesRoom.
                </p>
                <div className="space-y-2 text-xs sm:text-sm">
                  <p>
                    <strong>Encryption:</strong> Data in transit is secured via TLS 1.3 encryption. Passwords and sensitive authentication tokens are hashed using salted cryptographic algorithms.
                  </p>
                  <p>
                    <strong>Account Deletion:</strong> You have the right to permanently purge your account. Upon account deletion, all associated collaborative rooms, private snippets, and profile information will be immediately deleted or anonymized from active databases within 30 days.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 9 */}
            <section
              id="user-rights"
              className="scroll-mt-28 rounded-2xl border border-border/70 bg-card/60 p-6 sm:p-8 backdrop-blur-xl shadow-xs"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                  <Trash2 className="h-5 w-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  9. Your Privacy Rights (GDPR & CCPA)
                </h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Regardless of your country of residence, CodesRoom honors the following rights for all registered developers:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5">
                    <span className="font-semibold text-foreground block mb-1">Right to Access:</span>
                    Request a full copy of the personal information and saved snippets we hold about you.
                  </div>
                  <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5">
                    <span className="font-semibold text-foreground block mb-1">Right to Rectification:</span>
                    Update or correct inaccurate account details through your account settings.
                  </div>
                  <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5">
                    <span className="font-semibold text-foreground block mb-1">Right to Erasure ("To Be Forgotten"):</span>
                    Request total deletion of your account, history, and workspace files.
                  </div>
                  <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5">
                    <span className="font-semibold text-foreground block mb-1">Right to Data Portability:</span>
                    Export your saved code snippets in machine-readable JSON / raw format.
                  </div>
                </div>
              </div>
            </section>

            {/* Section 10 */}
            <section
              id="contact"
              className="scroll-mt-28 rounded-2xl border border-primary/30 bg-gradient-to-br from-card/90 via-card/70 to-primary/5 p-6 sm:p-8 backdrop-blur-xl shadow-md"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                  <Mail className="h-5 w-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  10. Contact & Privacy Inquiries
                </h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If you have questions about this Privacy Policy, your code security, or wish to exercise your data privacy rights, please reach out directly:
              </p>
              <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <a
                  href="mailto:support@codesroom.in"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95 transition"
                >
                  <Mail className="h-4 w-4" /> Email support@codesroom.in
                </a>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/80 px-5 py-2.5 text-sm font-medium hover:bg-accent transition"
                >
                  Back to CodesRoom
                </Link>
              </div>
              <p className="mt-4 text-[11px] text-muted-foreground">
                We typically respond to developer privacy and data requests within 2 business days.
              </p>
            </section>
          </article>
        </div>
      </main>

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll back to top"
          className="fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
