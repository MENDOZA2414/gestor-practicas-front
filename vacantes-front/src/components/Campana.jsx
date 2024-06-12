import React, { useState, useEffect } from 'react';
import { FaBell, FaExclamation } from 'react-icons/fa';
import axios from 'axios';
import './campana.css'; // Asegúrate de que este archivo CSS contenga los estilos proporcionados anteriormente

const Campana = ({ userType }) => {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const checkForChanges = async () => {
      try {
        const response = await axios.get('https://gestor-practicas-back-production.up.railway.app/checkDbChanges');
        const { hasChanges, changeTypes } = response.data;

        // Mostrar la notificación si hay cambios y el tipo de usuario es diferente al actual
        if (hasChanges && changeTypes.includes(userType === 'alumno' ? 'asesorInterno' : 'alumno')) {
          setShowNotification(true);
        }
      } catch (error) {
        console.error('Error checking for changes:', error);
      }
    };

    // Verifica cambios cada 10 segundos
    const interval = setInterval(checkForChanges, 10000);

    // Limpia el intervalo cuando el componente se desmonte
    return () => clearInterval(interval);
  }, [userType]);

  const handleBellClick = () => {
    // Recargar la página actual
    window.location.reload();
  };

  return (
    <div className="campana-container" onClick={handleBellClick}>
      <FaBell className={`campana-icon ${showNotification ? 'active' : ''}`} />
      {showNotification && (
        <div className="campana-notification">
          <FaExclamation className="campana-notification-icon" />
        </div>
      )}
    </div>
  );
};

export default Campana;
