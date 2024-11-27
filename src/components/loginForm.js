import React, { useState } from 'react'; // Eliminar useEffect si no se usa
import { useNavigate } from 'react-router-dom';
import './LoginForm.css'; 
import { Link } from 'react-router-dom';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:4000/login", {
        method: "POST", 
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({email, password}),
    });

    if (response.ok){
        //Si la respuesta es exitosa, redirige al usuario
        const data = await response.json();

        //Guarda el userId en localStorage
        localStorage.setItem("userId", data.userId)
        console.log("Login sucessful:", data); 

        navigate("/home"); 
    }else{
        const errorData = await response.json();
        setError(errorData.message || "Error aliniciar sesión"); 
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
                <div className="register-link">
                    <p>¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link></p>
                </div>
            </form>
        </div>
    );
};

export default LoginForm;