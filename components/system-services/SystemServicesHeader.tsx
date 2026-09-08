import { BellRing, LockKeyhole, Plus, ShieldCheck } from "lucide-react";

type Props = {
  reminderDisabled: boolean;
  onReminderDefaults: () => void;
  onAddService: () => void;
};

export default function SystemServicesHeader({ reminderDisabled, onReminderDefaults, onAddService }: Props) {
  return (
    <header className="relative overflow-hidden rounded-xl border border-[#E4DDD3] bg-white px-4 py-3 text-[#261B15] shadow-[0_6px_18px_rgba(38,27,21,.045)] sm:px-5">
      <div className="pointer-events-none absolute -right-16 -top-24 size-56 rounded-full bg-[#F5ECDD] blur-2xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-[#DFD2BE] bg-[#F8F1E6] text-[#8B6A3E]"><ShieldCheck size={18} /></span>
          <div>
            <div className="flex flex-wrap items-center gap-2"><h1 className="m-0 text-[21px] font-bold leading-tight tracking-[-.03em]">System &amp; Security</h1><span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700"><LockKeyhole size={9} /> Secure session</span></div>
            <p className="mb-0 mt-0.5 text-[11px] font-medium normal-case text-[#81766E]">Infrastructure, subscriptions, renewals and operational access in one protected workspace.</p>
          </div>
        </div>
        <div className="flex gap-2 max-[560px]:w-full [&_button]:max-[560px]:flex-1">
          <button className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-[#D8D0C7] bg-white px-3.5 text-[11px] font-bold text-[#4A4039] transition hover:-translate-y-0.5 hover:border-[#C3B8AC] hover:bg-[#FAF8F5] disabled:cursor-not-allowed disabled:opacity-50" onClick={onReminderDefaults} disabled={reminderDisabled}><BellRing size={13} /> Reminder Defaults</button>
          <button className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-[#8B6A3E] px-3.5 text-[11px] font-bold text-white shadow-[0_5px_14px_rgba(104,74,41,.16)] transition hover:-translate-y-0.5 hover:bg-[#684A29]" onClick={onAddService}><Plus size={13} /> Add Service</button>
        </div>
      </div>
    </header>
  );
}
