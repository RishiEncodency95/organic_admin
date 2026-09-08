import { AlertTriangle, Check } from "lucide-react";

export type SystemServiceToast = { id: string; text: string; type: "ok" | "err" };

export default function SystemServiceToasts({ items }: { items: SystemServiceToast[] }) {
  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.id} className={`flex max-w-[360px] items-start gap-2.5 rounded-xl border px-4 py-3 text-xs font-semibold text-white shadow-[0_16px_40px_rgba(10,25,20,.25)] ${item.type === "err" ? "border-red-400/30 bg-red-700" : "border-emerald-300/20 bg-slate-950"}`}>
          <span className="mt-px shrink-0">{item.type === "err" ? <AlertTriangle size={15} /> : <Check size={15} className="text-emerald-400" />}</span>
          <span>{item.text}</span>
        </div>
      ))}
    </div>
  );
}
