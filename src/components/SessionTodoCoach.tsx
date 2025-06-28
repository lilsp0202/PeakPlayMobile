import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckSquare, FiCalendar, FiUsers, FiPlus, FiTrash2, FiCheck, FiX, FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Check, Calendar, Users, ListChecks, Trophy, Target } from 'lucide-react';

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

export default function SessionTodoCoach({ assignedStudents = [] }: { assignedStudents?: AssignedStudent[] }) {
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
    <div className="space-y-6">
      {/* Header with Action Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* To-Do Role Filter */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <select 
              value={todoRoleFilter} 
              onChange={(e) => setTodoRoleFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200"
            >
              <option value="ALL">All Roles</option>
              <option value="BATSMAN">Batsman</option>
              <option value="BOWLER">Bowler</option>
              <option value="ALL_ROUNDER">All Rounder</option>
              <option value="KEEPER">Wicket Keeper</option>
            </select>
          </motion.div>
        </div>
        
        <motion.button 
          className="btn-gradient btn-modern flex items-center gap-2 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200" 
          onClick={() => setShowForm(f => !f)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showForm ? (
            <>
              <FiX className="w-4 h-4" />
              Cancel
            </>
          ) : (
            <>
              <FiPlus className="w-4 h-4" />
              New To-Do List
            </>
          )}
        </motion.button>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && todoToDelete && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.3 }}
            >
              <div className="text-center">
                <motion.div 
                  className="text-5xl mb-4"
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  🗑️
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Delete To-Do?</h3>
                <p className="text-gray-600 mb-1">Are you sure you want to delete:</p>
                <p className="text-indigo-700 font-semibold mb-4">"{todoToDelete.title}"</p>
                <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
                
                <div className="flex gap-3 justify-center">
                  <motion.button
                    onClick={handleDeleteCancel}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleDeleteConfirm}
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 shadow-lg"
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-3xl p-12 text-center shadow-2xl"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              <motion.div 
                className="text-7xl mb-4"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 360]
                }}
                transition={{ duration: 1 }}
              >
                🎉
              </motion.div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent mb-2">
                Tasklist Completed!
              </h3>
              <p className="text-gray-600 text-lg">Great job! All tasks have been checked off.</p>
              <motion.div 
                className="flex justify-center mt-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Trophy className="w-12 h-12 text-yellow-500" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form 
            className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 shadow-lg"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block font-medium mb-2 text-gray-800 flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-indigo-600" />
                  Title
                </label>
                <input 
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" 
                  value={form.title} 
                  onChange={e => handleFormChange('title', e.target.value)} 
                  placeholder="e.g., Morning Training Session"
                  required 
                />
              </div>
              <div>
                <label className="block font-medium mb-2 text-gray-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Session Date
                </label>
                <input 
                  type="date" 
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" 
                  value={form.sessionDate} 
                  onChange={e => handleFormChange('sessionDate', e.target.value)} 
                  required 
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block font-medium mb-2 text-gray-800 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                Checklist Items
              </label>
              <div className="space-y-2">
                {form.items.map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    className="flex gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <input 
                      className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" 
                      value={item} 
                      onChange={e => handleItemChange(idx, e.target.value)} 
                      placeholder={`Task ${idx + 1}`}
                      required 
                    />
                    <motion.button 
                      type="button" 
                      className="text-red-500 hover:text-red-700 font-bold p-2.5 hover:bg-red-50 rounded-xl transition-all duration-200" 
                      onClick={() => removeItem(idx)} 
                      disabled={form.items.length === 1}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
              <motion.button 
                type="button" 
                className="text-indigo-600 hover:text-indigo-700 font-medium mt-3 flex items-center gap-2 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all duration-200" 
                onClick={addItem}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiPlus className="w-4 h-4" />
                Add Item
              </motion.button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block font-medium text-gray-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Assign to Students
                </label>
                <div className="flex items-center gap-2">
                  <select 
                    value={studentRoleFilter} 
                    onChange={(e) => setStudentRoleFilter(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="BATSMAN">Batsman</option>
                    <option value="BOWLER">Bowler</option>
                    <option value="ALL_ROUNDER">All Rounder</option>
                    <option value="KEEPER">Wicket Keeper</option>
                  </select>
                  {filteredStudents.length > 0 && (
                    <motion.button 
                      type="button"
                      onClick={handleSelectAll}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isAllFilteredSelected 
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {isAllFilteredSelected ? 'Deselect All' : 'Select All'}
                    </motion.button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredStudents.map(s => (
                  <motion.label 
                    key={s.id} 
                    className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input 
                      type="checkbox" 
                      checked={form.studentIds.includes(s.id)} 
                      onChange={() => handleStudentToggle(s.id)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-gray-800 font-medium">{s.studentName}</span>
                      <span className="text-xs text-gray-500">{getRoleDisplayName(s.role)}</span>
                    </div>
                  </motion.label>
                ))}
              </div>
              {filteredStudents.length === 0 && (
                <div className="text-gray-500 text-sm mt-3 text-center py-4 bg-gray-50 rounded-xl">
                  No students found for the selected role filter.
                </div>
              )}
            </div>
            
            <motion.button 
              type="submit" 
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2" 
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FiCheck className="w-5 h-5" />
                  Save To-Do List
                </>
              )}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Loading and Error States */}
      {loading && !showForm && (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {error && (
        <motion.div 
          className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}
      
      {/* Results Summary */}
      <AnimatePresence>
        {todoRoleFilter !== 'ALL' && (
          <motion.div 
            className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-blue-800 text-sm flex items-center gap-2">
              <FiFilter className="w-4 h-4" />
              <span className="font-medium">Filter Active:</span> 
              Showing to-dos for {getRoleDisplayName(todoRoleFilter)} ({todosToShow.length} of {todos.length} to-dos)
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Todo List */}
      <div className="space-y-4">
        <AnimatePresence>
          {todosToShow.map((todo, index) => (
            <motion.div 
              key={todo.id} 
              className={`rounded-2xl p-6 shadow-lg transition-all duration-300 ${
                todo.isCompleted 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200' 
                  : 'bg-white border border-gray-200 hover:shadow-xl'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2 }}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-gray-800">{todo.title}</h3>
                    <span className="text-xs bg-indigo-100 text-indigo-700 rounded-full px-3 py-1 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(todo.sessionDate).toLocaleDateString()}
                    </span>
                    {todo.isCompleted && (
                      <motion.span 
                        className="text-xs bg-green-100 text-green-700 rounded-full px-3 py-1 font-semibold flex items-center gap-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                      >
                        <Check className="w-3 h-3" />
                        Completed
                      </motion.span>
                    )}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm text-gray-600">
                        {getCompletionPercentage(todo)}% ({todo.items.filter(item => item.isChecked).length}/{todo.items.length})
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <motion.div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${getCompletionPercentage(todo)}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  {/* Checklist Items */}
                  <div className="space-y-2 mb-4">
                    {todo.items.map((item, itemIndex) => (
                      <motion.div 
                        key={item.id} 
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: itemIndex * 0.05 }}
                      >
                        <input 
                          type="checkbox" 
                          checked={item.isChecked} 
                          onChange={() => handleCheckboxToggle(todo.id, item.id)}
                          className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer" 
                          disabled={loading || todo.isCompleted}
                        />
                        <span className={`flex-1 ${item.isChecked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {item.content}
                        </span>
                        {item.isChecked && (
                          <motion.span 
                            className="text-green-500"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                          >
                            <Check className="w-4 h-4" />
                          </motion.span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Assigned Students */}
                  <div className="flex flex-wrap gap-2">
                    {todo.students.map(s => {
                      const student = assignedStudents.find(st => st.id === s.studentId);
                      return student ? (
                        <span 
                          key={s.studentId} 
                          className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 text-indigo-700 rounded-full px-3 py-1 text-xs font-medium"
                        >
                          {student.studentName} 
                          <span className="text-indigo-500 ml-1">({getRoleDisplayName(student.role)})</span>
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {isAllItemsChecked(todo) && !todo.isCompleted && (
                    <motion.button 
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2"
                      onClick={() => handleCompleteChecklist(todo.id)}
                      disabled={loading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Trophy className="w-4 h-4" />
                      Complete
                    </motion.button>
                  )}
                  <motion.button 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2" 
                    onClick={() => handleDeleteRequest(todo)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Empty State */}
      {todosToShow.length === 0 && (
        <motion.div 
          className="text-center py-12 bg-gray-50 rounded-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ListChecks className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No To-Do Lists Yet</h3>
          <p className="text-gray-500">
            {todoRoleFilter !== 'ALL' 
              ? `No to-dos found for ${getRoleDisplayName(todoRoleFilter)}.`
              : 'Create your first training checklist to get started.'
            }
          </p>
        </motion.div>
      )}
      
      {/* Show More/Less Button */}
      {filteredTodos.length > 3 && (
        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button 
            className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all duration-200" 
            onClick={() => setShowAll(s => !s)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showAll ? (
              <>
                <FiChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <FiChevronDown className="w-4 h-4" />
                Show More ({filteredTodos.length - 3} more)
              </>
            )}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
} 