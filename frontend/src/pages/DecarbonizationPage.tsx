import React, { useEffect, useState } from 'react';
import { fetchDecarbonizationData } from '../services/api';
import { EmissionControlTech, DecarbonizationTimelineStage, AbatementPieItem, MultiDecadeTimelinePoint } from '../types';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Line
} from 'recharts';
import { Sparkles, Shield, CheckCircle2, AlertCircle, ArrowRight, Zap, Flame, Clock, Award } from 'lucide-react';

export const DecarbonizationPage: React.FC = () => {
  const [technologies, setTechnologies] = useState<EmissionControlTech[]>([]);
  const [timeline, setTimeline] = useState<DecarbonizationTimelineStage[]>([]);
  const [abatementPie, setAbatementPie] = useState<AbatementPieItem[]>([]);
  const [timelineGraph, setTimelineGraph] = useState<MultiDecadeTimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTech, setSelectedTech] = useState<EmissionControlTech | null>(null);

  useEffect(() => {
    fetchDecarbonizationData()
      .then((data) => {
        setTechnologies(data.technologies);
        setTimeline(data.timeline);
        setAbatementPie(data.abatementPie);
        setTimelineGraph(data.timelineGraph);
        if (data.technologies.length > 0) {
          setSelectedTech(data.technologies[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load decarbonization data', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Loading Decarbonization Roadmap & Emissions Control Engine...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-2 text-emerald-600 font-semibold text-xs tracking-wider uppercase mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Strategic Climate Engineering & Pathways</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Decarbonization Roadmap & Emission Control Methods
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
          Technological abatement levers, multi-decade emission pathways, and progressive policy phases for India's coal power fleet from 1990 to the 2070 Net Zero commitment.
        </p>
      </div>

      {/* Visual Analytics Row: Abatement Pie Chart + Multi-Decade Timeline Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual 1: Pie Chart - Carbon Abatement Potential Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <span>Carbon Abatement Potential by Technological Lever</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono border border-emerald-200">
                100% Wedge Analysis
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Distribution of required emission mitigation actions to achieve long-term power sector decarbonization
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={abatementPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={3}
                  dataKey="share_pct"
                  nameKey="name"
                >
                  {abatementPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: any, name: any, item: any) => [
                    `${value}% (${item.payload.abatement_potential_mt_yr} Mt CO₂/yr)`,
                    name
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Abatement Highlights */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
            <div className="bg-slate-50 rounded p-2">
              <span className="block text-[11px] text-slate-500 font-medium">RE Grid Substitution</span>
              <span className="text-sm font-bold text-emerald-600 font-mono">42.0%</span>
            </div>
            <div className="bg-slate-50 rounded p-2">
              <span className="block text-[11px] text-slate-500 font-medium">Fleet Modernization</span>
              <span className="text-sm font-bold text-blue-600 font-mono">30.5%</span>
            </div>
            <div className="bg-slate-50 rounded p-2">
              <span className="block text-[11px] text-slate-500 font-medium">CCUS & Deep Capture</span>
              <span className="text-sm font-bold text-purple-600 font-mono">16.5%</span>
            </div>
          </div>
        </div>

        {/* Visual 2: Multi-Decade Timeline Graph (1995 to 2070) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <span>National Emissions Trajectory Over the Ages (1995 – 2070)</span>
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono border border-blue-200">
                Panchamrit Pathway
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Historical coal emissions (1995–2024), Business-As-Usual (BAU) ceiling, and Target Mitigated Pathway
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineGraph} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="bauGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="mitigGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" unit=" Mt" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any, name: string) => [
                    `${val} Mt CO₂`,
                    name === 'bau_emissions_mt' ? 'Business-As-Usual (BAU)' : 'Mitigated Target Pathway'
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="bau_emissions_mt"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#bauGrad)"
                  name="bau_emissions_mt"
                />
                <Area
                  type="monotone"
                  dataKey="mitigated_emissions_mt"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#mitigGrad)"
                  name="mitigated_emissions_mt"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Peak Coal Projected: <b>2032 – 2035 (~1,180–1,250 Mt)</b></span>
            <span>Target: <b>Net Zero by 2070 (0 Mt Unabated)</b></span>
          </div>
        </div>
      </div>

      {/* Chronological Decarbonization Stages Across Timeline (1990 - 2070) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <span>Phased Decarbonization Stages Defined Over the Ages</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed transition stages illustrating regulatory evolution, technological milestones, and emission intensity targets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {timeline.map((stage) => (
            <div
              key={stage.stage}
              className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Stage {stage.stage}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700">{stage.period}</span>
                </div>

                <h4 className="font-bold text-sm text-slate-900">{stage.title}</h4>
                <p className="text-xs text-emerald-700 font-medium mb-3">{stage.focus}</p>

                <div className="space-y-1.5 mb-3 text-xs text-slate-600">
                  {stage.key_milestones.map((m, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-snug text-[11px]">{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Fleet Intensity:</span>
                <span className="font-mono font-bold text-slate-800">{stage.avg_emission_intensity_t_mwh} tCO₂/MWh</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emission Control Technologies Deep Dive */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <span>Emission Level Control Technologies & Abatement Methods</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Engineering characteristics, abatement potential, capital expenditures, advantages, and limitations.
          </p>
        </div>

        {/* Technology Selection Tabs */}
        <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-100">
          {technologies.map((tech) => (
            <button
              key={tech.id}
              onClick={() => setSelectedTech(tech)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTech?.id === tech.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tech.name}
            </button>
          ))}
        </div>

        {/* Active Technology Deep Dive Card */}
        {selectedTech && (
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase">
                  {selectedTech.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedTech.name}</h3>
                <p className="text-xs text-slate-600 font-medium">{selectedTech.primary_target}</p>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Abatement</span>
                  <span className="text-sm font-bold text-emerald-600 font-mono">{selectedTech.abatement_potential_co2_pct}</span>
                </div>
                <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Capex Level</span>
                  <span className="text-xs font-bold text-slate-800">{selectedTech.capex_requirement}</span>
                </div>
              </div>
            </div>

            {/* Grid of Advantages & Limitations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-emerald-100">
                <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-2 uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Key Advantages & Positive Climate Impacts
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {selectedTech.advantages.map((adv, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-lg p-4 border border-amber-100">
                <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-2 uppercase tracking-wide">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Engineering Limitations & Operational Impacts
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {selectedTech.limitations_and_impacts.map((lim, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                      <span>{lim}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Regulatory Status Footer */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900 flex items-center justify-between">
              <div>
                <span className="font-bold">Indian Regulatory Framework & Mandates:</span>{' '}
                <span>{selectedTech.regulatory_status}</span>
              </div>
              <span className="font-mono text-[11px] font-semibold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                {selectedTech.readiness_level}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
