import React, { useState, useEffect } from 'react';
import './Home.css';
import album1 from '../assets/album1.jpg';
import album2 from '../assets/album2.jpg';
import album3 from '../assets/album3.jpg';

const Home = () => {
    const [userId, setUserId] = useState(null);
    const [formData, setFormData] = useState({
        favoriteArtist: '',
        favoriteBand: '',
        preferredGenre: '',
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(storedUserId);
        }

        // Verificar suscripción y suscribirse si no está suscrito
        if (!localStorage.getItem('isSubscribed')) {
            subscribeToNotifications();
            localStorage.setItem('isSubscribed', 'true'); // Marca que la suscripción fue hecha
        }

        // Sincronizar datos pendientes cuando se restaure la conexión
        window.addEventListener('online', syncDataWithServer);

        return () => {
            window.removeEventListener('online', syncDataWithServer);
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const dataToSend = { ...formData, userId };
    
        try {
            const response = await fetch('https://musicback-748m.onrender.com/register-music', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });
    
            if (response.ok) {
                setMessage('Registro exitoso!');
                setFormData({ favoriteArtist: '', favoriteBand: '', preferredGenre: '' });

                 // Enviar notificación push
            try {
                const notificationResponse = await fetch('https://musicback-748m.onrender.com/sendNotification', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: userId,
                        message: `¡Gracias por registrarte! Tu género preferido es ${formData.preferredGenre}.`,
                    }),
                });

                if (notificationResponse.ok) {
                    console.log('Notificación push enviada correctamente');
                } else {
                    console.error('Error al enviar la notificación push:', notificationResponse.statusText);
                }
            } catch (error) {
                console.error('Error en el envío de la notificación push:', error);
            }

    
                // Después de un registro exitoso, verificar suscripción
                if (!localStorage.getItem('isSubscribed')) {
                    await subscribeToNotifications();
                    localStorage.setItem('isSubscribed', 'true'); // Marca que la suscripción fue hecha
                }
            } else {
                throw new Error('Error al registrar');
            }
        } catch (error) {
            console.error('Error al enviar el formulario:', error);
            setMessage('Error en la conexión con el servidor.');
    
            // Guardar en IndexedDB si falla la conexión
            if ('serviceWorker' in navigator && 'SyncManager' in window) {
                navigator.serviceWorker.ready.then((sw) => {
                    saveToIndexedDB(dataToSend)
                        .then(() => {
                            return sw.sync.register('sync-music');
                        })
                        .then(() => {
                            console.log('Sincronización registrada');
                        })
                        .catch((err) => console.error('Error al registrar la sincronización:', err));
                });
            } else {
                saveToIndexedDB(dataToSend)
                    .then(() => {
                        console.log('Datos guardados en IndexedDB debido a la falla en la red');
                    })
                    .catch((err) => console.error('Error al guardar en IndexedDB:', err));
            }
        }
    };

    const saveToIndexedDB = (data) => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('musicDB', 1);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('music')) {
                    db.createObjectStore('music', { keyPath: 'id', autoIncrement: true });
                }
            };

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction('music', 'readwrite');
                const objectStore = transaction.objectStore('music');
                const addRequest = objectStore.add(data);

                addRequest.onsuccess = () => {
                    resolve();
                };

                addRequest.onerror = () => {
                    reject('Error al guardar en IndexedDB');
                };
            };

            request.onerror = () => {
                reject('Error al abrir IndexedDB');
            };
        });
    };

    const syncDataWithServer = () => {
        const request = indexedDB.open('musicDB', 1);

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction('music', 'readonly');
            const objectStore = transaction.objectStore('music');
            const getAllRequest = objectStore.getAll();

            getAllRequest.onsuccess = async () => {
                const allData = getAllRequest.result;

                if (allData.length > 0) {
                    for (const data of allData) {
                        try {
                            const response = await fetch('https://musicback-748m.onrender.com/register-music', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(data),
                            });

                            if (response.ok) {
                                console.log('Datos sincronizados:', data);
                                // Eliminar datos sincronizados de IndexedDB
                                const deleteTransaction = db.transaction('music', 'readwrite');
                                const deleteObjectStore = deleteTransaction.objectStore('music');
                                deleteObjectStore.delete(data.id);
                            }
                        } catch (error) {
                            console.error('Error al sincronizar datos:', error);
                        }
                    }
                }
            };
        };
    };

     // Función para suscribirse a notificaciones
     const subscribeToNotifications = async () => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
                const registration = await navigator.serviceWorker.ready;

                // Verificar si ya existe una suscripción
                const existingSubscription = await registration.pushManager.getSubscription();
                if (existingSubscription) {
                    console.log("El usuario ya está suscrito");
                    return;
                }

                // Solicitar permiso para notificaciones
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    const newSubscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: "BHGb-siX4ivcgQ2utJMMnB276rlS48m3UYjsA1ogrAKruUnE2I6Wupq4yHVOiuJAe9EeAlVAurCdb4Hiyb9zoNo"
                    });

                    // Formatear los datos de suscripción junto con userId
                    const subscriptionData = {
                        ...newSubscription.toJSON(),
                        userId: localStorage.getItem("userId")
                    };

                    // Enviar la suscripción a la API
                    const response = await fetch('https://musicback-748m.onrender.com/Suscription', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(subscriptionData)
                    });

                    if (!response.ok) {
                        throw new Error('Error en la solicitud: ' + response.statusText);
                    }

                    const data = await response.json();
                    console.log('Suscripción guardada en la BD', data);
                } else {
                    console.log("Permiso para notificaciones denegado");
                }
            } catch (error) {
                console.error('Error en el proceso de suscripción', error);
            }
        } else {
            console.log("El navegador no soporta Service Worker o Push Notifications");
        }
    };

    return (
        <div className="home-container">
            <section className="intro-section">
                <h1 className="home-title">Bienvenido a Nuestra Página de Música</h1>
                <p className="home-description">
                    Sumérgete en el mundo de la música con nuestras recomendaciones de álbumes, artistas y tendencias musicales. 
                    Exploramos desde los géneros más clásicos hasta los más contemporáneos, destacando las bandas que están 
                    revolucionando la escena.
                </p>
            </section>

            <section className="albums-section">
                <h2 className="albums-title">Álbumes Destacados</h2>
                <div className="albums-grid">
                    <div className="album-item">
                        <img src={album1} alt="Palaye Royale" className="home-image" />
                        <p className="album-description">Palaye Royale: El estilo único que combina el rock clásico con un toque moderno.</p>
                    </div>
                    <div className="album-item">
                        <img src={album2} alt="Dance Gavin Dance" className="home-image" />
                        <p className="album-description">Dance Gavin Dance: Innovadores en la mezcla de post-hardcore con elementos experimentales.</p>
                    </div>
                    <div className="album-item">
                        <img src={album3} alt="Pierce The Veil" className="home-image" />
                        <p className="album-description">Pierce The Veil: Una banda que continúa liderando la escena con su sonido distintivo.</p>
                    </div>
                </div>
            </section>

            <section className="form-section">
                <h2 className="form-title">Regístrate para recibir nuestras noticias</h2>
                <form className="register-form" onSubmit={handleSubmit}>
                    <div className="form-group2">
                        <label htmlFor="favoriteArtist">Artista Favorito:</label>
                        <input
                            type="text"
                            id="favoriteArtist"
                            name="favoriteArtist"
                            value={formData.favoriteArtist}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group2">
                        <label htmlFor="favoriteBand">Banda Favorita:</label>
                        <input
                            type="text"
                            id="favoriteBand"
                            name="favoriteBand"
                            value={formData.favoriteBand}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group2">
                        <label htmlFor="preferredGenre">Género Preferido:</label>
                        <input
                            type="text"
                            id="preferredGenre"
                            name="preferredGenre"
                            value={formData.preferredGenre}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="submit-button">Enviar Datos</button>
                </form>
                {message && <p className="form-message">{message}</p>}
            </section>
        </div>
    );
};

export default Home;