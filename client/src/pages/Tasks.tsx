import { useState, useEffect } from 'react';
import api from '../api';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { Search } from 'lucide-react';

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [sortBy, setSortBy] = useState('date-asc');

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

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="p-8">Loading tasks...</div>;

  let filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' ? true : t.status === filterStatus;
    const matchesCategory = filterCategory === 'All' ? true : t.category?.name === filterCategory || t.categoryId === filterCategory;
    const matchesPriority = filterPriority === 'All' ? true : t.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  filteredTasks.sort((a, b) => {
    if (sortBy === 'date-asc') return a.date.localeCompare(b.date);
    if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-textPrimary">All Tasks</h1>
          <p className="text-textSecondary mt-1">Manage everything in one place</p>
        </div>
        <button 
          onClick={() => { setTaskToEdit(null); setIsModalOpen(true); }}
          className="hidden md:flex bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Add Task
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select 
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
          
          <select 
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          
          <select 
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none"
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          
          <select 
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="date-asc">Sort: Date (Oldest)</option>
            <option value="date-desc">Sort: Date (Newest)</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 mt-6">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-10 bg-card border border-border rounded-xl">
            <p className="text-textSecondary text-sm">No tasks match your criteria.</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onUpdate={fetchData}
              onEdit={(t: any) => { setTaskToEdit(t); setIsModalOpen(true); }}
            />
          ))
        )}
      </div>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={(refresh?: boolean) => {
          setIsModalOpen(false);
          if (refresh) fetchData();
        }} 
        taskToEdit={taskToEdit} 
      />
    </div>
  );
}
