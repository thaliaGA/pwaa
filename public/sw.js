const STATIC_CACHE = 'app-shell-v1';
const DYNAMIC_CACHE = 'dinamico';

// Instalación del Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then(cache => {
            return cache.addAll([
                '/components/loginForm.js',
                '/components/LoginForm.css',
                '/palaye.jpg',
                '/assets/error.jpg',
                '/index.html',
                '/assets/img/logo.png'
            ]);
        })
    );
    self.skipWaiting(); // Forzar activación del SW
});

// Activación del Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => 
            Promise.all(
                keys.map(key => {
                    if (![STATIC_CACHE, DYNAMIC_CACHE].includes(key)) {
                        return caches.delete(key); // Eliminar cachés viejas
                    }
                })
            )
        )
    );
    self.clients.claim();
});

// Manejo de peticiones fetch
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return; // Ignorar POST y otros métodos

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                return cachedResponse || fetch(event.request)
                    .then(networkResponse => {
                        return caches.open(DYNAMIC_CACHE).then(cache => {
                            cache.put(event.request, networkResponse.clone());
                            return networkResponse;
                        });
                    });
            })
            .catch(() => caches.match('/assets/error.jpg'))
    );
});

// Manejo de notificaciones push
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Nueva Notificación';
    const options = {
        body: data.body || 'Tienes una nueva notificación',
        icon: '/assets/img/logo.png',
        badge: '/assets/img/logo.png'
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

// Sincronización en segundo plano
self.addEventListener('sync', event => {
    if (event.tag === 'sync-music') {
        event.waitUntil(syncUsuarios());
    }
});

// Función para sincronizar datos de IndexedDB
function syncUsuarios() {
    return new Promise((resolve, reject) => {
        const dbRequest = indexedDB.open('musicDB');
        
        dbRequest.onsuccess = event => {
            const db = event.target.result;
            const transaction = db.transaction('music', 'readonly');
            const objectStore = transaction.objectStore('music');
            const getAllRequest = objectStore.getAll();

            getAllRequest.onsuccess = () => {
                const music = getAllRequest.result;

                if (music.length === 0) {
                    console.log('No hay tareas para sincronizar.');
                    resolve();
                    return;
                }

                const promises = music.map(music => {
                    return fetch('https://musicback-748m.onrender.com/register-music', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(music)
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Error en la API');
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Tarea sincronizada con éxito:', data);
                        eliminarUser(music.id);
                    })
                    .catch(error => {
                        console.error('Error al sincronizar tarea:', error);
                    });
                });

                Promise.all(promises)
                    .then(() => resolve())
                    .catch(error => {
                        console.error('Error en la sincronización:', error);
                        reject(error);
                    });
            };

            getAllRequest.onerror = event => {
                console.error('Error al obtener tareas de IndexedDB', event);
                reject(event);
            };
        };

        dbRequest.onerror = event => {
            console.error('Error al abrir la base de datos:', event);
            reject(event);
        };
    });
}

// Función para eliminar usuarios de IndexedDB
function eliminarUser(id) {
    const request = indexedDB.open('musicDB');

    request.onerror = event => {
        console.error('Error abriendo la base de datos', event);
    };

    request.onsuccess = event => {
        const db = event.target.result;
        const transaction = db.transaction('music', 'readwrite');
        const objectStore = transaction.objectStore('music');
        const deleteRequest = objectStore.delete(id);

        deleteRequest.onsuccess = () => {
            console.log(`Registro con id ${id} eliminado`);
        };

        deleteRequest.onerror = event => {
            console.error(`Error al eliminar el registro con id ${id}`, event);
        };
    };
}

//Listener para push
/*self.addEventListener('push', event => {
    const opciones = {
        body:"mensaje", 
        icon:'/palaye.jpg',
        silent:null
    }
    self.registration.showNotification('Joji', opciones)
})*/