import { useState } from 'react';
import PropTypes from 'prop-types';
import { initiateEmailChange } from '../../../../services/auth.services';
import { validateEmailChange } from './emailValidation';

export default function EmailSection({ currentEmail }) {
  const [state, setState] = useState({
    newEmail: '',
    error: '',
    success: ''
  });

  const handleEmailChange = async () => {
    try {
      const validation = validateEmailChange(state.newEmail, currentEmail);

      if (!validation.isValid) {
        setState(prev => ({ ...prev, error: validation.error }));
        return;
      }

      await initiateEmailChange(state.newEmail);
      setState(prev => ({ 
        ...prev,
        success: 'Verification email sent to your current email address',
        newEmail: '',
        error: ''
      }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  };

  return (
    <div className="section">
      <h3 className="section-title">Email Settings</h3>
      {state.error && <div className="error-message">{state.error}</div>}
      {state.success && <div className="success-message">{state.success}</div>}
      
      <div className="form-group">
        <label htmlFor="currentEmail">Current Email:</label>
        <input
          id="currentEmail"
          type="email"
          value={currentEmail}
          disabled
        />
      </div>
      <div className="form-group">
        <label htmlFor="newEmail">New Email:</label>
        <input
          id="newEmail"
          type="email"
          value={state.newEmail}
          onChange={(e) => setState(prev => ({ ...prev, newEmail: e.target.value }))}
          placeholder="Enter new email address"
        />
      </div>
      <button 
        className="button button-primary"
        onClick={handleEmailChange}
      >
        Change Email
      </button>
    </div>
  );
}

EmailSection.propTypes = {
  currentEmail: PropTypes.string.isRequired
};