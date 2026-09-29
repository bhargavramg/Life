import { useState, useEffect } from 'react';
import api from '../api';
import { format, subDays, addDays } from 'date-fns';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

export default function MyDay() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [defaultDateForNew, setDefaultDateForNew] = useState(format(new Date(), 'yyyy-MM-dd'));

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');

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

  const openNewTask = (date: string) => {
    setTaskToEdit(null);
    setDefaultDateForNew(date);
    setIsModalOpen(true);
  };

  if (loading) return <div>Loading...</div>;

  const yesterdayTasks = tasks.filter(t => t.date === yesterdayStr);
  const todayTasks = tasks.filter(t => t.date === todayStr);
  const tomorrowTasks = tasks.filter(t => t.date === tomorrowStr);

  const Column = ({ title, date, dateLabel, tasksList, isToday = false }: any) => {
    const unfinished = tasksList.filter((t: any) => t.status !== 'Completed');
    
    return (
      <div className="flex flex-col h-full bg-card border border-border rounded-xl shadow-sm overflow-hidden min-w-[300px] w-full md:w-1/3 shrink-0">
        <div className="p-4 border-b border-border bg-gray-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold text-textSecondary uppercase tracking-wider">{title}</h3>
            <p className={`text-lg font-bold mt-0.5 ${isToday ? 'text-brand-600' : 'text-textPrimary'}`}>{dateLabel}</p>
          </div>
          <div className="text-xs font-semibold bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full">
            {unfinished.length}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/50">
          {tasksList.length === 0 ? (
            <div className="text-center py-8 text-sm text-textSecondary">
              Nothing scheduled
            </div>
          ) : (
            tasksList
              .sort((a: any, _b: any) => (a.status === 'Completed' ? 1 : -1))
              .map((task: any) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onUpdate={fetchTasks}
                  onEdit={(t: any) => { setTaskToEdit(t); setIsModalOpen(true); }}
                  showMoveToToday={title === 'Yesterday'}
                  onMoveToToday={handleMoveToToday}
                />
              ))
          )}
        </div>
        
        <div className="p-3 border-t border-border bg-card">
          <button 
            onClick={() => openNewTask(date)}
            className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-medium text-textSecondary hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
          >
            <span className="text-lg leading-none">+</span> Add task
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-textPrimary">My Day</h1>
        <p className="text-textSecondary mt-1">Plan, act, complete, carry forward.</p>
      </div>

      <div className="flex-1 flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory hide-scrollbar">
        <div className="snap-center w-[90vw] md:w-auto shrink-0 flex">
          <Column 
            title="Yesterday" 
            date={yesterdayStr} 
            dateLabel={format(subDays(new Date(), 1), 'MMM d')} 
            tasksList={yesterdayTasks} 
          />
        </div>
        <div className="snap-center w-[90vw] md:w-auto shrink-0 flex">
          <Column 
            title="Today" 
            date={todayStr} 
            dateLabel={format(new Date(), 'MMM d')} 
            tasksList={todayTasks} 
            isToday={true}
          />
        </div>
        <div className="snap-center w-[90vw] md:w-auto shrink-0 flex">
          <Column 
            title="Tomorrow" 
            date={tomorrowStr} 
            dateLabel={format(addDays(new Date(), 1), 'MMM d')} 
            tasksList={tomorrowTasks} 
          />
        </div>
      </div>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={(refresh?: boolean) => {
          setIsModalOpen(false);
          if (refresh) fetchTasks();
        }} 
        taskToEdit={taskToEdit} 
        defaultDate={defaultDateForNew}
      />
    </div>
  );
}
