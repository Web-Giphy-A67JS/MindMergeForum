import { useState } from 'react';
import { changePassword } from '../../../../services/auth.services';
import { validatePasswordChange } from './passwordValidation';

export default function PasswordSection() {
  const [state, setState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    error: '',
    success: ''
  });

  const handlePasswordChange = async () => {
    try {
      const { currentPassword, newPassword, confirmPassword } = state;
      const validation = validatePasswordChange(currentPassword, newPassword, confirmPassword);

      if (!validation.isValid) {
        setState(prev => ({ ...prev, error: validation.error }));
        return;
      }

      await changePassword(currentPassword, newPassword);
      setState(prev => ({ 
        ...prev,
        success: 'Password updated successfully',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        error: ''
      }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  };

  return (
    <div className="section">
      <h3 className="section-title">Password Settings</h3>
      {state.error && <div className="error-message">{state.error}</div>}
      {state.success && <div className="success-message">{state.success}</div>}
      
      <div className="form-group">
        <label htmlFor="currentPassword">Current Password:</label>
        <input
          id="currentPassword"
          type="password"
          value={state.currentPassword}
          onChange={(e) => setState(prev => ({ ...prev, currentPassword: e.target.value }))}
          placeholder="Enter current password"
        />
      </div>
      <div className="form-group">
        <label htmlFor="newPassword">New Password:</label>
        <input
          id="newPassword"
          type="password"
          value={state.newPassword}
          onChange={(e) => setState(prev => ({ ...prev, newPassword: e.target.value }))}
          placeholder="Enter new password"
        />
      </div>
      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm New Password:</label>
        <input
          id="confirmPassword"
          type="password"
          value={state.confirmPassword}
          onChange={(e) => setState(prev => ({ ...prev, confirmPassword: e.target.value }))}
          placeholder="Confirm new password"
        />
      </div>
      <button 
        className="button button-primary"
        onClick={handlePasswordChange}
      >
        Change Password
      </button>
    </div>
  );
}