/**
 * Representa un ítem que se puede comprar en el mercado.
 * Define las propiedades básicas de cualquier objeto del juego.
 */
export class Producto {

    /**
     * Crea una nueva instancia de un producto.
     * @param {string} nombre - Nombre del objeto.
     * @param {string} imagen - Ruta relativa de la imagen.
     * @param {number} precio - Coste en monedas.
     * @param {string} tipo - Categoría: 'arma', 'armadura' o 'consumible'.
     * @param {number} bonus - Cantidad que suma a la estadística correspondiente.
     * @param {string} rareza - Nivel de rareza (ej: 'comun', 'rara', 'legendaria').
     */
    
    constructor(nombre, imagen, precio, tipo, bonus, rareza) {
        this.nombre = nombre;
        this.imagen = imagen;
        this.precio = precio;
        this.tipo = tipo;
        this.bonus = bonus;
        this.rareza = rareza;
    }


    /**
     * Crea y devuelve una copia del producto con el precio rebajado.
     * No modifica el producto original, devuelve uno nuevo (inmutabilidad).
     * @param {number} porcentaje - Porcentaje de descuento a aplicar (0-100).
     * @returns {Producto} Una nueva instancia del producto con el precio actualizado.
     */
    aplicarDescuento(porcentaje) {
        const nuevoProducto = new Producto(
            this.nombre, this.imagen, this.precio, 
            this.tipo, this.bonus, this.rareza
        );

        const descuento = (this.precio * porcentaje) / 100;
        nuevoProducto.precio = Math.floor(this.precio - descuento);

        return nuevoProducto;
    }
}