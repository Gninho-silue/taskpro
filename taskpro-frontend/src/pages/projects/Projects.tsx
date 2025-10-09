import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { fetchProjects, createProject, updateProject } from '@store/slices/projectsSlice';
import { Project, CreateProjectData, UpdateProjectData } from '../../types/project.types';
import CreateProjectModal from '../../components/projects/CreateProjectModal';
import EditProjectModal from '../../components/projects/EditProjectModal';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,  
} from '@heroicons/react/24/outline';

// Helper functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'PLANNING':
      return 'bg-gray-100 text-gray-800';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800';
    case 'ON_HOLD':
      return 'bg-yellow-100 text-yellow-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'ON_HOLD':
      return 'On Hold';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const isDueSoon = (dueDate: string) => {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7 && diffDays > 0;
};

const isOverdue = (dueDate: string) => {
  const due = new Date(dueDate);
  const today = new Date();
  return due < today;
};

const Projects: React.FC = () => {
  const dispatch = useAppDispatch();
  const { projects, isLoading, error } = useAppSelector((state) => state.projects);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNING':
        return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'ON_HOLD':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'ON_HOLD':
        return 'On Hold';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isDueSoon = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  const isOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    return due < today;
  };

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // Filter projects based on search and status
  const filteredProjects = projects.filter((project: Project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Handler functions
  const handleViewProject = (project: Project) => {
    console.log('View project:', project);
    // TODO: Navigate to project detail page
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsEditModalOpen(true);
  };

  const handleDeleteProject = (projectId: number) => {
    console.log('Delete project:', projectId);
    // TODO: Implement delete (Step 5)
  };

  // Handler pour créer un projet
  const handleCreateProject = async (data: CreateProjectData) => {
    try {
      await dispatch(createProject(data)).unwrap();
      setIsCreateModalOpen(false);
      console.log('Project created successfully!');
      // TODO: Afficher un toast de succès
    } catch (error) {
      console.error('Failed to create project:', error);
      // TODO: Afficher un toast d'erreur
    }
  };
  // Ajoutez ce nouveau handler
const handleUpdateProject = async (id: number, data: UpdateProjectData) => {
  try {
    await dispatch(updateProject({ id, data })).unwrap();
    setIsEditModalOpen(false);
    setSelectedProject(null);
    console.log('Project updated successfully!');
    // TODO: Afficher un toast de succès
  } catch (error) {
    console.error('Failed to update project:', error);
    // TODO: Afficher un toast d'erreur
  }
};

  // Handler pour ouvrir le modal
  const handleNewProjectClick = () => {
    setIsCreateModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage your projects and track progress</p>
        </div>
        <button 
          onClick={handleNewProjectClick}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 form-input"
            />
          </div>
          
          {/* Filter */}
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-input min-w-32"
            >
              <option value="ALL">All Status</option>
              <option value="PLANNING">Planning</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading projects...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-2">Error loading projects</p>
              <p className="text-gray-500 text-sm">{error}</p>
              <button 
                onClick={() => dispatch(fetchProjects())}
                className="mt-4 btn-primary"
              >
                Retry
              </button>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📁</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {projects.length === 0 ? 'No projects yet' : 'No projects match your filters'}
              </h3>
              <p className="text-gray-500 mb-4">
                {projects.length === 0 
                  ? 'Get started by creating your first project'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              {projects.length === 0 && (
                <button 
                  onClick={handleNewProjectClick}
                  className="btn-primary"
                >
                Create Project
              </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-4">Project</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Due Date</div>
                <div className="col-span-2">Owner</div>
                <div className="col-span-1">Tasks</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>
            
            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {filteredProjects.map((project) => (
                <div key={project.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Project Info */}
                    <div className="col-span-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {project.name.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {project.name}
                          </p>
                          {project.description && (
                            <p className="text-sm text-gray-500 truncate">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Status */}
                    <div className="col-span-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                    </div>
                    
                    {/* Due Date */}
                    <div className="col-span-2">
                      <div className="text-sm text-gray-900">
                        {project.dueDate ? (
                          <div className="flex flex-col">
                            <span>{formatDate(project.dueDate)}</span>
                            {isDueSoon(project.dueDate) && (
                              <span className="text-xs text-orange-600 font-medium">Due soon</span>
                            )}
                            {isOverdue(project.dueDate) && (
                              <span className="text-xs text-red-600 font-medium">Overdue</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">No due date</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Owner */}
                    <div className="col-span-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {project.owner?.firstName?.[0] || 'U'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900">
                          {project.owner?.firstName || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Tasks Count */}
                    <div className="col-span-1">
                      <span className="text-sm text-gray-500">
                        {project.tasks?.length || 0}
                      </span>
                    </div>
                    
                    {/* Actions */}
                    <div className="col-span-1">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleViewProject(project)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          title="View project"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditProject(project)}
                          className="p-1 text-gray-400 hover:text-green-600 rounded"
                          title="Edit project"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                          title="Delete project"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
        isLoading={isLoading}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={isEditModalOpen}
        project={selectedProject}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProject(null);
        }}
        onSubmit={handleUpdateProject}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Projects;