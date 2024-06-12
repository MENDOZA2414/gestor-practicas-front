import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFilePdf } from 'react-icons/fa';
import Swal from 'sweetalert2';
import moment from 'moment';
import './vacantes.css';

const Vacantes = () => {
  const [vacantes, setVacantes] = useState([]);
  const [postulaciones, setPostulaciones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState(null);
  const [selectedVacante, setSelectedVacante] = useState(null);

  useEffect(() => {
    const fetchVacantes = async () => {
      try {
        const response = await axios.get('http://localhost:3001/vacantePractica/all/1/100');
        setVacantes(response.data);
      } catch (error) {
        console.error('Error fetching vacantes:', error);
        setVacantes([{
          titulo: 'Titulo',
          descripcion: 'Descripcion',
          ciudad: 'X',
          fechaInicio: '2024-06-15',
          fechaFinal: '2024-12-15',
          tipoTrabajo: 'Remoto',
          nombreAsesorExterno: 'Nombre Asesor',
          apellidoPaternoAsesorExterno: 'Apellido Paterno',
          apellidoMaternoAsesorExterno: 'Apellido Materno',
          logoEmpresa: 'https://via.placeholder.com/150',
        }]);
      }
    };

    const fetchPostulaciones = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const alumnoID = storedUser ? storedUser.id : '';

      try {
        const response = await axios.get(`http://localhost:3001/postulaciones/${alumnoID}`);
        setPostulaciones(response.data.map(postulacion => postulacion.vacanteID));
      } catch (error) {
        console.error('Error fetching postulaciones:', error);
      }
    };

    fetchVacantes();
    fetchPostulaciones();
  }, []);

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
    } else {
      Swal.fire({
        position: 'center',
        icon: 'warning',
        title: 'Por favor, sube solo archivos PDF.',
        showConfirmButton: false,
        timer: 2000
      });
    }
  };

  const handleApplyClick = async (vacante) => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const alumnoID = storedUser ? storedUser.id : '';

    try {
      const response = await axios.get(`http://localhost:3001/checkPostulacion/${alumnoID}/${vacante.vacantePracticaID}`);
      if (response.data.aplicado) {
        Swal.fire({
          icon: 'warning',
          title: 'Ya has aplicado a esta vacante.',
          text: 'No puedes aplicar a la misma vacante más de una vez.',
        });
      } else {
        setSelectedVacante(vacante);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error verificando postulación:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error verificando postulación',
        text: 'Hubo un error al verificar la postulación. Intenta nuevamente.',
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFile(null);
  };

  const handleConfirm = async () => {
    if (file) {
      const formData = new FormData();
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const alumnoID = storedUser ? storedUser.id : '';
      const vacanteID = selectedVacante.vacantePracticaID;

      formData.append('alumnoID', alumnoID);
      formData.append('vacanteID', vacanteID);
      formData.append('cartaPresentacion', file);

      try {
        const response = await axios.post('http://localhost:3001/registerPostulacion', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Postulación registrada con éxito',
          showConfirmButton: false,
          timer: 2000
        });
        handleCloseModal();
      } catch (error) {
        console.error('Error enviando la postulación:', error);
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Hubo un error al enviar la postulación. Intenta nuevamente.',
          showConfirmButton: false,
          timer: 2000
        });
      }
    }
  };

  const handleButtonClick = () => {
    document.getElementById('fileInput').click();
  };

  const sortedVacantes = vacantes.sort((a, b) => {
    const aApplied = postulaciones.includes(a.vacantePracticaID);
    const bApplied = postulaciones.includes(b.vacantePracticaID);

    if (aApplied === bApplied) {
      return new Date(b.fechaInicio) - new Date(a.fechaInicio);
    }

    return aApplied - bApplied;
  });

  return (
    <div className="vacantes">
      <h1>Vacantes Disponibles</h1>
      {sortedVacantes.map((vacante, index) => (
        <div key={index} className="vacante-card">
          <div style={{ flex: '70%' }}>
            <div className="vacante-card-header">
              <img src={vacante.logoEmpresa || 'https://via.placeholder.com/150'} alt="Logo de la empresa" className="company-logo" />
              <div>
                <h2>{vacante.titulo}</h2>
                <h3>{vacante.nombreEmpresa || 'Empresa Desconocida'}</h3>
              </div>
            </div>
            <p>{vacante.descripcion}</p>
            <div className="vacante-info-horizontal">
              <p><strong>Ubicación:</strong> {vacante.ciudad}</p>
              <p><strong>Duración:</strong> {moment(vacante.fechaInicio).format('DD/MM/YYYY')} - {moment(vacante.fechaFinal).format('DD/MM/YYYY')}</p>
              <p><strong>Tipo de Trabajo:</strong> {vacante.tipoTrabajo}</p>
              <p><strong>Asesor Externo:</strong> {`${vacante.nombreAsesorExterno} ${vacante.apellidoPaternoAsesorExterno} ${vacante.apellidoMaternoAsesorExterno}`}</p>
            </div>
          </div>
          <div className="vacante-footer" style={{ flex: '30%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button
              className={`apply-button ${postulaciones.includes(vacante.vacantePracticaID) ? 'applied' : ''}`}
              onClick={() => handleApplyClick(vacante)}
              disabled={postulaciones.includes(vacante.vacantePracticaID)}
            >
              {postulaciones.includes(vacante.vacantePracticaID) ? 'Aplicado' : 'Aplicar a vacante'}
            </button>
          </div>
        </div>
      ))}

      {showModal && (
        <div className="vacante-modal">
          <div className="vacante-modal-content">
            <span className="close-button" onClick={handleCloseModal}>&times;</span>
            <h2>Subir Carta de Presentación</h2>
            <div className="vacancy-details">
              <h3>{selectedVacante?.titulo}</h3>
              <h4>{selectedVacante?.nombreEmpresa || 'Empresa Desconocida'}</h4>
              <p>{selectedVacante?.descripcion}</p>
              <div className="vacante-info-horizontal">
                <p><strong>Ubicación:</strong> {selectedVacante?.ciudad}</p>
                <p><strong>Duración:</strong> {moment(selectedVacante?.fechaInicio).format('DD/MM/YYYY')} - {moment(selectedVacante?.fechaFinal).format('DD/MM/YYYY')}</p>
                <p><strong>Tipo de Trabajo:</strong> {selectedVacante?.tipoTrabajo}</p>
                <p><strong>Asesor Externo:</strong> {`${selectedVacante?.nombreAsesorExterno} ${selectedVacante?.apellidoPaternoAsesorExterno} ${selectedVacante?.apellidoMaternoAsesorExterno}`}</p>
              </div>
            </div>
            <input 
              type="file" 
              accept="application/pdf" 
              onChange={handleFileUpload} 
              id="fileInput" 
              style={{ display: 'none' }} 
            />
            <button className="upload-button-vacantes" onClick={handleButtonClick}>
              <FaFilePdf className="pdf-icon" /> Subir carta de presentación
            </button>
            {file && <p>Archivo subido: {file.name}</p>}
            <button className="confirm-button" onClick={handleConfirm} disabled={!file}>
              Confirmar tu entrada
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vacantes;
