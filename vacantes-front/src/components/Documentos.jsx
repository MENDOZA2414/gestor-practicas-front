import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFilePdf, FaEye, FaDownload, FaPaperPlane, FaTrash, FaFolder } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './documentos.css';

const Documentos = ({ userType }) => {
    const [documents, setDocuments] = useState([]);
    const [sentDocuments, setSentDocuments] = useState([]);
    const [loadingDocuments, setLoadingDocuments] = useState(true);
    const [loadingSentDocuments, setLoadingSentDocuments] = useState(true);
    const [errorDocuments, setErrorDocuments] = useState(null);
    const [errorSentDocuments, setErrorSentDocuments] = useState(null);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [alumno, setAlumno] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [viewSentDocuments, setViewSentDocuments] = useState(false);

    const fetchDocuments = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const numControl = storedUser ? storedUser.id : null;

            if (!numControl) {
                throw new Error('No se encontró el número de control del alumno logueado');
            }

            // Fetch documentos subidos
            const response = await axios.get(`http://localhost:3001/documentoAlumnoSubidos/${numControl}`);
            const sortedDocuments = sortDocuments(response.data); // Ordenar documentos
            setDocuments(sortedDocuments);
            if (response.data.length === 0) {
                setErrorDocuments('No se encontraron documentos subidos.');
            }

            // Fetch alumno info
            const alumnoResponse = await axios.get(`http://localhost:3001/alumno/${numControl}`);
            setAlumno(alumnoResponse.data);

            // Log para verificar los datos del alumno
            console.log('Datos del alumno:', alumnoResponse.data);

        } catch (error) {
            setErrorDocuments('Error fetching documents');
        } finally {
            setLoadingDocuments(false);
        }
    };

    const fetchSentDocuments = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const numControl = storedUser ? storedUser.id : null;

            if (!numControl) {
                throw new Error('No se encontró el número de control del alumno logueado');
            }

            // Fetch documentos aprobados
            const sentResponse = await axios.get(`http://localhost:3001/documentoAlumnoAprobado/${numControl}`);
            const sortedSentDocuments = sortDocuments(sentResponse.data); // Ordenar documentos enviados
            setSentDocuments(sortedSentDocuments);
            if (sentResponse.data.length === 0) {
                setErrorSentDocuments('No se encontraron documentos aprobados.');
            }
        } catch (error) {
            setErrorSentDocuments('Error fetching sent documents');
        } finally {
            setLoadingSentDocuments(false);
        }
    };

    const sortDocuments = (documents) => {
        const statusOrder = {
            'Aceptado': 1,
            'En proceso': 2,
            'Rechazado': 3,
            'Subido': 4,
            'Eliminado': 5
        };
        return documents.sort((a, b) => statusOrder[a.estatus] - statusOrder[b.estatus]);
    };

    useEffect(() => {
        fetchDocuments();
        fetchSentDocuments();
    }, []);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const numControl = storedUser ? storedUser.id : null;

        if (file && file.type === 'application/pdf' && numControl) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('alumnoID', numControl);
            formData.append('nombreArchivo', file.name);

            try {
                const response = await axios.post('http://localhost:3001/uploadDocumentoAlumnoSubido', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                const newDocument = {
                    id: response.data.documentoID,
                    nombreArchivo: file.name,
                    estatus: 'Subido', // Estado inicial para un documento subido
                };
                const sortedDocuments = sortDocuments([...documents, newDocument]); // Ordenar documentos al añadir
                setDocuments(sortedDocuments);
                setErrorDocuments(null); // Clear error if new document is uploaded
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: response.data.message,
                    showConfirmButton: false,
                    timer: 2000
                });
            } catch (error) {
                console.error('Error uploading file:', error);
                Swal.fire({
                    position: 'top-end',
                    icon: 'error',
                    title: 'Error uploading file',
                    showConfirmButton: false,
                    timer: 2000
                });
            }
        } else {
            Swal.fire({
                position: 'top-end',
                icon: 'warning',
                title: 'Por favor, sube solo archivos PDF.',
                showConfirmButton: false,
                timer: 2000
            });
        }
    };

    const handleView = (id, table) => {
        if (id) {
            window.open(`http://localhost:3001/${table}/${id}`, '_blank');
        }
    };

    const handleDownload = (id, nombreArchivo, table) => {
        if (id) {
            axios.get(`http://localhost:3001/${table}/${id}`, {
                responseType: 'blob',
            }).then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', nombreArchivo);
                document.body.appendChild(link);
                link.click();
                link.remove();
            }).catch((error) => {
                console.error('Error downloading file:', error);
            });
        }
    };

    const handleDelete = async (id, table) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:3001/${table}/${id}`);
                if (table === 'documentoAlumnoSubido') {
                    const updatedDocuments = documents.filter(doc => doc.id !== id);
                    setDocuments(sortDocuments(updatedDocuments)); // Ordenar documentos al eliminar
                } else if (table === 'documentoAlumno') {
                    const updatedSentDocuments = sentDocuments.filter(doc => doc.id !== id);
                    setSentDocuments(sortDocuments(updatedSentDocuments)); // Ordenar documentos enviados al eliminar
                }
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Documento eliminado con éxito',
                    showConfirmButton: false,
                    timer: 2000
                });
            } catch (error) {
                console.error('Error deleting file:', error);
                Swal.fire({
                    position: 'top-end',
                    icon: 'error',
                    title: 'Error al eliminar el documento',
                    showConfirmButton: false,
                    timer: 2000
                });
            }
        }
    };

    const handleSend = (doc) => {
        setSelectedDocument(doc);
    };

    const handleCloseModal = () => {
        setSelectedDocument(null);
    };

    const handleConfirmSend = async () => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const numControl = storedUser ? storedUser.id : null;

        if (numControl && selectedDocument && userType) {
            try {
                const response = await axios.post('http://localhost:3001/enviarDocumentoAlumno', {
                    documentoID: selectedDocument.id,
                    userType: userType // Incluir el tipo de usuario en la solicitud
                });

                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: response.data.message,
                    showConfirmButton: false,
                    timer: 2000
                });

                // Actualizar la lista de documentos enviados
                await fetchSentDocuments();

                // Actualizar el estado del documento en la lista de documentos subidos
                const updatedDocuments = documents.map(doc =>
                    doc.id === selectedDocument.id ? { ...doc, estatus: 'En proceso' } : doc
                );
                setDocuments(sortDocuments(updatedDocuments)); // Ordenar documentos al actualizar estado

                setSelectedDocument(null); // Cerrar el modal
            } catch (error) {
                console.error('Error al enviar el documento:', error);
                console.log("documentoID", selectedDocument.id)
                Swal.fire({
                    position: 'top-end',
                    icon: 'error',
                    title: 'Error al enviar el documento',
                    showConfirmButton: false,
                    timer: 2000
                });
            }
        }
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'En proceso':
                return 'orange';
            case 'Aceptado':
                return 'green';
            case 'Rechazado':
                return 'red';
            case 'Eliminado':
                return 'black';
            case 'Subido':
                return 'grey'; // Color gris para el estatus "Subido"
            default:
                return 'grey';
        }
    };

    const getStatusColorAlwaysGreen = () => {
        return 'green';
    };

    const filteredDocuments = viewSentDocuments ? sentDocuments.filter((doc) =>
        doc.nombreArchivo.toLowerCase().includes(searchTerm.toLowerCase())
    ) : documents.filter((doc) =>
        doc.nombreArchivo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleView = () => {
        setViewSentDocuments(!viewSentDocuments);
        setErrorDocuments(null); // Reset error when toggling view
        setErrorSentDocuments(null);
    };

    return (
        <div className="documentos-container">
            <div className="alumno-card">
                <img
                    src={`data:image/jpeg;base64,${alumno.fotoPerfil}`}
                    alt="Foto del alumno"
                    className="alumno-foto"
                    onError={(e) => e.target.src = 'default-image-url.jpg'} // Reemplaza la imagen en caso de error
                />
                <div className="alumno-info">
                    <h4>{alumno.nombre}</h4>
                    <div className="alumno-details">
                        <p>Carrera: {alumno.carrera}</p>
                        <p>Turno: {alumno.turno}</p>
                    </div>
                </div>
                <div className="alumno-folder-icon" onClick={toggleView}>
                    <div className="folder-circle">
                        <FaFolder />
                    </div>
                </div>
            </div>
            <div className="card">
                <div className="card-header">
                    <div className="header-content">
                        <h3>{viewSentDocuments ? 'Documentos Registrados' : 'Documentos Subidos'}</h3>
                    </div>
                    <div className="search-bar2">
                        <input
                            type="text"
                            placeholder="Buscar PDF..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                </div>
                <div className="card-body">
                    <div className="documents-list">
                        {loadingDocuments && !viewSentDocuments ? (
                            <p>Cargando documentos subidos...</p>
                        ) : errorDocuments && !viewSentDocuments ? (
                            <p>{errorDocuments}</p>
                        ) : loadingSentDocuments && viewSentDocuments ? (
                            <p>Cargando documentos enviados...</p>
                        ) : errorSentDocuments && viewSentDocuments ? (
                            <p>{errorSentDocuments}</p>
                        ) : (
                            <ul>
                                {filteredDocuments.map((doc) => (
                                    <li key={doc.id}>
                                        <div className="document-name">
                                            <div
                                                className="status-circle"
                                                style={{
                                                    backgroundColor: viewSentDocuments ? getStatusColorAlwaysGreen() : getStatusColor(doc.estatus)
                                                }}
                                            />
                                            {doc.nombreArchivo}
                                        </div>
                                        <div className="document-actions">
                                            <FaEye className="action-icon" title="Ver" onClick={() => handleView(doc.id, viewSentDocuments ? 'documentoAlumno' : 'documentoAlumnoSubido')} />
                                            <FaDownload className="action-icon" title="Descargar" onClick={() => handleDownload(doc.id, doc.nombreArchivo, viewSentDocuments ? 'documentoAlumno' : 'documentoAlumnoSubido')} />
                                            {!viewSentDocuments && (
                                                <>
                                                    <FaPaperPlane 
                                                        className={`action-icon ${doc.estatus === 'Aceptado' ? 'disabled-icon' : ''}`} 
                                                        title="Enviar" 
                                                        onClick={() => doc.estatus !== 'Aceptado' && handleSend(doc)} 
                                                    />
                                                    <h5 className='barrita'>|</h5>
                                                    <FaTrash className="action-icon trash-icon" title="Eliminar" onClick={() => handleDelete(doc.id, 'documentoAlumnoSubido')} />
                                                </>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    {!viewSentDocuments && (
                        <div className="upload-button">
                            <input
                                type="file"
                                accept="application/pdf"
                                id="file-upload"
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                            />
                            <label htmlFor="file-upload" className="upload-label">
                                <FaFilePdf className="upload-icon" />
                                <span>Subir Documento PDF</span>
                            </label>
                        </div>
                    )}
                </div>
                {selectedDocument && (
                    <div className="modal">
                        <div className="modal-content">
                            <span className="close-button" onClick={handleCloseModal}>&times;</span>
                            <div className="modal-body">
                                <FaFilePdf className="modal-icon" />
                                <p>¿Deseas enviar este PDF para continuar con tu práctica profesional?</p>
                                <p>{selectedDocument.nombreArchivo}</p>
                                <button className="confirm-button" onClick={handleConfirmSend}>Enviar a asesor interno</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Documentos;
