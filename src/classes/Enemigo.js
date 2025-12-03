/**
 * Representa a un rival básico dentro del juego.
 * Hereda las características básicas de un Personaje (nombre, vida, imagen).
 * @extends Personaje
 */

import { Personaje } from './Personaje.js';

/**
     * Crea una instancia de un Enemigo.
     * @param {string} nombre - El nombre del enemigo (Ej: "León").
     * @param {string} imagen - Ruta relativa a la imagen del enemigo.
     * @param {number} vida - Puntos de vida iniciales.
     * @param {number} ataque - Puntos de daño base que inflige el enemigo.
     */

export class Enemigo extends Personaje {
    
    constructor(nombre, imagen, vida, ataque) {
        super(nombre, imagen, vida);
        this.ataque = ataque;
    }
}

/**
 * Representa al Jefe final del juego.
 * Es un tipo especial de Enemigo que otorga más puntos al ser derrotado.
 * @extends Enemigo
 */

export class Jefe extends Enemigo {

    /**
     * Crea una instancia de un Jefe.
     * @param {string} nombre - Nombre del jefe.
     * @param {string} imagen - Ruta de la imagen.
     * @param {number} vida - Puntos de vida (suelen ser mayores).
     * @param {number} ataque - Puntos de ataque.
     * @param {number} [multiplicador=1.2] - Factor multiplicador de puntos (por defecto 1.2).
     */
    
    constructor(nombre, imagen, vida, ataque, multiplicador = 1.2) {
        super(nombre, imagen, vida, ataque);
        this.multiplicador = multiplicador;
    }
}