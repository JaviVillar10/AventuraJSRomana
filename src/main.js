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
 * Función para actualizar visualmente el monedero en el footer.
 * Sincroniza el valor de jugador.dinero con el elemento #tr.
 */
const refrescarDineroVisual = () => {
    const elTr = document.getElementById('tr');
    if (elTr) {
        elTr.textContent = jugador.dinero;
    }
    // Sincroniza también el contador del mercado para evitar confusiones
    const elGasto = document.getElementById('gasto-total');
    if (elGasto) {
        elGasto.textContent = jugador.dinero;
    }
};

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
    
    // Propiedad dinero inicial
    jugador.dinero = 500;
    
    // Inicializamos el monedero fijo al cargar
    refrescarDineroVisual();

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

/**
 * Asigna los listeners a todos los botones de la interfaz.
 */
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

    // --- LÓGICA DE VALIDACIÓN ---
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
            // IMPORTANTE: Cambio de escena tras validación exitosa
            cambiarEscena('escena-inicio');
        }
    });

    // --- EVENTOS DE RANKING ---
    const btnRanking = document.getElementById('btn-ir-ranking-escena');
    if (btnRanking) {
        btnRanking.addEventListener('click', () => {
            mostrarRankingEnPantalla();
            cambiarEscena('escena-ranking');
        });
    }

    const btnTerminal = document.getElementById('btn-mostrar-terminal');
    if (btnTerminal) {
        btnTerminal.addEventListener('click', () => {
            const ranking = JSON.parse(localStorage.getItem('ranking_gladiadores')) || [];
            ranking.sort((a, b) => b.puntuacionTotal - a.puntuacionTotal);
            console.log("%c--- RANKING TÉCNICO (TERMINAL) ---", "color: gold; font-weight: bold;");
            console.table(ranking);
        });
    }
};

/**
 * Controla la visibilidad de las escenas del juego.
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

/**
 * Actualiza los datos del jugador en la escena de inicio/bienvenida.
 */
function actualizarInfoJugadorInicio() {
    document.getElementById('nombre-jugador').textContent = jugador.nombre;
    document.getElementById('vida-jugador').textContent = jugador.vida;
    document.getElementById('ataque-jugador').textContent = jugador.ataqueBase;
    document.getElementById('defensa-jugador').textContent = jugador.defensaBase;
    document.getElementById('img-jugador-inicio').src = jugador.imagen;
    
    const imgRes = document.getElementById('img-jugador-inicio-resumen');
    if(imgRes) imgRes.src = jugador.imagen;

    refrescarDineroVisual();
}

/**
 * Carga y renderiza los productos en la escena del mercado.
 */
const cargarMercado = () => {
    refrescarDineroVisual();
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
 * @param {Producto} producto - El objeto seleccionado.
 * @param {HTMLButtonElement} boton - El botón pulsado.
 * @param {HTMLElement} tarjetaDiv - El contenedor visual de la tarjeta.
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

    refrescarDineroVisual();
    renderizarInventarioUI();
}

/**
 * Renderiza los iconos de los objetos comprados.
 */
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

/**
 * Muestra las estadísticas finales calculadas antes del combate.
 */
const mostrarEstadoFinal = () => {
    document.getElementById('stat-ataque-final').textContent = jugador.obtenerAtaqueTotal();
    document.getElementById('stat-defensa-final').textContent = jugador.obtenerDefensaTotal();
    document.getElementById('stat-vida-final').textContent = jugador.vida;
    const imgEst = document.getElementById('img-jugador-estado');
    if(imgEst) imgEst.src = jugador.imagen;
};

/**
 * Muestra la lista de oponentes.
 */
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

/**
 * Inicializa el carrusel de batallas.
 */
const iniciarSistemaBatallas = () => {
    enemigoActualIndex = 0;
    prepararBatalla();
};

/**
 * Prepara el escenario para un combate individual.
 */
const prepararBatalla = () => {
    const enemigo = enemigos[enemigoActualIndex];
    document.getElementById('img-enemigo-actual').src = enemigo.imagen;
    document.getElementById('img-batalla-jugador').src = jugador.imagen;
    
    actualizarBarrasVida(enemigo);
    document.getElementById('mensaje-batalla').textContent = `¡Aparece un ${enemigo.nombre}!`;
    document.getElementById('mensaje-batalla').style.color = 'black';
    document.getElementById('btn-siguiente-batalla').classList.add('oculta');

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
 * Bucle de combate asíncrono.
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

/**
 * Actualiza las barras de salud en pantalla.
 */
const actualizarBarrasVida = (enemigo) => {
    const porcJ = (jugador.vida / jugador.vidaMaxima) * 100;
    document.getElementById('vida-bar-jugador').style.width = `${Math.max(0, porcJ)}%`;
    document.getElementById('batalla-vida-jugador').textContent = jugador.vida;
    const porcE = (enemigo.vida / enemigo.vidaMaxima) * 100;
    document.getElementById('vida-bar-enemigo').style.width = `${Math.max(0, porcE)}%`; 
    document.getElementById('batalla-vida-enemigo').textContent = enemigo.vida;
};

/**
 * Gestiona el premio tras la victoria y la animación de monedas 
 */
const resolverResultadoCombate = (enemigo) => {
    if (jugador.estaVivo()) {
        let ptsG = 100 + enemigo.ataque;
        let monG = (enemigo instanceof Jefe) ? 10 : 5;
        
        jugador.dinero += monG;
        jugador.sumarPuntos(ptsG);
        refrescarDineroVisual();

        document.getElementById('mensaje-batalla').innerHTML = `¡Victoria! +${ptsG} pts <br> <span style="color: gold; font-weight: bold;">+${monG} monedas 🪙</span>`;
        document.getElementById('mensaje-batalla').style.color = 'green';

        // Lanzamos la lluvia de monedas
        lanzarAnimacionMonedas();

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

/**
 * Crea la animación de 3 monedas cayendo.
 */
const lanzarAnimacionMonedas = () => {
    const posiciones = ['25%', '50%', '75%'];
    posiciones.forEach(pos => {
        let monedaHtml = `<img src="img/moneda.png" alt="moneda" class="moneda-animada" style="left: ${pos};">`;
        document.body.insertAdjacentHTML('beforeend', monedaHtml);
    });

    setTimeout(() => {
        const monedas = document.querySelectorAll('.moneda-animada');
        monedas.forEach(m => m.remove());
    }, 3000);
};

/**
 * Pasa al siguiente enemigo o termina el juego.
 */
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
 * Escena final de resultados y guardado en LocalStorage.
 */
const mostrarPantallaFinal = () => {
    const rangoH2 = document.getElementById('rango-final');
    const totalFinal = jugador.puntos + jugador.dinero;

    document.getElementById('resumen-puntos').textContent = jugador.puntos;
    document.getElementById('resumen-monedas').textContent = jugador.dinero;
    document.getElementById('puntuacion-final').textContent = totalFinal;

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
 * Rellena la tabla HTML del ranking  con los 4 datos solicitados.
 */
const mostrarRankingEnPantalla = () => {
    const ranking = JSON.parse(localStorage.getItem('ranking_gladiadores')) || [];
    ranking.sort((a, b) => b.puntuacionTotal - a.puntuacionTotal);
    const cuerpo = document.getElementById('cuerpo-ranking');
    if (!cuerpo) return;
    
    cuerpo.innerHTML = '';

    ranking.forEach(item => {
        const fila = document.createElement('tr');
        // Columnas: Nombre, Puntos, Monedas, Total
        fila.innerHTML = `
            <td>${item.gladiador}</td>
            <td>${item.puntosBatalla}</td>
            <td>${item.monedasRestantes}</td>
            <td style="font-weight:bold;">${item.puntuacionTotal}</td>
        `;
        cuerpo.appendChild(fila);
    });
};

/**
 * Efecto visual de confeti.
 */
function lanzarConfeti() {
    if (window.confetti) {
        window.confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#daa520', '#b71c1c', '#ffffff'] });
    }
}

document.addEventListener('DOMContentLoaded', init);