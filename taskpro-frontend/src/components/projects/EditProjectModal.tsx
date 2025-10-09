import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { XMarkIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { Project, UpdateProjectData, ProjectStatus } from '../../types/project.types';

// Schema de validation pour l'édition
const editProjectSchema = yup.object({
  name: yup
    .string()
    .required('Project name is required')
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name must be less than 100 characters'),
  description: yup
    .string()
    .max(500, 'Description must be less than 500 characters'),
  startDate: yup
    .string()
    .nullable(),
  dueDate: yup
    .string()
    .nullable()
    .test('due-date-after-start', 'Due date must be after start date', function(value) {
      const { startDate } = this.parent;
      if (!value || !startDate) return true;
      return new Date(value) > new Date(startDate);
    }),
});

// Interface pour les props du modal
interface EditProjectModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onSubmit: (id: number, data: UpdateProjectData) => void;
  isLoading: boolean;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ 
  isOpen, 
  project,
  onClose, 
  onSubmit, 
  isLoading 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<UpdateProjectData>({
    resolver: yupResolver(editProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      startDate: '',
      dueDate: '',
    }
  });

  const startDate = watch('startDate');

  // Remplir le formulaire quand le projet change
  useEffect(() => {
    if (project && isOpen) {
      setValue('name', project.name || '');
      setValue('description', project.description || '');
      setValue('startDate', project.startDate ? project.startDate.split('T')[0] : '');
      setValue('dueDate', project.dueDate ? project.dueDate.split('T')[0] : '');
    }
  }, [project, isOpen, setValue]);

  const handleFormSubmit = (data: UpdateProjectData) => {
    if (!project) return;

    // Nettoyer les données et convertir les dates
    const cleanData: UpdateProjectData = {
      ...data,
      startDate: data.startDate ? `${data.startDate}T00:00:00` : undefined,
      dueDate: data.dueDate ? `${data.dueDate}T00:00:00` : undefined,
    };
    
    console.log('Edit form data to submit:', cleanData);
    onSubmit(project.id, cleanData);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />
      
      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Edit Project</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
            {/* Project Name */}
            <div>
              <label htmlFor="edit-name" className="form-label">
                Project Name *
              </label>
              <input
                {...register('name')}
                type="text"
                id="edit-name"
                className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                placeholder="Enter project name"
              />
              {errors.name && (
                <p className="form-error">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="edit-description" className="form-label">
                Description
              </label>
              <textarea
                {...register('description')}
                id="edit-description"
                rows={3}
                className={`form-input resize-none ${errors.description ? 'form-input-error' : ''}`}
                placeholder="Enter project description (optional)"
              />
              {errors.description && (
                <p className="form-error">{errors.description.message}</p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <label htmlFor="edit-startDate" className="form-label">
                  Start Date
                </label>
                <div className="relative">
                  <input
                    {...register('startDate')}
                    type="date"
                    id="edit-startDate"
                    className={`form-input pr-10 ${errors.startDate ? 'form-input-error' : ''}`}
                  />
                  <CalendarIcon className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {errors.startDate && (
                  <p className="form-error">{errors.startDate.message}</p>
                )}
              </div>

              {/* Due Date */}
              <div>
                <label htmlFor="edit-dueDate" className="form-label">
                  Due Date
                </label>
                <div className="relative">
                  <input
                    {...register('dueDate')}
                    type="date"
                    id="edit-dueDate"
                    min={startDate || undefined}
                    className={`form-input pr-10 ${errors.dueDate ? 'form-input-error' : ''}`}
                  />
                  <CalendarIcon className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {errors.dueDate && (
                  <p className="form-error">{errors.dueDate.message}</p>
                )}
              </div>
            </div>

            {/* Project Info */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>Created:</strong> {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Owner:</strong> {project.owner?.firstName || 'Unknown'} {project.owner?.lastname || ''}</p>
                <p><strong>Tasks:</strong> {project.tasks?.length || 0}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProjectModal;