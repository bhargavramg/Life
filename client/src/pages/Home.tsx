import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { format,  } from 'date-fns';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

export default function Home() {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const todayTasks = tasks.filter(t => t.date === todayStr);
  const unfinishedYesterday = tasks.filter(t => t.date < todayStr && t.status !== 'Completed');
  
  const completedToday = todayTasks.filter(t => t.status === 'Completed').length;
  const totalToday = todayTasks.length;

  const handleMoveToToday = async (task: any) => {
    try {
      await api.put(`/tasks/${task.id}`, { 
        date: todayStr,
        carriedForwardFrom: task.id 
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-textPrimary">Good morning, {user?.name.split(' ')[0]} 👋</h1>
        <p className="text-textSecondary mt-1">{format(new Date(), 'EEEE, MMMM d')}</p>
      </header>

      {/* Today's Progress */}
      <section className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-medium text-textSecondary uppercase tracking-wider mb-3">Today's Progress</h2>
        <div className="flex items-end justify-between mb-2">
          <div className="text-3xl font-bold text-textPrimary">
            {completedToday} <span className="text-lg text-textSecondary font-medium">/ {totalToday}</span>
          </div>
          <div className="text-sm text-textSecondary font-medium">tasks completed</div>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-500 rounded-full transition-all duration-500"
            style={{ width: `${totalToday > 0 ? (completedToday / totalToday) * 100 : 0}%` }}
          />
        </div>
      </section>

      {/* Unfinished from yesterday */}
      {unfinishedYesterday.length > 0 && (
        <section className="bg-orange-50 border border-orange-200 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-orange-800 font-semibold mb-1">Yesterday</h2>
              <p className="text-orange-600 text-sm">You have {unfinishedYesterday.length} unfinished task{unfinishedYesterday.length > 1 ? 's' : ''}.</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {unfinishedYesterday.slice(0, 3).map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onUpdate={fetchTasks} 
                onEdit={(t: any) => { setTaskToEdit(t); setIsModalOpen(true); }}
                showMoveToToday={true}
                onMoveToToday={handleMoveToToday}
              />
            ))}
            {unfinishedYesterday.length > 3 && (
              <div className="text-sm text-orange-700 font-medium pt-2 text-center">
                + {unfinishedYesterday.length - 3} more tasks
              </div>
            )}
          </div>
        </section>
      )}

      {/* Today's Tasks */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-textPrimary">Today's Tasks</h2>
          <button 
            onClick={() => { setTaskToEdit(null); setIsModalOpen(true); }}
            className="text-brand-600 hover:text-brand-700 text-sm font-medium hidden md:block"
          >
            + Add Task
          </button>
        </div>
        
        <div className="space-y-3">
          {todayTasks.length === 0 ? (
            <div className="text-center py-10 bg-card border border-border rounded-xl">
              <p className="text-textSecondary text-sm">No tasks for today. Enjoy your day!</p>
              <button 
                onClick={() => { setTaskToEdit(null); setIsModalOpen(true); }}
                className="mt-3 px-4 py-2 bg-brand-50 text-brand-700 text-sm font-medium rounded-lg hover:bg-brand-100 transition-colors"
              >
                Add a task
              </button>
            </div>
          ) : (
            todayTasks
              .sort((a, _b) => (a.status === 'Completed' ? 1 : -1))
              .map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onUpdate={fetchTasks}
                  onEdit={(t: any) => { setTaskToEdit(t); setIsModalOpen(true); }}
                />
              ))
          )}
        </div>
      </section>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={(refresh?: boolean) => {
          setIsModalOpen(false);
          if (refresh) fetchTasks();
        }} 
        taskToEdit={taskToEdit} 
      />
    </div>
  );
}
