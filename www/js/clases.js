const DIV = document.querySelector("#divEventos");
const DIV2 = document.querySelector("#divEventos2");
const DIVPLAZA = document.querySelector("#divPlaza");

class Usuario {
    constructor() {
        this.usuario = null;
        this.password = null;
        this.idDepartamento = null;
        this.idCiudad = null;
        this.token = null;
    }

    static parse(data) {
        let instancia = new Usuario();

        if (data.usuario) {
            instancia.usuario = data.usuario;
        }
        if (data.password) {
            instancia.password = data.password;
        }
        if (data.idDepartamento) {
            instancia.idDepartamento = data.idDepartamento;
        }
        if (data.idCiudad) {
            instancia.idCiudad = data.idCiudad;
        }
        if (data.token) {
            instancia.token = data.token;
        }

        return instancia;
    }
}

class Evento {
    constructor() {
        this.id = null;
        this.idCategoria = null;
        this.idUsuario = null;
        this.detalle = null;
        this.fecha = null;
    }

    static parse(data) {
        let instancia = new Evento();

        if (data.id) {
            instancia.id = data.id;
        }
        if (data.idCategoria) {
            instancia.idCategoria = data.idCategoria;
        }
        if (data.idUsuario) {
            instancia.idUsuario = data.idUsuario;
        }
        if (data.detalle) {
            instancia.detalle = data.detalle;
        }
        if (data.fecha) {
            instancia.fecha = data.fecha;
        }

        return instancia;
    }
    obtenerURLImagen(){
        return "https://babytracker.develotion.com/imgs/" + this.urlImagen + ".png";
    }
}



class Producto {
    constructor() {
        this.id = null;
        this.etiquetas = null;
        this.codigo = null;
        this.nombre = null;
        this.descripcion = null;
        this.precio = null;
        this.urlImagen = null;
        this.estado = null;
        this.puntaje = null;
    }

    static parse(data) {
        let instancia = new Producto();

        if (data._id) {
            instancia.id = data._id;
        }
        if (data.etiquetas) {
            instancia.etiquetas = data.etiquetas;
        }
        if (data.codigo) {
            instancia.codigo = data.codigo;
        }
        if (data.nombre) {
            instancia.nombre = data.nombre;
        }
        if (data.descripcion) {
            instancia.descripcion = data.descripcion;
        }
        if (data.precio) {
            instancia.precio = data.precio;
        }
        if (data.urlImagen) {
            instancia.urlImagen = data.urlImagen;
        }
        if (data.estado) {
            instancia.estado = data.estado;
        }
        if (data.puntaje) {
            instancia.puntaje = data.puntaje;
        }

        return instancia;
    }

    obtenerURLImagen() {
        return "https://ort-tallermoviles.herokuapp.com/assets/imgs/" + this.urlImagen + ".jpg";
    }
}

class Pedido {
    constructor() {
        this.id = null;
        this.cantidad = null;
        this.fecha = null;
        this.producto = null;
        this.sucursal = null;
        this.estado = null;
        this.total = null;
        this.comentario = null;
    }

    static parse(data) {
        let instancia = new Pedido();

        if (data._id) {
            instancia.id = data._id;
        }
        if (data.cantidad) {
            instancia.cantidad = data.cantidad;
        }
        if (data.fecha) {
            instancia.fecha = data.fecha;
        }
        if (data.producto) {
            instancia.producto = Producto.parse(data.producto);
        }
        if (data.sucursal) {
            instancia.sucursal = Sucursal.parse(data.sucursal);
        }
        if (data.estado) {
            instancia.estado = data.estado;
        }
        if (data.total) {
            instancia.total = data.total;
        }
        if (data.comentario) {
            instancia.comentario = data.comentario;
        }

        return instancia;
    }
}

DIV.style.border = 'solid black 5px'
DIV.style.margin = '5px'
DIV2.style.margin = '5px'
DIVPLAZA.style.height = '100%'
DIV2.style.border = 'solid black 5px'
