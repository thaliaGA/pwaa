import React from 'react';
import './Home.css'; // Asegúrate de crear este archivo para el estilo
import album1 from '../assets/album1.jpg';
import album2 from '../assets/album2.jpg';
import album3 from '../assets/album3.jpg';

const Home = () => {
    return (
        <div className="home-container">
            <img src={album1} alt="Image 1" className="home-image" />
            <img src={album2} alt="Image 2" className="home-image" />
            <img src={album3} alt="Image 3" className="home-image" />
        </div>
    );
};

export default Home;