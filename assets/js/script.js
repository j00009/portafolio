const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente cargado y parseado');

    try {
        const form = document.getElementById('contact-form');
        if (!form) {
            throw new Error('Formulario no encontrado. Asegúrate de que el ID "contact-form" exista.');
        }
        console.log('Formulario encontrado:', form);

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Evento submit detectado.');

            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                message: document.getElementById('message').value,
            };
            console.log('Datos del formulario:', formData);

            try {
                const response = await fetch('/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                console.log('Respuesta del servidor recibida:', response);

                const result = await response.json();
                console.log('Resultado del servidor:', result);

                const responseMessage = document.getElementById('response-message');
                if (result.success) {
                    responseMessage.innerHTML = '<div class="alert alert-success">¡Correo enviado exitosamente!</div>';
                } else {
                    responseMessage.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
                }

                // Eliminar el mensaje después de 3 segundos
                setTimeout(() => {
                    responseMessage.innerHTML = '';  // Elimina el mensaje del alert
                }, 3000); 
                limpiarFormulario(form);
            } catch (error) {
                const responseMessage = document.getElementById('response-message');
                responseMessage.innerHTML = '<div class="alert alert-danger">Hubo un error al enviar el correo.</div>';

                // Eliminar el mensaje después de 3 segundos
                setTimeout(() => {
                    responseMessage.innerHTML = '';  // Elimina el mensaje del alert
                }, 3000);  

                console.error('Error al enviar los datos:', error);

            }
        });
        function limpiarFormulario(form) {
            form.reset();
        }
    } catch (error) {
        console.error('Ocurrió un error al configurar el envío del formulario:', error.message);
    }
    const formModal = document.getElementById('contact-form-modal');
    if (formModal) {
        formModal.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Formulario modal enviado.');

            const formData = {
                name: document.getElementById('name-modal').value,
                email: document.getElementById('email-modal').value,
                message: document.getElementById('message-modal').value,
            };
            console.log('Datos del formulario modal:', formData);

            try {
                const response = await fetch('/send-email-modal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });

                const result = await response.json();
                console.log('Resultado del servidor:', result);
                const responseMessage = document.getElementById('response-message-modal');
                if (result.success) {
                    responseMessage.innerHTML = '<div class="alert alert-success">¡Correo enviado exitosamente!</div>';
                } else {
                    responseMessage.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
                }



                setTimeout(() => {
                    responseMessage.innerHTML = '';
                }, 3000);
                limpiarFormulario(formModal)
            } catch (error) {
                const responseMessage = document.getElementById('response-message-modal');
                responseMessage.innerHTML = '<div class="alert alert-danger">Hubo un error al enviar el correo.</div>';


                setTimeout(() => {
                    responseMessage.innerHTML = '';
                }, 3000);

                console.error('Error al enviar los datos:', error);
            }
            function limpiarFormulario(form) {
                form.reset();
            }

        });
    }
    document.getElementById('openModalBtn').addEventListener('click', () => {

        if (window.innerWidth <= 768) {
            const modalMobile = new bootstrap.Modal(document.getElementById('modalMobile'));
            modalMobile.show();
        } else {
            const modalPC = new bootstrap.Modal(document.getElementById('modalPC'));
            modalPC.show();
        }
    });

    const initTypeWriteEffectForModal = (
        modalId,
        container1Id,
        message1,
        container2Id = null,
        message2 = null,
        container3Id = null,
        message3 = null,
        delayBetweenMessages = 1000
    ) => {
        const speed = 50;
        let timeouts = [];

        const typeWrite = (text, containerId, callback = null) => {
            let index = 0;
            const element = document.getElementById(containerId);
            element.innerHTML = "";
            const write = () => {
                if (index < text.length) {
                    element.innerHTML += text.charAt(index);
                    index++;
                    timeouts.push(setTimeout(write, speed));
                } else if (callback) {
                    callback();
                }
            };

            write();
        };

        const clearAllTimeouts = () => {
            timeouts.forEach(timeout => clearTimeout(timeout));
            timeouts = [];
        };

        const modal = document.getElementById(modalId);

        modal.addEventListener("shown.bs.modal", () => {
            clearAllTimeouts();

            const container1 = document.getElementById(container1Id);
            const container2 = container2Id ? document.getElementById(container2Id) : null;
            const container3 = container3Id ? document.getElementById(container3Id) : null;

            container1.innerHTML = "";
            if (container2) container2.innerHTML = "";
            if (container3) container3.innerHTML = "";


            typeWrite(message1, container1Id, () => {
                if (message2 && container2) {
                    timeouts.push(
                        setTimeout(() => {
                            typeWrite(message2, container2Id, () => {
                                if (message3 && container3) {
                                    timeouts.push(
                                        setTimeout(() => {
                                            typeWrite(message3, container3Id);
                                        }, delayBetweenMessages)
                                    );
                                }
                            });
                        }, delayBetweenMessages)
                    );
                }
            });
        });

        modal.addEventListener("hidden.bs.modal", () => {
            clearAllTimeouts();
        });
    };


    initTypeWriteEffectForModal(
        "modalPC",
        "container1",
        "¿Buscas un programador comprometido, analítico y capaz?",
        "container2",
        "¡Contactame sin dudar!!!",
        "container3",
        "Joeltroncoso2002@gmail.com",
        100
    );

    initTypeWriteEffectForModal(
        "modalMobile",
        "typetextMobile1",
        "Si buscas un programador analítico, capaz y comprometido, ya lo has conseguido, ¡no dudes en contáctarme!",
        "typetextMobile2",
        "Joeltroncoso2002@gmail.com",
        500

    );

    
    const copy = (idElemento, texto) => {
        const elemento = document.getElementById(idElemento);
        if (elemento) {
            elemento.addEventListener("click", async () => {
                try {
                    await navigator.clipboard.writeText(texto);
                    alert("Correo copiado");
                } catch (error) {
                    console.error("Error al copiar el texto:", error);
                }
            });
        } else {
            console.error(`Elemento con ID '${idElemento}' no encontrado.`);
        }
    };


    

    // Llamadas a la función para diferentes elementos
    copy("container3", "joeltroncoso2002@gmail.com");
    copy("typetextMobile2", "joeltroncoso2002@gmail.com");



    const fetchPreview = async (url, imgElements) => {
        try {
            // Mostrar la imagen de carga primero para cada imagen
            imgElements.forEach(img => img.src = 'cargando.gif');

            // Hacer la solicitud al servidor para generar la captura
            const response = await fetch(`/preview?url=${encodeURIComponent(url)}`);
            if (response.ok) {
                const data = await response.json(); // Obtener la URL de la imagen generada
                // Actualizar la imagen con la URL generada para cada imagen en el DOM
                imgElements.forEach(img => img.src = data.imageUrl);
            } else {
                console.error('Error al obtener la captura de pantalla');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Usar la función para cargar la previsualización
    const urlp_1 = 'https://skatepark.logicaldevjt.cl/';
    const imgElementsp_1 = document.querySelectorAll('.preview-imagep1');
    fetchPreview(urlp_1, imgElementsp_1);

    const urlp_2 = 'https://bancosolar.logicaldevjt.cl/';
    const imgElementsp_2 = document.querySelectorAll('.preview-imagep2');
    fetchPreview(urlp_2, imgElementsp_2);

    const urlp_3 = 'https://superheroapi.logicaldevjt.cl/';
    const imgElementsp_3 = document.querySelectorAll('.preview-imagep3');
    fetchPreview(urlp_3, imgElementsp_3);

    const urlp_4 = 'https://likeme.logicaldevjt.cl/';
    const imgElementsp_4 = document.querySelectorAll('.preview-imagep4');
    fetchPreview(urlp_4, imgElementsp_4);

    const urlp_5 = 'https://viajeschile.logicaldevjt.cl/';
    const imgElementsp_5 = document.querySelectorAll('.preview-imagep5');
    fetchPreview(urlp_5, imgElementsp_5);

    const urlp_6 = 'https://fbisys.logicaldevjt.cl/';
    const imgElementsp_6 = document.querySelectorAll('.preview-imagep6');
    fetchPreview(urlp_6, imgElementsp_6);

    const urlp_7 = 'https://clubdeportivo.logicaldevjt.cl/';
    const imgElementsp_7 = document.querySelectorAll('.preview-imagep7');
    fetchPreview(urlp_7, imgElementsp_7);

    const urlp_8 = 'https://blackandwhite.logicaldevjt.cl/';
    const imgElementsp_8 = document.querySelectorAll('.preview-imagep8');
    fetchPreview(urlp_8, imgElementsp_8);


    const el = document.getElementById("enlacewtsp");

    // Inicializa tooltip
    const tooltip = new bootstrap.Tooltip(el, {
        placement: 'bottom',
        fallbackPlacements: [],
    });
    // Crea observer
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                tooltip.show();
                setTimeout(() => tooltip.hide(), 5000);
            }
        });
    }, { threshold: 1.0 });

    observer.observe(el);

});
