import React, { useState } from 'react';
import { useAuthStore } from '../stores/auth-store';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '300px',
        margin: '50px auto',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
    },
    input: {
        marginBottom: '10px',
        padding: '8px',
        fontSize: '1rem',
    },
    button: {
        padding: '10px',
        fontSize: '1rem',
        cursor: 'pointer',
    },
    error: {
        color: 'red',
        marginBottom: '10px',
    }
};

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const login = useAuthStore(state => state.login);
    const isLoading = useAuthStore(state => state.isLoading);
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            const axiosError = err as AxiosError<{ message?: string }>;
            const message = axiosError.response?.data?.message || 'Login failed. Please try again.';
            setError(message);
            console.error('Login submit error:', err);
        } 
    };

    return (
        <div style={styles.container}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                {error && <p style={styles.error}>{error}</p>}
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        style={styles.input}
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading} // Use isLoading from store
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        style={styles.input}
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                <button style={styles.button} type="submit" disabled={isLoading}> 
                    {isLoading ? 'Logging in...' : 'Login'} 
                </button>
            </form>
        </div>
    );
};

export default LoginPage; 