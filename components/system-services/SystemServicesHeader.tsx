import { BellRing, LockKeyhole, Plus, ShieldCheck } from "lucide-react";

type Props = {
  reminderDisabled: boolean;
  onReminderDefaults: () => void;
  onAddService: () => void;
};

export default function SystemServicesHeader({ reminderDisabled, onReminderDefaults, onAddService }: Props) {
  return (
    <header className="relative overflow-hidden rounded-xl border border-slate-200/90 bg-white/95 px-4 py-2.5 text-slate-900 shadow-md backdrop-blur-md">
      <div className="relative flex items-center justify-between gap-3 whitespace-nowrap overflow-x-auto">
        <div className="flex items-center gap-2.5 whitespace-nowrap min-w-0">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-emerald-200 bg-emerald-50 text-[#075D3D]"><ShieldCheck size={16} strokeWidth={2.2} /></span>
          <h1 className="m-0 text-[16px] font-extrabold leading-none tracking-tight text-[#075D3D] whitespace-nowrap">System &amp; Security</h1>
          <span className="text-slate-300 font-bold">·</span>
          <p className="m-0 text-[11px] font-bold text-slate-600 whitespace-nowrap">Protected service and infrastructure records</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
          <button className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[10.5px] font-bold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm" onClick={onReminderDefaults} disabled={reminderDisabled}><BellRing size={12} /> Reminder Defaults</button>
          <button className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#075D3D] px-3.5 text-[10.5px] font-bold text-white shadow-md transition hover:bg-[#054930]" onClick={onAddService}><Plus size={12} /> Add Service</button>
        </div>
      </div>
    </header>
  );
}
