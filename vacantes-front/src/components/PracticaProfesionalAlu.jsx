import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { FaEnvelope } from 'react-icons/fa';
import Avance from './Avance';
import './practicaProfesional.css';

const PracticaProfesionalAlu = ({ alumnoID }) => {
    const [practica, setPractica] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPractica = async () => {
            try {
                const response = await axios.get(`https://gestor-practicas-back-production.up.railway.app/practica/alumno/${alumnoID}`);
                setPractica(response.data);
            } catch (error) {
                setError('Error fetching practica profesional: ' + error.message);
            }
        };
        if (alumnoID) {
            fetchPractica();
        }
    }, [alumnoID]);

    const handleEmailClick = (correoAsesor) => {
        const emailProvider = correoAsesor.includes('gmail.com') ? 'gmail' : 'outlook';
        const mailtoLink = emailProvider === 'gmail'
            ? `https://mail.google.com/mail/?view=cm&fs=1&to=${correoAsesor}`
            : `https://outlook.live.com/owa/?path=/mail/action/compose&to=${correoAsesor}`;
        window.open(mailtoLink, '_blank');
    };

    if (error) {
        return <p>{error}</p>;
    }

    if (!practica) {
        return <p>No hay práctica profesional disponible.</p>;
    }

    return (
        <div className="pract-prof-alu-card">
            <h2>Práctica Profesional</h2>
            <div className="pract-prof-alu-table-wrapper">
                <table className="pract-prof-alu-table">
                    <thead>
                        <tr>
                            <th>Num. Control</th>
                            <th>Alumno</th>
                            <th>Asesor Externo</th>
                            <th>Correo Asesor E</th>
                            <th>Título de la Vacante</th>
                            <th>Fecha de Inicio</th>
                            <th>Fecha de Fin</th>
                            <th>Estado</th>
                            <th>Contacto Entidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td data-label="Num. Control">{practica.numControl}</td>
                            <td data-label="Alumno">{`${practica.nombreAlumno} ${practica.apellidoAlumno} ${practica.apellidoMaternoAlumno}`}</td>
                            <td data-label="Asesor Externo">{`${practica.nombreAsesorExterno} ${practica.apellidoPaternoAsesorExterno} ${practica.apellidoMaternoAsesorExterno}`}</td>
                            <td data-label="Correo Asesor E">
                                <FaEnvelope
                                    className="email-icon"
                                    onClick={() => handleEmailClick(practica.correoAsesorExterno)}
                                />
                            </td>
                            <td data-label="Título de la Vacante">{practica.tituloVacante}</td>
                            <td data-label="Fecha de Inicio">{new Date(practica.fechaInicio).toLocaleDateString()}</td>
                            <td data-label="Fecha de Fin">{new Date(practica.fechaFin).toLocaleDateString()}</td>
                            <td data-label="Estado">{practica.estado}</td>
                            <td data-label="Contacto Entidad">{practica.numCelularEntidad}</td>
                        </tr>
                    </tbody>

                </table>
            </div>
            <Avance />
        </div>
    );
};

PracticaProfesionalAlu.propTypes = {
    alumnoID: PropTypes.number.isRequired,
};

export default PracticaProfesionalAlu;
