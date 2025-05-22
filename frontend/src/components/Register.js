import React, { useState } from "react";
import axios from "axios";
import { AUTH_API_URL } from "../config";
import { Link } from 'react-router-dom';
import "../styles/global.css";

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("user");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const register = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await axios.post(`${AUTH_API_URL}/auth/`, { username, password, email, role });
            alert("Registration successful");
            window.location.href = "/";
        } catch (err) {
            console.error(err);
            if (err.response) {
                setError(err.response.data.message || 'Registration failed');
            } else if (err.request) {
                setError("No response from server");
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };    return (
        <div className="auth-container">
            <div className="auth-card">                <div className="auth-logo">
                    <h1>MEMS</h1>
                    <h3>ERP</h3>
                </div>
                
                <h2 className="auth-title">Create an Account</h2>
                
                {error && <div style={{ 
                    color: 'var(--secondary-color)', 
                    marginBottom: '20px', 
                    textAlign: 'center',
                    padding: '10px', 
                    borderRadius: 'var(--border-radius)', 
                    backgroundColor: 'rgba(255, 107, 107, 0.1)' 
                }}>{error}</div>}
                
                <div className="auth-form">
                    <div className="input-group">
                        <label htmlFor="username" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Username</label>
                        <input 
                            id="username" 
                            name="username" 
                            placeholder="Choose a username" 
                            onChange={(e) => setUsername(e.target.value)}
                            className="styled-input"
                            autoComplete="username"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Password</label>
                        <input 
                            id="password" 
                            name="password" 
                            placeholder="Create a password" 
                            type="password" 
                            onChange={(e) => setPassword(e.target.value)}
                            className="styled-input"
                            autoComplete="new-password"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Email</label>
                        <input 
                            id="email" 
                            name="email" 
                            placeholder="Enter your email" 
                            onChange={(e) => setEmail(e.target.value)}
                            className="styled-input"
                            autoComplete="email"
                            type="email"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="role" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Role</label>
                        <select 
                            id="role" 
                            name="role" 
                            onChange={(e) => setRole(e.target.value)}
                            className="styled-input"
                            defaultValue="user"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button 
                        onClick={register} 
                        disabled={loading}
                        className="login-button"
                    >
                        {loading ? "Creating Account..." : "Register"}
                    </button>
                    <div className="auth-link">
                        Already have an account? <Link to="/">Login</Link>
                    </div>
                </div>
            </div>
            <div className="theme-toggle" style={{ position: 'absolute', bottom: '30px', right: '30px' }}>
                <span className="theme-icon">⚙️</span>
            </div>
        </div>
    );
}

export default Register;