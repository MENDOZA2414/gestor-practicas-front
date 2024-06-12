import React, { useState } from 'react';
import './avance.css';
import { useNavigate } from 'react-router-dom';

const Avance = () => {
    const [estado, setEstado] = useState(0);
    const [mostrarModal, setMostrarModal] = useState(false);
    const navigate = useNavigate();

    const estados = [
        {
            titulo: 'Inicio',
            descripcion: 'Este es el punto de partida. Aquí se proporciona una visión general del proceso.',
        },
        {
            titulo: 'Primera Tarea',
            descripcion: 'En este estado, deberás completar la primera tarea asignada.',
        },
        {
            titulo: 'Segunda Tarea',
            descripcion: 'Aquí trabajas en la segunda tarea. Sigue las instrucciones proporcionadas.',
        },
        {
            titulo: 'Revisión',
            descripcion: 'En este estado, se revisan las tareas completadas antes de continuar.',
        },
        {
            titulo: 'Finalización',
            descripcion: 'Felicidades, has completado todas las tareas. Este es el estado final.',
        },
    ];

    const avanzarEstado = () => {
        if (estado < estados.length - 1) {
            setEstado(estado + 1);
            setMostrarModal(true);
        }
    };

    const handleCloseModal = () => {
        setMostrarModal(false);
    };

    const handleContinue = () => {
        setMostrarModal(false);
        navigate('/inicioAlumno/documentos');
    };

    return (
        <div className="avance-container">
            <h2 className='h2-avance'>Barra de Avance</h2>
            <div className="progress-container-avance">
                <div className="progress-bar" style={{ width: `${(estado + 1) * 20}%` }}></div>
            </div>
            <div className="estado">
                <h3>{estados[estado].titulo}</h3>
                <p>{estados[estado].descripcion}</p>
            </div>
            <button onClick={avanzarEstado} disabled={estado >= estados.length - 1} className='button-avance'>Ir al siguiente paso</button>

            {mostrarModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <span className="close-button" onClick={handleCloseModal}>&times;</span>
                        <h2>Pasos a seguir</h2>
                        <p>A continuación, se te redirigirá a la página de documentos. Por favor, asegúrate de haber completado todas las tareas requeridas antes de continuar.</p>
                        <div className="modal-buttons">
                            <button className="modal-button-continue" onClick={handleContinue}>Continuar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Avance;
