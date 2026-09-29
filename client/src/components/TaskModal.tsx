import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../api';
import { format } from 'date-fns';

export default function TaskModal({ isOpen, onClose, taskToEdit = null, defaultDate = null }: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      api.get('/categories').then((res) => {
        setCategories(res.data);
        if (!taskToEdit && !categoryId && res.data.length > 0) {
          setCategoryId(res.data.find((c: any) => c.name === 'Personal')?.id || res.data[0].id);
        }
      });
      
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description || '');
        setDate(taskToEdit.date);
        setTime(taskToEdit.time || '');
        setCategoryId(taskToEdit.categoryId);
        setPriority(taskToEdit.priority);
      } else {
        setTitle('');
        setDescription('');
        setDate(defaultDate || format(new Date(), 'yyyy-MM-dd'));
        setTime('');
        setPriority('Medium');
      }
    }
  }, [isOpen, taskToEdit, defaultDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (taskToEdit) {
        await api.put(`/tasks/${taskToEdit.id}`, { title, description, date, time, categoryId, priority });
      } else {
        await api.post('/tasks', { title, description, date, time, categoryId, priority });
      }
      onClose(true); // pass true to indicate success/reload
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="w-full md:w-[500px] bg-card rounded-t-2xl md:rounded-xl shadow-2xl p-6 animate-in slide-in-from-bottom md:zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-textPrimary">{taskToEdit ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={() => onClose()} className="p-2 -mr-2 text-textSecondary hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="text" 
              placeholder="What do you need to do?" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full text-lg border-b border-border py-2 focus:outline-none focus:border-brand-500 bg-transparent placeholder-gray-400"
              autoFocus
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-textSecondary mb-1">Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-textSecondary mb-1">Time (Optional)</label>
              <input 
                type="time" 
                value={time} 
                onChange={e => setTime(e.target.value)} 
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-textSecondary mb-1">Category</label>
              <select 
                value={categoryId} 
                onChange={e => setCategoryId(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-transparent"
                required
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-textSecondary mb-1">Priority</label>
              <select 
                value={priority} 
                onChange={e => setPriority(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-transparent"
              >
                <option value="High">🔴 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-textSecondary mb-1">Description (Optional)</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-transparent resize-none h-20"
              placeholder="Add details..."
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-lg transition-colors active:scale-[0.98]"
            >
              {taskToEdit ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
