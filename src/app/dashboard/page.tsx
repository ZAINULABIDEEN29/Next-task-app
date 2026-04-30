"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useTaskContext, Task } from "@/context/TaskContext";
import { useAuthContext } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";


// Sortable Task Card Component
function SortableTask({ task, ...props }: { task: Task } & any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} {...props} />
    </div>
  );
}

// Separate Task Card UI for reuse in Overlay
function TaskCard({ 
  task, 
  editingId, 
  editContent, 
  setEditContent, 
  editPriority, 
  setEditPriority, 
  editStatus, 
  setEditStatus, 
  editDeadline, 
  setEditDeadline, 
  onUpdateTask, 
  setEditingId, 
  startEditing, 
  deleteTask,
  getPriorityColor
}: any) {
  return (
    <motion.div
      layout
      className="group relative bg-white dark:bg-[#0c0c0e] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 cursor-grab active:cursor-grabbing"
    >
      {/* Task Priority Badge */}
      <div className="flex justify-between items-start mb-3">
        <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider shadow-sm ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); startEditing(task); }}
            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); deleteTask(task._id); }}
            className="p-1 text-slate-400 hover:text-rose-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      </div>

      {/* Content */}
      {editingId === task._id ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300" onPointerDown={(e) => e.stopPropagation()}>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Content</label>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              autoFocus
              className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-all resize-none min-h-[100px] font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Priority</label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-[11px] font-bold focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-[11px] font-bold focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="todo">To Do</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Due Date</label>
            <input
              type="date"
              value={editDeadline}
              onChange={(e) => setEditDeadline(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-[11px] font-bold focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onUpdateTask(task._id); }} 
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest py-2 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
            >
              Save
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setEditingId(null); }} 
              className="flex-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-black uppercase tracking-widest py-2 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-[14px] font-bold text-slate-800 dark:text-slate-200 mb-4 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {task.content}
        </p>
      )}

      {/* Metadata Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {task.deadline && (
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tight shadow-sm ${
              new Date(task.deadline) < new Date() && task.status !== 'completed'
              ? 'bg-rose-500 text-white'
              : 'bg-emerald-500 text-white'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
          )}
          
          <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
              <span className="text-[9px] font-bold">0/3</span>
          </div>
        </div>

        <div className="flex -space-x-1.5">
          <div className="w-5 h-5 rounded-full border border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-sm">
            <img src={`https://i.pravatar.cc/50?u=${task._id}`} alt="avatar" />
          </div>
          <div className="w-5 h-5 rounded-full border border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-sm">
            <img src={`https://i.pravatar.cc/50?u=${task._id}1`} alt="avatar" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}



function DroppableColumn({ id, children, className }: any) {
  const { setNodeRef, isOver } = useDroppable({ id });
  
  return (
    <div 
      ref={setNodeRef} 
      className={`${className} transition-colors duration-200 ${isOver ? 'bg-indigo-500/10 ring-2 ring-indigo-500/20' : ''}`}
    >
      {children}
    </div>
  );
}

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
  const [viewFilter, setViewFilter] = useState<"all" | "pending" | "completed">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editPriority, setEditPriority] = useState<"high" | "medium" | "low">("medium");
  const [editStatus, setEditStatus] = useState<"todo" | "in progress" | "completed">("todo");
  const [newDeadline, setNewDeadline] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleLogout = async () => {
    await logout();
  };

  const onSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createTask(newContent, newPriority, newDeadline, newStatus);
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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    setTasks((prev) => {
      const activeIndex = prev.findIndex((t) => t._id === activeId);
      const overIndex = prev.findIndex((t) => t._id === overId);
      
      const activeTask = prev[activeIndex];
      if (!activeTask) return prev;

      // Case 1: Dragging over another task
      const overTask = prev[overIndex];
      if (overTask && activeTask.status !== overTask.status) {
        const newTasks = [...prev];
        newTasks[activeIndex] = { ...activeTask, status: overTask.status };
        return arrayMove(newTasks, activeIndex, overIndex);
      }

      // Case 2: Dragging over a column background
      const isOverAColumn = ["todo", "in progress", "completed"].includes(overId as string);
      if (isOverAColumn && activeTask.status !== overId) {
        const newTasks = [...prev];
        newTasks[activeIndex] = { ...activeTask, status: overId as any };
        // Place it at the end of the items in that column
        const columnItems = newTasks.filter(t => t.status === overId);
        const lastInColumn = columnItems[columnItems.length - 1];
        const lastIndex = lastInColumn ? newTasks.findIndex(t => t._id === lastInColumn._id) : activeIndex;
        
        return arrayMove(newTasks, activeIndex, lastIndex);
      }

      return prev;
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    setTasks((prev) => {
      const activeIndex = prev.findIndex((t) => t._id === activeId);
      const overIndex = prev.findIndex((t) => t._id === overId);

      let updatedTasks = prev;
      if (activeIndex !== -1 && overIndex !== -1 && activeId !== overId) {
        updatedTasks = arrayMove(prev, activeIndex, overIndex);
      }

      const finalTask = updatedTasks.find(t => t._id === activeId);
      if (finalTask) {
        // We trigger the updateTask outside the state update
        setTimeout(() => {
          updateTask(finalTask._id, { 
            status: finalTask.status,
            isCompleted: finalTask.status === "completed"
          });
        }, 0);
      }

      return updatedTasks;
    });
  };



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
      case "high": return "bg-rose-500 text-white shadow-rose-500/20";
      case "medium": return "bg-amber-500 text-white shadow-amber-500/20";
      case "low": return "bg-emerald-500 text-white shadow-emerald-500/20";
      default: return "bg-slate-500 text-white shadow-slate-500/20";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "todo": return "Upcoming";
      case "in progress": return "In Progress";
      case "completed": return "Done";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-fixed bg-gradient-to-br from-indigo-50/50 via-white to-sky-50/50 dark:from-slate-950 dark:via-[#09090b] dark:to-indigo-950/20 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-500/30">
      {/* Premium Gradient Background Element */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-500/5 blur-[120px] rounded-full" />
      </div>

      
      <main className="relative z-10 p-6 lg:px-10 max-w-[1600px] mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Task Management</h1>
             
            </div>
            <p className="text-slate-500 text-sm font-medium">Keep your team synchronized and tasks on track.</p>
          </div>
          
          <div className="flex items-center gap-4">
            
            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50 mr-2">
              {(["all", "pending", "completed"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setViewFilter(f)}
                  className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                    viewFilter === f 
                    ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 group"
            >
              <svg className="group-hover:rotate-90 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Task
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-sm font-bold flex justify-between items-center shadow-sm">
            {error}
            <button onClick={() => setError(null)} className="hover:opacity-50 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}

        {/* Kanban Board Layout */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start pb-20 overflow-x-auto">
            {(["todo", "in progress", "completed"] as const)
              .filter(status => {
                if (viewFilter === "all") return true;
                if (viewFilter === "pending") return status === "todo" || status === "in progress";
                if (viewFilter === "completed") return status === "completed";
                return true;
              })
              .map((status) => (
              <div key={status} id={status} className={`flex flex-col min-w-[320px] max-h-[85vh] ${viewFilter !== 'all' ? 'lg:max-w-md mx-auto w-full' : ''}`}>
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      {getStatusLabel(status)}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      {tasks.filter(t => t.status === status).length}
                    </span>
                  </div>
                </div>

                <DroppableColumn 
                  id={status} 
                  className="flex-1 flex flex-col gap-3 p-3 bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-y-auto custom-scrollbar backdrop-blur-sm min-h-[200px]"
                >
                  <SortableContext 
                    id={status}
                    items={tasks.filter(t => t.status === status).map(t => t._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <AnimatePresence mode="popLayout">
                      {tasks.filter(t => t.status === status).length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="py-10 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl"
                        >
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Empty</p>
                        </motion.div>
                      ) : (
                        tasks.filter(t => t.status === status).map((task) => (
                          <SortableTask 
                            key={task._id} 
                            task={task}
                            editingId={editingId}
                            editContent={editContent}
                            setEditContent={setEditContent}
                            editPriority={editPriority}
                            setEditPriority={setEditPriority}
                            editStatus={editStatus}
                            setEditStatus={setEditStatus}
                            editDeadline={editDeadline}
                            setEditDeadline={setEditDeadline}
                            onUpdateTask={onUpdateTask}
                            setEditingId={setEditingId}
                            startEditing={startEditing}
                            deleteTask={deleteTask}
                            getPriorityColor={getPriorityColor}
                          />
                        ))
                      )}
                    </AnimatePresence>
                  </SortableContext>

                  <button 
                    onClick={() => {
                      setNewStatus(status);
                      setIsModalOpen(true);
                    }}
                    className="mt-2 group flex items-center gap-2 p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-xl transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    <svg className="group-hover:rotate-90 transition-transform" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    <span className="text-xs font-bold">Add another card</span>
                  </button>
                </DroppableColumn>
              </div>
            ))}
          </div>
          
          <DragOverlay dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: '0.5',
                },
              },
            }),
          }}>
            {activeTask ? (
              <div className="w-[320px] rotate-2 scale-105 opacity-90 shadow-2xl">
                <TaskCard 
                  task={activeTask} 
                  getPriorityColor={getPriorityColor}
                  editingId={null} // Don't show editing in overlay
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
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
