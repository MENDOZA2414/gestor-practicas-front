import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBuilding, FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';
import Titulo from './common/Titulo';
import './preRegistro.css';

const PreRegistro = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
  };

  const handleNextClick = () => {
    switch (selectedRole) {
      case 'empresa':
        navigate('/registrarEntidad');
        break;
      case 'alumno':
        navigate('/registrarAlumno');
        break;
      case 'asesor':
        navigate('/registrarAsesor');
        break;
      default:
        break;
    }
  };

  const isCardSelected = (role) => selectedRole === role ? 'selected' : '';

  return (
    <div className="pre-registro-container">
      <div className="titulo-container">
        <Titulo titulo='Selecciona el tipo de usuario deseado para registrarte' />
      </div>
      <div className="cards-container">
        <div 
          className={`pre-registro-card ${isCardSelected('empresa')}`}
          onClick={() => handleRoleChange('empresa')}
        >
          <div className={`icon-card ${isCardSelected('empresa')}`}>
            <FaBuilding className="icon" />
          </div>
          <div className="card-content">
            <h3 className="card-title">Empresa</h3>
            <h4 className="card-subtitle">
              <small>Registrate como entidad receptora</small>
            </h4>
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={selectedRole === 'empresa'}
                readOnly
              />
              <span className="checkmark"></span>
            </label>
          </div>
        </div>
        <div 
          className={`pre-registro-card ${isCardSelected('alumno')}`}
          onClick={() => handleRoleChange('alumno')}
        >
          <div className={`icon-card ${isCardSelected('alumno')}`}>
            <FaUserGraduate className="icon" />
          </div>
          <div className="card-content">
            <h3 className="card-title">Alumno</h3>
            <h4 className="card-subtitle">
              <small>Registrate como alumno del DASC</small>
            </h4>
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={selectedRole === 'alumno'}
                readOnly
              />
              <span className="checkmark"></span>
            </label>
          </div>
        </div>
        <div 
          className={`pre-registro-card ${isCardSelected('asesor')}`}
          onClick={() => handleRoleChange('asesor')}
        >
          <div className={`icon-card ${isCardSelected('asesor')}`}>
            <FaChalkboardTeacher className="icon" />
          </div>
          <div className="card-content">
            <h3 className="card-title">Asesor</h3>
            <h4 className="card-subtitle">
              <small>Registrate como asesor interno</small>
            </h4>
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={selectedRole === 'asesor'}
                readOnly
              />
              <span className="checkmark"></span>
            </label>
          </div>
        </div>
      </div>
      <div className="next-button-container">
        <button
          className="next-button"
          onClick={handleNextClick}
          disabled={!selectedRole}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default PreRegistro;
