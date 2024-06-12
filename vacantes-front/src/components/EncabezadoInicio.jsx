import React from 'react';
import { FaBars, FaBell, FaEnvelope } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import Campana from './Campana';
import './encabezadoInicio.css';

const EncabezadoInicio = ({ user, userType, toggleSidebar, isCollapsed }) => {
  const navigate = useNavigate();

  const getCurrentDate = () => {
    const date = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  };

  const getProfileLink = () => {
    switch (userType) {
      case 'alumno':
        return '/inicioAlumno/perfil';
      case 'asesorInterno':
        return '/inicioAsesorInterno/perfil';
      case 'asesorExterno':
        return '/inicioAsesorExterno/perfil';
      case 'entidadReceptora':
        return '/inicioEntidad/perfil';
      default:
        return '/inicioAlumno/perfil';
    }
  };

  const handleMessageClick = () => {
    switch (userType) {
      case 'alumno':
        navigate('/inicioAlumno/asesor');
        break;
      case 'asesorInterno':
        navigate('/inicioAsesorInterno/administrar');
        break;
      case 'entidadReceptora':
        window.location.href = 'mailto:dasc@gmail.com';
        break;
      default:
        break;
    }
  };

  return (
    <header className={`header-principal ${isCollapsed ? 'collapsed' : ''} sticky`}>
      <div className="header-principal-content">
        <div className="header-principal-left">
          <FaBars className="menu-icon2 custom-bars-icon" onClick={toggleSidebar} />
          <div className="user-info2">
            {user && user.username && (
              <>
                <span className="user-greeting">¡Hola {user.username}!</span>
                <span className="current-date">{getCurrentDate()}</span>
              </>
            )}
          </div>
        </div>
        <div className="header-principal-right">
          <div className="icon-group">
            <div className="separator"></div>
            <div className="message-icon-container" onClick={handleMessageClick}>
              <FaEnvelope className="message-icon" />
            </div>
            <Campana userType={userType} />
          </div>
          {user && user.logo && (
            <Link to={getProfileLink()}>
              <img src={user.logo} alt="Profile" className="profile-picture" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default EncabezadoInicio;
