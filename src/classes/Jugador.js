import { Personaje } from './Personaje.js';

/**
 * Representa al usuario principal del juego.
 * Gestiona sus estadísticas, inventario y puntuación.
 * @extends Personaje
 */
export class Jugador extends Personaje {

    /**
     * Crea una instancia del Jugador.
     * @param {string} nombre - Nombre del gladiador.
     * @param {string} imagen - Ruta de la imagen del avatar.
     * @param {number} vidaBase - Puntos de vida iniciales.
     * @param {number} ataqueBase - Puntos de ataque base (sin armas).
     * @param {number} defensaBase - Puntos de defensa base (sin armadura).
     */

    constructor(nombre, imagen, vidaBase, ataqueBase, defensaBase) {
        super(nombre, imagen, vidaBase);

        this.ataqueBase = ataqueBase;
        this.defensaBase = defensaBase;
        this.puntos = 0;
        this.inventario = [];
    }


    /**
     * Añade un producto al inventario del jugador.
     * Si el producto es un consumible, se aplica el efecto de curación inmediatamente.
     * @param {Object} producto - El objeto comprado en el mercado.
     */
    agregarObjeto(producto) {
        this.inventario.push(producto);
        if (producto.tipo === 'consumible') {
            this.vida += producto.bonus;
            this.vidaMaxima += producto.bonus;
        }
    }

    /**
     * Calcula el ataque total sumando la base y los bonus de todas las armas en el inventario.
     * @returns {number} El daño total que inflige el jugador.
     */

    obtenerAtaqueTotal() {
        const bonusArmas = this.inventario
            .filter(item => item.tipo === 'arma')
            .reduce((total, item) => total + item.bonus, 0);
            
        return this.ataqueBase + bonusArmas;
    }

    /**
     * Calcula la defensa total sumando la base y los bonus de todas las armaduras.
     * @returns {number} La defensa total del jugador.
     */
    obtenerDefensaTotal() {
        const bonusArmadura = this.inventario
            .filter(item => item.tipo === 'armadura')
            .reduce((total, item) => total + item.bonus, 0);

        return this.defensaBase + bonusArmadura;
    }

    /**
     * Suma una cantidad de puntos al marcador del jugador.
     * @param {number} cantidad - Puntos a sumar.
     */

    sumarPuntos(cantidad) {
        this.puntos += cantidad;
    }

    /**
     * Restaura la vida del jugador al máximo (vidaMaxima).
     * Se utiliza al finalizar un combate exitoso.
     */
    recuperarVidaCompleta() {
        this.vida = this.vidaMaxima;
    }
}