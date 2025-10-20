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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Project Manager</h1>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
            <button
              onClick={() => setShowProjectModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              New Project
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projects.map((project: any) => (
              <div
                key={project._id}
                onClick={() => {
                  setSelectedProject(project._id);
                  setProjectMembers(project.members || []);
                  fetchTasks(project._id);
                }}
                className={`p-4 bg-white rounded-lg shadow cursor-pointer hover:shadow-md transition ${
                  selectedProject === project._id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <h3 className="font-semibold text-lg text-gray-900">{project.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                    {project.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    👥 {project.members?.length || 0} members
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowMemberModal(true)}
                disabled={!selectedProject}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
              >
                Add Member
              </button>
              <button
                onClick={() => setShowTaskModal(true)}
                disabled={!selectedProject}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                New Task
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['todo', 'in-progress', 'completed'].map((status) => (
              <div key={status} className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 capitalize text-gray-900">{status.replace('-', ' ')}</h3>
                <div className="space-y-3">
                  {tasks
                    .filter((task: any) => task.status === status)
                    .map((task: any) => (
                      <div key={task._id} className="bg-white p-3 rounded shadow-sm">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        {task.assignedTo && (
                          <p className="text-xs text-blue-600 mt-1">
                            👤 {task.assignedTo.name}
                          </p>
                        )}
                        {task.deadline && (
                          <p className="text-xs text-gray-500 mt-1">
                            📅 Due: {new Date(task.deadline).toLocaleDateString()}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          {status !== 'todo' && (
                            <button
                              onClick={() => updateTaskStatus(task._id, 'todo')}
                              className="text-xs px-2 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            >
                              To Do
                            </button>
                          )}
                          {status !== 'in-progress' && (
                            <button
                              onClick={() => updateTaskStatus(task._id, 'in-progress')}
                              className="text-xs px-2 py-1 bg-yellow-200 text-gray-800 rounded hover:bg-yellow-300"
                            >
                              In Progress
                            </button>
                          )}
                          {status !== 'completed' && (
                            <button
                              onClick={() => updateTaskStatus(task._id, 'completed')}
                              className="text-xs px-2 py-1 bg-green-200 text-gray-800 rounded hover:bg-green-300"
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
