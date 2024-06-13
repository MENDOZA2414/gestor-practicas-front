import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaEye, FaEdit, FaTrashAlt } from 'react-icons/fa';
import moment from 'moment';
import axios from 'axios';
import Swal from 'sweetalert2';
import './vacantesEntidad.css';

const ListaVacantes = ({ entidadID, vacantes, setVacantes, setVacante, setIsModalOpen, setSelectedPostulaciones, fetchPostulaciones }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedVacante, setSelectedVacante] = useState(null);

  const fetchVacantes = async () => {
    try {
      setVacantes([]); // Limpiar el estado antes de hacer la solicitud
      const response = await axios.get(`https://gestor-practicas-back-production.up.railway.app/vacantePractica/${entidadID}`);
      setVacantes(response.data);
    } catch (error) {
      console.error('Error fetching vacantes:', error);
    }
  };

  useEffect(() => {
    fetchVacantes();
  }, [entidadID]);

  const handleDelete = async (vacantePracticaID, event) => {
    event.preventDefault();
    event.stopPropagation(); // Evita la propagación del evento
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: '¡No podrás revertir esto!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await axios.delete(`https://gestor-practicas-back-production.up.railway.app/vacantePractica/${vacantePracticaID}`);
        Swal.fire(
          'Eliminado',
          'La vacante y sus postulaciones han sido eliminadas.',
          'success'
        );
        // Actualizar el estado de las vacantes sin necesidad de refrescar la página
        setVacantes(prevVacantes => prevVacantes.filter(vacante => vacante.vacantePracticaID !== vacantePracticaID));
        // Actualizar las postulaciones también
        fetchPostulaciones();
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al eliminar la vacante: ' + (error.response?.data?.message || error.message),
      });
    }
  };

  const handleViewVacante = (vacante, event) => {
    event.preventDefault();
    event.stopPropagation(); // Evita la propagación del evento
    setSelectedVacante(vacante);
    setShowModal(true);
    setIsModalOpen(true); // Marca el modal como abierto
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVacante(null);
    setIsModalOpen(false); // Marca el modal como cerrado
  };

  return (
    <div className="vacantes-enti">
      {vacantes.length === 0 ? (
        <p className="text-center">Sin vacantes registradas</p>
      ) : (
        <div className="vacantes-enti-card">
          {vacantes.map((item) => (
            <div key={item.vacantePracticaID} className="vacantes-enti-item">
              <div>
                <span className="vacantes-enti-item-title">{item.titulo}</span>
                <br />
                <span>{item.ciudad}</span>
              </div>
              <div className="vacantes-enti-actions">
                <button className="icon-button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); setSelectedPostulaciones(item.vacantePracticaID); }} aria-label={`Ver postulaciones ${item.titulo}`}>
                  Postulaciones
                </button>
                <button className="icon-button" onClick={(event) => handleViewVacante(item, event)} aria-label={`Ver vacante ${item.titulo}`}>
                  <FaEye />
                </button>
                <button className="icon-button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); setVacante(item); }} aria-label={`Editar vacante ${item.titulo}`}>
                  <FaEdit />
                </button>
                <button className="icon-button" onClick={(event) => handleDelete(item.vacantePracticaID, event)} aria-label={`Eliminar vacante ${item.titulo}`}>
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && selectedVacante && (
        <div className="vacantes-enti-modal" tabIndex="-1" aria-hidden="true">
          <div className="vacantes-enti-modal-content">
            <span className="vacantes-enti-close-button" onClick={handleCloseModal}>&times;</span>
            <h2>{selectedVacante.titulo}</h2>
            <p><strong>Tipo de Trabajo:</strong> {selectedVacante.tipoTrabajo}</p>
            <p><strong>Ciudad:</strong> {selectedVacante.ciudad}</p>
            <p><strong>Descripción:</strong> {selectedVacante.descripcion}</p>
            <p><strong>Fecha de Inicio:</strong> {moment(selectedVacante.fechaInicio).format('DD/MM/YYYY')}</p>
            <p><strong>Fecha de Fin:</strong> {moment(selectedVacante.fechaFinal).format('DD/MM/YYYY')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

ListaVacantes.propTypes = {
  entidadID: PropTypes.number.isRequired,
  vacantes: PropTypes.arrayOf(
    PropTypes.shape({
      vacantePracticaID: PropTypes.number.isRequired,
      titulo: PropTypes.string.isRequired,
      tipoTrabajo: PropTypes.string.isRequired,
      ciudad: PropTypes.string.isRequired,
      descripcion: PropTypes.string.isRequired,
      fechaInicio: PropTypes.string.isRequired,
      fechaFinal: PropTypes.string.isRequired,
    })
  ).isRequired,
  setVacantes: PropTypes.func.isRequired,
  setVacante: PropTypes.func.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
  setSelectedPostulaciones: PropTypes.func.isRequired,
  fetchPostulaciones: PropTypes.func.isRequired,
};

export default ListaVacantes;
