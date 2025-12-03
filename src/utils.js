/**
 * Módulo de utilidades generales para la aplicación.
 * Contiene funciones auxiliares para formateo, cálculos aleatorios y control de tiempo.
 */

/**
 * Formatea un valor numérico añadiendo el símbolo de la moneda.
 * @param {number} cantidad - El valor numérico a formatear.
 * @returns {string} El precio formateado con el símbolo del euro (Ej: "150 €").
 */
export const formatearPrecio = (cantidad) => {
    return cantidad + " €";
};

/**
 * Genera un número entero aleatorio dentro de un rango específico (ambos incluidos).
 * Se utiliza para la lógica de descuentos y selección de elementos al azar.
 * @param {number} min - Valor mínimo del rango.
 * @param {number} max - Valor máximo del rango.
 * @returns {number} Un número entero aleatorio entre min y max.
 */
export function obtenerAleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Crea una pausa asíncrona que detiene la ejecución durante un tiempo determinado.
 * Es fundamental para controlar el ritmo de los turnos en el sistema de batalla.
 * @param {number} ms - Tiempo de espera en milisegundos.
 * @returns {Promise} Una promesa que se resuelve cuando ha pasado el tiempo.
 */
export const esperar = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};