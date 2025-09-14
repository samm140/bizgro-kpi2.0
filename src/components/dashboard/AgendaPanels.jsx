import React from 'react';
import {
  Megaphone,
  ClipboardList,
  LineChart,
  DollarSign,
  Users,
  Flag,
  Target,
  FileText,
  Mic,
} from 'lucide-react';

const Badge = ({ children }) => (
  <span className="inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-md bg-slate-700/60 text-slate-300 border border-slate-600">
    {children}
  </span>
);

const Item = ({ icon: Icon, title, text }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 shrink-0">
      <div className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-slate-700/70 border border-slate-600">
        <Icon className="h-4 w-4 text-slate-200" />
      </div>
    </div>
    <div>
      <div className="text-sm font-semibold text-slate-200">{title}</div>
      <div className="text-sm text-slate-400">{text}</div>
    </div>
  </div>
);

const AgendaCard = ({ title, subtitle, items }) => (
  <div className="bg-slate-800/60 rounded-2xl border border-slate-700 shadow-sm p-6">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <Badge>
        <Mic className="h-3.5 w-3.5" />
        Calls recorded with AI notetaker
      </Badge>
    </div>

    <div className="grid sm:grid-cols-2 gap-5">
      {items.map((it, i) => (
        <Item key={i} icon={it.icon} title={it.title} text={it.text} />
      ))}
    </div>

    <div className="mt-6 pt-4 border-t border-slate-700 text-[13px] text-slate-300">
      <strong className="text-slate-200">At BizGro Partners, Inc.,</strong> our core values encompass
      transparency, a family-oriented atmosphere, the utilization of group intelligence, inclusive
      decision-making, professionalism, effective leadership, communication, and respect for all.
    </div>
  </div>
);

export default function AgendaPanels() {
  const kpiCallItems = [
    {
      icon: Megaphone,
      title: 'Overview',
      text:
        'Board Manager will ask President to provide an overview of Sales, Operations, Finance & Accounting.',
    },
    {
      icon: ClipboardList,
      title: 'Task Checklist',
      text:
        "BizGro's VP of Operations will go over task checklist items with the Executive Management Team.",
    },
    {
      icon: LineChart,
      title: 'KPI Overview',
      text:
        'Members of the executive team will speak to their respective KPIs under management responsibility.',
    },
    {
      icon: Flag,
      title: 'Final Items',
      text: 'Key budget items, talent needs, or other Org Chart compliance issues.',
    },
    {
      icon: DollarSign,
      title: 'Cash Variance',
      text:
        'Controller, with President's assistance, will review Cash Variance with the Board Manager.',
    },
  ];

  const boardMeetingItems = [
    {
      icon: Megaphone,
      title: 'Board Manager Overview',
      text:
        'Board Manager will highlight overall company performance and a synopsis of direction.',
    },
    {
      icon: Target,
      title: 'Executive Overview',
      text:
        'President provides overview of last week with focus on Sales, Operations, Finance & Admin.',
    },
    {
      icon: FileText,
      title: 'Financial Overview',
      text:
        'BizGro rep will review monthly, quarterly, and trailing 12-month P&Ls and other reports. Board Manager participates.',
    },
    {
      icon: Users,
      title: 'Stakeholder & Mgmt Feedback',
      text:
        'A call to all management to provide feedback and perspective.',
    },
    {
      icon: ClipboardList,
      title: 'Task Checklist',
      text:
        'VP of Operations to go over checklist with the Executive Management Team.',
    },
    {
      icon: LineChart,
      title: 'Operational Overview',
      text:
        'Business plan, operational report review, recruitment initiatives, operations KPIs, team performance.',
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-200">Meeting Agendas</h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <AgendaCard title="Agenda for KPI Calls" items={kpiCallItems} />
        <AgendaCard title="Agenda for Board Meetings" items={boardMeetingItems} />
      </div>
    </section>
  );
}
