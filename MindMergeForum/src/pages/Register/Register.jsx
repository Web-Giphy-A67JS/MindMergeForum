import { AppContext } from "../../store/app.context";
import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, signInWithGoogle } from "../../../services/auth.services";
import { createUserHandle, getUserByHandle } from "../../../services/user.services";
import { Roles } from "../../../common/roles.enum";
import "./Register.css";

export default function Register() {
  const { setAppState } = useContext(AppContext);
  const [user, setUser] = useState({
    handle: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: Roles.user,
    phone: '',
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const register = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);
    try {
      if (!user.email || !user.password || !user.firstName || !user.lastName || !user.handle) {
        throw new Error('Please fill in all required fields');
      }

      if (user.firstName.length < 4 || user.firstName.length > 32) {
        throw new Error('Your first name must be between 4 and 32 characters');
      }

      if (user.lastName.length < 4 || user.lastName.length > 32) {
        throw new Error('Your last name must be between 4 and 32 characters');
      }

      if (user.phone && isNaN(user.phone)) {
        throw new Error('Please enter a valid phone number');
      }

      const userFromDb = await getUserByHandle(user.handle);
      if (userFromDb) {
        throw new Error(`User with username "${user.handle}" already exists`);
      }

      const userCredential = await registerUser(user.email, user.password);
      await createUserHandle(user.handle, userCredential.user.uid, user.email, user.firstName, user.lastName, user.phone, user.role);

      setAppState({
        user: userCredential.user,
        userData: {
          handle: user.handle,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
        },
      });
      setSuccessMessage("Registration successful! Redirecting to forum...");
      setTimeout(() => navigate('/forum'), 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setSuccessMessage("");
    setIsLoading(true);
    try {
      const userData = await signInWithGoogle();
      setAppState({
        user: userData,
        userData,
      });
      setSuccessMessage("Google sign-up successful! Redirecting to forum...");
      setTimeout(() => navigate('/forum'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (prop) => (e) => {
    setUser({
      ...user,
      [prop]: e.target.value
    });
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      <form onSubmit={register}>
        <div className="form-group">
          <label htmlFor="firstName">First Name:</label>
          <input value={user.firstName} onChange={updateUser('firstName')} type="text" name="firstName" id="firstName" required disabled={isLoading} />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name:</label>
          <input value={user.lastName} onChange={updateUser('lastName')} type="text" name="lastName" id="lastName" required disabled={isLoading} />
        </div>
        <div className="form-group">
          <label htmlFor="handle">Username:</label>
          <input value={user.handle} onChange={updateUser('handle')} type="text" name="handle" id="handle" required disabled={isLoading} />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone (optional):</label>
          <input value={user.phone} onChange={updateUser('phone')} type="tel" name="phone" id="phone" disabled={isLoading} />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input value={user.email} onChange={updateUser('email')} type="email" name="email" id="email" required disabled={isLoading} />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input value={user.password} onChange={updateUser('password')} type="password" name="password" id="password" required disabled={isLoading} />
        </div>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </button>
      </form>
      <div className="additional-options">
        <button onClick={handleGoogleSignUp} className="btn btn-google" disabled={isLoading}>
          {isLoading ? "Signing up..." : "Sign up with Google"}
        </button>
      </div>
      <p className="login-link">
        Already have an account? <Link to="/login">Log in here</Link>
      </p>
    </div>
  );
}