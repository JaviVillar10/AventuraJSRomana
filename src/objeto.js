const CLAVE_LOCAL_STORAGE = 'productos_javier';

const MAPA_RAREZA = {
    'Común': 'comun',
    'Raro': 'rara',
    'Épico': 'epico'
};

document.getElementById('crear-objeto').addEventListener('submit', (evento) => {
    evento.preventDefault();

    const formulario = evento.target;

    const nombre = formulario.elements['nombre'].value.trim();
    const precio = parseInt(formulario.elements['precio'].value);
    const rareza = formulario.elements['rareza'].value;
    const tipo = formulario.elements['tipo'].value;
    const bonus = formulario.elements['bonus'].value.trim();
    const imagenArchivo = formulario.elements['imagen'].files[0];

    const nuevoProducto = {
        nombre: nombre,
        imagen: imagenArchivo ? imagenArchivo.name : '',
        precio: precio,
        tipo: tipo.toLowerCase(),
        bonus: parseInt(bonus.slice(1)),
        rareza: MAPA_RAREZA[rareza] || 'comun'
    };

    const productosGuardados = JSON.parse(localStorage.getItem(CLAVE_LOCAL_STORAGE)) || [];
    productosGuardados.push(nuevoProducto);
    localStorage.setItem(CLAVE_LOCAL_STORAGE, JSON.stringify(productosGuardados));

    formulario.reset();
    alert('Objeto guardado correctamente.');
});
