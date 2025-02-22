export const validateEmailChange = (newEmail, currentEmail) => {
  if (!newEmail) {
    return { isValid: false, error: 'Please enter a new email address' };
  }

  if (newEmail === currentEmail) {
    return { isValid: false, error: 'New email must be different from current email' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
};