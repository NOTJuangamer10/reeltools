// ReelTools Beta 1
// aqui guardo los enlaces en el localStorage del navegador
// (no tengo backend todavia, en la beta 2 quiero meter eso)

var CLAVE = 'reeltools_enlaces';

// pillar el formulario y la lista
var formulario = document.getElementById('form-enlace');
var inputUrl = document.getElementById('input-url');
var lista = document.getElementById('lista-enlaces');
var contador = document.getElementById('contador');
var vacio = document.getElementById('vacio');

// cuando envio el formulario añado el enlace
formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();
    var url = inputUrl.value.trim();

    if (url === '') {
        return; // no añado nada vacio
    }

    var enlaces = cargarEnlaces();
    enlaces.push({
        url: url,
        fecha: new Date().toLocaleString('es-ES')
    });
    guardarEnlaces(enlaces);

    inputUrl.value = '';
    mostrarEnlaces();
});

// cargo los enlaces guardados
function cargarEnlaces() {
    var datos = localStorage.getItem(CLAVE);
    if (datos === null) {
        return [];
    }
    return JSON.parse(datos);
}

// guardo los enlaces
function guardarEnlaces(enlaces) {
    localStorage.setItem(CLAVE, JSON.stringify(enlaces));
}

// pinto la lista en el HTML
function mostrarEnlaces() {
    var enlaces = cargarEnlaces();
    lista.innerHTML = '';
    contador.textContent = enlaces.length;

    // si no hay enlaces muestro el mensaje de vacio
    if (enlaces.length === 0) {
        vacio.style.display = 'block';
        return;
    }
    vacio.style.display = 'none';

    enlaces.forEach(function (enlace, posicion) {
        var li = document.createElement('li');

        var a = document.createElement('a');
        a.href = enlace.url;
        a.textContent = enlace.url;
        a.target = '_blank';

        var div = document.createElement('div');
        div.style.textAlign = 'right';

        var fecha = document.createElement('small');
        fecha.textContent = enlace.fecha;
        fecha.style.color = '#78716c';

        var borrar = document.createElement('button');
        borrar.textContent = 'Borrar';
        borrar.onclick = function () {
            borrarEnlace(posicion);
        };

        div.appendChild(fecha);
        div.appendChild(document.createElement('br'));
        div.appendChild(borrar);

        li.appendChild(a);
        li.appendChild(div);
        lista.appendChild(li);
    });
}

// borro un enlace por su posicion
function borrarEnlace(posicion) {
    var enlaces = cargarEnlaces();
    enlaces.splice(posicion, 1);
    guardarEnlaces(enlaces);
    mostrarEnlaces();
}

// al cargar la pagina muestro lo que ya tenga guardado
mostrarEnlaces();
