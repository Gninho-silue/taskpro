import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { XMarkIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { CreateProjectData } from '../../types/project.types';

// Schema de validation pour le formulaire
const createProjectSchema = yup.object({
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
  teamId: yup
    .number()
    .nullable()
});

// Interface pour les props du modal
interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectData) => void;
  isLoading: boolean;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<CreateProjectData>({
    resolver: yupResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      startDate: '',
      dueDate: '',
      teamId: undefined
    }
  });

  const startDate = watch('startDate');

  const handleFormSubmit = (data: CreateProjectData) => {
    // Nettoyer les données et convertir les dates au format LocalDateTime
    const cleanData = {
      ...data,
      startDate: data.startDate ? `${data.startDate}T00:00:00` : undefined,
      dueDate: data.dueDate ? `${data.dueDate}T00:00:00` : undefined,
      teamId: data.teamId || undefined
    };
    console.log('Form data to submit:', cleanData);
    onSubmit(cleanData);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />
      
      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Create New Project</h2>
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
              <label htmlFor="name" className="form-label">
                Project Name *
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                placeholder="Enter project name"
                autoFocus
              />
              {errors.name && (
                <p className="form-error">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                {...register('description')}
                id="description"
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
                <label htmlFor="startDate" className="form-label">
                  Start Date
                </label>
                <div className="relative">
                  <input
                    {...register('startDate')}
                    type="date"
                    id="startDate"
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
                <label htmlFor="dueDate" className="form-label">
                  Due Date
                </label>
                <div className="relative">
                  <input
                    {...register('dueDate')}
                    type="date"
                    id="dueDate"
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

            {/* Team Selection */}
            <div>
              <label htmlFor="teamId" className="form-label">
                Team (Optional)
              </label>
              <select
                {...register('teamId', { 
                  setValueAs: (value) => value === '' ? undefined : Number(value)
                })}
                id="teamId"
                className="form-input"
              >
                <option value="">No team assigned</option>
                {/* TODO: Load teams from Redux store */}
                <option value="1">Development Team</option>
                <option value="2">Design Team</option>
                <option value="3">Marketing Team</option>
                <option value="4">Quality Assurance</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                You can assign a team to collaborate on this project
              </p>
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
                    <span>Creating...</span>
                  </div>
                ) : (
                  'Create Project'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
