import React, { useState, useEffect } from 'react';
import './avance.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Avance = () => {
    const [estado, setEstado] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAcceptedDocuments = async () => {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (!storedUser || !storedUser.alumnoID) {
                return;
            }

            try {
                const response = await axios.get(`/countAcceptedDocuments/${storedUser.alumnoID}`);
                const acceptedCount = response.data.acceptedCount || 0;

                // La barra de avance tiene 3 estados
                const maxEstados = 3;

                // Calcula el estado basado en el número de documentos aceptados
                const nuevoEstado = Math.min(acceptedCount, maxEstados);

                setEstado(nuevoEstado); // Actualiza el estado de la barra de avance según el número de documentos aceptados
            } catch (error) {
                console.error('Error al contar los documentos aceptados:', error);
            }
        };

        fetchAcceptedDocuments();
    }, []);

    const estados = [
        {
            titulo: 'Inicio',
            descripcion: 'Este es el punto de partida. Aquí se proporciona una visión general del proceso.',
        },
        {
            titulo: 'Primer Documento Aceptado',
            descripcion: 'Has completado y aceptado el primer documento.',
        },
        {
            titulo: 'Segundo Documento Aceptado',
            descripcion: 'Has completado y aceptado el segundo documento.',
        },
        {
            titulo: 'Tercer Documento Aceptado',
            descripcion: 'Has completado y aceptado el tercer documento.',
        },
        {
            titulo: 'Finalización',
            descripcion: 'Felicidades, has completado todas las tareas. Este es el estado final.',
        },
    ];

    const handleContinue = () => {
        navigate('/inicioAlumno/documentos');
    };

    return (
        <div className="avance-container">
            <h2 className='h2-avance'>Barra de Avance</h2>
            <div className="progress-container-avance">
                <div className="progress-bar" style={{ width: `${(estado / estados.length) * 100}%` }}></div>
            </div>
            <div className="estado">
                <h3>{estados[estado].titulo}</h3>
                <p>{estados[estado].descripcion}</p>
            </div>
            <button onClick={handleContinue} className='button-avance'>Ir a documentos</button>
        </div>
    );
};

export default Avance;
