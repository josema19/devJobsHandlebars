// Importar librerías
import axios from 'axios';
import Swal from 'sweetalert2';

// Ejecutar código para el documento
document.addEventListener('DOMContentLoaded', () => {
    // Manejo de Skills
    const skills = document.querySelector('.lista-conocimientos');
    if (skills) {
        skills.addEventListener('click', agregarSkills);
        skillsSeleccionados();
    };

    // Limpiar Alertas
    let alertas = document.querySelector('.alertas');
    if (alertas) {
        limpiarAlertas(alertas);
    };

    // Eliminar vacante
    const vacantesListado = document.querySelector('.panel-administracion');
    if (vacantesListado) {
        vacantesListado.addEventListener('click', accionesListado);
    };
});

const skills = new Set();

const agregarSkills = e => {
    // Activar o desactivas habiliades según sea el caso
    if (e.target.tagName === 'LI') {
        if (e.target.classList.contains('activo')) {
            skills.delete(e.target.textContent);
            e.target.classList.remove('activo');
        } else {
            skills.add(e.target.textContent);
            e.target.classList.add('activo');
        };
    };
    // Convertir a Arreglo
    const skillArray = [...skills];
    document.querySelector('#skills').value = skillArray;
};

const skillsSeleccionados = () => {
    // Obtener habilidades seleccionas a convertirlas en un arreglo
    const seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientos .activo'));

    // Agregar información de las habiliades seleccionadas al conjutno skills
    seleccionadas.forEach(seleccionada => {
        skills.add(seleccionada.textContent);
    });

    // Insertar en el Hiden
    const skillArray = [...skills];
    document.querySelector('#skills').value = skillArray;
};

const limpiarAlertas = (alertas) => {
    const interval = setInterval(() => {
        if (alertas.children.length > 0) {
            alertas.removeChild(alertas.children[0]);
        } else {
            alertas.parentElement.removeChild(alertas);
            clearInterval(interval);
        };
    }, 2000);
}

const accionesListado = e => {
    if (e.target.dataset.eliminar) {
        e.preventDefault();
        Swal.fire({
            title: 'Seguro que desea eliminar esta vacante?',
            text: "Una vacante eliminada no se puede recuperar",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, eliminar!',
            cancelButtonText: 'No, Cancelar'
        }).then((result) => {
            // Enviar petición axios
            const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;

            axios.delete(url, { params: { url } }).then(res => {
                if (res.status === 200) {
                    Swal.fire(
                        'Eliminado!',
                        res.data,
                        'success'
                    );
                    e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement);
                };
            }).catch(error => {
                console.log(error);
                Swal.fire(
                    'Mal!',
                    'No se pudo eliminar',
                    'error'
                );
            });
        });
    } else if (e.target.name === 'A') {
        window.location.href = e.target.href;
    };
};