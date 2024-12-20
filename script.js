const url = 'https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero';

let personasEnMemoria = []

class Persona {
    constructor(id, nombre, apellido, fechaNacimiento) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.fechaNacimiento = fechaNacimiento;
    }

    toString(){
        return `ID: ${this.id}.
        Nombre: ${this.nombre}.
        Apellido: ${this.apellido}.
        Fecha de nacimiento: ${this.fechaNacimiento}.`;
    }
}

class Ciudadano extends Persona {
    constructor(id, nombre, apellido, fechaNacimiento, dni) {
        super(id, nombre, apellido, fechaNacimiento);
        this.dni = dni;
    }

    toString(){
        return `${super.toString()} 
        DNI: ${this.dni}.`;
    }
}

class Extranjero extends Persona {
    constructor(id, nombre, apellido, fechaNacimiento, dni, paisOrigen) {
        super(id, nombre, apellido, fechaNacimiento, dni);
        this.paisOrigen = paisOrigen;
    }

    toString(){
        return `${super.toString()} 
        País de origen: ${this.paisOrigen}.`
    }
}

function cargarPersonas() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', `${url}`, true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            personasEnMemoria = JSON.parse(xhr.responseText);
            mostrarPersonas(personasEnMemoria);
        } else {
            alert("Error al cargar personas.");
        }
    };
    xhr.send();
}

function obtenerPersonaPorId(id) {
    return personasEnMemoria.find(persona => persona.id === parseInt(id)) || null;
}

function parseDateFromInt(fechaInt) {
    let numeroStr = fechaInt.toString();

    let año = numeroStr.slice(0, 4);
    let mes = numeroStr.slice(4, 6);
    let dia = numeroStr.slice(6, 8);

    let fecha = `${año}/${mes}/${dia}`;

    return fecha;
}

function parseDateFromIso(iso) {
    const [año, mes, dia] = iso.split('-');

    return `${año}/${mes}/${dia}`;
}

function mostrarPersonas(personas) {
    const tabla = document.getElementById('tabla-personas');
    tabla.innerHTML = '';

    personas.forEach(v => {
        if (v && v.id !== undefined) {
            const fila = `<tr>
                <td>${v.id}</td>
                <td>${v.nombre}</td>
                <td>${v.apellido}</td>
                <td>${parseDateFromInt(v.fechaNacimiento)}</td>
                <td>${v.dni || 'N/A'}</td>
                <td>${v.paisOrigen || 'N/A'}</td>
                <td>
                    <button onclick="modificarPersona(${v.id})">Modificar</button>
                    <button onclick="eliminarPersona(${v.id})">Eliminar</button>
                </td>
            </tr>`;
            tabla.innerHTML += fila;
        }
    });
}

function modificarPersona(id) {
    const persona = obtenerPersonaPorId(id);
    if (!persona) return alert("Persona no encontrada.");
    mostrarFormularioABM('modificación', persona);

}

function eliminarPersona(id) {
    const persona = obtenerPersonaPorId(id);
    if (!persona) return alert("Persona no encontrada.");
    mostrarFormularioABM('baja', persona);

    /*
    if (!confirm("¿Está seguro de que desea eliminar esta persona?")) return;

    personasEnMemoria = personasEnMemoria.filter(v => v.id !== parseInt(id));
    */
}

function mostrarFormularioABM(accion, persona = null) {
    const titulo = document.getElementById('titulo-abm');
    titulo.textContent = `${accion.charAt(0).toUpperCase() + accion.slice(1)}.`;

    document.getElementById('form-abm').reset();

    document.getElementById('personaId').value = persona ? persona.id : '';

    const camposCiudadano = document.getElementById('atributos-ciudadanos');
    const camposExtranjero = document.getElementById('atributos-extranjeros');

    if (camposCiudadano && camposExtranjero) {
        camposCiudadano.classList.add('oculto');
        camposExtranjero.classList.add('oculto');
    }

    let tipoPersonaSelect = document.getElementById('tipoPersona');

    if (persona) {
        document.getElementById('nombre').value = persona.nombre;
        document.getElementById('apellido').value = persona.apellido;
        document.getElementById('fechaNacimiento').value = persona.fechaNacimiento;

        if (persona.hasOwnProperty('dni')) {
            tipoPersonaSelect.value = 'Ciudadano';
            document.getElementById('dni').value = persona.dni;
            camposCiudadano.classList.remove('oculto');
        } else if (persona.hasOwnProperty('paisOrigen')) {
            tipoPersonaSelect.value = 'Extranjero';
            document.getElementById('paisOrigen').value = persona.paisOrigen;
            camposExtranjero.classList.remove('oculto');
        }

        tipoPersonaSelect.disabled = true;
    } else {
        tipoPersonaSelect.disabled = false;
    }

    document.getElementById('aceptar-abm').addEventListener('click', function () {
        if (accion === 'alta') {
            agregarPersona();
        } else if (accion === 'modificación') {
            modificarApi(persona);
        } else if (accion === 'baja') {
            bajaApi(persona);
        }
    });

    document.getElementById('formulario-abm').classList.remove('oculto');
    document.getElementById('formulario-lista').classList.add('oculto');
}

function ajustarCamposPorTipo() {
    const tipo = document.getElementById('tipoPersona').value;
    document.getElementById('atributos-ciudadanos').classList.add('oculto');
    document.getElementById('atributos-extranjeros').classList.add('oculto');

    if (tipo === 'Ciudadano') {
        document.getElementById('atributos-ciudadanos').classList.remove('oculto');
    } else if (tipo === 'Extranjero') {
        document.getElementById('atributos-extranjeros').classList.remove('oculto');
    }
}

function agregarPersona() {
    console.log("agregarPersona");
    const id = document.getElementById('personaId').value;
    const tipo = document.getElementById('tipoPersona').value;
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const fechaNacimiento = parseInt((document.getElementById('fechaNacimiento').value).replace(/-/g, ''), 10);

    let persona = null;

    if (tipo === 'Ciudadano') {
        const dni = document.getElementById('dni').value;
        persona = new Ciudadano(id ? parseInt(id) : null, nombre, apellido, fechaNacimiento, dni);
    } else if (tipo === 'Extranjero') {
        const paisOrigen = document.getElementById('paisOrigen').value;
        persona = new Extranjero(id ? parseInt(id) : null, nombre, apellido, fechaNacimiento, paisOrigen);
    } else {
        alert("Por favor, selecciona un tipo de persona válido.");
        return;
    }
    
    agregarApi(persona);

    async function agregarApi(persona)
    {
        try
        {
            switchSpinner(true);
            delete persona.id;

            const respuesta = await fetch(url, {
                method: "POST",
                headers:{
                    "Content-Type": "Application/json"
                },
                body: JSON.stringify(persona)
                })

            let json = await respuesta.json();

            if (respuesta.status === 200)
            {
                console.log("Request POST realizado con éxito");
                return;
            }
        }
        catch(error)
        {
            window.alert("Error Del servidor - Status: " + respuesta.status + "Error: " + error);
        }
        finally
        {
            switchSpinner(false)
        }
    }

    persona.id = personasEnMemoria.length > 0 
        ? Math.max(...personasEnMemoria.map(v => parseInt(v.id))) + 1 
        : 1;
    personasEnMemoria.push(persona);

    mostrarPersonas(personasEnMemoria);
    cancelarABM();
}

function modificarApi(persona) {

    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const fechaNacimiento = parseInt((document.getElementById('fechaNacimiento').value).replace(/-/g, ''), 10);

    if (!nombre || !apellido || !fechaNacimiento) {
        return alert("Por favor, completa todos los campos requeridos.");
    }

    persona.nombre = nombre;
    persona.apellido = apellido;
    persona.fechaNacimiento = fechaNacimiento;

    if (persona instanceof Ciudadano) {
        persona.dni = document.getElementById('dni').value;
    } else if (persona instanceof Extranjero) {
        persona.paisOrigen = document.getElementById('paisOrigen').value;
    }

    switchSpinner(true);

    fetch(url, {
        method: "PUT",
        headers:{
            "Content-Type": "Application/json"
        },
        body: JSON.stringify(persona)
    })
    .then((respuesta) => 
        {
            return new Promise ((e, f) =>
            {
                if (respuesta.status == 200)
                {
                    e(respuesta.status);
                }
                else
                {
                    f(respuesta.status);
                }
            })
        })
    .then(status => {
        {
            console.log("modificarApi");
            personasEnMemoria = personasEnMemoria.filter(persona => persona.id !== persona.id)
            personasEnMemoria.push(persona);
        }
    })
    .catch((error) => {window.alert("Error Del servidor - Status: " + error)})
    .then(() => switchSpinner(false));

    mostrarPersonas(personasEnMemoria);
    cancelarABM();
}

function bajaApi(persona) {
    console.log("bajaApi");
    console.log(persona);

    switchSpinner(true);

    fetch(url,{
        method: "DELETE",
        headers: {
            "Content-Type": "Application/json"
        },
        body: JSON.stringify(persona)
    })
    .then((respuesta) => {
        return new Promise ((e, f) =>{
            if (respuesta.status == 200)
            {
                e(respuesta);
            }
            else
                f(respuesta);
        });
    })
    .then( (respuesta) => {
        console.log(respuesta);
        const index = personasEnMemoria.findIndex(p => p.id === persona.id);
            if (index !== -1) {
                personasEnMemoria.splice(index, 1);
            }
    })
    .catch((respuesta) => {window.alert("Error Del servidor - Status: " + respuesta.status)})
    .then(() => switchSpinner(false));

    mostrarPersonas(personasEnMemoria);
    cancelarABM();
}

function cancelarABM() {
    document.getElementById('formulario-abm').classList.add('oculto');
    document.getElementById('formulario-lista').classList.remove('oculto');
}

function switchSpinner(bandera)
{
    let spinner = document.querySelector('.spinner-container');
    if (bandera)
        spinner.style.display = "flex";
    else
        spinner.style.display = "none";
}

document.addEventListener('DOMContentLoaded', cargarPersonas);