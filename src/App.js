import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/loginForm'; // Importamos el componente Login
import Home from './components/Home'; // Página a la que redirigimos después del login
import RegisterForm from './components/RegisterForm'; // Importamos el componente de registro

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginForm />} />
                <Route path="/home" element={<Home />} />
                <Route path="/register" element={<RegisterForm />} />
            </Routes>
        </Router>
    );
}

export default App;