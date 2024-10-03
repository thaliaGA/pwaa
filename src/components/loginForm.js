import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css'; 

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validación simple de usuario y contraseña
        const validEmail = 'user@example.com';
        const validPassword = 'password123';

        if (email === validEmail && password === validPassword) {
            // Si los datos son correctos, redirige a la página del home
            navigate('/home');
        } else {
            // Si los datos no son correctos, mostrar un mensaje de error
            setError('Correo o contraseña incorrectos');
        }
    };

    return (
        <div className="login-container">
            <img src="/palaye.jpg" alt="Logo" className="logo" />
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Iniciar Sesión</h2>
                {error && <p className="error-message">{error}</p>}
                <div className="form-group">
                    <label htmlFor="email">Correo Electrónico</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Iniciar</button>
            </form>
        </div>
    );
};

export default LoginForm;