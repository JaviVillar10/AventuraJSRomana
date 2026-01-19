import { DATOS_JUGADOR, LISTA_ENEMIGOS, MERCADO_PRODUCTOS, PUNTOS_PARA_VETERANO, REGEX } from './constants.js';
import { formatearPrecio, obtenerAleatorio, esperar } from './utils.js';
import { Jugador } from './classes/Jugador.js';
import { Enemigo, Jefe } from './classes/Enemigo.js';
import { Producto } from './classes/Producto.js';


document.getElementById('btn-ir-objeto') .addEventListener('click', () => {alert('Objeto guardado');
  });

            cargarMercado();

            const formulario = document.getElementById('crear-objeto');
            const errNom = document.getElementById('error-nombre');
            const errStat = document.getElementById('error-stats');
    
            errNom.textContent = "";
            errStat.textContent = "";
    
            const nombre = formulario.elements['nombre-objeto'].value.trim();
            const price = parseInt(formulario.elements['precio'].value);
            const rare = parseInt(formulario.elements['rareza'].value);
            const tip = parseInt(formulario.elements['tipo'].value);
            const bon = parseInt(formulario.elements['bonus'].value);
    
            let errores = false;
    
            if (!REGEX.NOMBRE_OBJETO.test(nombre)) {
                 alert("La primera letra debe ser mayuscula.");
                errores = true;
            }
    
            if (bon = false) {
            errStat.textContent = "Debe comenza con el caracter +";
            errores = true;
        }
    
            if (!errores) {
                objeto.nombre = nombre;
                objeto.precio = price;
                jugador.rare = rareza;
                jugador.tip = tipo;
                jugador.bon = bonus;
    
                cargarMercado();
                
            }

            if(REGEX = false){
                alert("DEBES INTRODUCIR CORRECTAMENTE LOS CAMPOS")
            };


    
    /**
     * Carga y renderiza los productos en la escena del mercado.
     */
    const cargarMercado = () => {
        const contenedor = document.getElementById('contenedor-productos');
        contenedor.innerHTML = '';
    
        const rarezas = ['comun', 'rara', 'legendaria'];
        const rarezaConDescuento = rarezas[obtenerAleatorio(0, rarezas.length - 1)];
        const porcentajeDescuento = obtenerAleatorio(10, 50);
    
        MERCADO_PRODUCTOS.forEach(datosProd => {
            let productoObj = new Producto(
                datosProd.nombre, datosProd.imagen, datosProd.precio, 
                datosProd.tipo, datosProd.bonus, datosProd.rareza
            );
    
            if (productoObj.rareza === rarezaConDescuento) {
                productoObj = productoObj.aplicarDescuento(porcentajeDescuento);
            }
    
            const tarjetaDiv = document.createElement('div');
            tarjetaDiv.className = 'ficha-producto';
            
            tarjetaDiv.innerHTML = `
                <img src="${productoObj.imagen}" alt="${productoObj.nombre}">
                <h4>${productoObj.nombre}</h4>
                <p>+${productoObj.bonus} (${productoObj.tipo})</p>
                <p class="precio">${formatearPrecio(productoObj.precio)}</p>
                <button class="btn-comprar">Comprar</button>
            `;
    
            const btn = tarjetaDiv.querySelector('.btn-comprar');
            if (jugador.inventario.some(p => p.nombre === productoObj.nombre)) {
                 btn.textContent = "Retirar";
                 btn.classList.add('btn-retirar');
                 tarjetaDiv.style.backgroundColor = "#c8e6c9";
            }
    
            btn.addEventListener('click', () => {
                gestionarCompra(productoObj, btn, tarjetaDiv);
            });
    
            contenedor.appendChild(tarjetaDiv);
        });
    };

    function gestionarCompra(producto, boton, tarjetaDiv) {
    const index = jugador.inventario.findIndex(p => p.nombre === producto.nombre);

    if (index === -1) {
        if (jugador.dinero < producto.precio) {
            alert("No tienes suficiente oro.");
            return;
        }
        jugador.agregarObjeto(producto);
        jugador.dinero -= producto.precio;
        boton.textContent = "Retirar";
        boton.classList.add('btn-retirar');
        tarjetaDiv.style.backgroundColor = "#c8e6c9";
    } else {
        jugador.inventario.splice(index, 1);
        jugador.dinero += producto.precio;
        if(producto.tipo === 'consumible') {
            jugador.vida -= producto.bonus;
            jugador.vidaMaxima -= producto.bonus;
        }
        boton.textContent = "Comprar";
        boton.classList.remove('btn-retirar');
        tarjetaDiv.style.backgroundColor = "";
    }
}

document.addEventListener('DOMContentLoaded', init);