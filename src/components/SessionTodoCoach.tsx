import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AssignedStudent {
  id: string;
  studentName: string;
  role: string;
  // Add more fields as needed
}

interface TodoItem {
  id: string;
  title: string;
  sessionDate: string;
  items: { id: string; content: string; isChecked: boolean }[];
  students: { studentId: string }[];
  isCompleted?: boolean;
}

export default function SessionTodoCoach({ assignedStudents }: { assignedStudents: AssignedStudent[] }) {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{ title: string; sessionDate: string; items: string[]; studentIds: string[] }>({ title: '', sessionDate: '', items: [''], studentIds: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completedTodoId, setCompletedTodoId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<TodoItem | null>(null);
  const [studentRoleFilter, setStudentRoleFilter] = useState<string>('ALL');
  const [todoRoleFilter, setTodoRoleFilter] = useState<string>('ALL');

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

  // Select All functionality
  const handleSelectAll = () => {
    const filteredStudents = getFilteredStudents();
    const allFilteredIds = filteredStudents.map(s => s.id);
    const isAllSelected = allFilteredIds.every(id => form.studentIds.includes(id));
    
    if (isAllSelected) {
      // Deselect all filtered students
      setForm(f => ({ ...f, studentIds: f.studentIds.filter(id => !allFilteredIds.includes(id)) }));
    } else {
      // Select all filtered students (add those not already selected)
      const newIds = allFilteredIds.filter(id => !form.studentIds.includes(id));
      setForm(f => ({ ...f, studentIds: [...f.studentIds, ...newIds] }));
    }
  };

  // Filter students based on role
  const getFilteredStudents = () => {
    if (studentRoleFilter === 'ALL') return assignedStudents;
    return assignedStudents.filter(student => student.role === studentRoleFilter);
  };

  // Filter todos based on role
  const getFilteredTodos = () => {
    if (todoRoleFilter === 'ALL') return todos;
    
    return todos.filter(todo => {
      // Check if any assigned student has the selected role
      return todo.students.some(todoStudent => {
        const student = assignedStudents.find(s => s.id === todoStudent.studentId);
        return student?.role === todoRoleFilter;
      });
    });
  };

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

  const handleDeleteRequest = (todo: TodoItem) => {
    setTodoToDelete(todo);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!todoToDelete) return;
    
    setLoading(true);
    try { 
      await axios.delete('/api/session-todo', { data: { id: todoToDelete.id } }); 
      fetchTodos(); 
      setShowDeleteConfirm(false);
      setTodoToDelete(null);
    } catch (e) { 
      setError('Failed to delete'); 
    }
    setLoading(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setTodoToDelete(null);
  };

  // Handle checkbox toggle
  const handleCheckboxToggle = async (todoId: string, itemId: string) => {
    setLoading(true);
    try {
      const todo = todos.find(t => t.id === todoId);
      if (!todo) return;

      const updatedItems = todo.items.map(item => 
        item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
      );

      await axios.patch('/api/session-todo', {
        id: todoId,
        title: todo.title,
        sessionDate: todo.sessionDate,
        items: updatedItems
      });

      // Update local state
      setTodos(prevTodos => 
        prevTodos.map(t => 
          t.id === todoId ? { ...t, items: updatedItems } : t
        )
      );
    } catch (e) { 
      setError('Failed to update task'); 
    }
    setLoading(false);
  };

  // Handle complete checklist
  const handleCompleteChecklist = async (todoId: string) => {
    setLoading(true);
    try {
      const todo = todos.find(t => t.id === todoId);
      if (!todo) return;

      const allItemsChecked = todo.items.map(item => ({ ...item, isChecked: true }));

      await axios.patch('/api/session-todo', {
        id: todoId,
        title: todo.title,
        sessionDate: todo.sessionDate,
        items: allItemsChecked
      });

      // Update local state and mark as completed
      setTodos(prevTodos => 
        prevTodos.map(t => 
          t.id === todoId ? { ...t, items: allItemsChecked, isCompleted: true } : t
        )
      );

      // Show celebration animation
      setCompletedTodoId(todoId);
      setShowCelebration(true);
      
      // Hide celebration after 3 seconds
      setTimeout(() => {
        setShowCelebration(false);
        setCompletedTodoId(null);
      }, 3000);

    } catch (e) { 
      setError('Failed to complete checklist'); 
    }
    setLoading(false);
  };

  // Check if all items in a todo are completed
  const isAllItemsChecked = (todo: TodoItem) => {
    return todo.items.length > 0 && todo.items.every(item => item.isChecked);
  };

  // Get completion percentage
  const getCompletionPercentage = (todo: TodoItem) => {
    if (todo.items.length === 0) return 0;
    const checkedCount = todo.items.filter(item => item.isChecked).length;
    return Math.round((checkedCount / todo.items.length) * 100);
  };

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'BATSMAN': return 'Batsman';
      case 'BOWLER': return 'Bowler';
      case 'ALL_ROUNDER': return 'All Rounder';
      case 'KEEPER': return 'Wicket Keeper';
      default: return role;
    }
  };

  const filteredTodos = getFilteredTodos();
  const todosToShow = showAll ? filteredTodos : filteredTodos.slice(0, 3);
  const filteredStudents = getFilteredStudents();
  const isAllFilteredSelected = filteredStudents.length > 0 && filteredStudents.every(s => form.studentIds.includes(s.id));

  return (
    <section className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-indigo-700">Session To-Do</h2>
        <div className="flex gap-2">
          {/* To-Do Role Filter */}
          <select 
            value={todoRoleFilter} 
            onChange={(e) => setTodoRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Roles</option>
            <option value="BATSMAN">Batsman</option>
            <option value="BOWLER">Bowler</option>
            <option value="ALL_ROUNDER">All Rounder</option>
            <option value="KEEPER">Wicket Keeper</option>
          </select>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-indigo-700" onClick={() => setShowForm(f => !f)}>{showForm ? 'Cancel' : '+ New To-Do'}</button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && todoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">🗑️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete To-Do?</h3>
              <p className="text-gray-600 mb-1">Are you sure you want to delete:</p>
              <p className="text-indigo-700 font-semibold mb-4">"{todoToDelete.title}"</p>
              <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleDeleteCancel}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-12 text-center shadow-2xl transform animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-3xl font-bold text-green-600 mb-2">Tasklist Completed!</h3>
            <p className="text-gray-600 text-lg">Great job! All tasks have been checked off.</p>
            <div className="flex justify-center mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          </div>
        </div>
      )}

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
            <div className="flex items-center justify-between mb-2">
              <label className="block font-medium text-gray-800">Assign to Students</label>
              <div className="flex items-center gap-2">
                {/* Student Role Filter */}
                <select 
                  value={studentRoleFilter} 
                  onChange={(e) => setStudentRoleFilter(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">All Roles</option>
                  <option value="BATSMAN">Batsman</option>
                  <option value="BOWLER">Bowler</option>
                  <option value="ALL_ROUNDER">All Rounder</option>
                  <option value="KEEPER">Wicket Keeper</option>
                </select>
                {/* Select All Button */}
                {filteredStudents.length > 0 && (
                  <button 
                    type="button"
                    onClick={handleSelectAll}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isAllFilteredSelected 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {isAllFilteredSelected ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredStudents.map(s => (
                <label key={s.id} className="flex items-center gap-2 bg-white px-3 py-2 rounded shadow border cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                  <input type="checkbox" checked={form.studentIds.includes(s.id)} onChange={() => handleStudentToggle(s.id)} />
                  <div className="flex flex-col">
                    <span className="text-gray-800 font-medium">{s.studentName}</span>
                    <span className="text-xs text-gray-500">{getRoleDisplayName(s.role)}</span>
                  </div>
                </label>
              ))}
            </div>
            {filteredStudents.length === 0 && (
              <div className="text-gray-500 text-sm mt-2">
                No students found for the selected role filter.
              </div>
            )}
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-indigo-700" disabled={loading}>{loading ? 'Saving...' : 'Save To-Do'}</button>
        </form>
      )}
      {loading && <div className="text-gray-700 mb-4">Loading...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      {/* Results Summary */}
      {todoRoleFilter !== 'ALL' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <span className="font-medium">Filter Active:</span> Showing to-dos for {getRoleDisplayName(todoRoleFilter)} ({todosToShow.length} of {todos.length} to-dos)
          </p>
        </div>
      )}
      
      <div className="space-y-6">
        {todosToShow.map(todo => (
          <div key={todo.id} className={`rounded-xl p-6 shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${todo.isCompleted ? 'bg-green-50 border-2 border-green-200' : 'bg-indigo-50'}`}>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-indigo-800">{todo.title}</h3>
                <span className="text-xs bg-indigo-200 text-indigo-700 rounded-full px-2 py-1">{new Date(todo.sessionDate).toLocaleDateString()}</span>
                {todo.isCompleted && (
                  <span className="text-xs bg-green-200 text-green-700 rounded-full px-2 py-1 font-semibold">✓ Completed</span>
                )}
              </div>
              
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-700">Progress: {getCompletionPercentage(todo)}%</span>
                  <span className="text-xs text-gray-500">({todo.items.filter(item => item.isChecked).length}/{todo.items.length} tasks)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${getCompletionPercentage(todo)}%` }}
                  ></div>
                </div>
              </div>

              <ul className="list-none pl-0 mb-2">
                {todo.items.map(item => (
                  <li key={item.id} className="flex items-center gap-2 mb-1">
                    <input 
                      type="checkbox" 
                      checked={item.isChecked} 
                      onChange={() => handleCheckboxToggle(todo.id, item.id)}
                      className="accent-indigo-600 h-4 w-4 cursor-pointer" 
                      disabled={loading || todo.isCompleted}
                    />
                    <span className={item.isChecked ? 'line-through text-gray-400' : 'text-gray-800'}>{item.content}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2 mt-2">
                {todo.students.map(s => {
                  const student = assignedStudents.find(st => st.id === s.studentId);
                  return (
                    <span key={s.studentId} className="bg-white border border-indigo-200 text-indigo-700 rounded-full px-3 py-1 text-xs">
                      {student?.studentName || 'Student'} 
                      <span className="text-gray-500 ml-1">({getRoleDisplayName(student?.role || '')})</span>
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {isAllItemsChecked(todo) && !todo.isCompleted && (
                <button 
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-green-700 transition-colors duration-200"
                  onClick={() => handleCompleteChecklist(todo.id)}
                  disabled={loading}
                >
                  {loading ? 'Completing...' : 'Complete Checklist'}
                </button>
              )}
              <button className="text-red-500 hover:underline font-medium" onClick={() => handleDeleteRequest(todo)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      
      {todosToShow.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {todoRoleFilter !== 'ALL' 
            ? `No to-dos found for ${getRoleDisplayName(todoRoleFilter)}.`
            : 'No to-dos created yet.'
          }
        </div>
      )}
      
      {filteredTodos.length > 3 && (
        <div className="flex justify-center mt-4">
          <button className="text-indigo-600 hover:underline font-medium" onClick={() => setShowAll(s => !s)}>{showAll ? 'Show Less' : 'Show More'}</button>
        </div>
      )}
    </section>
  );
} 