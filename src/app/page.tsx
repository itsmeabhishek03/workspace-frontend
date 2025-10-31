// app/page.tsx
"use client";

import Link from "next/link";

function Logo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="h-6 w-6 rounded-xl bg-gradient-to-br from-purple-400 to-blue-400" />
      <span className="text-sm font-semibold tracking-wide">
        Workspace Chat
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* subtle background orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      {/* navbar */}
      <header className="sticky top-0 z-40 bg-black/10 backdrop-blur supports-[backdrop-filter]:bg-black/10">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-300">
            <a href="#features" className="hover:text-white">
              Features
            </a>
            <a href="#how" className="hover:text-white">
              How it works
            </a>
            <a href="/pricing" className="hover:text-white">
              Pricing
            </a>
            <a href="/faq" className="hover:text-white">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link className="btn btn-ghost" href="/login">
              Sign in
            </Link>
            <Link className="btn btn-primary" href="/register">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* hero */}
      <main>
        <section className="mx-auto max-w-6xl px-4 pt-16 pb-14 md:pt-24 md:pb-20">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h1 className="text-4xl/tight md:text-5xl/tight font-semibold">
                Chat that feels{" "}
                <span className="gradient-text">fast, clean, and focused</span>.
              </h1>
              <p className="mt-4 text-zinc-300">
                Organize conversations by{" "}
                <span className="text-white">workspaces</span> &{" "}
                <span className="text-white">channels</span>, invite teammates
                with one click, and collaborate in a modern, minimal interface.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link className="btn btn-primary" href="/register">
                  Create your workspace
                </Link>
                <Link className="btn btn-ghost" href="/login">
                  I already have an account
                </Link>
              </div>

              {/* trusted by */}
              <div className="mt-10">
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  Trusted by teams at
                </p>
                <div className="mt-3 grid grid-cols-3 sm:flex sm:flex-wrap sm:items-center gap-4 opacity-80">
                  {["NovaTech", "Acme", "Helix", "Orbit", "Yumi"].map((n) => (
                    <div
                      key={n}
                      className="h-8 rounded-lg border border-white/10 px-3 text-xs flex items-center justify-center text-zinc-400"
                    >
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* mock preview card */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-purple-500/10 to-blue-500/10 blur-2xl" />
              <div className="card relative overflow-hidden">
                <div className="border-b border-white/10 px-4 py-3 text-sm text-zinc-400 flex items-center justify-between">
                  <span>
                    Workspace •{" "}
                    <span className="text-zinc-200">Design Team</span>
                  </span>
                  <span className="text-zinc-500">preview</span>
                </div>

                <div className="grid md:grid-cols-[220px_1fr]">
                  {/* sidebar */}
                  <aside className="border-r border-white/10 p-3">
                    <div className="text-xs text-zinc-500 mb-2">Channels</div>
                    {[
                      "general",
                      "announcements",
                      "design-reviews",
                      "random",
                    ].map((ch, i) => (
                      <div
                        key={ch}
                        className={`mb-1 rounded-lg px-3 py-2 text-sm ${
                          i === 2
                            ? "bg-white/10 text-white"
                            : "hover:bg-white/5 text-zinc-200"
                        }`}
                      >
                        #{ch}
                      </div>
                    ))}
                    <div className="mt-3">
                      <button className="btn btn-ghost w-full text-xs">
                        + New channel
                      </button>
                    </div>
                  </aside>

                  {/* messages */}
                  <section className="p-3">
                    <div className="text-xs text-zinc-500 mb-2">
                      #design-reviews
                    </div>
                    <div className="space-y-2">
                      {[
                        {
                          u: "Ava",
                          t: "Can someone review the new dashboard mock?",
                        },
                        {
                          u: "Liam",
                          t: "Left comments—looks great! Just one spacing nit.",
                        },
                        { u: "Zoe", t: "Pushed a fix. Ready to merge ✅" },
                      ].map((m, i) => (
                        <div
                          key={i}
                          className="flex gap-3 items-start p-3 rounded-xl border border-white/10 bg-[#111114]/60"
                        >
                          <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center text-xs">
                            {m.u[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium">{m.u}</div>
                            <div className="text-sm text-zinc-300">{m.t}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <input className="input" placeholder="Write a message…" />
                      <button className="btn btn-primary">Send</button>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* features */}
        <section
          id="features"
          className="mx-auto max-w-6xl px-4 py-14 md:py-22"
        >
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-semibold">
              Everything you need—nothing you don’t
            </h2>
            <p className="mt-3 text-zinc-300">
              Simple, fast, and clean. Built for focus.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Workspaces & Channels",
                desc: "Organize your teams and projects with clean separation.",
                icon: (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    className="text-purple-300"
                  >
                    <path
                      fill="currentColor"
                      d="M3 5a2 2 0 0 1 2-2h6v6H3V5Zm10-2h6a2 2 0 0 1 2 2v4h-8V3ZM3 13h8v8H5a2 2 0 0 1-2-2v-6Zm18 0v6a2 2 0 0 1-2 2h-6v-8h8Z"
                    />
                  </svg>
                ),
              },
              {
                title: "Invites & Roles",
                desc: "Send email invites. Control access with member, admin, and owner roles.",
                icon: (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    className="text-blue-300"
                  >
                    <path
                      fill="currentColor"
                      d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5Zm-9 9a9 9 0 1 1 18 0H3Z"
                    />
                  </svg>
                ),
              },
              {
                title: "Real-time Messaging",
                desc: "Socket-powered updates. Fast optimistic sends, no reloads.",
                icon: (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    className="text-emerald-300"
                  >
                    <path
                      fill="currentColor"
                      d="M4 4h16v11H5.17L4 16.17V4Zm2 3h12v2H6V7Zm0 4h9v2H6v-2Z"
                    />
                  </svg>
                ),
              },
              {
                title: "Modern UI",
                desc: "Dark, minimal, and responsive—built with Tailwind v4.",
                icon: (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    className="text-pink-300"
                  >
                    <path
                      fill="currentColor"
                      d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v5H3V6Zm0 7h18v5a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-5Z"
                    />
                  </svg>
                ),
              },
              {
                title: "Secure by default",
                desc: "JWT auth, membership checks, and role-based guards.",
                icon: (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    className="text-cyan-300"
                  >
                    <path
                      fill="currentColor"
                      d="M12 2L4 5v6c0 5 3.4 9.7 8 11c4.6-1.3 8-6 8-11V5l-8-3Z"
                    />
                  </svg>
                ),
              },
              {
                title: "Email Invites",
                desc: "Resend integration with verified domain deliverability.",
                icon: (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    className="text-amber-300"
                  >
                    <path
                      fill="currentColor"
                      d="M20 4H4a2 2 0 0 0-2 2v.4l10 6.25L22 6.4V6a2 2 0 0 0-2-2Zm0 4.75l-8 5l-8-5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.75Z"
                    />
                  </svg>
                ),
              },
            ].map((f) => (
              <div key={f.title} className="card p-5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center">
                    {f.icon}
                  </div>
                  <div className="text-base font-medium">{f.title}</div>
                </div>
                <p className="mt-3 text-sm text-zinc-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* how it works */}
        <section id="how" className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                n: "01",
                t: "Create a workspace",
                d: "Sign up and name your team. Workspaces keep channels and members organized.",
              },
              {
                n: "02",
                t: "Invite teammates",
                d: "Send email invites with a role—member or admin. Owners control everything.",
              },
              {
                n: "03",
                t: "Start chatting",
                d: "Create channels and begin focused conversations. Real-time, clean, and fast.",
              },
            ].map((s) => (
              <div key={s.n} className="card p-6">
                <div className="text-xs text-zinc-500">{s.n}</div>
                <div className="mt-1 text-lg font-medium">{s.t}</div>
                <p className="mt-2 text-sm text-zinc-400">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Link href="/register" className="btn btn-primary">
              Get started free
            </Link>
          </div>
        </section>

        {/* CTA band */}
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="card p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold">
                Ready to focus your team?
              </h3>
              <p className="text-sm text-zinc-400 mt-1">
                Create a workspace and start chatting in under a minute.
              </p>
            </div>
            <div className="flex gap-2">
              <Link className="btn btn-primary" href="/register">
                Create workspace
              </Link>
              <Link className="btn btn-ghost" href="/login">
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo className="h-6" />
          <div className="text-xs text-zinc-500">
            © {new Date().getFullYear()} Workspace Chat. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <a className="hover:text-white" href="#pricing">
              Pricing
            </a>
            <a className="hover:text-white" href="#faq">
              FAQ
            </a>
            <a className="hover:text-white" href="mailto:support@example.com">
              Support
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
