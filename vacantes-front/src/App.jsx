import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Ofertas from './components/Ofertas';
import MisOfertas from './components/MisOfertas';
import Encabezado from './components/Encabezado';
import PreRegistro from './components/PreRegistro';
import Principal from './components/Principal';
import RegistrarAlumno from './components/RegistrarAlumno';
import RegistrarAsesor from './components/RegistrarAsesor';
import InicioAlumno from './components/inicioAlumno';
import InicioAsesorInterno from './components/inicioAsesorInterno';
import InicioAsesorExterno from './components/inicioAsesorExterno';
import InicioEntidad from './components/inicioEntidad';
import Swal from 'sweetalert2';
import RegistrarEntidad from './components/RegistrarEntidad';
// import InicioAdministrador from './components/InicioAdministrador';

const AppContent = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || undefined);
  const [pagina, setPagina] = useState(1);
  const location = useLocation();
  const navigate = useNavigate();
  const sessionDuration = 60 * 60 * 1000; 

  const handleSessionExpiration = () => {
    Swal.fire({
      icon: 'info',
      title: 'Sesión expirada',
      text: 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.',
    });
    localStorage.setItem('lastPath', location.pathname); // Guarda la ruta actual
    localStorage.clear();
    setUser(undefined);
    navigate('/login'); // Redirige a la página de inicio de sesión
  };

  const handleLogout = () => {
    localStorage.setItem('lastPath', location.pathname); // Guarda la ruta actual
    localStorage.clear();
    setUser(undefined);
    navigate('/login'); // Redirige a la página de inicio de sesión
  };

  const showHeaderRoutes = [
    '/',
    '/ofertas',
    '/misOfertas',
    '/login',
    '/registrarEntidad',
    '/preRegistro',
    '/registrarAlumno',
    '/registrarAsesor'
  ];

  const showHeader = showHeaderRoutes.includes(location.pathname);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedUser) {
      setUser(savedUser);
      const lastPath = localStorage.getItem('lastPath');
      if (lastPath) {
        navigate(lastPath);
      }
    }
  }, [navigate]);

  useEffect(() => {
    let timer;
    if (user) {
      timer = setTimeout(() => {
        handleSessionExpiration();
      }, sessionDuration);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [user, sessionDuration]);

  return (
    <>
      {showHeader && <Encabezado user={user} logOut={handleLogout} />}
      <div className="container-fluid">
        <Routes>
          <Route path="/" element={<Principal />} />
          <Route path="/ofertas" element={<Ofertas />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/registrarEntidad" element={<RegistrarEntidad />} />
          <Route path="/preRegistro" element={<PreRegistro />} />
          <Route path="/registrarAlumno" element={<RegistrarAlumno />} />
          <Route path="/registrarAsesor" element={<RegistrarAsesor />} />
          <Route path="/misOfertas" element={<MisOfertas pagina={pagina} setPagina={setPagina} setUser={setUser} />} />

          {/* Rutas específicas para cada tipo de usuario */}
          <Route path="/inicioAlumno/*" element={user?.type === 'alumno' ? <InicioAlumno user={user} logOut={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/inicioAsesorInterno/*" element={user?.type === 'asesorInterno' ? <InicioAsesorInterno user={user} logOut={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/inicioAsesorExterno/*" element={user?.type === 'asesorExterno' ? <InicioAsesorExterno user={user} logOut={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/inicioEntidad/*" element={user?.type === 'entidad' ? <InicioEntidad user={user} logOut={handleLogout} /> : <Navigate to="/" />} />
          {/* <Route path="/inicioAdministrador/*" element={user?.type === 'administrador' ? <InicioAdministrador user={user} logOut={handleLogout} /> : <Navigate to="/" />} /> */}
        </Routes>
      </div>
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
