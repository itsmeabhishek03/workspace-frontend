// app/faq/page.tsx
"use client";

import { useState } from "react";

const faqs = [
  {
    q: "What is a workspace?",
    a: "A workspace is a top-level space for your team. It contains channels, members, and settings.",
  },
  {
    q: "How do invites work?",
    a: "Admins/Owners can send email invites. When the recipient accepts, they join the workspace with the assigned role.",
  },
  {
    q: "Do you support real-time messaging?",
    a: "Yes—Socket.IO powers live message updates. Messages also use optimistic sending for snappy UX.",
  },
  {
    q: "Can I change roles later?",
    a: "Owners can promote/demote any member (with safeguards like preventing removal of the last owner). Admins can manage members.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes! The Starter tier is free and great for small teams. You can upgrade any time.",
  },
];

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-semibold text-center">
        Frequently asked questions
      </h1>
      <p className="mt-3 text-zinc-300 text-center">
        Everything you need to know.
      </p>

      <div className="mt-10 space-y-3">
        {faqs.map((item, idx) => (
          <FAQItem key={idx} {...item} />
        ))}
      </div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card p-4">
      <button
        className="w-full text-left flex items-center justify-between gap-2"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="text-sm font-medium">{q}</span>
        <span className="text-zinc-400">{open ? "–" : "+"}</span>
      </button>
      {open && <p className="mt-2 text-sm text-zinc-400">{a}</p>}
    </div>
  );
}
