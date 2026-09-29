import { Check, Clock, Trash2, Calendar, MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';
import api from '../api';

export default function TaskCard({ task, onUpdate, onEdit, showMoveToToday = false, onMoveToToday = null }: any) {
  const toggleComplete = async () => {
    try {
      const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async () => {
    try {
      await api.delete(`/tasks/${task.id}`);
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const isCompleted = task.status === 'Completed';

  return (
    <div className={cn(
      "group bg-card border rounded-xl p-4 transition-all hover:shadow-sm",
      isCompleted ? "border-border/60 bg-gray-50/50" : "border-border",
      task.priority === 'High' && !isCompleted ? "border-l-4 border-l-red-500" : ""
    )}>
      <div className="flex items-start gap-3">
        <button 
          onClick={toggleComplete}
          className={cn(
            "mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors",
            isCompleted 
              ? "bg-brand-600 border-brand-600 text-white" 
              : "border-gray-300 hover:border-brand-500 hover:bg-brand-50"
          )}
        >
          {isCompleted && <Check className="w-3.5 h-3.5" />}
        </button>
        
        <div className="flex-1 min-w-0">
          <div 
            onClick={() => onEdit(task)}
            className={cn(
              "text-[15px] font-medium truncate cursor-pointer",
              isCompleted ? "text-textSecondary line-through" : "text-textPrimary"
            )}
          >
            {task.title}
          </div>
          
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5">
            {task.time && (
              <span className="flex items-center text-xs text-textSecondary gap-1">
                <Clock className="w-3 h-3" />
                {task.time}
              </span>
            )}
            <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
              {task.category?.name || 'Category'}
            </span>
            {task.priority && !isCompleted && (
              <span className={cn(
                "text-[10px] font-semibold uppercase tracking-wider",
                task.priority === 'High' ? "text-red-600" : task.priority === 'Medium' ? "text-orange-500" : "text-green-600"
              )}>
                {task.priority}
              </span>
            )}
            {task.carriedForwardFrom && (
              <span className="text-[10px] font-medium text-orange-600 bg-orange-50 px-1.5 rounded">Carried forward</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {showMoveToToday && onMoveToToday && !isCompleted && (
            <button 
              onClick={() => onMoveToToday(task)}
              className="p-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 rounded"
              title="Move to Today"
            >
              Move to Today
            </button>
          )}
          <button onClick={() => onEdit(task)} className="p-1.5 text-textSecondary hover:bg-gray-100 rounded md:hidden group-hover:block">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <button onClick={deleteTask} className="p-1.5 text-textSecondary hover:text-red-600 hover:bg-red-50 rounded hidden md:block">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
