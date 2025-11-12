import AuthGate from "components/AuthGate";

export default function AccountOverview() {
  return (
    <AuthGate>
      <div className="max-w-3xl mx-auto py-10 space-y-6">
        <h1 className="h1">Profile</h1>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-3">
          <div className="text-sm text-white/70">Display Name</div>
          <input className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2" placeholder="Your name" />
          <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15">Save</button>
        </div>
        <div className="text-sm text-white/50">More options: Settings · Verification (see menu)</div>
      </div>
    </AuthGate>
  );
}
