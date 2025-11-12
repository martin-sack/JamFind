import AuthGate from "components/AuthGate";

export default function AccountSettings() {
  return (
    <AuthGate>
      <div className="max-w-3xl mx-auto py-10 space-y-6">
        <h1 className="h1">Settings</h1>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <div className="text-sm text-white/70">Change Password</div>
          <input className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2" placeholder="Current password" type="password" />
          <input className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2" placeholder="New password" type="password" />
          <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899]">Update</button>
        </div>
      </div>
    </AuthGate>
  );
}
