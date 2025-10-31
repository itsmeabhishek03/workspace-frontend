// app/pricing/page.tsx
"use client";

import Link from "next/link";

export default function PricingPage() {
  const tiers = [
    {
      name: "Starter",
      price: "Free",
      blurb: "For small teams exploring Workspace Chat.",
      cta: "Get started",
      features: [
        "Up to 1 workspace",
        "Unlimited channels",
        "Basic roles (owner/admin/member)",
        "Email invites",
        "Community support",
      ],
    },
    {
      name: "Pro",
      price: "$8",
      suffix: "/user/mo",
      highlight: true,
      blurb: "For growing teams that need more control.",
      cta: "Start Pro",
      features: [
        "Unlimited workspaces",
        "Advanced member management",
        "Priority email support",
        "Usage analytics (coming soon)",
        "Audit logs (coming soon)",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      blurb: "Security, compliance, and custom contracts.",
      cta: "Contact sales",
      features: [
        "SAML/SSO",
        "Data residency",
        "Custom retention",
        "Dedicated support",
        "Uptime SLA",
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-semibold">Simple, transparent pricing</h1>
        <p className="mt-3 text-zinc-300">
          Start free, upgrade as your team grows.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`card p-6 ${
              t.highlight ? "ring-1 ring-purple-400/30" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-lg font-medium">{t.name}</div>
              {t.highlight && (
                <span className="text-xs px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-300/30">
                  Popular
                </span>
              )}
            </div>

            <div className="mt-2 text-3xl font-semibold">
              {t.price}{" "}
              {t.suffix && (
                <span className="text-base text-zinc-400">{t.suffix}</span>
              )}
            </div>
            <p className="mt-1 text-sm text-zinc-400">{t.blurb}</p>

            <ul className="mt-5 space-y-2 text-sm">
              {t.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                  <span className="text-zinc-300">{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <Link
                href={
                  t.name === "Enterprise"
                    ? "mailto:sales@example.com"
                    : "/register"
                }
                className={`btn ${
                  t.highlight ? "btn-primary w-full" : "btn-ghost w-full"
                }`}
              >
                {t.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-zinc-500">
        Prices in USD. Taxes may apply.
      </p>
    </div>
  );
}
