"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, ChevronDown, ListChecks, Wallet } from 'lucide-react';
import { apiClient } from '@/components/infrastructure/lib/client';
import { cn } from '@/components/infrastructure/lib/cn';
import { useCanManage } from './permissions';

type Task = { _id: string; name: string; status: string; payload?: { priority?: string } };
type Alert = { _id: string; title: string; message: string; readAt?: string };
type Usage = { runs: number; estimatedCostUsd: number; inputTokens: number; outputTokens: number; reservations: { costUsd: number; tokens: number; calls: number }; note: string };

const STATUS_LABEL: Record<string, string> = { pending: 'To do', doing: 'In progress', done: 'Done' };
const STATUS_CLS: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-700 border-slate-200',
  doing: 'bg-amber-50 text-amber-800 border-amber-200',
  done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};
const PRIORITY_CLS: Record<string, string> = { high: 'bg-red-50 text-red-700', medium: 'bg-amber-50 text-amber-800', low: 'bg-slate-100 text-slate-600' };

function Card({ title, icon: Icon, tone, count, children }: { title: string; icon: typeof Bell; tone: string; count?: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0 rounded-lg border border-[#E6EBF4] bg-white">
      <header className="flex items-center justify-between gap-2 border-b border-[#EEF2F8] px-3 py-2">
        <h3 className="flex items-center gap-2 text-[12px] font-semibold text-[#111C3A]">
          <span className={cn('grid size-6 place-items-center rounded-md', tone)}><Icon className="size-3.5" aria-hidden /></span>
          {title}
        </h3>
        {count ? <span className="rounded-full bg-[#F1F4F9] px-2 py-0.5 text-[10.5px] font-medium text-[#4B5872]">{count}</span> : null}
      </header>
      <div className="p-3">{children}</div>
    </section>
  );
}

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-md bg-[#F8FAFD] px-2.5 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-[#6B7A94]">{label}</p>
      <p className="text-[15px] font-semibold tabular-nums text-[#111C3A]">{value}</p>
      {sub ? <p className="text-[10.5px] text-[#94A3B8]">{sub}</p> : null}
    </div>
  );
}

export function AnalyzerOperations() {
  const manage = useCanManage(), cache = useQueryClient();
  const query = useQuery({
    queryKey: ['analyzer-operations'],
    queryFn: async () => {
      const [tasks, alerts, usage] = await Promise.all([
        apiClient.request<Task[]>({ method: 'GET', path: '/competitor-analyzer/tasks' }),
        apiClient.request<Alert[]>({ method: 'GET', path: '/competitor-analyzer/alerts' }),
        apiClient.request<Usage>({ method: 'GET', path: '/competitor-analyzer/usage' }),
      ]);
      return { tasks, alerts, usage };
    },
  });
  const mutation = useMutation({
    mutationFn: ({ path, body }: { path: string; body: unknown }) => apiClient.request({ method: 'PATCH', path, body }),
    onSuccess: () => Promise.all([cache.invalidateQueries({ queryKey: ['analyzer-operations'] }), cache.invalidateQueries({ queryKey: ['competitor-analyzer'] })]),
  });
  const data = query.data;
  const openTasks = data?.tasks.filter((t) => t.status !== 'done').length ?? 0;
  const unread = data?.alerts.filter((a) => !a.readAt).length ?? 0;
  return (
    <details className="group rounded-xl border border-[#E6EBF4] bg-white normal-case shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block text-[13px] font-semibold text-[#111C3A]">Tasks, change alerts and usage</span>
          <span className="block text-[11px] text-[#6B7A94]">Follow up on actions, see what changed on competitor sites, and watch today’s AI use.</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {data ? (
            <>
              <span className="rounded-full bg-[#EFF4FC] px-2 py-0.5 text-[10.5px] font-medium text-[#2563EB]">{openTasks} open task{openTasks === 1 ? '' : 's'}</span>
              <span className={cn('rounded-full px-2 py-0.5 text-[10.5px] font-medium', unread ? 'bg-[#FFFBEB] text-[#92400E]' : 'bg-[#F1F4F9] text-[#6B7A94]')}>{unread} new alert{unread === 1 ? '' : 's'}</span>
            </>
          ) : null}
          <ChevronDown className="size-4 text-[#94A3B8] transition-transform group-open:rotate-180" aria-hidden />
        </span>
      </summary>
      <div className="border-t border-[#EEF2F8] p-3">
        {query.isPending ? <p className="text-xs text-[#6B7A94]">Loading…</p> : query.error ? <p role="alert" className="text-xs text-red-700">{query.error.message}</p> : data ? (
          <div id="analyzer-tasks" className="grid gap-3 lg:grid-cols-3">
            <Card title="Action tasks" icon={ListChecks} tone="bg-[#EFF4FC] text-[#2563EB]" count={data.tasks.length ? `${data.tasks.length}` : undefined}>
              {data.tasks.length ? (
                <ul className="max-h-64 space-y-1.5 overflow-y-auto">
                  {data.tasks.map((task) => (
                    <li key={task._id} className="rounded-md border border-[#EEF2F8] p-2 text-xs">
                      <p className={cn('leading-snug text-[#28354C]', task.status === 'done' && 'text-[#94A3B8] line-through')}>{task.name}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {task.payload?.priority ? <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', PRIORITY_CLS[task.payload.priority] ?? PRIORITY_CLS.low)}>{task.payload.priority} priority</span> : null}
                        {manage ? (
                          <select
                            aria-label={`Status for ${task.name}`}
                            value={task.status}
                            disabled={mutation.isPending}
                            onChange={(e) => mutation.mutate({ path: `/competitor-analyzer/tasks/${task._id}`, body: { status: e.target.value } })}
                            className={cn('h-6 rounded-md border px-1.5 text-[11px] font-medium', STATUS_CLS[task.status] ?? STATUS_CLS.pending)}
                          >
                            <option value="pending">To do</option>
                            <option value="doing">In progress</option>
                            <option value="done">Done</option>
                          </select>
                        ) : (
                          <span className={cn('rounded-md border px-1.5 py-0.5 text-[11px] font-medium', STATUS_CLS[task.status] ?? STATUS_CLS.pending)}>{STATUS_LABEL[task.status] ?? task.status}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-xs text-[#6B7A94]">No action tasks yet. Open a report’s Action Plan and choose “Create action task”.</p>}
            </Card>

            <Card title="Your change alerts" icon={Bell} tone="bg-[#FFFBEB] text-[#B45309]" count={unread ? `${unread} new` : undefined}>
              {data.alerts.length ? (
                <ul className="max-h-64 space-y-1.5 overflow-y-auto">
                  {data.alerts.map((alert) => (
                    <li key={alert._id} className={cn('rounded-md border p-2 text-xs', alert.readAt ? 'border-[#EEF2F8]' : 'border-[#FDE68A] bg-[#FFFBEB]/60')}>
                      <p className="font-medium text-[#111C3A]">{alert.title}</p>
                      <p className="mt-0.5 leading-snug text-[#4B5872]">{alert.message}</p>
                      {!alert.readAt ? (
                        <button className="mt-1 font-medium text-[#2563EB] hover:underline" disabled={mutation.isPending} onClick={() => mutation.mutate({ path: `/competitor-analyzer/alerts/${alert._id}`, body: {} })}>Mark read</button>
                      ) : <p className="mt-1 text-[10.5px] text-[#94A3B8]">Read</p>}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-xs text-[#6B7A94]">No change alerts yet. You get one when a competitor changes something important between checks.</p>}
            </Card>

            <Card title="Today’s usage (UTC)" icon={Wallet} tone="bg-[#ECFDF5] text-[#047857]">
              <div className="grid grid-cols-2 gap-2">
                <Tile label="Checks run" value={`${data.usage.runs}`} />
                <Tile label="AI cost" value={`$${data.usage.estimatedCostUsd.toFixed(4)}`} sub="estimated" />
                <Tile label="Input tokens" value={data.usage.inputTokens.toLocaleString()} />
                <Tile label="Output tokens" value={data.usage.outputTokens.toLocaleString()} />
              </div>
              <p className="mt-2 text-[11px] text-[#4B5872]">Reserved now: <b className="font-semibold">${data.usage.reservations.costUsd.toFixed(4)}</b> · {data.usage.reservations.tokens.toLocaleString()} tokens</p>
              <p className="mt-1 text-[10.5px] leading-snug text-[#94A3B8]">{data.usage.note}</p>
            </Card>
          </div>
        ) : null}
        {mutation.error ? <p role="alert" className="mt-2 text-xs text-red-700">{mutation.error.message}</p> : null}
      </div>
    </details>
  );
}
