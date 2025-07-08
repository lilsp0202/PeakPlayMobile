import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';

interface TodoItem {
  id: string;
  title: string;
  sessionDate: string;
  items: { id: string; content: string; isChecked: boolean }[];
  students: { studentId: string }[];
}

export default function SessionTodoStudent({ studentId, coachName }: { studentId: string; coachName: string }) {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(true);
      try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
        
        const res = await axios.get(`/api/session-todo?studentId=${studentId}`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        setTodos(res.data || []);
      } catch (e: unknown) { 
        if (e instanceof Error && e.name === 'AbortError') {
          console.error('Session todo request timeout');
        } else {
          console.error('Error fetching session todos:', e);
          setError(e instanceof Error ? e.message : 'Unknown error');
        }
        setTodos([]); 
      } finally {
        setLoading(false);
      }
    };
    fetchTodos();
  }, [studentId]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  const openModal = (todo: TodoItem) => {
    setSelectedTodo(todo);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTodo(null);
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showModal]);

  // Modal Component
  const Modal = () => {
    if (!showModal) return null;

    return createPortal(
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[10000]"
        onClick={handleBackdropClick}
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          margin: 0,
          padding: '20px'
        }}
      >
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden animate-in fade-in zoom-in duration-300"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'relative',
            margin: 'auto'
          }}
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 md:px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <span className="text-lg md:text-xl">📋</span>
              <span className="truncate">All Training To-Do Lists</span>
            </h3>
            <button
              onClick={closeModal}
              className="text-white hover:text-gray-200 text-2xl font-bold w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors duration-200 flex-shrink-0"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          {/* Modal Body */}
          <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-4 md:p-6">
            <div className="space-y-4">
              {todos.map((todo, todoIndex) => (
                <div key={todo.id} className="bg-gray-50 rounded-xl p-3 md:p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-base md:text-lg font-semibold text-gray-800 truncate">{todo.title}</span>
                      <span className="text-xs bg-indigo-100 text-indigo-700 rounded-full px-2 py-1 font-medium flex-shrink-0">
                        {new Date(todo.sessionDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {todoIndex === 0 && (
                      <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-1 font-medium flex-shrink-0">
                        Latest
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {todo.items.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-2 md:gap-3 bg-white rounded-lg p-2 md:p-3 shadow-sm">
                        <div className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <input 
                          type="checkbox" 
                          checked={item.isChecked} 
                          readOnly 
                          className="accent-indigo-600 w-4 h-4 flex-shrink-0" 
                        />
                        <span className={`flex-1 text-sm ${item.isChecked ? 'line-through text-gray-400' : 'text-gray-800'} break-words`}>
                          {item.content}
                        </span>
                        {item.isChecked && (
                          <span className="text-green-500 text-sm flex-shrink-0">✓</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 pt-3 border-t border-gray-200 gap-2">
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <span className="text-indigo-500">👨‍🏫</span>
                      <span className="truncate">Coach: {coachName}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {todo.items.filter(item => item.isChecked).length} of {todo.items.length} completed
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  if (loading) return (
    <section className="bg-white rounded-2xl md:rounded-3xl shadow-lg md:shadow-xl border border-gray-100 p-4 md:p-8 min-h-[300px] md:min-h-[400px]">
      <div className="animate-pulse">
        <div className="h-6 md:h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    </section>
  );

  if (todos.length === 0) return (
    <section className="bg-white rounded-2xl md:rounded-3xl shadow-lg md:shadow-xl border border-gray-100 p-4 md:p-8 min-h-[300px] md:min-h-[400px]">
      <div className="text-center py-6 md:py-8">
        <div className="text-4xl md:text-6xl mb-4">📝</div>
        <p className="text-gray-600 text-base md:text-lg">No to-do lists have been provided yet.</p>
        <p className="text-gray-500 text-sm mt-2">Check back later or ask your coach for your session plan!</p>
      </div>
    </section>
  );

  const mostRecentTodo = todos[0];
  const hasMoreTodos = todos.length > 1;

  return (
    <>
      <section className="bg-white rounded-2xl md:rounded-3xl shadow-lg md:shadow-xl border border-gray-100 p-4 md:p-8 min-h-[300px] md:min-h-[400px]">
        {/* Most Recent Todo */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl md:rounded-2xl p-4 md:p-6 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
              <span className="text-base md:text-lg font-semibold text-indigo-800 truncate">{mostRecentTodo.title}</span>
              <span className="text-xs bg-indigo-200 text-indigo-700 rounded-full px-2 md:px-3 py-1 font-medium flex-shrink-0">
                {new Date(mostRecentTodo.sessionDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-1 font-medium self-start sm:self-center">
              Latest
            </span>
          </div>

          <div className="space-y-2 md:space-y-3">
            {mostRecentTodo.items.slice(0, 3).map((item, index) => (
              <div key={item.id} className="flex items-center gap-2 md:gap-3 bg-white rounded-lg p-2 md:p-3 shadow-sm">
                <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs md:text-sm font-bold">
                  {index + 1}
                </div>
                <input 
                  type="checkbox" 
                  checked={item.isChecked} 
                  readOnly 
                  className="accent-indigo-600 w-4 h-4 flex-shrink-0" 
                />
                <span className={`flex-1 text-sm md:text-base ${item.isChecked ? 'line-through text-gray-400' : 'text-gray-800'} break-words`}>
                  {item.content}
                </span>
                {item.isChecked && (
                  <span className="text-green-500 text-sm flex-shrink-0">✓</span>
                )}
              </div>
            ))}

            {mostRecentTodo.items.length > 3 && (
              <div className="text-center pt-2">
                <button
                  onClick={() => openModal(mostRecentTodo)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline"
                >
                  +{mostRecentTodo.items.length - 3} more items
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 pt-4 border-t border-indigo-100 gap-2">
            <div className="text-sm text-gray-600 flex items-center gap-1">
              <span className="text-indigo-500">👨‍🏫</span>
              <span className="truncate">Coach: {coachName}</span>
            </div>
            <div className="text-xs text-gray-500">
              {mostRecentTodo.items.filter(item => item.isChecked).length} of {mostRecentTodo.items.length} completed
            </div>
          </div>
        </div>

        {/* Show More Button */}
        {hasMoreTodos && (
          <div className="text-center pb-4">
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              View All {todos.length} To-Do Lists
            </button>
          </div>
        )}
      </section>

      {/* Modal */}
      <Modal />
    </>
  );
} 