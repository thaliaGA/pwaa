import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/loginForm'; // Importamos el componente Login
import Home from './components/Home'; // Página a la que redirigimos después del login

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginForm />} />
                <Route path="/home" element={<Home />} />
            </Routes>
        </Router>
    );
}

export default App;