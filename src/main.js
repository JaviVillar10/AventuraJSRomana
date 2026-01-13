/* src/main.js */

import { DATOS_JUGADOR, LISTA_ENEMIGOS, MERCADO_PRODUCTOS, PUNTOS_PARA_VETERANO, REGEX } from './constants.js';
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
    
    //  Dinero inicial
    jugador.dinero = 500;

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

    // --- LÓGICA DE VALIDACIÓN  ---
    document.getElementById('btn-ir-inicio').addEventListener('click', () => {
        const formulario = document.getElementById('crear-personaje');
        const errNom = document.getElementById('error-nombre');
        const errStat = document.getElementById('error-stats');

        errNom.textContent = "";
        errStat.textContent = "";

        const nombre = formulario.elements['nombre-jugador'].value.trim();
        const atkVal = parseInt(formulario.elements['ataque'].value);
        const defVal = parseInt(formulario.elements['defensa'].value);
        const vidVal = parseInt(formulario.elements['vida'].value);

        let errores = false;

        if (!REGEX.NOMBRE_GLADIADOR.test(nombre)) {
            errNom.textContent = "La primera letra debe ser Mayúscula (máx 20 carac).";
            errores = true;
        }

        if (vidVal < 100) {
            errStat.textContent = "La vida no puede ser inferior a 100 puntos.";
            errores = true;
        } else if ((atkVal + defVal + vidVal) > 110) {
            errStat.textContent = "Total excedido. Solo puedes repartir 10 puntos extra.";
            errores = true;
        }

        if (!errores) {
            jugador.nombre = nombre;
            jugador.ataqueBase = atkVal;
            jugador.defensaBase = defVal;
            jugador.vida = vidVal;
            jugador.vidaMaxima = vidVal;

            actualizarInfoJugadorInicio();
            cambiarEscena('escena-inicio');
        }
    });

    // --- EVENTOS DE RANKING (EJERCICIO 4) ---
    document.getElementById('btn-ir-ranking-escena').addEventListener('click', () => {
        mostrarRankingEnPantalla();
        cambiarEscena('escena-ranking');
    });

    document.getElementById('btn-mostrar-terminal').addEventListener('click', () => {
        const ranking = JSON.parse(localStorage.getItem('ranking_gladiadores')) || [];
        ranking.sort((a, b) => b.puntuacionTotal - a.puntuacionTotal);
        console.log("%c--- RANKING DE GLADIADORES (TERMINAL) ---", "color: gold; font-weight: bold; font-size: 14px;");
        console.table(ranking);
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
    const imgRes = document.getElementById('img-jugador-inicio-resumen');
    if(imgRes) imgRes.src = jugador.imagen;
}

// --- ESCENA 2: MERCADO ---
const cargarMercado = () => {
    document.getElementById('gasto-total').textContent = jugador.dinero;
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

    document.getElementById('gasto-total').textContent = jugador.dinero;
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
    const imgEst = document.getElementById('img-jugador-estado');
    if(imgEst) imgEst.src = jugador.imagen;
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
    // --- ASIGNACIÓN DE IMÁGENES ---
    document.getElementById('img-enemigo-actual').src = enemigo.imagen;
    document.getElementById('img-batalla-jugador').src = jugador.imagen;
    
    actualizarBarrasVida(enemigo);
    document.getElementById('mensaje-batalla').textContent = `¡Aparece un ${enemigo.nombre}!`;
    document.getElementById('mensaje-batalla').style.color = 'black';
    document.getElementById('btn-siguiente-batalla').classList.add('oculta');

    // Animación de entrada
    const arena = document.querySelector('.area-combate');
    const luchadores = document.querySelectorAll('.luchador');
    arena.classList.remove('start-anim');
    luchadores.forEach(l => l.style.transition = 'none');
    setTimeout(() => {
        luchadores.forEach(l => l.style.transition = '');
        arena.classList.add('start-anim');
        setTimeout(() => combate(enemigo), 1000);
    }, 50);
};

/**
 * Bucle principal de combate asíncrono.
 * @param {Enemigo} enemigo - El oponente actual.
 */
async function combate(enemigo) {
    while (jugador.estaVivo() && enemigo.estaVivo()) {
        const ataqueJ = jugador.obtenerAtaqueTotal();
        enemigo.recibirDaño(ataqueJ);
        document.getElementById('mensaje-batalla').textContent = `Atacas a ${enemigo.nombre}: ${ataqueJ} daño.`;
        actualizarBarrasVida(enemigo);
        if (!enemigo.estaVivo()) break;
        await esperar(1500);

        const defensaJ = jugador.obtenerDefensaTotal();
        let dañoRecibido = enemigo.ataque - defensaJ;
        if (dañoRecibido < 0) dañoRecibido = 0;
        jugador.recibirDaño(dañoRecibido);
        document.getElementById('mensaje-batalla').textContent = `${enemigo.nombre} te ataca: ${dañoRecibido} daño.`;
        document.getElementById('mensaje-batalla').style.color = 'red';
        actualizarBarrasVida(enemigo);
        if (!jugador.estaVivo()) break;
        await esperar(1500);
        document.getElementById('mensaje-batalla').style.color = 'black';
    }
    resolverResultadoCombate(enemigo);
}

const actualizarBarrasVida = (enemigo) => {
    const porcJ = (jugador.vida / jugador.vidaMaxima) * 100;
    document.getElementById('vida-bar-jugador').style.width = `${Math.max(0, porcJ)}%`;
    document.getElementById('batalla-vida-jugador').textContent = jugador.vida;
    const porcE = (enemigo.vida / enemigo.vidaMaxima) * 100;
    document.getElementById('vida-bar-enemigo').style.width = `${Math.max(0, porcE)}%`; 
    document.getElementById('batalla-vida-enemigo').textContent = enemigo.vida;
};

/**
 * Evalúa el resultado final del combate (CON PREMIOS EJERCICIO 3).
 * @param {Enemigo} enemigo - El enemigo contra el que se ha luchado.
 */
const resolverResultadoCombate = (enemigo) => {
    if (jugador.estaVivo()) {
        let ptsG = 100 + enemigo.ataque;
        let monG = (enemigo instanceof Jefe) ? 10 : 5;
        
        jugador.dinero += monG;
        jugador.sumarPuntos(ptsG);

        document.getElementById('mensaje-batalla').innerHTML = `¡Victoria! +${ptsG} pts <br> <span style="color: gold; font-weight: bold;">+${monG} monedas 🪙</span>`;
        document.getElementById('mensaje-batalla').style.color = 'green';

        const btnSig = document.getElementById('btn-siguiente-batalla');
        btnSig.classList.remove('oculta');
        if (enemigoActualIndex === enemigos.length - 1) btnSig.textContent = "Ver Resultados Finales";
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

/**
 * Muestra la pantalla final.
 */
const mostrarPantallaFinal = () => {
    const rangoH2 = document.getElementById('rango-final');
    const totalFinal = jugador.puntos + jugador.dinero;

    document.getElementById('resumen-puntos').textContent = jugador.puntos;
    document.getElementById('resumen-monedas').textContent = jugador.dinero;
    document.getElementById('puntuacion-final').textContent = totalFinal;

    // --- GUARDADO LOCALSTORAGE ---
    const registro = {
        gladiador: jugador.nombre,
        puntosBatalla: jugador.puntos,
        monedasRestantes: jugador.dinero,
        puntuacionTotal: totalFinal
    };
    let ranking = JSON.parse(localStorage.getItem('ranking_gladiadores')) || [];
    ranking.push(registro);
    localStorage.setItem('ranking_gladiadores', JSON.stringify(ranking));

    if (totalFinal >= PUNTOS_PARA_VETERANO) {
        rangoH2.textContent = "¡VETERANO DE LA ARENA!";
        lanzarConfeti();
    } else {
        rangoH2.textContent = "Novato... Sigue entrenando.";
    }
};

/**
 * Renderiza la tabla del Ranking en el HTML 
 */
const mostrarRankingEnPantalla = () => {
    const ranking = JSON.parse(localStorage.getItem('ranking_gladiadores')) || [];
    ranking.sort((a, b) => b.puntuacionTotal - a.puntuacionTotal);
    const cuerpo = document.getElementById('cuerpo-ranking');
    cuerpo.innerHTML = '';

    ranking.forEach(item => {
        const fila = document.createElement('tr');
        fila.style.borderBottom = "1px solid #555";
        fila.innerHTML = `
            <td style="padding:8px;">${item.gladiador}</td>
            <td style="text-align:center;">${item.puntosBatalla}</td>
            <td style="text-align:center;">${item.monedasRestantes}</td>
            <td style="text-align:center; font-weight:bold; color:gold;">${item.puntuacionTotal}</td>
        `;
        cuerpo.appendChild(fila);
    });
};

function lanzarConfeti() {
    if (window.confetti) {
        window.confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#daa520', '#b71c1c', '#ffffff'] });
    }
}

document.addEventListener('DOMContentLoaded', init);