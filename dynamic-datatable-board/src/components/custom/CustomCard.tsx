import React from 'react';

interface CustomCardProps {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
  gradientFrom?: string;
  gradientTo?: string;
  iconBgClass?: string;
  iconTextClass?: string;
}

export function CustomCard({
  icon,
  title,
  value,
  gradientFrom = 'from-white',
  gradientTo = 'to-white',
  iconBgClass = 'bg-slate-50 border-slate-100',
  iconTextClass = 'text-slate-700'
}: CustomCardProps) {
  return (
    <div className={`p-5 flex items-center gap-4 rounded-xl border border-slate-200/60 bg-gradient-to-br ${gradientFrom} ${gradientTo} hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 shadow-2xs`}>
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform duration-300 hover:rotate-6 ${iconBgClass} ${iconTextClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-sans">{title}</p>
        <h4 className="text-xl md:text-2xl font-black text-slate-800 leading-none mt-1.5 font-sans tracking-tight">
          {value}
        </h4>
      </div>
    </div>
  );
}
