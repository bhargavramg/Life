import { useState, useEffect } from 'react';
import api from '../api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';

const COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'];

export default function Analytics() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, catsRes] = await Promise.all([
          api.get('/tasks'),
          api.get('/categories')
        ]);
        setTasks(tasksRes.data);
        setCategories(catsRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8">Loading analytics...</div>;

  // Key Metrics
  const totalCreated = tasks.length;
  const totalCompleted = tasks.filter(t => t.status === 'Completed').length;
  const completionRate = totalCreated === 0 ? 0 : Math.round((totalCompleted / totalCreated) * 100);
  const carriedForward = tasks.filter(t => t.carriedForwardFrom !== null).length;

  // Weekly Completion Chart Data
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  const weeklyData = last7Days.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayTasks = tasks.filter(t => t.date === dateStr);
    const completed = dayTasks.filter(t => t.status === 'Completed').length;
    return {
      name: format(date, 'EEE'),
      Completed: completed,
      Total: dayTasks.length
    };
  });

  // Category Breakdown Data
  const categoryData = categories.map(cat => {
    const catTasks = tasks.filter(t => t.categoryId === cat.id);
    return {
      name: cat.name,
      value: catTasks.length
    };
  }).filter(c => c.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-textPrimary">Analytics</h1>
        <p className="text-textSecondary mt-1">Track your productivity over time</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <p className="text-sm font-medium text-textSecondary uppercase tracking-wider">Tasks Created</p>
          <p className="text-3xl font-bold text-textPrimary mt-2">{totalCreated}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <p className="text-sm font-medium text-textSecondary uppercase tracking-wider">Completed</p>
          <p className="text-3xl font-bold text-brand-600 mt-2">{totalCompleted}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <p className="text-sm font-medium text-textSecondary uppercase tracking-wider">Completion Rate</p>
          <p className="text-3xl font-bold text-textPrimary mt-2">{completionRate}%</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <p className="text-sm font-medium text-textSecondary uppercase tracking-wider">Carried Forward</p>
          <p className="text-3xl font-bold text-orange-500 mt-2">{carriedForward}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-textPrimary mb-4">Last 7 Days</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} allowDecimals={false} />
                <Tooltip 
                  cursor={{fill: '#F8FAFC'}}
                  contentStyle={{borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Legend />
                <Bar dataKey="Total" fill="#BFDBFE" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Completed" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-textPrimary mb-4">Tasks by Category</h2>
          <div className="h-[300px]">
            {categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-textSecondary">
                No categorical data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: '1px solid #E2E8F0'}}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
