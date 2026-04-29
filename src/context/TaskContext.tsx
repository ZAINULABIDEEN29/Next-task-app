"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import axios from "axios";

export interface Task {
  _id: string;
  content: string;
  isCompleted: boolean;
  status: "todo" | "in progress" | "completed";
  priority: "high" | "medium" | "low";
  deadline?: string;
  createdAt: string;
}

interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  fetchTasks: () => Promise<void>;
  createTask: (content: string, priority: "high" | "medium" | "low") => Promise<boolean>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      if (tasks.length === 0) setIsLoading(true);
      setError(null);
      const response = await axios.get("/api/tasks");
      if (response.data.success) {
        setTasks(response.data.data);
      }
    } catch (err: any) {
      setError("Failed to synchronize tasks with the server.");
    } finally {
      setIsLoading(false);
    }
  }, [tasks.length]);

  const createTask = async (content: string, priority: "high" | "medium" | "low") => {
    try {
      setIsSubmitting(true);
      setError(null);
      const response = await axios.post("/api/tasks", { content, priority });
      if (response.data.success) {
        setTasks((prev) => [response.data.data, ...prev]);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create task.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Optimistic Update
      const previousTasks = [...tasks];
      setTasks(prev => prev.map(t => t._id === id ? { ...t, ...updates } : t));

      const response = await axios.put(`/api/tasks/${id}`, updates);
      
      if (!response.data.success) {
        setTasks(previousTasks); // Rollback
        return false;
      }
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update task.");
      fetchTasks(); // Re-sync
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      setError(null);
      // Optimistic Update
      const previousTasks = [...tasks];
      setTasks(prev => prev.filter(t => t._id !== id));

      const response = await axios.delete(`/api/tasks/${id}`);
      
      if (!response.data.success) {
        setTasks(previousTasks); // Rollback
        return false;
      }
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete task.");
      fetchTasks(); // Re-sync
      return false;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading,
        isSubmitting,
        error,
        setError,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        setTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
}
