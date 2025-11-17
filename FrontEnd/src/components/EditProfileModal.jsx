import React, { useState } from 'react';
import Modal from './Modal.jsx';
import { DOMAINS, LEARNING_STYLES, STUDY_TIMES, TEAM_PREFERENCES, AVATAR_OPTIONS, getAvatarUrl } from '../constants.js';

const EditProfileModal = ({ user, isOpen, onClose, onProfileUpdate }) => {
  const [formData, setFormData] = useState(user);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update form when user prop changes (in case modal is open and user data updates)
  React.useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDomainChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      domains: checked
        ? [...(prev.domains || []), value]
        : (prev.domains || []).filter(d => d !== value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await onProfileUpdate(formData);
      onClose(); // Close modal on success
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const formInputClass = "mt-1 w-full p-2.5 bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 rounded-lg outline-none text-gray-800 dark:text-gray-200";
  const formLabelClass = "text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Your Profile">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded-lg text-center">
            <p className="text-sm font-medium text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}
        
        <div>
          <label className={formLabelClass}>Choose your Avatar</label>
          <div className="mt-2 flex justify-center mb-4">
              <img src={getAvatarUrl(formData.avatarId)} alt="Avatar" className="w-24 h-24 rounded-full object-cover shadow-lg"/>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {AVATAR_OPTIONS.map(avatar => (
                  <button
                      type="button"
                      key={avatar.id}
                      onClick={() => setFormData(prev => ({ ...prev, avatarId: avatar.id }))}
                      className={`rounded-full overflow-hidden transition-all transform hover:scale-110 ${formData.avatarId === avatar.id ? 'ring-4 ring-blue-500' : 'ring-2 ring-transparent'}`}
                  >
                      <img src={avatar.url} alt={`Avatar ${avatar.id}`} className="w-full h-full object-cover" />
                  </button>
              ))}
          </div>
        </div>
        
        <div>
          <label htmlFor="name" className={formLabelClass}>Name</label>
          <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className={formInputClass} required />
        </div>
        
        <div>
          <label className={formLabelClass}>Interested Domains</label>
          <div className="mt-2 grid grid-cols-2 gap-2">{DOMAINS.map(domain => <label key={domain} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300"><input type="checkbox" value={domain} checked={(formData.domains || []).includes(domain)} onChange={handleDomainChange} className="rounded text-blue-500 focus:ring-blue-500" /><span>{domain}</span></label>)}</div>
        </div>
        
        <div>
            <label htmlFor="learningStyle" className={formLabelClass}>Learning Style</label>
            <select name="learningStyle" id="learningStyle" onChange={handleInputChange} value={formData.learningStyle} className={formInputClass}>{LEARNING_STYLES.map(style => <option key={style} value={style}>{style}</option>)}</select>
        </div>
        
        <div>
            <label htmlFor="studyTime" className={formLabelClass}>Study Time Preference</label>
            <select name="studyTime" id="studyTime" onChange={handleInputChange} value={formData.studyTime} className={formInputClass}>{STUDY_TIMES.map(time => <option key={time} value={time}>{time}</option>)}</select>
        </div>
        
        <div>
            <label className={formLabelClass}>Team or Solo Preference</label>
            <div className="mt-2 flex items-center space-x-6">{TEAM_PREFERENCES.map(pref => <label key={pref} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300"><input type="radio" name="teamPref" value={pref} checked={formData.teamPref === pref} onChange={handleInputChange} className="text-blue-500 focus:ring-blue-500" /><span>{pref}</span></label>)}</div>
        </div>

        <div className="flex justify-end gap-x-4 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 font-medium">
              Cancel
          </button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:bg-gray-400">
              {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;