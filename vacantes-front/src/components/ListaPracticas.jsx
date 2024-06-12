import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { FaEnvelope } from 'react-icons/fa';
import './listaPracticas.css';

const ListaPracticas = ({ entidadID }) => {
    const [practicas, setPracticas] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPracticas = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/practicas/${entidadID}`);
                setPracticas(response.data);
            } catch (error) {
                setError('Error fetching practicas: ' + error.message);
            }
        };
        if (entidadID) {
            fetchPracticas();
        }
    }, [entidadID]);

    const handleEmailClick = (correoAlumno) => {
        const emailProvider = correoAlumno.includes('gmail.com') ? 'gmail' : 'outlook';
        const mailtoLink = emailProvider === 'gmail'
            ? `https://mail.google.com/mail/?view=cm&fs=1&to=${correoAlumno}`
            : `https://outlook.live.com/owa/?path=/mail/action/compose&to=${correoAlumno}`;
        window.open(mailtoLink, '_blank');
    };

    if (error) {
        return <p>{error}</p>;
    }

    if (!practicas.length) {
        return <p>No hay prácticas profesionales disponibles.</p>;
    }

    return (
        <div className="pract-enti-card">
            <h2>Prácticas Profesionales</h2>
            <div className="pract-enti-table-wrapper">
                <table className="pract-enti-table">
                    <thead>
                        <tr>
                            <th>No. de Práctica</th>
                            <th>Título de la Vacante</th>
                            <th>Nombre Alumno</th>
                            <th>Contacto Alumno</th>
                            <th>Nombre Asesor</th>
                            <th>Fecha de Inicio</th>
                            <th>Fecha de Fin</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {practicas.map((practica, index) => (
                            <tr key={practica.practicaID}>
                                <td data-title="No. de Práctica">{index + 1}</td>
                                <td data-title="Título de la Vacante">{practica.tituloVacante}</td>
                                <td data-title="Nombre Alumno">{`${practica.nombreAlumno} ${practica.apellidoAlumno}`}</td>
                                <td data-title="Contacto Alumno">
                                    <FaEnvelope 
                                        className="email-icon"
                                        onClick={() => handleEmailClick(practica.correoAlumno)}
                                    />
                                </td>
                                <td data-title="Nombre Asesor">{`${practica.nombreAsesorExterno} ${practica.apellidoAsesorExterno}`}</td>
                                <td data-title="Fecha de Inicio">{new Date(practica.fechaInicio).toLocaleDateString()}</td>
                                <td data-title="Fecha de Fin">{new Date(practica.fechaFin).toLocaleDateString()}</td>
                                <td data-title="Estado">{practica.estado}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

ListaPracticas.propTypes = {
    entidadID: PropTypes.number.isRequired,
};

export default ListaPracticas;
