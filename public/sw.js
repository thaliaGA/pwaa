self.addEventListener('install', event=>{

    //console.log(event);

    /*event.respondWith(
        fetch(event.request)
        .then(resp=>{
            if(resp.ok){
                return resp;
            }else{
                console.log('no jalo w');
            }
        })
    );*/

    //console.log(event)

    caches.open('appShell6').then(cache=>{
        cache.addAll([
            '/src/components/loginForm.js',
            '/src/components/LoginForm.css',
            '/palaye.jpg',
            '/src/assets/error.jpg',
        ])
    });


    /*caches.match('/index.html')
    .then(respuesta=>{
        respuesta.text().then(console.log)//imprimir texto en consola
    });*/

    self.skipWaiting();//activar el SW

    });

    self.addEventListener('activate', event=>{
        caches.delete('appShell4');
        //eliminar cache viejita
    })

    self.addEventListener('fetch', event => {
        //console.log(event.request.url);

        // Filtrar solicitudes que provienen de extensiones o esquemas no soportados
    const url = new URL(event.request.url);
    if (url.protocol === 'chrome-extension:' || url.protocol !== 'http:' && url.protocol !== 'https:') {
        return; // Ignorar solicitudes de esquemas no soportados
    }

        const resp = fetch(event.request).then(respuesta => {
            if (!respuesta) {
                // Si la respuesta no existe, buscamos en el cache
                return caches.match(event.request).then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    } else {
                        // Si no está en el cache, retornamos una imagen de error desde el cache
                        return caches.match('/src/assets/error.jpg'); // Ruta de la imagen de error en cache
                    }
                });
            } else {
                // Si la respuesta existe, la almacenamos en el cache dinámico
                return caches.open('dinamico').then(cache => {
                    cache.put(event.request, respuesta.clone());
                    return respuesta;
                });
            }
        }).catch(err => {
            // Si ocurre un error (por ejemplo, si no hay conexión), buscamos en el cache
            return caches.match(event.request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                } else {
                    // Si no está en el cache, retornamos la imagen de error
                    return caches.match('/public/img/error.jpg');
                }
            });
        });
    
        event.respondWith(resp);
    });

