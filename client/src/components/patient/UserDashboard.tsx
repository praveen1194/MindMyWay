import { useState, useEffect } from 'react';
import Header from '../layout/Header';
import RiskAssessmentBanner from '../shared/RiskAssessment';
import { api } from '../../lib/api';
import type { DashboardData } from '../../types';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { TrendingUp, Zap, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';

interface UserDashboardProps {
  patientId: string;
}

export default function UserDashboard({ patientId }: UserDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await api.getDashboard(patientId);
      setData(result);
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [patientId]);

  if (loading) {
    return (
      <div>
        <Header title="Dashboard" />
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={24} className="animate-spin text-indigo-400" />
        </div>
      </div>
    );
  }

  if (!data) return <div className="p-4 text-center text-sm text-slate-500">Unable to load dashboard</div>;

  const { checkins, insights, riskAssessment, symptomFrequency, stressSourceCounts, goodDaySources } = data;

  // Prepare chart data
  const chartData = checkins.map((c: any) => ({
    date: c.date.slice(5), // MM-DD
    mood: c.mood,
    energy: c.energy,
    stress: c.stress,
    sleep: c.sleep_hours,
  }));

  // Parse insights
  const weeklyReflection = insights?.find((i: any) => i.type === 'weekly_reflection');
  const aiParagraph = insights?.find((i: any) => i.type === 'ai_paragraph');
  let reflectionData: any = null;
  try {
    reflectionData = weeklyReflection ? JSON.parse(weeklyReflection.content) : null;
  } catch { reflectionData = null; }

  // Stress source ranking
  const stressRanking = Object.entries(stressSourceCounts || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 3);

  // Symptom frequency chart data
  const symptomChartData = symptomFrequency.map((s: any) => ({
    name: s.symptom.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    days: s.frequency,
  }));

  return (
    <div className="pb-24">
      <Header title="Dashboard" right={
        <button onClick={loadData} className="p-1.5 rounded-lg hover:bg-slate-100">
          <RefreshCw size={16} className="text-slate-400" />
        </button>
      } />

      {/* Risk assessment banner */}
      {riskAssessment?.high_risk && (
        <RiskAssessmentBanner
          patientId={patientId}
          assessment={riskAssessment}
          onConsentUpdate={loadData}
        />
      )}

      <div className="px-4 py-3 space-y-4">
        {/* AI Paragraph */}
        {aiParagraph && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={14} className="text-indigo-500" />
              <span className="text-xs font-semibold text-indigo-600">Your Reflection</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{aiParagraph.content}</p>
          </div>
        )}

        {/* Mood/Energy/Stress Chart */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
            <TrendingUp size={14} className="text-indigo-500" />
            2-Week Tendencies
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} />
              <Line type="monotone" dataKey="mood" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} name="Mood" />
              <Line type="monotone" dataKey="energy" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Energy" />
              <Line type="monotone" dataKey="stress" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Stress" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sleep Chart */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Sleep Hours</h3>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis domain={[0, 12]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} />
              <Bar dataKey="sleep" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Sleep (hrs)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Reflection */}
        {reflectionData && (
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">Weekly Reflection</h3>
            <p className="text-sm text-slate-600">{reflectionData.summary}</p>
            {reflectionData.insight && (
              <div className="p-3 rounded-xl bg-indigo-50">
                <p className="text-sm text-indigo-700 font-medium">{reflectionData.insight}</p>
              </div>
            )}
            {reflectionData.suggestion && (
              <p className="text-xs text-slate-500 italic">{reflectionData.suggestion}</p>
            )}
          </div>
        )}

        {/* Energy Boosters */}
        {(reflectionData?.energyBoosters?.length > 0 || goodDaySources?.length > 0) && (
          <div className="p-4 rounded-2xl bg-white border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Zap size={14} className="text-emerald-500" />
              Your Top Energy Boosters
            </h3>
            <div className="space-y-1.5">
              {(reflectionData?.energyBoosters || goodDaySources || []).map((b: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 text-xs flex items-center justify-center font-medium">{i + 1}</span>
                  {b}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common Stress Triggers */}
        {(reflectionData?.stressTriggers?.length > 0 || stressRanking.length > 0) && (
          <div className="p-4 rounded-2xl bg-white border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-amber-500" />
              Common Stress Triggers
            </h3>
            <div className="space-y-1.5">
              {(reflectionData?.stressTriggers || stressRanking.map(([k]) => k) || []).map((t: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 text-xs flex items-center justify-center font-medium">{i + 1}</span>
                  {t}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Symptom Frequency */}
        {symptomChartData.length > 0 && (
          <div className="p-4 rounded-2xl bg-white border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Symptom Frequency (14 days)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={symptomChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} stroke="#94a3b8" width={100} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} />
                <Bar dataKey="days" fill="#6366f1" radius={[0, 4, 4, 0]} name="Days" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
