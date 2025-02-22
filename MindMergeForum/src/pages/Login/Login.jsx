import { useContext, useState } from "react";
import { loginUser, resetPassword, signInWithGoogle } from "../../../services/auth.services";
import { useNavigate, Link } from "react-router-dom";
import { AppContext } from "../../store/app.context";
import { Roles } from "../../../common/roles.enum";
import { getUserData } from "../../../services/user.services";
import "./Login.css";

export default function Login() {
  const { setAppState } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);
    try {
      const userCredential = await loginUser(email, password);
      const user = userCredential.user;
      const userData = await getUserData(user.uid);
      const userRole = userData.role;

      setAppState({
        user,
        userData,
      });

      if (userRole === Roles.banned) {
        navigate("/banned");
      } else {
        navigate("/forum");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setSuccessMessage("");
    setIsLoading(true);
    if (!email) {
      setError("Please enter your email address");
      setIsLoading(false);
      return;
    }
    try {
      await resetPassword(email);
      setSuccessMessage("Password reset email sent. Please check your inbox.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSuccessMessage("");
    setIsLoading(true);
    try {
      const userData = await signInWithGoogle();
      setAppState({
        user: userData,
        userData,
      });
      navigate("/forum");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Log in</h2>
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Log in"}
        </button>
      </form>
      <div className="additional-options">
        <button onClick={handleForgotPassword} className="btn btn-secondary" disabled={isLoading}>
          Forgot Password
        </button>
        <button onClick={handleGoogleSignIn} className="btn btn-google" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in with Google"}
        </button>
      </div>
      <p className="register-link">
        Don&apos;t have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}
