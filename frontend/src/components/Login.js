import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AUTH_API_URL } from "../config";
import { Link } from 'react-router-dom';
import "../styles/global.css";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const login = async () => {
        try {
            setLoading(true);
            setError("");
            
            const form = new URLSearchParams();
            form.append("username", username);
            form.append("password", password);            const res = await axios.post(`${AUTH_API_URL}/auth/token`, form);
            const token = res.data.access_token;

            // Add logging for debugging
            console.log('Received token from auth service');
            
            // Store token in localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("tokenTimestamp", Date.now().toString());
            
            navigate("/Dashboard");
        } catch (err) {
            console.error(err); 
            if (err.response) {
                setError(err.response.data.message || 'An error occurred');
            } else if (err.request) {
                setError("No response from server");
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            login();
        }
    };    return (
        <div className="auth-container">
            <div className="auth-card">                <div className="auth-logo">
                    <h1>MEMS</h1>
                    <h3>ERP</h3>
                </div>
                
                <h2 className="auth-title">Welcome Back</h2>
                
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
                            placeholder="Enter your username" 
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="styled-input"
                            autoComplete="username"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Password</label>
                        <input 
                            id="password" 
                            name="password" 
                            placeholder="Enter your password" 
                            type="password" 
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="styled-input"
                            autoComplete="current-password"
                        />
                    </div>
                    <button 
                        onClick={login} 
                        disabled={loading}
                        className="login-button"
                    >
                        {loading ? "Logging in..." : "Sign In"}
                    </button>
                    <div className="auth-link">
                        Don't have an account? <Link to="/register">Register</Link>
                    </div>
                </div>
            </div>
            <div className="theme-toggle" style={{ position: 'absolute', bottom: '30px', right: '30px' }}>
                <span className="theme-icon">⚙️</span>
            </div>
        </div>
    );
}

export default Login;
