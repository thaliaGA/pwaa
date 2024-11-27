import React, { useState } from 'react';
import './RegisterForm.css';
import { Link } from 'react-router-dom';

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegisterUser = (event) => {
    event.preventDefault(); // Previene la recarga de la página al enviar el formulario

    const userToSend = {
      name: name,
      email: email,
      password: password
    };
  
    // Intenta enviar los datos al servidor
    fetch('https://musicback-748m.onrender.com/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userToSend)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error en la API');
        }
        return response.json();
      })
      .then(data => {
        console.log('Usuario registrado exitosamente:', data);
        // Aquí puedes limpiar los campos o hacer alguna acción posterior
        setName('');
        setEmail('');
        setPassword('');
      })
      .catch(error => {
        console.error('Error en la petición, guardando localmente:', error);
  
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          navigator.serviceWorker.ready.then(sw => {
            return sw.sync.register('sync-users');
          }).then(() => {
            console.log('Sincronización registrada');
          }).catch(err => console.error('Error al registrar la sincronización:', err));
        }
  
        saveUserToIndexedDB(userToSend)
          .then(() => {
            console.log('Usuario guardado en IndexedDB debido a la falla en la red');
          })
          .catch(err => console.error('Error al guardar en IndexedDB:', err));
      });
  };

  const saveUserToIndexedDB = (user) => {
    return new Promise((resolve, reject) => {
      let dbRequest = indexedDB.open('userDB');

      dbRequest.onupgradeneeded = (event) => {
        let db = event.target.result;
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
        }
      };

      dbRequest.onsuccess = (event) => {
        let db = event.target.result;
        let transaction = db.transaction('users', 'readwrite');
        let objectStore = transaction.objectStore('users');
        let addRequest = objectStore.add(user);

        addRequest.onsuccess = () => {
          resolve();
        };

        addRequest.onerror = () => {
          reject('Error al guardar en IndexedDB');
        };
      };

      dbRequest.onerror = () => {
        reject('Error al abrir IndexedDB');
      };
    });
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleRegisterUser}>
        <h2>Registro</h2>
        <label>
          Nombre:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Correo electrónico:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Contraseña:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">Registrarse</button>

        <p className="login-link">
          ¿Ya tienes una cuenta? <Link to="/">Inicia sesión aquí</Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterForm;