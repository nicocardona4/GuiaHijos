const MENU = document.querySelector("#menu");
const MENULOGIN = document.querySelector("#menuLogin");
const ROUTER = document.querySelector("#ruteo");
const LOGIN = document.querySelector("#pantalla-login");
const REGISTRO = document.querySelector("#pantalla-registro");
const INGRESAR = document.querySelector("#pantalla-ingresar");
const EVENTOS = document.querySelector("#pantalla-eventos");
const INFORME = document.querySelector("#pantalla-informe");
const PLAZA = document.querySelector("#pantalla-plaza");
const NAV = document.querySelector("#nav");
const APIbaseURL = 'https://babytracker.develotion.com/';
const COMBO_FILTRO_DEPARTAMENTOS = document.querySelector("#pantalla-registro-combo-departamentos");
const COMBO_FILTRO_CIUDADES = document.querySelector("#pantalla-registro-combo-ciudades");
const COMBO_FILTRO_CATEGORIAS = document.querySelector("#pantalla-ingresar-combo-categorias");
const departamentos = [];
let ciudades = [];
let categorias = [];
let plazas = [];
let usuarioLogueado = null;
let haySesionActiva = false
let usuarios = [];
let eventos = [];
let inicioSesion = true;
let apiKeyActual = '';
let idActual = 0;
let sesion = {
    "apikey": '',
    "id": 0
}
let MAP = null;
let posicionUsuario = {
    latitude: -34.903816878014354,
    longitude: -56.19059048108193
};



inicializar();

function inicializar() {
    suscribirmeAEventos();
    cargarPosicionUsuario();
    inicializarUI();
}

function suscribirmeAEventos() {
    cargarUsuarioDesdeLocalStorage();
    ROUTER.addEventListener('ionRouteDidChange', navegar);
    COMBO_FILTRO_DEPARTAMENTOS.addEventListener("ionChange", comboDepartamentosChangeHandler);


    /* inicializarUI(); */
}

function inicializarUI() {
    if (haySesionActiva) {
        mostrarIngresar()
    } else {
        mostrarLogin()
    }
    /* actualizarMenu */
}

function navegar(evt) {
    /* console.log(evt.detail.to) */
    let ruta = evt.detail.to;
    if (ruta === '/') {
        if (haySesionActiva) {
            ruta = '/ingresar'
        }
        else {
            ruta = "/login"
        }
    }
    ocultarPantallas();
    switch (ruta) {
        /*         case "/":
                    HOME.style.display = 'block';
                    break; */
        case "/login":
            LOGIN.style.display = 'block';
            mostrarLogin();
            break;
        case "/registro":
            mostrarDepartamentos();
            REGISTRO.style.display = 'block';
            mostrarRegistro();
            break;
        case "/ingresar":
            mostrarCategorias();
            cargarYListarEventos();
            INGRESAR.style.display = 'block';
            mostrarIngresar();
            break;
        case "/eventos":
            cargarYListarEventos();
            mostrarEventos();
            EVENTOS.style.display = 'block'
            break;
        case "/informe":
            cargarYListarInforme('','','','');
            completarTablaEventos();
            cargarYListarEventos();
            mostrarInforme();
            INFORME.style.display = 'block'
            break;
        case "/plaza":
            
            obtenerPlazas();
            mostrarPlazas();
            PLAZA.style.display = 'block'
            inicializarMapa();
            break;
    }
}

function cerrarMenu() {
    MENU.close()
}

function inicializarMapa(){
    if (!MAP) {
        MAP = L.map('divPlaza');
        MAP.setView([posicionUsuario.latitude, posicionUsuario.longitude], 17);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{}).addTo(MAP);

        markerUsuario = L.marker([posicionUsuario.latitude, posicionUsuario.longitude], {icon: posicionUsuarioIcon}).addTo(MAP).bindPopup("Posición del usuario.");

    }
}

function ocultarPantallas() {
    /* HOME.style.display = 'none'; */
    LOGIN.style.display = 'none';
    REGISTRO.style.display = 'none';
    INGRESAR.style.display = 'none';
    EVENTOS.style.display = 'none';
    INFORME.style.display = 'none';
    PLAZA.style.display = 'none';
}


function btnLoginRegistroHandler() {
    mostrarRegistro();
}

function btnIngresarEventoHandler() {
    const idCategoria = document.querySelector("#pantalla-ingresar-combo-categorias").value;
    let detalle = document.querySelector("#txtDetalle").value;
    let fecha = document.querySelector("#dateEvento").value;
    let hora = document.querySelector("#txtHora").value;


    if (validarFechaMayorAHoy(fecha)){ 
    if (idCategoria && validarHora(hora)) {
        if (hora === '') {
            hora = new Date();
            hora = `${hora}`
            hora = hora.substring(16, 24);
           /*  console.log(hora); */
        }

        if (!detalle){
            detalle = 'Sin detalle';
        }
        

        if (fecha === '') {
            fecha = new Date();
          /*   console.log(fecha) */

            fecha = `${fecha}`;
            fecha = convertirFecha(fecha);

            /* console.log(fecha) */
        }
        let fechaCompleta = combinarFechaYHora(fecha, hora)
        console.log(fechaCompleta)
        const url = APIbaseURL + 'eventos.php';
        const data = {
            "idCategoria": idCategoria,
            "idUsuario": sesion.id,
            "detalle": detalle,
            "fecha": fechaCompleta
        };
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": sesion.apikey,
                "iduser": sesion.id
            },
            body: JSON.stringify(data)
        })
            .then((response) => {
                return response.json();
            })
            .then((responseBody) => {
                /*  console.log(responseBody); */
                if (responseBody.codigo !== 200) {
                    document.querySelector("#pIngresarEventoMensajes").innerHTML = "Ha ocurrido un error"
                } else {
                    document.querySelector("#txtDetalle").value = '';
                    document.querySelector("#pantalla-ingresar-combo-categorias").value = '';

                    let evento1 = new Evento();
                    evento1.detalle = detalle;
                    evento1.fecha = fechaCompleta;
                    evento1.id = generarIdRandom();
                    console.log(evento1)
                    evento1.idCategoria = idCategoria;
                    evento1.idUsuario = sesion.id;
                    eventos.push(evento1);
                    completarTablaEventos();
                    mostrarToast('SUCCESS', 'Evento agregado correctamente', '');

                }
            })
    } else {
        mostrarToast('ERROR', 'Categoría obligatoria.', 'Ingrese nuevamente');
    }}
}

function generarIdRandom() {
    const randomId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) + 1;
    return randomId;
}

/* function buscarUsuario (usuario){
    let i = 0;
    usuarioBuscado = null;

    while (usuarioBuscado = null || i < usuarios.length){
        if (usuario === usuarios[i].usuario){
            usuarioBuscado = usuarios[i];
        }
        i++;
    }
    console.log(usuarioBuscado)
    return usuarioBuscado;
} */

    let plazaAccesible = L.icon({
        iconUrl: 'img/silla.png',
        iconSize: [25, 25],
    });
    let plazaMascotas = L.icon({
        iconUrl: 'img/pet.png',
        iconSize: [25, 25],
    });
    let posicionUsuarioIcon = L.icon({
        iconUrl : 'img/user.png',
        iconSize: [25, 25],
    });
    let plaza = L.icon({
        iconUrl: 'img/plaza.png',
        iconSize: [25, 25],
    });
    let plazaMascotasAccesible = L.icon({
        iconUrl: 'img/perro-guía.jpg',
        iconSize: [25, 25]
    });

function btnLoginIngresarHandler() {
    const usuarioIngresado = document.querySelector("#txtLoginUsuario").value;
    const passwordIngresado = document.querySelector("#txtLoginPassword").value;
    document.querySelector("#pLoginMensajes").innerHTML = '';

    if (usuarioIngresado && passwordIngresado) {
        const url = APIbaseURL + 'login.php';
        const data = {
            "usuario": usuarioIngresado,
            "password": passwordIngresado
        };
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then((response) => {
                return response.json();
            })
            .then((responseBody) => {
                /* console.log(responseBody); */
                if (responseBody.codigo !== 200) {
                    mostrarToast('ERROR', 'Ha ocurrido un error', 'Ingrese los datos nuevamente.');
                } else {
                    document.querySelector("#txtLoginUsuario").value = '';
                    document.querySelector("#txtLoginPassword").value = '';
                    /* console.log(`ingresado ${usuarioIngresado}`) */
                    sesion.apikey = responseBody.apiKey;
                    sesion.id = responseBody.id;
                    localStorage.setItem("token", responseBody.apiKey);
                    localStorage.setItem("usuarioId", responseBody.id);
                    mostrarIngresar();
                    

                }
            })
    } else {
        mostrarToast('ERROR', 'Todos los campos son obligatorios', 'Ingrese los datos nuevamente.');

    }
}

function validarFechaMayorAHoy(fecha){
    let fechaOK = true;
    if (fecha !== ''){
        fecha = new Date(fecha)
        let ahora = new Date();
        if (fecha > ahora){
            fechaOK = false;
            mostrarToast('ERROR', 'La fecha debe ser menor o igual a hoy', 'Ingrese nuevamente')
        }
    }
    return fechaOK;
}

function btnRegistroRegistrarseHandler() {
    const usuarioIngresado = document.querySelector("#txtRegistroUsuario").value;
    const passwordIngresado = document.querySelector("#txtRegistroPassword").value;
    const departamentoIngresado = document.querySelector("#pantalla-registro-combo-departamentos").value;
    const ciudadIngresada = document.querySelector("#pantalla-registro-combo-ciudades").value;
    


    if (usuarioIngresado && passwordIngresado && departamentoIngresado && ciudadIngresada) {
        let url = APIbaseURL + 'usuarios.php';
        const data = {
            "usuario": usuarioIngresado,
            "password": passwordIngresado,
            "idDepartamento": departamentoIngresado,
            "idCiudad": ciudadIngresada
        };
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((response) => {
                if (response.status === 200) {
                    /*  console.log("logueado") */
                    document.querySelector("#txtRegistroUsuario").value = '';
                    document.querySelector("#txtRegistroPassword").value = '';
                    /* -----------------CONSUMO SERVICIO DE INICIO DE SESION----------------------------- */
                    url = APIbaseURL + 'login.php';
                    /*   console.log(url) */
                    const data2 = {
                        "usuario": usuarioIngresado,
                        "password": passwordIngresado
                    };
                    fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data2)
                    })
                        .then((response2) => {
     
                            return response2.json();
                        })
                        .then((responseBody2) => {
                            sesion.apikey = responseBody2.apiKey;
                            sesion.id = responseBody2.id;
                            /*                            usuarioLogueado = Usuario.parse(data);
                                                       usuarioLogueado.token = responseBody2.apiKey;
                                                       usuarios.push(usuarioLogueado); */
                            console.log(usuarioLogueado)
                            /* usuarioString = JSON.stringify(usuarioLogueado) */
                            localStorage.setItem("token", responseBody2.apiKey);
                            localStorage.setItem("usuarioId", sesion.id)
                            haySesionActiva = true;
                            mostrarToast('SUCCESS', 'Registro exitoso', 'ya inició sesión.');
                            mostrarIngresar();


                        })

                    /* ______________________________________________________________________________________ */
                }
                return response.json();
            })
            .then((responseBody) => {
                if (responseBody.error) {
                    mostrarToast('ERROR', responseBody.error, 'Ingrese nuevamente los datos.')
                }
            })
            .catch((responseBody) => {
                /* console.log(responseBody); */
                mostrarToast('ERROR', 'Ha ocurrido un error', 'Ingrese nuevamente los datos.')

            });

    } else {
        mostrarToast('ERROR', 'Todos los campos son obligatorios', 'Ingrese nuevamente los datos.')

    }
    /* ________________________________________________________________________________________________ */

}


/* function mostrarHome() {
    ocultarPantallas();
    if (!inicioSesion){ 
        NAV.push('page-home')
    }
    inicioSesion = false
    document.querySelector("#pantalla-home").style.display = "block";
} */

function mostrarIngresar() {
    ocultarPantallas();
    if (!inicioSesion) {
        NAV.push('page-ingresar');
    }
    document.querySelector("#pantalla-ingresar").style.display = "block";
}

function mostrarEventos() {
    ocultarPantallas();
    if (!inicioSesion) {
        NAV.push('page-eventos');
    }
    document.querySelector("#pantalla-eventos").style.display = "block";
}

function mostrarPlazas() {
    ocultarPantallas();
    if (!inicioSesion) {
        NAV.push('page-plaza');
    }
    document.querySelector("#pantalla-plaza").style.display = "block";
}

function mostrarLogin() {
    ocultarPantallas();
    if (!inicioSesion) {
        /*         NAV.push('page-login') */
    }
    inicioSesion = false
    document.querySelector("#pantalla-login").style.display = "block";
}

function mostrarInforme() {
    ocultarPantallas();
    if (!inicioSesion) {
        NAV.push('page-informe')
    }
    document.querySelector("#pantalla-informe").style.display = "block";
}

function mostrarRegistro() {
    ocultarPantallas();
    if (!inicioSesion) {
        NAV.push('page-registro')
    }
    document.querySelector("#pantalla-registro").style.display = "block";
}

function mostrarDepartamentos() {
    const url = APIbaseURL + '/departamentos.php';
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => {
            if (response.status === 401) {
                cerrarSesionPorFaltaDeToken();
            } else {
                return response.json();
            }
        })
        .then(data => {
            for (let i = 0; i < data.departamentos.length; i++) {
                /* const Departamento = ""; */
                const departamentoActual = data.departamentos[i];
                departamentos.push(departamentoActual);
            }
            /*  console.log(departamentos) */
            actualizarComboDepartamentos();
        })
        .catch(error => console.log(error));
}

function obtenerPlazas() {
    const url = APIbaseURL + '/plazas.php';
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'apikey': sesion.apikey,
            'iduser': sesion.id
        }
    })
        .then(response => {
            if (response.status === 401) {
                cerrarSesionPorFaltaDeToken();
            } else {
                return response.json();
            }
        })
        .then(data => {
            for (let i = 0; i < data.plazas.length; i++) {
                const plazaActual = data.plazas[i];
                plazas.push(plazaActual);

                if (plazaActual.aceptaMascotas === 0 && plazaActual.accesible === 0){
                    L.marker([plazaActual.latitud, plazaActual.longitud],{icon: plaza}).addTo(MAP);

                }else if (plazaActual.accesible === 1 && plazaActual.aceptaMascotas === 0){
                    L.marker([plazaActual.latitud, plazaActual.longitud], {icon: plazaAccesible}).addTo(MAP);
                } else if (plazaActual.aceptaMascotas === 1 && plazaActual.accesible === 0){
                    L.marker([plazaActual.latitud, plazaActual.longitud], {icon: plazaMascotas}).addTo(MAP);

                }else {
                    L.marker([plazaActual.latitud, plazaActual.longitud], {icon: plazaMascotasAccesible}).addTo(MAP);

                }
            }
        })
        .catch(error => console.log(error));
}

function actualizarComboDepartamentos() {
    COMBO_FILTRO_DEPARTAMENTOS.innerHTML = '';
    for (let i = 0; i < departamentos.length; i++) {
        const departamentoActual = departamentos[i];
        COMBO_FILTRO_DEPARTAMENTOS.innerHTML += `<ion-select-option value="${departamentoActual.id}">${departamentoActual.nombre}</ion-select-option>`;
    }
}

function cargarPosicionUsuario() {
    if (Capacitor.isNativePlatform()) {
        // Cargo la posición del usuario desde el dispositivo.
        const loadCurrentPosition = async () => {
            const resultado = await Capacitor.Plugins.Geolocation.getCurrentPosition({ timeout: 3000 });
            if (resultado.coords && resultado.coords.latitude) {
                posicionUsuario = {
                    latitude: resultado.coords.latitude,
                    longitude: resultado.coords.longitude
                }
            }
        };
        loadCurrentPosition();
    } else {
        // Cargo la posición del usuario desde el navegador web.
        window.navigator.geolocation.getCurrentPosition(
        // Callback de éxito.
        function (pos) {
            if (pos && pos.coords && pos.coords.latitude) {
                posicionUsuario = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                };
            }
        },
        // Callback de error.
        function () {
            // No necesito hacer nada, ya asumí que el usuario estaba en ORT.
        });
    }
}


/* Mensajes */
async function mostrarToast(tipo, titulo, mensaje) {
    const toast = document.createElement('ion-toast');
    toast.header = titulo;
    toast.message = mensaje;
    toast.position = 'bottom';
    toast.duration = 2000;
    if (tipo === "ERROR") {
        toast.color = "danger";
    } else if (tipo === "SUCCESS") {
        toast.color = "success";
    } else if (tipo === "WARNING") {
        toast.color = "warning";
    }

    document.body.appendChild(toast);
    return toast.present();
}


function cerrarSesionPorFaltaDeToken() {
    mostrarToast('ERROR', 'No autorizado', 'Se ha cerrado sesión por seguridad');
    cerrarSesion();
}

/* Logout */
function cerrarSesion() {
    cerrarMenu();
    localStorage.clear();
    haySesionActiva = false;
    NAV.setRoot("page-login");
    NAV.popToRoot();
}

function cargarUsuarioDesdeLocalStorage() {
    let tokenStorage = localStorage.getItem("token");
    let usuarioId = localStorage.getItem("usuarioId");
    if (tokenStorage && usuarioId) {
        haySesionActiva = true;
        sesion.apikey = tokenStorage
        sesion.id = usuarioId
    } else {
        haySesionActiva = false;
    }
}

function comboDepartamentosChangeHandler(evt) {
    COMBO_FILTRO_CIUDADES.innerHTML = '';
    ciudades = [];
    url = APIbaseURL + '/ciudades.php' + `?idDepartamento=${evt.detail.value}`
    /* console.log(evt) */
    fetch(url, {
        method: 'GET',
        /*         headers: {
                    'idDepartamento': evt.detail.value
                } */
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            for (let i = 0; i < data.ciudades.length; i++) {
                const ciudadActual = data.ciudades[i];
                ciudades.push(ciudadActual);
            }
            actualizarComboCiudades();
        }).catch(error => console.log(error));

}

function actualizarComboCiudades() {
    COMBO_FILTRO_CIUDADES.innerHTML = '';
    for (let i = 0; i < ciudades.length; i++) {
        const ciudadActual = ciudades[i];
        COMBO_FILTRO_CIUDADES.innerHTML += `<ion-select-option value="${ciudadActual.id}">${ciudadActual.nombre}</ion-select-option>`;
    }
}

function mostrarCategorias() {
    const url = APIbaseURL + '/categorias.php';
    /*  console.log(sesion.id)
     console.log(sesion.apikey) */
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'apikey': sesion.apikey,
            'iduser': sesion.id
        }
    })
        .then(response => {
            if (response.status === 401) {
                cerrarSesionPorFaltaDeToken();
            } else {
                return response.json();
            }
        })
        .then(data => {
            for (let i = 0; i < data.categorias.length; i++) {
                let categoriaActual = data.categorias[i];
                categorias.push(categoriaActual);
                console.log('categorias' + categorias)
            }
            /* console.log(categorias) */
            actualizarComboCategorias();
        })
        .catch(error => console.log(error));
}

function actualizarComboCategorias() {
    COMBO_FILTRO_CATEGORIAS.innerHTML = '';
    for (let i = 0; i < categorias.length; i++) {
        const categoriaActual = categorias[i];
        COMBO_FILTRO_CATEGORIAS.innerHTML += `<ion-select-option value="${categoriaActual.id}">${categoriaActual.tipo}</ion-select-option>`;
    }
}

function cargarYListarEventos() {
    eventos = [];
    url = APIbaseURL + 'eventos.php?idUsuario=' + sesion.id;
    fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "apikey": sesion.apikey,
            "iduser": sesion.id
        }
    })
        .then((response) => {
            if (response.status === 401) {
                cerrarSesionPorFaltaDeToken();
            } else {
                return response.json();
            }
        })
        .then((data) => {
            if (data.mensaje) {
                mostrarToast('ERROR', 'Error', data.mensaje);
            } else if (data.eventos) {
                for (let i = 0; i < data.eventos.length; i++) {
                    const eventoActual = data.eventos[i];
                    eventos.push(Evento.parse(eventoActual));
                }
                completarTablaEventos();
            } else if (data.eventos.length === 0) {
                mostrarToast('ERROR', 'Error', 'No hay eventos ingresados');
            } else {
                mostrarToast('ERROR', 'Error', 'Por favor, intente nuevamente.');
            }
        })
        .catch((error) => {
            console.log(error);
            mostrarToast('ERROR', 'Error', 'Por favor, intente nuevamente.');
        });
}

function obtenerTipoCategoria(idCategoria) {
    let tipo = '';
    for (let i = 0; i < categorias.length; i++) {
        let unaCategoria = categorias[i];
        if (idCategoria === unaCategoria.id) {
            tipo = unaCategoria.tipo

        }
    }
    return tipo;
}

function obtenerIdImagen(idCategoria) {
    let idImagen = 0;
    for (let i = 0; i < categorias.length; i++) {
        let unaCategoria = categorias[i]
        if (idCategoria === unaCategoria.id) {
            idImagen = unaCategoria.imagen

        }
    }
    return idImagen;
}

function completarTablaEventos() {
    let listadoEventos = '<ion-list>'
    let contadorBiberones = 0;
    let contadorPaniales = 0;
    let tiempoTranscurridoBiberon = 0;
    let tiempoTranscurridoPanial = 0;
    let horaUltimoBiberon = '00:00'; // Inicializar correctamente en formato HH:MM
    let horaUltimoPanial = '00:00'; // Inicializar correctamente en formato HH:MM

    eventos.forEach((e) => {
        if (obtenerEventosDelDia(e)) {
            if (e.idCategoria === 35) { // Identificador de Biberones
                contadorBiberones++;
                horaUltimoBiberon = actualizarUltBiberon(e.fecha.substring(11, 16), horaUltimoBiberon);
                tiempoTranscurridoBiberon = calcularTiempoBiberones(horaUltimoBiberon);
            } else if (e.idCategoria === 33) { // Identificador de Pañales
                contadorPaniales++;
                horaUltimoPanial = actualizarUltPanial(e.fecha.substring(11, 16), horaUltimoPanial);
                tiempoTranscurridoPanial = calcularTiempoPaniales(horaUltimoPanial);
            }
            cargarYListarInforme(contadorBiberones, tiempoTranscurridoBiberon, contadorPaniales, tiempoTranscurridoPanial);

            /* ----------------------------------------------------------------------------------------------------------- */
            listadoEventos += `
            <ion-item class="ion-item-evento">
                <ion-thumbnail slot="start">
                    <img src="https://babytracker.develotion.com/imgs/${obtenerIdImagen(e.idCategoria)}.png" width="100"/>
                </ion-thumbnail>
                <ion-label>
                    <h2>${obtenerTipoCategoria(e.idCategoria)}</h2>
                    <h3>${e.detalle}</h3>
                    <h3>${e.fecha}</h3>
                    <h4> <ion-button color = "danger" id="${e.id}" onclick="eliminarEvento(${e.id})">Eliminar</ion-button></h4>

                </ion-label>
                
            </ion-item>
        `;
        }
    });
    listadoEventos += '</ion-list>'

    if (listadoEventos.length === 0) {
        listadoEventos = "No se encontraron eventos del dia de hoy.";
    }

    let listadoEventos2 = '<ion-list>';
    eventos.forEach((e) => {
        
        if (!obtenerEventosDelDia(e)) {
            listadoEventos2 += `
            <ion-item class="ion-item-evento">
                <ion-thumbnail slot="start">
                    <img src="https://babytracker.develotion.com/imgs/${obtenerIdImagen(e.idCategoria)}.png" width="100"/>
                </ion-thumbnail>
                <ion-label>
                    <h2>${obtenerTipoCategoria(e.idCategoria)}</h2>
                    <h3>${e.detalle}</h3>
                    <h3>${e.fecha}</h3>
                    <h4> <ion-button color = "danger" id="${e.id}" onclick="eliminarEvento(${e.id})">Eliminar</ion-button></h4>

                </ion-label>
                
            </ion-item>
        `;
        }
    });
    listadoEventos2 += '</ion-list>'

    if (listadoEventos2.length === 0) {
        listadoEventos2 = "No se encontraron eventos anteriores al dia de hoy.";
    }

    document.querySelector("#divEventos").innerHTML = listadoEventos;
    document.querySelector("#divEventos2").innerHTML = listadoEventos2;


    const itemEventos = document.querySelectorAll(".ion-item-eventos");

    itemEventos.forEach((ie) => {
        ie.addEventListener('click', eliminarEvento);
    });
}

function eliminarEvento(id) {
    console.log(id);
    const url = APIbaseURL + 'eventos.php?idEvento=' + id;

    fetch(url, {
        method: 'DELETE',
        headers: {
            'apikey': sesion.apikey,
            'iduser': sesion.id
        }
    })
        .then(response => {
            if (response.status === 401) {
                cerrarSesionPorFaltaDeToken();
            } else if (response.status === 200) {
                return response.json();
            } else {
                throw new Error('Error al eliminar el evento');
            }
        })
        .then(data => {
            mostrarToast('SUCCESS', 'Evento eliminado', 'El evento ha sido eliminado correctamente.');
            cargarYListarEventos(); // Recargar la lista de eventos después de la eliminación
            completarTablaEventos();
        })
        .catch(error => {
            console.error(error);
            mostrarToast('ERROR', 'Error', 'Hubo un problema al eliminar el evento.');
        });
}

function obtenerEventosDelDia(evento) {
    let diaRecibido = new Date(evento.fecha);
    let esHoy = false
    diaHoy = new Date();
    if (diaHoy.getDate() === diaRecibido.getDate() &&
        diaHoy.getFullYear() === diaRecibido.getFullYear() && diaHoy.getMonth() === diaRecibido.getMonth()) {
        esHoy = true;
    }

    return esHoy;
}

function combinarFechaYHora(fechaCompleta, horaString) {
    const fecha = fechaCompleta.split(' ')[0];
    const nuevaFechaCompleta = `${fecha} ${horaString}`;
    console.log('FECHAAAAAAAAAAAAAAAAAA' + nuevaFechaCompleta)
    return nuevaFechaCompleta;
}

function validarHora(hora) {
    let formatoOk = true;

    if (hora === '') {
        formatoOk = true;
    } else {
        if (hora.length !== 8) {
            formatoOk = false;
            mostrarToast('ERROR', 'Hora no válida', 'El formato ingresado no es correcto');

        }

        if (hora.charAt(2) !== ':' || hora.charAt(5) !== ':') {
            formatoOk = false;
            mostrarToast('ERROR', 'Hora no válida', 'El formato ingresado no es correcto');

        }
    }
    return formatoOk;
}

function convertirFecha(fecha) {
    const mesString = fecha.substring(4, 7); // 'Sun'
    const dia = fecha.substring(8, 10); // 'Aug'
    const anio = fecha.substring(11, 15); // '2024'

    let mes;
    switch (mesString) {
        case 'Jan': mes = '01'; break;
        case 'Feb': mes = '02'; break;
        case 'Mar': mes = '03'; break;
        case 'Apr': mes = '04'; break;
        case 'May': mes = '05'; break;
        case 'Jun': mes = '06'; break;
        case 'Jul': mes = '07'; break;
        case 'Aug': mes = '08'; break;
        case 'Sep': mes = '09'; break;
        case 'Oct': mes = '10'; break;
        case 'Nov': mes = '11'; break;
        case 'Dec': mes = '12'; break;
    }

    let fechaBuscada = `${anio}-${mes}-${dia} 00:00:00`;

    return fechaBuscada;
}

function cargarYListarInforme(contadorBiberones, stringTiempoBiberon, contadorPaniales, stringTiempoPanial) {
    let ultimoBiberon = '<ion-list>';
    let ultimoPanial = '<ion-list>';
    ultimoBiberon += `
            <ion-item>
                <ion-label>
                    <h3>Biberones ingeridos en el día: ${contadorBiberones}</h3>
                    <h3>Tiempo transcurrido del último biberón: ${stringTiempoBiberon}</h3>
                </ion-label>
            </ion-item> `
    ultimoBiberon += '</ion-list>'
    ultimoPanial += `
            <ion-item>
                <ion-label>
                    <h3>Pañales cambiados en el día: ${contadorPaniales}</h3>
                    <h3>Tiempo transcurrido del último pañal: ${stringTiempoPanial}</h3>
                </ion-label>
            </ion-item> `
    ultimoPanial += '<ion-list>';

    document.querySelector("#divInforme").innerHTML = ultimoBiberon;
    document.querySelector("#divInforme2").innerHTML = ultimoPanial;
}

function actualizarUltBiberon(biberonActual, horaUltimo) {
    // Aseguramos que ambos tiempos estén en formato de 5 caracteres "HH:MM"
    biberonActual = biberonActual.substring(0, 5);
    horaUltimo = horaUltimo.substring(0, 5);

    // Separar horas y minutos de ambos tiempos
    const horasBiberonActual = parseInt(biberonActual.substring(0, 2), 10);
    const minutosBiberonActual = parseInt(biberonActual.substring(3, 5), 10);
    
    const horasUltimo = parseInt(horaUltimo.substring(0, 2), 10);
    const minutosUltimo = parseInt(horaUltimo.substring(3, 5), 10);

    // Comparar horas
    if (horasBiberonActual > horasUltimo) {
        horaUltimo = biberonActual;
    } else if (horasBiberonActual === horasUltimo) {
        // Comparar minutos si las horas son iguales
        if (minutosBiberonActual > minutosUltimo) {
            horaUltimo = biberonActual;
        }
    }

    // Verificación en consola para depurar
    console.log('último: ' + horaUltimo);
    console.log('actual: ' + biberonActual);

    return horaUltimo;
}

function calcularTiempoBiberones(horaUltimo) {
    let ahora = new Date();
    
    // Extrae las horas y minutos actuales
    const horasAhora = ahora.getHours(); // Número de horas actual
    const minutosAhora = ahora.getMinutes(); // Número de minutos actual
    
    // Extrae las horas y minutos de `horaUltimo`
    const horasUltimo = parseInt(horaUltimo.substring(0, 2), 10);
    const minutosUltimo = parseInt(horaUltimo.substring(3, 5), 10);

    // Calcula la diferencia en horas y minutos
    let tiempoTranscurridoHoras = horasAhora - horasUltimo;
    let tiempoTranscurridoMinutos = minutosAhora - minutosUltimo;

    // Si los minutos actuales son menores que los minutos del último biberón
    if (tiempoTranscurridoMinutos < 0) {
        tiempoTranscurridoHoras--;
        tiempoTranscurridoMinutos += 60;
    }

    // Devuelve el tiempo transcurrido en formato horas y minutos
    let tiempoTranscurrido = `${tiempoTranscurridoHoras} horas, ${tiempoTranscurridoMinutos} minutos`;

    return tiempoTranscurrido;
}


function actualizarUltPanial(panialActual, horaUltimo) {
    panialActual = panialActual.substring(0, 5); // Asegúrate de que ambos tiempos estén en formato HH:MM
    horaUltimo = horaUltimo.substring(0, 5);
    
    const horasPanialActual = parseInt(panialActual.substring(0, 2), 10);
    const minutosPanialActual = parseInt(panialActual.substring(3, 5), 10);
    
    const horasUltimo = parseInt(horaUltimo.substring(0, 2), 10);
    const minutosUltimo = parseInt(horaUltimo.substring(3, 5), 10);
    
    if (horasPanialActual > horasUltimo || (horasPanialActual === horasUltimo && minutosPanialActual > minutosUltimo)) {
        horaUltimo = panialActual;
    }
    
    console.log('último pañal (después de actualización): ' + horaUltimo);
    console.log('actual pañal: ' + panialActual);
    
    return horaUltimo;
}

function calcularTiempoPaniales(horaUltimo) {
    let ahora = new Date();
    let horasAhora = ahora.getHours();
    let minutosAhora = ahora.getMinutes();
    
    const horasUltimo = parseInt(horaUltimo.substring(0, 2), 10);
    const minutosUltimo = parseInt(horaUltimo.substring(3, 5), 10);
    
    let tiempoTranscurridoHoras = horasAhora - horasUltimo;
    let tiempoTranscurridoMinutos = minutosAhora - minutosUltimo;
    
    if (tiempoTranscurridoMinutos < 0) {
        tiempoTranscurridoHoras--;
        tiempoTranscurridoMinutos += 60;
    }
    
    if (tiempoTranscurridoHoras < 0) {
        tiempoTranscurridoHoras += 24; // Si las horas resultantes son negativas, sumamos 24 horas
    }
    
    let tiempoTranscurrido = `${tiempoTranscurridoHoras} horas, ${tiempoTranscurridoMinutos} minutos`;
    return tiempoTranscurrido;
}
