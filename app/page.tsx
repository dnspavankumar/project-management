'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [projectMembers, setProjectMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchProjects();
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setAllUsers(data);
    }
  };

  const fetchProjects = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/projects', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setProjects(data);
    }
  };

  const fetchTasks = async (projectId?: string) => {
    const token = localStorage.getItem('token');
    const url = projectId ? `/api/tasks?projectId=${projectId}` : '/api/tasks';
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setTasks(data);
    }
  };

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const token = localStorage.getItem('token');

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: formData.get('name'),
        description: formData.get('description'),
      }),
    });

    if (res.ok) {
      setShowProjectModal(false);
      fetchProjects();
    }
  };

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const token = localStorage.getItem('token');

    const assignedTo = formData.get('assignedTo');

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: formData.get('title'),
        description: formData.get('description'),
        project: formData.get('project'),
        assignedTo: assignedTo || undefined,
        priority: formData.get('priority'),
        deadline: formData.get('deadline'),
      }),
    });

    if (res.ok) {
      setShowTaskModal(false);
      fetchTasks(selectedProject);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    fetchTasks(selectedProject);
  };

  const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const token = localStorage.getItem('token');
    const userId = formData.get('userId');

    const res = await fetch(`/api/projects/${selectedProject}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    });

    if (res.ok) {
      setShowMemberModal(false);
      fetchProjects();
      const data = await res.json();
      setProjectMembers(data.members || []);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const todoTasks = tasks.filter((task: any) => task.status === 'todo').length;
  const inProgressTasks = tasks.filter((task: any) => task.status === 'in-progress').length;
  const completedTasks = tasks.filter((task: any) => task.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">PM</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Project Manager</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={logout}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm hover:shadow-md font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📁</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">To Do</p>
                <p className="text-3xl font-bold text-gray-900">{todoTasks}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-yellow-600">{inProgressTasks}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
        </div>
        {/* Projects Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
            <button
              onClick={() => setShowProjectModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              + New Project
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((project: any) => (
              <div
                key={project._id}
                onClick={() => {
                  setSelectedProject(project._id);
                  setProjectMembers(project.members || []);
                  fetchTasks(project._id);
                }}
                className={`p-6 bg-white rounded-xl shadow-sm cursor-pointer hover:shadow-lg transition-all border-2 ${
                  selectedProject === project._id 
                    ? 'border-indigo-500 shadow-lg' 
                    : 'border-transparent hover:border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-900">{project.name}</h3>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    project.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <span>👥</span>
                    <span>{project.members?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📋</span>
                    <span>{tasks.filter((t: any) => t.project._id === project._id).length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Tasks Board</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setShowMemberModal(true)}
                disabled={!selectedProject}
                className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              >
                + Add Member
              </button>
              <button
                onClick={() => setShowTaskModal(true)}
                disabled={!selectedProject}
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              >
                + New Task
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { status: 'todo', label: 'To Do', color: 'gray', emoji: '📋' },
              { status: 'in-progress', label: 'In Progress', color: 'yellow', emoji: '⚡' },
              { status: 'completed', label: 'Completed', color: 'green', emoji: '✅' }
            ].map(({ status, label, color, emoji }) => (
              <div key={status} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <span>{emoji}</span>
                    <span>{label}</span>
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${color}-100 text-${color}-700`}>
                    {tasks.filter((task: any) => task.status === status).length}
                  </span>
                </div>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {tasks
                    .filter((task: any) => task.status === status)
                    .map((task: any) => (
                      <div key={task._id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{task.title}</h4>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            task.priority === 'high' 
                              ? 'bg-red-100 text-red-700' 
                              : task.priority === 'medium'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                        <div className="space-y-2 mb-3">
                          {task.assignedTo && (
                            <div className="flex items-center gap-2 text-xs text-gray-700">
                              <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-xs">
                                  {task.assignedTo.name.charAt(0)}
                                </span>
                              </div>
                              <span>{task.assignedTo.name}</span>
                            </div>
                          )}
                          {task.deadline && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <span>📅</span>
                              <span>{new Date(task.deadline).toLocaleDateString()}</span>
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {status !== 'todo' && (
                            <button
                              onClick={() => updateTaskStatus(task._id, 'todo')}
                              className="text-xs px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                            >
                              To Do
                            </button>
                          )}
                          {status !== 'in-progress' && (
                            <button
                              onClick={() => updateTaskStatus(task._id, 'in-progress')}
                              className="text-xs px-3 py-1.5 bg-yellow-200 text-yellow-900 rounded-md hover:bg-yellow-300 transition-colors"
                            >
                              In Progress
                            </button>
                          )}
                          {status !== 'completed' && (
                            <button
                              onClick={() => updateTaskStatus(task._id, 'completed')}
                              className="text-xs px-3 py-1.5 bg-green-200 text-green-900 rounded-md hover:bg-green-300 transition-colors"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Create Project</h3>
            <form onSubmit={handleCreateProject}>
              <input
                name="name"
                placeholder="Project Name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded mb-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                name="description"
                placeholder="Description"
                className="w-full px-3 py-2 border border-gray-300 rounded mb-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Create Task</h3>
            <form onSubmit={handleCreateTask}>
              <input
                name="title"
                placeholder="Task Title"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded mb-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <textarea
                name="description"
                placeholder="Description"
                className="w-full px-3 py-2 border border-gray-300 rounded mb-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={2}
              />
              <input
                type="hidden"
                name="project"
                value={selectedProject}
              />
              <select
                name="assignedTo"
                className="w-full px-3 py-2 border border-gray-300 rounded mb-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Unassigned</option>
                {projectMembers.map((member: any) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
              <select
                name="priority"
                className="w-full px-3 py-2 border border-gray-300 rounded mb-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <input
                type="date"
                name="deadline"
                className="w-full px-3 py-2 border border-gray-300 rounded mb-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Add Team Member</h3>
            <form onSubmit={handleAddMember}>
              <select
                name="userId"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded mb-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select a user</option>
                {allUsers
                  .filter((user: any) => !projectMembers.some((m: any) => m._id === user._id))
                  .map((user: any) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Add Member
                </button>
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}