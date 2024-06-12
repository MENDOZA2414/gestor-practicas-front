import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye, FaDownload } from 'react-icons/fa';
import './formatos.css';

const Formatos = () => {
    const [formatos, setFormatos] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFormatos = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/formatos');
                setFormatos(response.data);
            } catch (err) {
                setError('Error fetching formatos');
                console.error(err);
            }
        };

        fetchFormatos();
    }, []);

    const handleView = async (nombreArchivo, base64) => {
        const fileURL = `data:application/pdf;base64,${base64}`;
        const newWindow = window.open("", nombreArchivo);
        if (newWindow) {
            newWindow.document.write(`
                <html>
                    <head>
                        <title>${nombreArchivo}</title>
                        <style>
                            body, html {
                                margin: 0;
                                padding: 0;
                                height: 100%;
                                overflow: hidden;
                            }
                            iframe {
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                border: none;
                            }
                        </style>
                    </head>
                    <body>
                        <iframe src="${fileURL}" title="${nombreArchivo}"></iframe>
                    </body>
                </html>
            `);
            newWindow.document.close();
        }
    };

    const handleDownload = (nombreArchivo, base64) => {
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${base64}`;
        link.download = nombreArchivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="main-container">
            <div className="formatos-card">
                <h3>Formatos</h3>
                {error ? (
                    <p>{error}</p>
                ) : (
                    <ul>
                        {formatos.map((formato) => (
                            <li key={formato.documentoID}>
                                <span className="formato-name">{formato.nombreArchivo}</span>
                                <div className="formato-actions">
                                    <FaEye className="action-icon" title="Ver" onClick={() => handleView(formato.nombreArchivo, formato.archivo)} />
                                    <FaDownload className="action-icon" title="Descargar" onClick={() => handleDownload(formato.nombreArchivo, formato.archivo)} />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Formatos;
