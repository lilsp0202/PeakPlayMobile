import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AssignedStudent {
  id: string;
  studentName: string;
  // Add more fields as needed
}

interface TodoItem {
  id: string;
  title: string;
  sessionDate: string;
  items: { id: string; content: string; isChecked: boolean }[];
  students: { studentId: string }[];
}

export default function SessionTodoCoach({ assignedStudents }: { assignedStudents: AssignedStudent[] }) {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{ title: string; sessionDate: string; items: string[]; studentIds: string[] }>({ title: '', sessionDate: '', items: [''], studentIds: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchTodos(); }, []);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/session-todo');
      setTodos(res.data);
    } catch (e) { setError('Failed to load to-dos'); }
    setLoading(false);
  };

  const handleFormChange = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));
  const handleItemChange = (idx: number, value: string) => setForm(f => ({ ...f, items: f.items.map((it, i) => i === idx ? value : it) }));
  const addItem = () => setForm(f => ({ ...f, items: [...f.items, ''] }));
  const removeItem = (idx: number) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  const handleStudentToggle = (id: string) => setForm(f => ({ ...f, studentIds: f.studentIds.includes(id) ? f.studentIds.filter(sid => sid !== id) : [...f.studentIds, id] }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/session-todo', { ...form });
      setShowForm(false); setForm({ title: '', sessionDate: '', items: [''], studentIds: [] });
      fetchTodos();
    } catch (e) { setError('Failed to create to-do'); }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this to-do?')) return;
    setLoading(true);
    try { await axios.delete('/api/session-todo', { data: { id } }); fetchTodos(); } catch (e) { setError('Failed to delete'); }
    setLoading(false);
  };

  const todosToShow = showAll ? todos : todos.slice(0, 3);

  return (
    <section className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-indigo-700">Session To-Do</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-indigo-700" onClick={() => setShowForm(f => !f)}>{showForm ? 'Cancel' : '+ New To-Do'}</button>
      </div>
      {showForm && (
        <form className="bg-indigo-50 p-6 rounded-xl mb-8" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-medium mb-1 text-gray-800">Title</label>
            <input className="w-full rounded border px-3 py-2 text-gray-900" value={form.title} onChange={e => handleFormChange('title', e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1 text-gray-800">Session Date</label>
            <input type="date" className="w-full rounded border px-3 py-2 text-gray-900" value={form.sessionDate} onChange={e => handleFormChange('sessionDate', e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1 text-gray-800">Checklist Items</label>
            {form.items.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input className="flex-1 rounded border px-3 py-2 text-gray-900" value={item} onChange={e => handleItemChange(idx, e.target.value)} required />
                <button type="button" className="text-red-500 font-bold" onClick={() => removeItem(idx)} disabled={form.items.length === 1}>✕</button>
              </div>
            ))}
            <button type="button" className="text-indigo-600 font-medium mt-2" onClick={addItem}>+ Add Item</button>
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1 text-gray-800">Assign to Students</label>
            <div className="flex flex-wrap gap-2">
              {assignedStudents.map(s => (
                <label key={s.id} className="flex items-center gap-2 bg-white px-3 py-1 rounded shadow border cursor-pointer">
                  <input type="checkbox" checked={form.studentIds.includes(s.id)} onChange={() => handleStudentToggle(s.id)} />
                  <span className="text-gray-800">{s.studentName}</span>
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-indigo-700" disabled={loading}>{loading ? 'Saving...' : 'Save To-Do'}</button>
        </form>
      )}
      {loading && <div className="text-gray-700 mb-4">Loading...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="space-y-6">
        {todosToShow.map(todo => (
          <div key={todo.id} className="bg-indigo-50 rounded-xl p-6 shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-indigo-800">{todo.title}</h3>
                <span className="text-xs bg-indigo-200 text-indigo-700 rounded-full px-2 py-1">{new Date(todo.sessionDate).toLocaleDateString()}</span>
              </div>
              <ul className="list-none pl-0 mb-2">
                {todo.items.map(item => (
                  <li key={item.id} className="flex items-center gap-2 mb-1">
                    <input type="checkbox" checked={item.isChecked} readOnly className="accent-indigo-600" />
                    <span className={item.isChecked ? 'line-through text-gray-400' : 'text-gray-800'}>{item.content}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2 mt-2">
                {todo.students.map(s => (
                  <span key={s.studentId} className="bg-white border border-indigo-200 text-indigo-700 rounded-full px-3 py-1 text-xs">{assignedStudents.find(st => st.id === s.studentId)?.studentName || 'Student'}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button className="text-red-500 hover:underline font-medium" onClick={() => handleDelete(todo.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      {todos.length > 3 && (
        <div className="flex justify-center mt-4">
          <button className="text-indigo-600 hover:underline font-medium" onClick={() => setShowAll(s => !s)}>{showAll ? 'Show Less' : 'Show More'}</button>
        </div>
      )}
    </section>
  );
} 