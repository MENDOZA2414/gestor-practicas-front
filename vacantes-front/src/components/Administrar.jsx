import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserGraduate, FaBriefcase, FaBuilding, FaEye, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import Switch from 'react-switch';
import moment from 'moment';
import './administrar.css';

const Administrar = ({ currentUser }) => {
  const [data, setData] = useState([]);
  const [selectedOption, setSelectedOption] = useState('vacantes');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchData = async () => {
    try {
      let response;
      if (isRegistered) {
        switch (selectedOption) {
          case 'entidades':
            response = await axios.get('https://gestor-practicas-back-production.up.railway.app/entidades', {
              params: { estatus: 'Aceptado' }
            });
            break;
          case 'alumnos':
            response = await axios.get('https://gestor-practicas-back-production.up.railway.app/alumnos', {
              params: { asesorInternoID: currentUser.asesorInternoID, estatus: 'Aceptado' }
            });
            break;
          case 'vacantes':
          default:
            response = await axios.get('https://gestor-practicas-back-production.up.railway.app/vacantePractica', {
              params: { estatus: 'Aceptado' }
            });
            break;
        }
      } else {
        switch (selectedOption) {
          case 'entidades':
            response = await axios.get('https://gestor-practicas-back-production.up.railway.app/entidades', {
              params: { estatus: null }
            });
            break;
          case 'alumnos':
            response = await axios.get('https://gestor-practicas-back-production.up.railway.app/alumnos', {
              params: { asesorInternoID: currentUser.asesorInternoID, estatus: null }
            });
            break;
          case 'vacantes':
          default:
            response = await axios.get('https://gestor-practicas-back-production.up.railway.app/vacantePractica', {
              params: { estatus: null }
            });
            break;
        }
      }
      setData(response.data);
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
      setErrorMessage('No hay solicitudes de ' + selectedOption);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [selectedOption, isRegistered, currentUser]);

  const handleAcceptClick = (item) => {
    setSelectedItem(item);
    setConfirmAction('accept');
    setConfirmMessage(`¿Estás seguro de que deseas aceptar esta ${selectedOption.slice(0, -1)}?`);
    setShowConfirmModal(true);
  };

  const handleRejectClick = (item) => {
    setSelectedItem(item);
    setConfirmAction('reject');
    setConfirmMessage(`¿Estás seguro de que deseas rechazar esta ${selectedOption.slice(0, -1)}?`);
    setShowConfirmModal(true);
  };

  const handleDeleteClick = (item) => {
    if (item.estatus !== 'Aceptado') {
      Swal.fire({
        position: 'center',
        icon: 'warning',
        title: 'Solo se pueden eliminar elementos aceptados',
        showConfirmButton: true
      });
    } else {
      Swal.fire({
        title: '¿Estás seguro de que deseas eliminar este elemento?',
        text: "Esta acción no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          setSelectedItem(item);
          setConfirmAction('delete');
          handleConfirm(); // Llama a handleConfirm directamente
        }
      });
    }
};

  const handleViewClick = async (item) => {
    try {
      let response;
      if (selectedOption === 'alumnos') {
        response = await axios.get(`https://gestor-practicas-back-production.up.railway.app/alumno/${item.numControl}`);
      } else if (selectedOption === 'entidades') {
        response = await axios.get(`https://gestor-practicas-back-production.up.railway.app/entidadReceptora/${item.entidadID}`);
      } else if (selectedOption === 'vacantes') {
        response = await axios.get(`https://gestor-practicas-back-production.up.railway.app/vacantePractica/${item.vacantePracticaID}`);
      }
      setSelectedItem({ ...response.data, logoEmpresa: item.logoEmpresa }); // Agrega logoEmpresa al selectedItem
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching item details:', error);
    }
  };

  const handleConfirm = async () => {
    setShowConfirmModal(false);
    try {
      if (confirmAction === 'accept') {
        if (selectedOption === 'alumnos') {
          await axios.put(`https://gestor-practicas-back-production.up.railway.app/alumno/aceptar/${selectedItem.numControl}`);
        } else if (selectedOption === 'vacantes') {
          await axios.put(`https://gestor-practicas-back-production.up.railway.app/vacantePractica/aceptar/${selectedItem.vacantePracticaID}`);
        } else if (selectedOption === 'entidades') {
          await axios.put(`https://gestor-practicas-back-production.up.railway.app/entidadReceptora/aceptar/${selectedItem.entidadID}`);
        }
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: `${selectedOption.slice(0, -1).charAt(0).toUpperCase() + selectedOption.slice(1, -1).slice(1)} aceptado con éxito`,
          showConfirmButton: false,
          timer: 2000
        });
      } else if (confirmAction === 'reject') {
        if (selectedOption === 'alumnos') {
          await axios.put(`https://gestor-practicas-back-production.up.railway.app/alumno/rechazar/${selectedItem.numControl}`);
        } else if (selectedOption === 'vacantes') {
          await axios.put(`https://gestor-practicas-back-production.up.railway.app/vacantePractica/rechazar/${selectedItem.vacantePracticaID}`);
        } else if (selectedOption === 'entidades') {
          await axios.put(`https://gestor-practicas-back-production.up.railway.app/entidadReceptora/rechazar/${selectedItem.entidadID}`);
        }
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: `${selectedOption.slice(0, -1).charAt(0).toUpperCase() + selectedOption.slice(1, -1).slice(1)} rechazado con éxito`,
          showConfirmButton: false,
          timer: 2000
        });
      } else if (confirmAction === 'delete') {
        if (selectedOption === 'alumnos') {
          await axios.delete(`https://gestor-practicas-back-production.up.railway.app/alumno/${selectedItem.numControl}`);
        } else if (selectedOption === 'vacantes') {
          await axios.delete(`https://gestor-practicas-back-production.up.railway.app/vacantePractica/${selectedItem.vacantePracticaID}`);
        } else if (selectedOption === 'entidades') {
          await axios.delete(`https://gestor-practicas-back-production.up.railway.app/entidadReceptora/${selectedItem.entidadID}`);
        }
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: `${selectedOption.slice(0, -1).charAt(0).toUpperCase() + selectedOption.slice(1, -1).slice(1)} eliminado con éxito`,
          showConfirmButton: false,
          timer: 2000
        });
      }
      fetchData(); // Recargar datos después de aceptar, rechazar o eliminar
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const renderTitle = () => {
    switch (selectedOption) {
      case 'entidades':
        return isRegistered ? 'Entidades Registradas' : 'Solicitudes de Entidades';
      case 'alumnos':
        return isRegistered ? 'Alumnos Registrados' : 'Solicitudes de Alumnos';
      case 'vacantes':
      default:
        return isRegistered ? 'Vacantes Registradas' : 'Aprobación de Vacantes';
    }
  };

  const renderButtons = (item) => {
    if (isRegistered) {
      return (
        <>
          <FaEye className="admin-action-icon view-icon" onClick={() => handleViewClick(item)} />
          <FaTrash className="admin-action-icon delete-icon" onClick={() => handleDeleteClick(item)} />
        </>
      );
    }
    return (
      <>
        <FaEye className="admin-action-icon view-icon" onClick={() => handleViewClick(item)} />
        <FaCheck className="admin-action-icon accept-icon" onClick={() => handleAcceptClick(item)} />
        <FaTimes className="admin-action-icon reject-icon" onClick={() => handleRejectClick(item)} />
      </>
    );
  };

  const renderModalContent = () => {
    if (!selectedItem) return null;
    if (selectedOption === 'alumnos') {
      return (
        <>
          <h2>{selectedItem.nombre}</h2>
          <img src={`data:image/jpeg;base64,${selectedItem.fotoPerfil}`} alt="Foto de Perfil" className="admin-modal-company-logo" />
          <p><strong>Número de Control:</strong> {selectedItem.numControl}</p>
          <p><strong>Fecha de Nacimiento:</strong> {moment(selectedItem.fechaNacimiento).format('YYYY-MM-DD')}</p>
          <p><strong>Carrera:</strong> {selectedItem.carrera}</p>
          <p><strong>Semestre:</strong> {selectedItem.semestre}</p>
          <p><strong>Turno:</strong> {selectedItem.turno}</p>
          <p><strong>Correo:</strong> {selectedItem.correo}</p>
          <p><strong>Teléfono:</strong> {selectedItem.numCelular}</p>
        </>
      );
    } else if (selectedOption === 'vacantes') {
      return (
        <>
          <h2>{selectedItem.titulo}</h2>
          <img src={selectedItem.logoEmpresa || 'https://via.placeholder.com/50'} alt="Logo Empresa" className="admin-modal-company-logo" />
          <p><strong>Descripción:</strong> {selectedItem.descripcion}</p>
          <p><strong>Fecha de Inicio:</strong> {moment(selectedItem.fechaInicio).format('YYYY-MM-DD')}</p>
          <p><strong>Fecha de Fin:</strong> {moment(selectedItem.fechaFin).format('YYYY-MM-DD')}</p>
          <p><strong>Ciudad:</strong> {selectedItem.ciudad}</p>
          <p><strong>Modalidad:</strong> {selectedItem.tipoTrabajo}</p>
        </>
      );
    } else if (selectedOption === 'entidades') {
      return (
        <>
          <h2>{selectedItem.nombreEntidad}</h2>
          <img src={`data:image/jpeg;base64,${selectedItem.fotoPerfil}`} alt="Logo Empresa" className="admin-modal-company-logo" />
          <p><strong>Nombre Usuario:</strong> {selectedItem.nombreUsuario}</p>
          <p><strong>Dirección:</strong> {selectedItem.direccion}</p>
          <p><strong>Categoría:</strong> {selectedItem.categoria}</p>
          <p><strong>Correo:</strong> {selectedItem.correo}</p>
          <p><strong>Teléfono:</strong> {selectedItem.numCelular}</p>
        </>
      );
    }
  };

  return (
    <div className="admin-administrar">
      <div className="admin-administrar-header">
        <h1 className="admin-administrar-title">{renderTitle()}</h1>
        <div className="admin-administrar-icons">
          <Switch
            checked={isRegistered}
            onChange={() => setIsRegistered(!isRegistered)}
            offColor="#888"
            onColor="#0d6efd"
            onHandleColor="#fff"
            handleDiameter={20}
            uncheckedIcon={false}
            checkedIcon={false}
            height={20}
            width={48}
            className="react-switch"
          />
          <div
            className={`admin-icon-circle ${selectedOption === 'alumnos' ? 'selected' : ''}`}
            onClick={() => setSelectedOption('alumnos')}
          >
            <FaUserGraduate className="admin-icon" />
          </div>
          <div
            className={`admin-icon-circle ${selectedOption === 'vacantes' ? 'selected' : ''}`}
            onClick={() => setSelectedOption('vacantes')}
          >
            <FaBriefcase className="admin-icon" />
          </div>
          <div
            className={`admin-icon-circle ${selectedOption === 'entidades' ? 'selected' : ''}`}
            onClick={() => setSelectedOption('entidades')}
          >
            <FaBuilding className="admin-icon" />
          </div>
        </div>
      </div>
      <div className="admin-administrar-card">
        <div className="admin-administrar-list">
          {errorMessage ? (
            <p>{errorMessage}</p>
          ) : (
            data.map((item, index) => (
              <div key={index} className="admin-administrar-list-item">
                <img 
                  src={item.logoEmpresa || item.fotoPerfil || 'https://via.placeholder.com/50'} 
                  alt="Foto de Perfil" 
                  className="admin-company-logo" 
                />
                <div className="admin-administrar-list-item-content">
                  <h2>{item.titulo || item.nombre || 'Nombre Desconocido'}</h2>
                </div>
                <div className="admin-administrar-footer">
                  {renderButtons(item)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="admin-administrar-modal">
          <div className="admin-administrar-modal-content">
            <span className="admin-close-button" onClick={() => setShowModal(false)}>
              &times;
            </span>
            {renderModalContent()}
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="admin-confirm-modal">
          <div className="admin-confirm-modal-content">
            <span className="admin-close-button" onClick={() => setShowConfirmModal(false)}>
              &times;
            </span>
            <h2>Confirmación</h2>
            <p>{confirmMessage}</p>
            <div className="admin-confirm-buttons">
              <button className="admin-confirm-button blue" onClick={handleConfirm}>Sí</button>
              <button className="admin-confirm-button red" onClick={() => setShowConfirmModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Administrar;
