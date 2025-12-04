/* src/main.js */

import { DATOS_JUGADOR, LISTA_ENEMIGOS, MERCADO_PRODUCTOS, PUNTOS_PARA_VETERANO } from './constants.js';
import { formatearPrecio, obtenerAleatorio, esperar } from './utils.js';
import { Jugador } from './classes/Jugador.js';
import { Enemigo, Jefe } from './classes/Enemigo.js';
import { Producto } from './classes/Producto.js';

/**
 * LÓGICA PRINCIPAL DEL JUEGO
 * Gestiona el flujo entre escenas, la lógica del mercado, el sistema de batalla y el estado global.
 * @module main
 */

// --- ESTADO ---
let jugador;
let enemigos = [];
let enemigoActualIndex = 0;
let gastoTotal = 500;


/**
 * Función de inicialización principal.
 * Se ejecuta cuando el DOM ha terminado de cargar.
 * Instancia al jugador, prepara los enemigos y configura los eventos de la interfaz.
 */
const init = () => {
    jugador = new Jugador(
        DATOS_JUGADOR.nombre,
        DATOS_JUGADOR.imagen,
        DATOS_JUGADOR.vidaBase,
        DATOS_JUGADOR.ataqueBase,
        DATOS_JUGADOR.defensaBase
    );

    enemigos = LISTA_ENEMIGOS.map(datos => {
        if (datos.esJefe) {
            return new Jefe(datos.nombre, datos.imagen, datos.vida, datos.ataque, datos.multiplicador);
        } else {
            return new Enemigo(datos.nombre, datos.imagen, datos.vida, datos.ataque);
        }
    });

    asignarEventosBotones();
    actualizarInfoJugadorInicio();
};

const asignarEventosBotones = () => {
    document.getElementById('btn-ir-mercado').addEventListener('click', () => {
        cargarMercado();
        cambiarEscena('escena-mercado');
    });

    document.getElementById('btn-mercado-continuar').addEventListener('click', () => {
        mostrarEstadoFinal();
        cambiarEscena('escena-estado');
    });

    document.getElementById('btn-ver-enemigos').addEventListener('click', () => {
        mostrarGaleriaEnemigos();
        cambiarEscena('escena-enemigos');
    });

    document.getElementById('btn-comenzar-batalla').addEventListener('click', () => {
        iniciarSistemaBatallas();
        cambiarEscena('escena-batalla');
    });

    document.getElementById('btn-siguiente-batalla').addEventListener('click', () => {
        siguienteRonda();
    });

    document.getElementById('btn-reiniciar').addEventListener('click', () => {
        location.reload();
    });



    document.getElementById('btn-ir-inicio').addEventListener('click', () => {
        cambiarEscena('escena-inicio');
    });
};

/**
 * Controla la visibilidad de las escenas del juego.
 * Oculta todas las secciones y muestra únicamente la que coincide con el ID proporcionado.
 * @param {string} idEscena - El ID del elemento HTML de la escena a mostrar.
 */

const cambiarEscena = (idEscena) => {
    const escenas = document.querySelectorAll('.escena');
    escenas.forEach(escena => {
        if (escena.id === idEscena) {
            escena.classList.remove('oculta');
            escena.classList.add('visible');
        } else {
            escena.classList.add('oculta');
            escena.classList.remove('visible');
        }
    });
};

// --- ESCENA 1 ---
function actualizarInfoJugadorInicio() {
    document.getElementById('nombre-jugador').textContent = jugador.nombre;
    document.getElementById('vida-jugador').textContent = jugador.vida;
    document.getElementById('ataque-jugador').textContent = jugador.ataqueBase;
    document.getElementById('defensa-jugador').textContent = jugador.defensaBase;
    document.getElementById('img-jugador-inicio').src = jugador.imagen;
}

// --- ESCENA 2: MERCADO ---
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
            <button class="btn-nada"></button>
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



/**
 * Gestiona la lógica de compra y devolución de objetos.
 * Actualiza el inventario del jugador, el dinero gastado y la interfaz.
 * @param {Producto} producto - El objeto seleccionado.
 * @param {HTMLButtonElement} boton - El botón pulsado.
 * @param {HTMLElement} tarjetaDiv - El contenedor visual de la tarjeta de producto.
 */
function gestionarCompra(producto, boton, tarjetaDiv) {
    const index = jugador.inventario.findIndex(p => p.nombre === producto.nombre);

//////////////////////////////////////////////////////////////////////////////////////////////////////////
     if (gastoTotal < producto.precio){ boton.classList.replace('btn-comprar');}
     
////////////////////////////////////////////////////////////////////////////////////////////////////////
    if (index === -1) {
        jugador.agregarObjeto(producto);
        gastoTotal -= producto.precio; //ACABO DE PONER -= ANTES +=
        boton.textContent = "Retirar";
        boton.classList.add('btn-retirar');
        tarjetaDiv.style.backgroundColor = "#c8e6c9";

        
    } else {
        jugador.inventario.splice(index, 1);
        gastoTotal -= producto.precio;
        
        if(producto.tipo === 'consumible') {
            jugador.vida -= producto.bonus;
            jugador.vidaMaxima -= producto.bonus;
        }
       
       
     
        boton.textContent = "Comprar";
        boton.classList.remove('btn-retirar');
        tarjetaDiv.style.backgroundColor = "";
    }

    document.getElementById('gasto-total').textContent = gastoTotal;
    renderizarInventarioUI();
}

const renderizarInventarioUI = () => {
    const contInv = document.getElementById('contenedor-inventario');
    contInv.innerHTML = '';

    jugador.inventario.forEach(item => {
        const img = document.createElement('img');
        img.src = item.imagen;
        img.style.width = '50px';
        img.style.border = '1px solid #000';
        img.title = item.nombre;
        contInv.appendChild(img);
    });
};

// --- ESCENA 3: ESTADO FINAL ---
const mostrarEstadoFinal = () => {
    document.getElementById('stat-ataque-final').textContent = jugador.obtenerAtaqueTotal();
    document.getElementById('stat-defensa-final').textContent = jugador.obtenerDefensaTotal();
    document.getElementById('stat-vida-final').textContent = jugador.vida;
};

// --- ESCENA 4: GALERÍA ---
const mostrarGaleriaEnemigos = () => {
    const lista = document.getElementById('lista-enemigos');
    lista.innerHTML = '';

    enemigos.forEach(enemigo => {
        const ficha = document.createElement('div');
        ficha.className = 'ficha-producto';
        ficha.innerHTML = `
            <img src="${enemigo.imagen}" alt="${enemigo.nombre}">
            <h4>${enemigo.nombre}</h4>
            <p>Vida: ${enemigo.vida}</p>
            <p>Ataque: ${enemigo.ataque}</p>
            ${enemigo instanceof Jefe ? '<p style="color:red; font-weight:bold">¡JEFE!</p>' : ''}
        `;
        lista.appendChild(ficha);
    });
};

// --- ESCENA 5: BATALLA ---
const iniciarSistemaBatallas = () => {
    enemigoActualIndex = 0;
    prepararBatalla();
};

const prepararBatalla = () => {
    const enemigo = enemigos[enemigoActualIndex];
    document.getElementById('img-enemigo-actual').src = enemigo.imagen;
    gastoTotal + 5;
    actualizarBarrasVida(enemigo);

    document.getElementById('mensaje-batalla').textContent = `¡Aparece un ${enemigo.nombre}!`;
    document.getElementById('mensaje-batalla').style.color = 'black';
    document.getElementById('btn-siguiente-batalla').classList.add('oculta');

    // Animación de entrada 
    const arena = document.querySelector('.area-combate');
    const luchadores = document.querySelectorAll('.luchador');

    // 1. Resetear
    arena.classList.remove('start-anim');
    luchadores.forEach(l => l.style.transition = 'none');

    // 2. Activar
    setTimeout(() => {
        luchadores.forEach(l => l.style.transition = '');
        arena.classList.add('start-anim');
        
        // Empezar turnos
        setTimeout(() => {
            combate(enemigo);
        }, 1000);
    }, 50);
};

/**
 * Bucle principal de combate asíncrono.
 * Gestiona los turnos, cálculo de daño y actualización de la interfaz hasta que uno muera.
 * @param {Enemigo} enemigo - El oponente actual.
 */

async function combate(enemigo) {
    // Espera inicial gestionada por el timeout de arriba

    while (jugador.estaVivo() && enemigo.estaVivo()) {
        const ataqueJ = jugador.obtenerAtaqueTotal();
        enemigo.recibirDaño(ataqueJ);
        
        document.getElementById('mensaje-batalla').textContent = 
            `Atacas a ${enemigo.nombre}: ${ataqueJ} daño.`;
        
        actualizarBarrasVida(enemigo);
        
        if (!enemigo.estaVivo()) break;
        
        await esperar(1500);

        const defensaJ = jugador.obtenerDefensaTotal();
        let dañoRecibido = enemigo.ataque - defensaJ;
        if (dañoRecibido < 0) dañoRecibido = 0;

        jugador.recibirDaño(dañoRecibido);

        document.getElementById('mensaje-batalla').textContent = 
            `${enemigo.nombre} te ataca: ${dañoRecibido} daño.`;
        document.getElementById('mensaje-batalla').style.color = 'red';

        actualizarBarrasVida(enemigo);

        if (!jugador.estaVivo()) break;

        await esperar(1500);
        document.getElementById('mensaje-batalla').style.color = 'black';
    }

    resolverResultadoCombate(enemigo);
}

/**
 * Actualiza el ancho de las barras de vida en el DOM según la vida actual/máxima.
 * @param {Enemigo} enemigo - El enemigo actual para calcular su barra.
 */

const actualizarBarrasVida = (enemigo) => {
    const vidaMaxJ = jugador.vidaMaxima;
    const porcentajeJ = (jugador.vida / vidaMaxJ) * 100;
    document.getElementById('vida-bar-jugador').style.width = `${Math.max(0, porcentajeJ)}%`;
    document.getElementById('batalla-vida-jugador').textContent = jugador.vida;

    const vidaMaxE = enemigo.vidaMaxima; 
    const porcentajeE = (enemigo.vida / vidaMaxE) * 100;
    document.getElementById('vida-bar-enemigo').style.width = `${Math.max(0, porcentajeE)}%`; 
    document.getElementById('batalla-vida-enemigo').textContent = enemigo.vida;
};

/**
 * Evalúa el resultado final del combate (Victoria o Derrota).
 * Asigna puntos y gestiona la transición a la siguiente ronda o pantalla final.
 * @param {Enemigo} enemigo - El enemigo contra el que se ha luchado.
 */

const resolverResultadoCombate = (enemigo) => {
    if (jugador.estaVivo()) {
        let puntosGanados = 100 + enemigo.ataque;
        if (enemigo instanceof Jefe) {
            puntosGanados = Math.floor(puntosGanados * enemigo.multiplicador);
            document.getElementById('mensaje-batalla').textContent = `¡HAS DERROTADO AL JEFE! +${puntosGanados}puntos  ${gastoTotal = +10} monedas.`;
        } else {
            document.getElementById('mensaje-batalla').textContent = `¡Victoria! +${puntosGanados}puntos  ${gastoTotal = +5} monedas .`;
        }
        
        document.getElementById('mensaje-batalla').style.color = 'green';
        jugador.sumarPuntos(puntosGanados);

        

        const btnSiguiente = document.getElementById('btn-siguiente-batalla');
        btnSiguiente.classList.remove('oculta');
        
        if (enemigoActualIndex === enemigos.length - 1) {
            btnSiguiente.textContent = "Ver Resultados Finales";
        }

    } else {
        document.getElementById('mensaje-batalla').textContent = "Has caído en la arena... Honor y Gloria.";
        setTimeout(() => {
            mostrarPantallaFinal();
            cambiarEscena('escena-fin');
        }, 3000);
    }
};

const siguienteRonda = () => {
    enemigoActualIndex++;
    if (enemigoActualIndex < enemigos.length) {
        prepararBatalla();
    } else {
        mostrarPantallaFinal();
        cambiarEscena('escena-fin');
    }
};

// --- ESCENA 6 ---
const mostrarPantallaFinal = () => {
    const rangoH2 = document.getElementById('rango-final');
    const puntosSpan = document.getElementById('puntuacion-final');
    

    puntosSpan.textContent = jugador.puntos;
    

    if (jugador.puntos >= PUNTOS_PARA_VETERANO) {
        rangoH2.textContent = "¡VETERANO DE LA ARENA!";
        rangoH2.style.color = "gold";
        lanzarConfeti();
    } else {
        rangoH2.textContent = "Novato... Sigue entrenando.";
        rangoH2.style.color = "gray";
    }
};

function lanzarConfeti() {
    if (window.confetti) {
        window.confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#daa520', '#b71c1c', '#ffffff']
        });
    }
}

document.addEventListener('DOMContentLoaded', init);