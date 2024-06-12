import React from 'react';
import Titulo from './common/Titulo';
import { FaFacebook, FaInstagram } from 'react-icons/fa'; // Importamos los iconos de React Icons
import './principal.css'; // Importamos el archivo CSS

const Principal = () => {
    return (
        <>
            <div className="mt-5">
                <Titulo titulo={
                    <>
                        La <span className="highlight">gestión de prácticas</span> del DASC bajo control
                    </>
                } />
            </div>
            <p className="description">
                Simplificamos y unificamos los procesos de prácticas profesionales de nuestro departamento para que ganes tiempo, seguridad y tranquilidad.
            </p>

            <div className="card-container">
                <div className="card-wrapper">
                    <div className="custom-card">
                        <div className="card-body">
                            <h5 className="card-title-principal">¿Qué son las prácticas profesionales?</h5>
                            <p className="card-text">
                                Las Prácticas Profesionales son actividades curriculares que el alumnado del DASC realiza en alguna organización pública, privada o social, con el propósito de consolidar y complementar el desarrollo de sus competencias y conocimientos adquiridos en su formación académica.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="card-wrapper">
                    <div className="custom-card">
                        <div className="card-body">
                            <h5 className="card-title-principal">Su objetivo</h5>
                            <p className="card-text">
                                Las prácticas Profesionales tienen como objetivo general que los alumnos pongan en práctica los conocimientos adquiridos en el transcurso de su formación profesional.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="highlight-section">
                <div className="highlight-content">
                    <h1>Una plataforma moderna y actualizada para los alumnos</h1>
                    <p>Creada por y para alumnos, esta herramienta cumple un rol importante en el proceso académico de cada alumno del departamento.</p>
                    <p>
                        <a href="#" className="button">Continua leyendo</a>
                    </p>
                </div>
            </div>

            <footer className="footer">
                <p>2024 © Universidad Autónoma de Baja California Sur</p>
                <div className="social-icons">
                    <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                        <FaFacebook />
                    </a>
                    <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                        <FaInstagram />
                    </a>
                </div>
            </footer>
        </>
    );
}

export default Principal;
