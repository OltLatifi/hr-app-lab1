import React, { useState } from 'react';
import { useAuthStore } from '../stores/auth-store'; // Assuming register function will be added here
// import { useNavigate } from 'react-router-dom';
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

const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    // Assuming register function and isLoading state will be added to the store
    const register = useAuthStore(state => state.register); 
    const isLoading = useAuthStore(state => state.isLoading); 
    // const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        
        if (!register) {
            setError('Registration function not available.'); // Placeholder error
            console.error('Register function not found in auth store.');
            return;
        }


        try {
            await register("name_input", email, password);
            // // Optionally navigate to login page or directly log in after registration
            // navigate('/login'); 
        } catch (err) {
            const axiosError = err as AxiosError<{ message?: string }>;
            const message = axiosError.response?.data?.message || 'Registration failed. Please try again.';
            setError(message);
            console.error('Registration submit error:', err);
        }
    };

    return (
        <div style={styles.container}>
            <h2>Register</h2>
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
                        disabled={isLoading}
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
                <div>
                    <label htmlFor="confirmPassword">Confirm Password:</label>
                    <input
                        style={styles.input}
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                <button style={styles.button} type="submit" disabled={isLoading}>
                    {isLoading ? 'Registering...' : 'Register'}
                </button>
            </form>
        </div>
    );
};

export default RegisterPage; 