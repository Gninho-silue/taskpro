import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchProjects } from '../../store/slices/projectsSlice';
import { fetchTeams } from '../../store/slices/teamsSlice';
import {
  FolderIcon,
  CheckCircleIcon,
  UsersIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

// Mock data for demonstration
const mockStats = {
  totalProjects: 12,
  activeTasks: 24,
  completedTasks: 89,
  totalTeams: 5,
  overdueTasks: 3,
  upcomingDeadlines: 8
};

const mockRecentTasks = [
  { id: 1, title: 'Implement user authentication', project: 'TaskPro', priority: 'HIGH', dueDate: '2024-01-20' },
  { id: 2, title: 'Design dashboard UI', project: 'TaskPro', priority: 'MEDIUM', dueDate: '2024-01-22' },
  { id: 3, title: 'Setup CI/CD pipeline', project: 'DevOps', priority: 'HIGH', dueDate: '2024-01-25' },
  { id: 4, title: 'Write API documentation', project: 'Backend', priority: 'LOW', dueDate: '2024-01-28' },
];

const mockRecentActivity = [
  { id: 1, action: 'Task completed', item: 'User registration flow', time: '2 hours ago' },
  { id: 2, action: 'New project created', item: 'Mobile App v2.0', time: '4 hours ago' },
  { id: 3, action: 'Team member added', item: 'John Doe joined Frontend Team', time: '1 day ago' },
  { id: 4, action: 'Task assigned', item: 'Database optimization', time: '2 days ago' },
];

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { projects = [] } = useAppSelector((state) => state.projects || { projects: [] });
  const { teams = [] } = useAppSelector((state) => state.teams || { teams: [] });
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Fetch dashboard data
    dispatch(fetchProjects());
    dispatch(fetchTeams());
  }, [dispatch]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-600 bg-red-100';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100';
      case 'LOW':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change }: any) => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="text-gray-600">Here's what's happening with your projects today.</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-primary">
            Create Project
          </button>
          <button className="btn-secondary">
            Create Task
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard
          title="Total Projects"
          value={projects.length || mockStats.totalProjects}
          icon={FolderIcon}
          color="bg-blue-500"
          change={12}
        />
        <StatCard
          title="Active Tasks"
          value={mockStats.activeTasks}
          icon={ClockIcon}
          color="bg-yellow-500"
          change={-2}
        />
        <StatCard
          title="Completed Tasks"
          value={mockStats.completedTasks}
          icon={CheckCircleIcon}
          color="bg-green-500"
          change={8}
        />
        <StatCard
          title="Teams"
          value={teams.length || mockStats.totalTeams}
          icon={UsersIcon}
          color="bg-purple-500"
          change={5}
        />
        <StatCard
          title="Overdue Tasks"
          value={mockStats.overdueTasks}
          icon={ExclamationTriangleIcon}
          color="bg-red-500"
          change={-15}
        />
        <StatCard
          title="Upcoming Deadlines"
          value={mockStats.upcomingDeadlines}
          icon={ChartBarIcon}
          color="bg-indigo-500"
          change={3}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View all
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {mockRecentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-600">{task.project}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="text-sm text-gray-500">{task.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View all
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {mockRecentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.action}:</span> {activity.item}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FolderIcon className="h-8 w-8 text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">New Project</p>
              <p className="text-sm text-gray-600">Create a new project</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">New Task</p>
              <p className="text-sm text-gray-600">Add a task to a project</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <UsersIcon className="h-8 w-8 text-purple-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Invite Team</p>
              <p className="text-sm text-gray-600">Invite team members</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ChartBarIcon className="h-8 w-8 text-indigo-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">View Reports</p>
              <p className="text-sm text-gray-600">Check project analytics</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


