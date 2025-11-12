import AuthGate from "components/AuthGate";

export default function AccountVerify() {
  return (
    <AuthGate>
      <div className="max-w-3xl mx-auto py-10 space-y-6">
        <h1 className="h1">Artist / Label Verification</h1>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-3">
          <p className="text-white/70 text-sm">Submit info to verify your artist or label profile.</p>
          <input className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2" placeholder="Artist/Label name" />
          <input className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2" placeholder="Website or social link" />
          <textarea className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2" rows={4} placeholder="Tell us about your releases" />
          <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899]">Submit</button>
        </div>
      </div>
    </AuthGate>
  );
}
