/**
 * Clase de utilidad estática para gestionar las operaciones del mercado.
 * Proporciona métodos auxiliares para filtrar y buscar en el inventario de la tienda.
 */

export class Mercado {


    /**
     * Filtra una lista de productos según su nivel de rareza.
     * @param {Array<Object>} productos - Lista completa de productos disponibles.
     * @param {string} rareza - La rareza a filtrar (ej: 'comun', 'rara', 'legendaria').
     * @returns {Array<Object>} Un nuevo array que contiene solo los productos de esa rareza.
     */
    static filtrarPorRareza(productos, rareza) {
        return productos.filter(p => p.rareza === rareza);
    }


    /**
     * Busca un producto específico dentro de una lista por su nombre exacto.
     * @param {Array<Object>} productos - Lista de productos donde realizar la búsqueda.
     * @param {string} nombre - El nombre del producto a buscar.
     * @returns {Object|undefined} El objeto del producto encontrado o undefined si no existe.
     */
    static buscarProducto(productos, nombre) {
        return productos.find(p => p.nombre === nombre);
    }
}