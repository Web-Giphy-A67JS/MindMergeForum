export const validatePasswordChange = (currentPassword, newPassword, confirmPassword) => {
  if (!currentPassword || !newPassword || !confirmPassword) {
    return { isValid: false, error: 'Please fill in all password fields' };
  }

  if (newPassword !== confirmPassword) {
    return { isValid: false, error: 'New passwords do not match' };
  }

  if (newPassword.length < 6) {
    return { isValid: false, error: 'New password must be at least 6 characters' };
  }

  return { isValid: true };
};