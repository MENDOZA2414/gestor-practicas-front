import React, { useState, useEffect } from 'react';
import { FaHome, FaUser, FaFileAlt, FaChartLine, FaBuilding, FaSignOutAlt, FaBars, FaArrowLeft } from 'react-icons/fa'; // Importa el icono de flecha
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios';
import PerfilEntidadReceptora from './PerfilEntidadReceptora';
import EncabezadoInicio from './EncabezadoInicio';
import MenuLateral from './MenuLateral';
import RegistrarAsesorExterno from './RegistrarAsesorExterno';
import './inicioEntidad.css';
import RegistrarVacantes from './RegistrarVacantes';
import ListaPracticas from './ListaPracticas';

const InicioEntidad = ({ user, logOut }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [pagina, setPagina] = useState(1); // Estado para la página actual
  const location = useLocation();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          const response = await axios.get(`https://gestor-practicas-back.onrender.com/entidadReceptora/${storedUser.id}`);
          const userData = response.data;
          userData.foto = userData.fotoPerfil ? `data:image/jpeg;base64,${userData.fotoPerfil}` : 'ruta/a/imagen/predeterminada.png';
          setCurrentUser({
            username: `${userData.nombreUsuario}`,
            logo: userData.foto,
            entidadID: userData.entidadID // Asegúrate de obtener y almacenar el entidadID
          });
          // Guardar en localStorage
          localStorage.setItem('user', JSON.stringify({
            ...storedUser,
            logo: userData.foto,
            entidadID: userData.entidadID // Guarda el entidadID en el localStorage
          }));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  return (
    <div className={`inicio-entidad ${collapsed ? 'collapsed' : ''}`}>
      <MenuLateral
        userType="entidadReceptora"
        logOut={logOut}
        collapsed={collapsed}
        toggleSidebar={toggleSidebar}
      />
      <EncabezadoInicio
        user={currentUser}
        userType="entidadReceptora"
        toggleSidebar={toggleSidebar}
        isCollapsed={collapsed}
      />
      <div className={`content ${collapsed ? 'collapsed' : ''}`}>
        <Routes>
          <Route path="/" element={
            <div className="default-message">
              <FaArrowLeft className="arrow-icon" />
              <h1>Selecciona una de las opciones del menú lateral</h1>
            </div>
          } />
          <Route path="perfil" element={<PerfilEntidadReceptora user={currentUser} setUser={setCurrentUser} />} />
          <Route path="registrarVacantes" element={<RegistrarVacantes setUser={setCurrentUser} pagina={pagina} setPagina={setPagina} />} />
          <Route path="listaPracticas" element={<ListaPracticas entidadID={currentUser?.entidadID} />} />
          <Route path="registrar-asesor" element={<RegistrarAsesorExterno />} />
        </Routes>
      </div>
    </div>
  );
};

export default InicioEntidad;
