// ReelTools Beta 2
// ahora guardo mas cosas: nombre, urls, descripcion, etiquetas y transcripcion
// sigo usando localStorage, sin backend

var CLAVE = 'reeltools_entradas';

// pillar los campos del formulario
var formulario = document.getElementById('form-enlace');
var inputNombre = document.getElementById('input-nombre');
var inputReel = document.getElementById('input-reel');
var inputRepo = document.getElementById('input-repo');
var inputDesc = document.getElementById('input-desc');
var inputTags = document.getElementById('input-tags');
var inputTrans = document.getElementById('input-trans');

// pillar la lista y botones
var lista = document.getElementById('lista-enlaces');
var contador = document.getElementById('contador');
var vacio = document.getElementById('vacio');
var btnExportar = document.getElementById('btn-exportar');

// cuando envio el formulario añado la entrada
formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();

    var nombre = inputNombre.value.trim();
    if (nombre === '') {
        return;
    }

    var entrada = {
        nombre: nombre,
        urlReel: inputReel.value.trim(),
        urlRepo: inputRepo.value.trim(),
        descripcion: inputDesc.value.trim(),
        etiquetas: inputTags.value.trim(),
        transcripcion: inputTrans.value.trim(),
        fecha: new Date().toLocaleString('es-ES')
    };

    var entradas = cargarEntradas();
    entradas.push(entrada);
    guardarEntradas(entradas);

    // limpio el formulario
    formulario.reset();
    mostrarEntradas();
});

// cargo las entradas guardadas
function cargarEntradas() {
    var datos = localStorage.getItem(CLAVE);
    if (datos === null) {
        return [];
    }
    return JSON.parse(datos);
}

// guardo las entradas
function guardarEntradas(entradas) {
    localStorage.setItem(CLAVE, JSON.stringify(entradas));
}

// paso las etiquetas "react, animacion" a un array ["react", "animacion"]
function parsearEtiquetas(texto) {
    if (!texto) return [];
    return texto.split(',')
        .map(function (e) { return e.trim(); })
        .filter(function (e) { return e !== ''; });
}

// pinto la lista en el HTML
function mostrarEntradas() {
    var entradas = cargarEntradas();
    lista.innerHTML = '';
    contador.textContent = entradas.length;

    // el boton de exportar lo deshabilito si no hay nada
    if (entradas.length === 0) {
        vacio.style.display = 'block';
        btnExportar.disabled = true;
        return;
    }
    vacio.style.display = 'none';
    btnExportar.disabled = false;

    entradas.forEach(function (entrada, posicion) {
        var li = document.createElement('li');

        // cabecera con nombre y boton borrar
        var cabecera = document.createElement('div');
        cabecera.className = 'item-cabecera';

        var divNombre = document.createElement('div');
        var nombre = document.createElement('div');
        nombre.className = 'item-nombre';
        nombre.textContent = entrada.nombre;
        var fecha = document.createElement('div');
        fecha.className = 'item-fecha';
        fecha.textContent = entrada.fecha;
        divNombre.appendChild(nombre);
        divNombre.appendChild(fecha);

        var borrar = document.createElement('button');
        borrar.className = 'btn-borrar';
        borrar.textContent = 'Borrar';
        borrar.onclick = function () {
            if (confirm('¿Seguro que quieres borrar esta entrada?')) {
                borrarEntrada(posicion);
            }
        };

        cabecera.appendChild(divNombre);
        cabecera.appendChild(borrar);
        li.appendChild(cabecera);

        // etiquetas
        var etiquetas = parsearEtiquetas(entrada.etiquetas);
        if (etiquetas.length > 0) {
            var divTags = document.createElement('div');
            divTags.className = 'item-tags';
            etiquetas.forEach(function (tag) {
                var span = document.createElement('span');
                span.className = 'tag';
                span.textContent = tag;
                divTags.appendChild(span);
            });
            li.appendChild(divTags);
        }

        // descripcion
        if (entrada.descripcion) {
            var desc = document.createElement('div');
            desc.className = 'item-desc';
            desc.textContent = entrada.descripcion;
            li.appendChild(desc);
        }

        // enlaces
        var links = document.createElement('div');
        links.className = 'item-links';
        if (entrada.urlReel) {
            var aReel = document.createElement('a');
            aReel.href = entrada.urlReel;
            aReel.target = '_blank';
            aReel.textContent = 'Ver reel';
            links.appendChild(aReel);
        }
        if (entrada.urlRepo) {
            if (entrada.urlReel) {
                links.appendChild(document.createTextNode('·'));
            }
            var aRepo = document.createElement('a');
            aRepo.href = entrada.urlRepo;
            aRepo.target = '_blank';
            aRepo.textContent = 'Ver repo';
            links.appendChild(aRepo);
        }
        if (entrada.urlReel || entrada.urlRepo) {
            li.appendChild(links);
        }

        // transcripcion en desplegable
        if (entrada.transcripcion) {
            var details = document.createElement('details');
            var summary = document.createElement('summary');
            summary.textContent = 'Ver transcripción';
            var p = document.createElement('p');
            p.textContent = entrada.transcripcion;
            details.appendChild(summary);
            details.appendChild(p);
            li.appendChild(details);
        }

        lista.appendChild(li);
    });
}

// borro una entrada por su posicion
function borrarEntrada(posicion) {
    var entradas = cargarEntradas();
    entradas.splice(posicion, 1);
    guardarEntradas(entradas);
    mostrarEntradas();
}

// exporto todas las entradas a un archivo .md
btnExportar.addEventListener('click', function () {
    var entradas = cargarEntradas();
    if (entradas.length === 0) {
        return;
    }

    var md = '# 🧰 Mi colección de herramientas\n\n';
    md += '> Generado con ReelTools\n\n';

    entradas.forEach(function (entrada) {
        md += '## ' + entrada.nombre + '\n\n';
        if (entrada.urlRepo) {
            md += '- **Repo:** ' + entrada.urlRepo + '\n';
        }
        if (entrada.etiquetas) {
            md += '- **Etiquetas:** ' + entrada.etiquetas + '\n';
        }
        if (entrada.descripcion) {
            md += '- **Descripción:** ' + entrada.descripcion + '\n';
        }
        if (entrada.transcripcion) {
            md += '- **Transcripción:** ' + entrada.transcripcion + '\n';
        }
        md += '\n';
    });

    // descargo el archivo
    var blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'herramientas.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// al cargar la pagina muestro lo que ya tenga guardado
mostrarEntradas();


// === MEJORAS: buscador y boton editar ===
// estas funciones las añado al final, redefinen mostrarEntradas


// creo el input de busqueda y lo meto arriba de la lista
var seccionLista = document.getElementById('lista');
var buscador = document.createElement('input');
buscador.type = 'search';
buscador.id = 'input-buscar';
buscador.placeholder = 'buscar por nombre, etiqueta o descripcion...';
seccionLista.insertBefore(buscador, seccionLista.firstChild);

// filtro las entradas por el texto del buscador
function buscarEntradas(texto) {
    var entradas = cargarEntradas();
    if (!texto) return entradas;
    var filtro = texto.toLowerCase();
    return entradas.filter(function (e) {
        var enNombre = e.nombre.toLowerCase().indexOf(filtro) !== -1;
        var enTags = e.etiquetas.toLowerCase().indexOf(filtro) !== -1;
        var enDesc = e.descripcion.toLowerCase().indexOf(filtro) !== -1;
        return enNombre || enTags || enDesc;
    });
}

// redefino mostrarEntradas para que filtre y añada el boton editar
function mostrarEntradas() {
    var texto = buscador ? buscador.value : '';
    var todas = cargarEntradas();
    var entradas = todas;
    if (texto) {
        var filtro = texto.toLowerCase();
        entradas = todas.filter(function (e) {
            var enNombre = e.nombre.toLowerCase().indexOf(filtro) !== -1;
            var enTags = e.etiquetas.toLowerCase().indexOf(filtro) !== -1;
            var enDesc = e.descripcion.toLowerCase().indexOf(filtro) !== -1;
            return enNombre || enTags || enDesc;
        });
    }
    lista.innerHTML = '';
    contador.textContent = entradas.length;

    if (entradas.length === 0) {
        vacio.style.display = 'block';
        if (todas.length === 0) {
            vacio.textContent = 'Aún no has añadido ninguna entrada.';
        } else {
            vacio.textContent = 'No hay resultados para tu busqueda.';
        }
        btnExportar.disabled = todas.length === 0;
        return;
    }
    vacio.style.display = 'none';
    btnExportar.disabled = false;

    entradas.forEach(function (entrada) {
        // busco la posicion original para poder borrar/editar bien
        var posicion = todas.indexOf(entrada);
        var li = document.createElement('li');

        // cabecera con nombre y botones
        var cabecera = document.createElement('div');
        cabecera.className = 'item-cabecera';

        var divNombre = document.createElement('div');
        var nombre = document.createElement('div');
        nombre.className = 'item-nombre';
        nombre.textContent = entrada.nombre;
        var fecha = document.createElement('div');
        fecha.className = 'item-fecha';
        fecha.textContent = entrada.fecha;
        divNombre.appendChild(nombre);
        divNombre.appendChild(fecha);

        // contenedor para los dos botones
        var divBtns = document.createElement('div');
        divBtns.style.display = 'flex';
        divBtns.style.gap = '6px';

        var editar = document.createElement('button');
        editar.className = 'btn-editar';
        editar.textContent = 'Editar';
        editar.onclick = function () {
            editarEntrada(posicion);
        };

        var borrar = document.createElement('button');
        borrar.className = 'btn-borrar';
        borrar.textContent = 'Borrar';
        borrar.onclick = function () {
            if (confirm('¿Seguro que quieres borrar esta entrada?')) {
                borrarEntrada(posicion);
            }
        };

        divBtns.appendChild(editar);
        divBtns.appendChild(borrar);
        cabecera.appendChild(divNombre);
        cabecera.appendChild(divBtns);
        li.appendChild(cabecera);

        // etiquetas
        var etiquetas = parsearEtiquetas(entrada.etiquetas);
        if (etiquetas.length > 0) {
            var divTags = document.createElement('div');
            divTags.className = 'item-tags';
            etiquetas.forEach(function (tag) {
                var span = document.createElement('span');
                span.className = 'tag';
                span.textContent = tag;
                divTags.appendChild(span);
            });
            li.appendChild(divTags);
        }

        // descripcion
        if (entrada.descripcion) {
            var desc = document.createElement('div');
            desc.className = 'item-desc';
            desc.textContent = entrada.descripcion;
            li.appendChild(desc);
        }

        // enlaces
        var links = document.createElement('div');
        links.className = 'item-links';
        if (entrada.urlReel) {
            var aReel = document.createElement('a');
            aReel.href = entrada.urlReel;
            aReel.target = '_blank';
            aReel.textContent = 'Ver reel';
            links.appendChild(aReel);
        }
        if (entrada.urlRepo) {
            if (entrada.urlReel) {
                links.appendChild(document.createTextNode('·'));
            }
            var aRepo = document.createElement('a');
            aRepo.href = entrada.urlRepo;
            aRepo.target = '_blank';
            aRepo.textContent = 'Ver repo';
            links.appendChild(aRepo);
        }
        if (entrada.urlReel || entrada.urlRepo) {
            li.appendChild(links);
        }

        // transcripcion en desplegable
        if (entrada.transcripcion) {
            var details = document.createElement('details');
            var summary = document.createElement('summary');
            summary.textContent = 'Ver transcripción';
            var p = document.createElement('p');
            p.textContent = entrada.transcripcion;
            details.appendChild(summary);
            details.appendChild(p);
            li.appendChild(details);
        }

        lista.appendChild(li);
    });
}

// editar: relleno el formulario con los datos y borro la entrada vieja
// cuando el usuario le de a añadir se crea como nueva
function editarEntrada(posicion) {
    var entradas = cargarEntradas();
    var entrada = entradas[posicion];
    inputNombre.value = entrada.nombre;
    inputReel.value = entrada.urlReel;
    inputRepo.value = entrada.urlRepo;
    inputDesc.value = entrada.descripcion;
    inputTags.value = entrada.etiquetas;
    inputTrans.value = entrada.transcripcion;
    // borro la entrada vieja, al guardar se crea de nuevo con los cambios
    entradas.splice(posicion, 1);
    guardarEntradas(entradas);
    mostrarEntradas();
    // subo al formulario para que el usuario lo vea
    document.getElementById('formulario').scrollIntoView({ behavior: 'smooth' });
    inputNombre.focus();
}

// busqueda en tiempo real
buscador.addEventListener('input', mostrarEntradas);

// vuelvo a pintar la lista con las mejoras
mostrarEntradas();
