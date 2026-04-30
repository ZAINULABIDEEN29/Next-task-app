"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useTaskContext, Task } from "@/context/TaskContext";
import { useAuthContext } from "@/context/AuthContext";
import { motion, Reorder, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthContext();
  const { 
    tasks, 
    isLoading, 
    isSubmitting, 
    error, 
    setError, 
    createTask, 
    updateTask, 
    deleteTask,
    setTasks
  } = useTaskContext();

  // Local UI State
  const [newContent, setNewContent] = useState("");
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">("medium");
  const [newStatus, setNewStatus] = useState<"todo" | "in progress" | "completed">("todo");
  const [filter, setFilter] = useState<"all" | "todo" | "in progress" | "completed">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editPriority, setEditPriority] = useState<"high" | "medium" | "low">("medium");
  const [editStatus, setEditStatus] = useState<"todo" | "in progress" | "completed">("todo");
  const [newDeadline, setNewDeadline] = useState("");
  const [editDeadline, setEditDeadline] = useState("");

  const handleLogout = async () => {
    await logout();
  };

  const onSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createTask(newContent, newPriority, newDeadline);
    if (success) {
      setNewContent("");
      setNewPriority("medium");
      setNewStatus("todo");
      setNewDeadline("");
      setIsModalOpen(false);
    }
  };

  const onUpdateTask = async (id: string) => {
    const success = await updateTask(id, { 
      content: editContent, 
      priority: editPriority,
      status: editStatus,
      deadline: editDeadline,
      isCompleted: editStatus === "completed"
    });
    if (success) setEditingId(null);
  };

  const startEditing = (task: Task) => {
    setEditingId(task._id);
    setEditContent(task.content);
    setEditPriority(task.priority);
    setEditStatus(task.status || "todo");
    setEditDeadline(task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : "");
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filter === "all") return true;
      return task.status === filter;
    });
  }, [tasks, filter]);

  const handleReorder = useCallback((reorderedSubset: Task[]) => {
    const newTasks = [...tasks];
    const indices = reorderedSubset.map(item => tasks.findIndex(t => t._id === item._id));
    const sortedIndices = [...indices].sort((a, b) => a - b);
    reorderedSubset.forEach((item, i) => {
      newTasks[sortedIndices[i]] = item;
    });
    setTasks(newTasks);
  }, [tasks, setTasks]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
      case "in progress": return "bg-sky-500/10 text-sky-500 border-sky-500/30";
      case "todo": return "bg-slate-500/10 text-slate-500 border-slate-500/30";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/30";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/10 text-red-500 border-red-500/30";
      case "medium": return "bg-orange-500/10 text-orange-500 border-orange-500/30";
      case "low": return "bg-indigo-500/10 text-indigo-500 border-indigo-500/30";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-500/30">
      {/* Main Content */}
      <main className="p-6 lg:p-10 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
            <p className="text-slate-500 text-sm">Manage your tasks and keep track of your progress.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Task
            </button>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {(["all", "todo", "in progress", "completed"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${
                    filter === f 
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <button 
              onClick={handleLogout} 
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-medium flex justify-between items-center">
            {error}
            <button onClick={() => setError(null)} className="text-red-900 dark:text-red-200 hover:opacity-50 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="p-5 bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <p className="text-xs font-medium text-slate-500 mb-1">Total Tasks</p>
            <p className="text-2xl font-bold">{tasks.length}</p>
          </div>
          <div className="p-5 bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <p className="text-xs font-medium text-slate-500 mb-1">Active</p>
            <p className="text-2xl font-bold">{tasks.filter(t => !t.isCompleted).length}</p>
          </div>
          <div className="p-5 bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <p className="text-xs font-medium text-slate-500 mb-1">Completed</p>
            <p className="text-2xl font-bold text-emerald-600">{tasks.filter(t => t.isCompleted).length}</p>
          </div>
          <div className="p-5 bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <p className="text-xs font-medium text-slate-500 mb-1">Completion Rate</p>
            <p className="text-2xl font-bold">{tasks.length > 0 ? Math.round((tasks.filter(t => t.isCompleted).length / tasks.length) * 100) : 0}%</p>
          </div>
        </div>

        {/* Task List Container */}
        <div className="bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Tasks</h3>
            <span className="text-xs text-slate-400 font-medium">{filteredTasks.length} shown</span>
          </div>
          
          {isLoading && tasks.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">Syncing tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 text-slate-400">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
              </div>
              <p className="text-slate-900 dark:text-slate-200 font-semibold mb-1">No tasks found</p>
              <p className="text-slate-500 text-sm">Create your first task to get started.</p>
            </div>
          ) : (
            <Reorder.Group 
              as="div"
              axis="y" 
              values={filteredTasks} 
              onReorder={handleReorder}
              className="flex flex-col gap-4 p-6 w-full"
            >
              <AnimatePresence>
                {filteredTasks.map((task) => (
                  <Reorder.Item 
                    as="div"
                    key={task._id} 
                    value={task}
                    layout="position"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ 
                      layout: { type: "spring", stiffness: 600, damping: 40 },
                      opacity: { duration: 0.2 }
                    }}
                    whileDrag={{ 
                      scale: 1.02, 
                      rotate: 1,
                      zIndex: 50,
                      boxShadow: "0 20px 40px rgba(0,0,0,0.12)" 
                    }}
                    className={`group relative flex flex-col p-0 rounded-2xl overflow-hidden transition-all duration-500 shadow-sm min-h-[120px] cursor-grab active:cursor-grabbing ${
                      task.isCompleted 
                      ? 'opacity-75 grayscale-[0.5]' 
                      : ''
                    }`}
                  >
                    {/* Glass Background & Borders */}
                    <div className={`absolute inset-0 transition-all duration-500 ${
                      task.isCompleted
                      ? 'bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800'
                      : 'bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-slate-800 group-hover:border-indigo-500/50 group-hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)]'
                    }`} />
                    
                    {/* Top-right Accent Glow (Hover only) */}
                    {!task.isCompleted && (
                      <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    )}

                    <div className="relative h-full flex flex-col p-6 z-10">
                      {/* Header: Status and Priority */}
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newCompleted = !task.isCompleted;
                              updateTask(task._id, { 
                                isCompleted: newCompleted,
                                status: newCompleted ? "completed" : "todo"
                              });
                            }}
                            className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-300 transform active:scale-90 ${
                              task.isCompleted 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : 'border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-800'
                            }`}
                          >
                            {task.isCompleted && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const statuses: ("todo" | "in progress" | "completed")[] = ["todo", "in progress", "completed"];
                              const currentIndex = statuses.indexOf(task.status || "todo");
                              const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                              updateTask(task._id, { 
                                status: nextStatus,
                                isCompleted: nextStatus === "completed"
                              });
                            }}
                            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-2 transition-all ${getStatusColor(task.status || "todo")}`}
                          >
                            {task.status || "todo"}
                          </button>
                        </div>
                        
                        <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-2 ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </div>
                      </div>
                      
                      {/* Content: Top-aligned focus */}
                      <div className="flex-1 flex flex-col">
                        {editingId === task._id ? (
                          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300" onPointerDown={(e) => e.stopPropagation()}>
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              autoFocus
                              className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all resize-none h-32 font-medium"
                            />
                            <div className="flex flex-wrap gap-2">
                              <select
                                value={editPriority}
                                onChange={(e) => setEditPriority(e.target.value as any)}
                                className="flex-1 min-w-[100px] bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold"
                              >
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                              </select>
                              <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value as any)}
                                className="flex-1 min-w-[100px] bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold"
                              >
                                <option value="todo">To Do</option>
                                <option value="in progress">In Progress</option>
                                <option value="completed">Completed</option>
                              </select>
                              <input
                                type="date"
                                value={editDeadline}
                                onChange={(e) => setEditDeadline(e.target.value)}
                                className="flex-1 min-w-[100px] bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold"
                              />
                              <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                  onClick={(e) => { e.stopPropagation(); onUpdateTask(task._id); }}
                                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                                  className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                                >
                                  Skip
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className={`text-lg font-bold leading-tight line-clamp-6 transition-colors ${
                              task.isCompleted 
                              ? 'text-slate-400 line-through' 
                              : 'text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                            }`}>
                              {task.content}
                            </p>
                            <div className="w-8 h-1 bg-slate-100 dark:bg-slate-800 rounded-full group-hover:w-16 group-hover:bg-indigo-500/50 transition-all duration-500" />
                          </div>
                        )}
                      </div>

                      {/* Footer: Date and Hidden Actions */}
                      <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <svg className="text-slate-400" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                            {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        {task.deadline && (
                          <div className="flex items-center gap-2">
                            <svg className="text-indigo-500" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                              new Date(task.deadline) < new Date() && !task.isCompleted
                              ? 'text-red-500' 
                              : 'text-indigo-500'
                            }`}>
                              Due {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 transition-all duration-300">
                          {editingId !== task._id && (
                            <button
                              onClick={(e) => { e.stopPropagation(); startEditing(task); }}
                              className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 rounded-xl transition-all shadow-sm"
                              title="Edit Task"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteTask(task._id); }}
                            className="p-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-500 rounded-xl transition-all shadow-sm"
                            title="Delete Task"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          )}
        </div>
      </main>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setIsModalOpen(false)} 
          />
          <div className="relative bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight">Create New Task</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <form onSubmit={onSubmitTask} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Task Description</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="e.g., Complete the project documentation"
                  autoFocus
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Priority Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["low", "medium", "high"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewPriority(p)}
                        className={`py-2 text-[10px] font-black uppercase tracking-tighter rounded-xl border-2 transition-all ${
                          newPriority === p 
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400' 
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["todo", "in progress", "completed"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNewStatus(s)}
                        className={`py-2 text-[10px] font-black uppercase tracking-tighter rounded-xl border-2 transition-all ${
                          newStatus === s 
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400' 
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Due Date (Optional)</label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newContent.trim()}
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-2xl text-sm transition-colors shadow-xl shadow-indigo-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Syncing...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
