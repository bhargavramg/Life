import { useState, useEffect } from 'react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  isSameMonth, isSameDay, addDays 
} from 'date-fns';
import api from '../api';
import TaskModal from '../components/TaskModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [defaultDate, setDefaultDate] = useState('');

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentMonth]);

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4 bg-card p-4 rounded-xl border border-border">
        <h2 className="text-xl font-bold text-textPrimary">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 border border-border rounded-lg hover:bg-gray-50">
            <ChevronLeft className="w-5 h-5 text-textSecondary" />
          </button>
          <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-2 text-sm font-medium border border-border rounded-lg hover:bg-gray-50">
            Today
          </button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 border border-border rounded-lg hover:bg-gray-50">
            <ChevronRight className="w-5 h-5 text-textSecondary" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const dateFormat = 'EEE';
    const days = [];
    let startDate = startOfWeek(currentMonth, { weekStarts: 1 });
    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="text-center font-medium text-xs text-textSecondary py-2 uppercase" key={i}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }
    return <div className="grid grid-cols-7 border-b border-border">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStarts: 1 });
    const endDate = endOfWeek(monthEnd, { weekStarts: 1 });

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        const dayStr = format(day, 'yyyy-MM-dd');
        
        // Find tasks for this day
        const dayTasks = tasks.filter(t => t.date === dayStr);

        days.push(
          <div
            className={cn(
              "min-h-[100px] border-r border-b border-border p-1 md:p-2 transition-colors flex flex-col",
              !isSameMonth(day, monthStart) ? "bg-gray-50/50 text-gray-400" : "bg-card text-textPrimary hover:bg-gray-50",
              isSameDay(day, new Date()) ? "bg-brand-50/30" : ""
            )}
            key={day.toString()}
            onClick={() => {
              setDefaultDate(dayStr);
              setTaskToEdit(null);
              setIsModalOpen(true);
            }}
          >
            <div className="flex justify-between items-start">
              <span className={cn(
                "text-xs md:text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full",
                isSameDay(day, new Date()) ? "bg-brand-600 text-white" : ""
              )}>
                {formattedDate}
              </span>
            </div>
            
            <div className="mt-1 flex-1 space-y-1 overflow-y-auto max-h-[80px] hide-scrollbar">
              {dayTasks.map(task => (
                <div 
                  key={task.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTaskToEdit(task);
                    setIsModalOpen(true);
                  }}
                  className={cn(
                    "text-[10px] md:text-xs truncate px-1.5 py-1 rounded cursor-pointer",
                    task.status === 'Completed' 
                      ? "bg-gray-100 text-gray-500 line-through"
                      : "bg-brand-100 text-brand-800 hover:bg-brand-200"
                  )}
                >
                  {task.status !== 'Completed' && task.priority === 'High' && '🔴 '}
                  {task.time ? `${task.time} ` : ''}{task.title}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="border-l border-t border-border bg-card rounded-xl overflow-hidden">{rows}</div>;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-textPrimary">Calendar</h1>
        <p className="text-textSecondary mt-1">Manage tasks across your month</p>
      </div>
      
      {renderHeader()}
      
      <div className="flex-1 bg-card rounded-xl border border-border shadow-sm flex flex-col">
        {renderDays()}
        <div className="flex-1 overflow-y-auto">
          {renderCells()}
        </div>
      </div>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={(refresh?: boolean) => {
          setIsModalOpen(false);
          if (refresh) fetchTasks();
        }} 
        taskToEdit={taskToEdit} 
        defaultDate={defaultDate}
      />
    </div>
  );
}
