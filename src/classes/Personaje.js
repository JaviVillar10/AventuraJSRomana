/**
 * Clase base para cualquier entidad viva del juego.
 * Define las propiedades y métodos comunes para jugadores y enemigos.
 */
export class Personaje {
    
    /**
     * Crea una nueva instancia de un personaje.
     * @param {string} nombre - El nombre del personaje.
     * @param {string} imagen - La ruta relativa a la imagen del avatar.
     * @param {number} vida - Los puntos de vida iniciales.
     */
    constructor(nombre, imagen, vida) {
        this.nombre = nombre;
        this.imagen = imagen;
        this.vida = vida;
        this.vidaMaxima = vida;
    }

    /**
     * Comprueba si el personaje sigue vivo (vida mayor que 0).
     * @returns {boolean} Devuelve true si la vida es > 0, false en caso contrario.
     */
    estaVivo() {
        return this.vida > 0;
    }

    /**
     * Resta una cantidad de puntos a la vida del personaje.
     * Si la vida baja de 0, se ajusta automáticamente a 0.
     * @param {number} cantidad - La cantidad de daño a recibir.
     */
    recibirDaño(cantidad) {
        this.vida -= cantidad;
        if (this.vida < 0) this.vida = 0;
    }
}