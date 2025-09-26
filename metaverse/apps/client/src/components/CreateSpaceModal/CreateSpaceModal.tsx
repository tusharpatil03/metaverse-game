import React, { useState } from 'react';
import { useSpace } from '../../contexts/SpaceContext';
import type { CreateSpaceRequest, Space } from '../../types/space';
import styles from './CreateSpaceModal.module.css';

interface CreateSpaceModalProps {
  onClose: () => void;
  onSpaceCreated: (space: Space) => void;
}

const CreateSpaceModal: React.FC<CreateSpaceModalProps> = ({ onClose, onSpaceCreated }) => {
  const { createSpace, isLoading } = useSpace();
  const [formData, setFormData] = useState<CreateSpaceRequest>({
    name: '',
    description: '',
    width: 50,
    height: 50,
    isPublic: true,
    maxUsers: 100,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : type === 'number' 
          ? parseInt(value) || 0
          : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Space name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Space name must be at least 3 characters';
    }

    if (formData.width < 10 || formData.width > 200) {
      newErrors.width = 'Width must be between 10 and 200';
    }

    if (formData.height < 10 || formData.height > 200) {
      newErrors.height = 'Height must be between 10 and 200';
    }

    if (formData.maxUsers && (formData.maxUsers < 1 || formData.maxUsers > 1000)) {
      newErrors.maxUsers = 'Max users must be between 1 and 1000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const newSpace = await createSpace(formData);
      onSpaceCreated(newSpace);
    } catch (error) {
      console.error('Failed to create space:', error);
      // Error is handled by the context
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>🏗️ Create New Space</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Space Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter space name"
              className={errors.name ? styles.error : ''}
              disabled={isLoading}
            />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your space (optional)"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="width">Width *</label>
              <input
                type="number"
                id="width"
                name="width"
                value={formData.width}
                onChange={handleChange}
                min="10"
                max="200"
                className={errors.width ? styles.error : ''}
                disabled={isLoading}
              />
              {errors.width && <span className={styles.errorText}>{errors.width}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="height">Height *</label>
              <input
                type="number"
                id="height"
                name="height"
                value={formData.height}
                onChange={handleChange}
                min="10"
                max="200"
                className={errors.height ? styles.error : ''}
                disabled={isLoading}
              />
              {errors.height && <span className={styles.errorText}>{errors.height}</span>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="maxUsers">Max Users</label>
            <input
              type="number"
              id="maxUsers"
              name="maxUsers"
              value={formData.maxUsers || ''}
              onChange={handleChange}
              min="1"
              max="1000"
              placeholder="Leave empty for unlimited"
              className={errors.maxUsers ? styles.error : ''}
              disabled={isLoading}
            />
            {errors.maxUsers && <span className={styles.errorText}>{errors.maxUsers}</span>}
          </div>

          <div className={`${styles.formGroup} ${styles.checkboxGroup}`}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                disabled={isLoading}
              />
              <span className={styles.checkmark}></span>
              Make this space public
            </label>
            <small>Public spaces can be joined by anyone</small>
          </div>

          <div className={styles.formActions}>
            <button 
              type="button" 
              onClick={onClose} 
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.createButton}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Space'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSpaceModal;
