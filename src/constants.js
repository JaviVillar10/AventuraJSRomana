/**
 * Archivo de configuración y constantes globales del juego "Aventura en el Coliseo".
 * Contiene los datos iniciales, catálogos y valores de equilibrio.
 * @module constants
 */



/**
 * Configuración inicial del personaje Jugador.
 * @type {Object}
 * @property {string} nombre - Nombre por defecto del gladiador.
 * @property {string} imagen - Ruta relativa a la imagen del avatar.
 * @property {number} vidaBase - Puntos de vida iniciales.
 * @property {number} ataqueBase - Puntos de ataque base (sin armas).
 * @property {number} defensaBase - Puntos de defensa base (sin armadura).
 */
export const DATOS_JUGADOR = {
    nombre: "Apuleyo Diocles",
    imagen: "img/Gladiador.png",
    vidaBase: 100,
    ataqueBase: 10,
    defensaBase: 5
};



/**
 * Lista de oponentes disponibles en el juego.
 * Se utiliza para generar las instancias de la clase Enemigo o Jefe.
 * @type {Array<Object>}
 * @property {string} nombre - Nombre del enemigo.
 * @property {string} imagen - Ruta de la imagen.
 * @property {number} vida - Vida inicial del enemigo.
 * @property {number} ataque - Daño que inflige por turno.
 * @property {boolean} esJefe - Indica si es un jefe final (afecta a la puntuación).
 * @property {number} [multiplicador] - Solo para jefes: multiplicador de puntos.
 */
export const LISTA_ENEMIGOS = [
    {
        nombre: "León de Nemea",
        imagen: "img/Leon.png",
        vida: 80,
        ataque: 20, 
        esJefe: false
    },
    {
        nombre: "Espartaco (Rebelde)",
        imagen: "img/Esclavo_rebelde.png",
        vida: 90,
        ataque: 25, 
        esJefe: false
    },
    {
        nombre: "Reciario Traidor",
        imagen: "img/Reciario.png",
        vida: 100,
        ataque: 25, 
        esJefe: false
    },
    {
        nombre: "Centurión Maldito",
        imagen: "img/Centurio_romano.png",
        vida: 120,
        ataque: 30, 
        esJefe: true, 
        multiplicador: 2.0
    }
];


/**
 * Catálogo de productos disponibles en el mercado.
 * Define los ítems que el jugador puede comprar para mejorar sus estadísticas.
 * @type {Array<Object>}
 * @property {string} nombre - Nombre del ítem.
 * @property {string} imagen - Ruta de la imagen.
 * @property {string} tipo - Categoría: 'arma', 'armadura' o 'consumible'.
 * @property {number} bonus - Puntos que suma a la estadística correspondiente.
 * @property {number} precio - Coste base en monedas.
 * @property {string} rareza - Nivel de rareza para aplicar descuentos ('comun', 'rara', 'legendaria').
 */
export const MERCADO_PRODUCTOS = [
    {
        nombre: "Gladius Hispaniensis",
        imagen: "img/Espada.png",
        tipo: "arma",
        bonus: 15, 
        precio: 100,
        rareza: "comun"
    },
    {
        nombre: "Tridente de Neptuno",
        imagen: "img/Tridente.png",
        tipo: "arma",
        bonus: 30, 
        precio: 250,
        rareza: "rara"
    },
    {
        nombre: "Casco de Pretoriano",
        imagen: "img/Casco.png",
        tipo: "armadura",
        bonus: 10, 
        precio: 80,
        rareza: "comun"
    },
    {
        nombre: "Escudo Scutum",
        imagen: "img/Escudo.png",
        tipo: "armadura",
        bonus: 15, 
        precio: 200,
        rareza: "rara"
    },
    {
        nombre: "Uvas del César",
        imagen: "img/Uvas.png",
        tipo: "consumible",
        bonus: 20, 
        precio: 50,
        rareza: "comun"
    },
    {
        nombre: "Poción de los Dioses",
        imagen: "img/Pocion.png",
        tipo: "consumible",
        bonus: 50, 
        precio: 100,
        rareza: "legendaria"
    }
];

/**
 * Umbral de puntos necesarios para obtener el rango de "Veterano" al finalizar el juego.
 * @constant {number}
 */
export const PUNTOS_PARA_VETERANO = 500;


export const REGEX = {
    
    NOMBRE_GLADIADOR: /^[A-ZÁÉÍÓÚÑ][a-zA-ZÁÉÍÓÚáéíóúñÑ\s]{0,19}$/,
    
    SOLO_NUMEROS: /^\d+$/,

    NOMBRE_OBJETO:/^[A-ZÁÉÍÓÚÑ][a-zA-ZÁÉÍÓÚáéíóúñÑ\s]{0,19}$/,

};