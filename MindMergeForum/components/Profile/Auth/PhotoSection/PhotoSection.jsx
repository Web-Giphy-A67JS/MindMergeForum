import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { uploadProfilePhoto, deleteProfilePhoto } from '../../../../services/profile.services';

export default function PhotoSection({ photoURL, onPhotoUpdate }) {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handlePhotoClick = () => {
    if (!loading) {
      fileInputRef.current?.click();
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError('');
      const newPhotoURL = await uploadProfilePhoto(file);
      onPhotoUpdate(newPhotoURL);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoDelete = async () => {
    try {
      setLoading(true);
      setError('');
      await deleteProfilePhoto();
      onPhotoUpdate(null);
    } catch (error) {
      if (error.message !== 'No profile photo found') {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="photo-section">
      <div className="photo-container">
        <img
          src={photoURL || 'https://via.placeholder.com/100'}
          alt="Profile"
          className={`profile-photo ${loading ? 'loading' : ''}`}
          onClick={handlePhotoClick}
        />
        {!loading && (
          <div className="photo-upload-overlay" onClick={handlePhotoClick}>
            <span className="photo-upload-text">
              {photoURL ? 'Change Photo' : 'Add Photo'}
            </span>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoChange}
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          disabled={loading}
        />
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading && (
        <div className="loading-indicator">
          Updating photo...
        </div>
      )}
      
      {photoURL && !loading && (
        <button 
          className="button button-danger photo-delete-button"
          onClick={handlePhotoDelete}
          disabled={loading}
        >
          Remove Photo
        </button>
      )}
    </div>
  );
}

PhotoSection.propTypes = {
  photoURL: PropTypes.string,
  onPhotoUpdate: PropTypes.func.isRequired
};

PhotoSection.defaultProps = {
  photoURL: null
};