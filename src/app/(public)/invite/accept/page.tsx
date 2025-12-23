import { Suspense } from "react";
import AcceptInviteClient from "../../../../components/accept-invite-client";

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh grid place-items-center p-6">
          <div className="card w-full max-w-md p-6 text-center">
            <h1 className="text-xl font-semibold mb-2">Invitation</h1>
            <p className="text-zinc-300">Loading invitation…</p>
          </div>
        </main>
      }
    >
      <AcceptInviteClient />
    </Suspense>
  );
}
