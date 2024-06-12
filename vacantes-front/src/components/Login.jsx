import React, { useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Error from './common/Error';
import md5 from 'md5';
import Titulo from './common/Titulo';
import { FaUser } from 'react-icons/fa';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [goInicio, setGoInicio] = useState(false);
  const [userType, setUserType] = useState('entidad');

  const login = async (e) => {
    e.preventDefault();

    if ([email, password].includes('')) {
      setError(true);
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Debe llenar todos los campos',
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    } else setError(false);

    try {
      let endpoint;
      switch (userType) {
        case 'alumno':
          endpoint = 'login/alumno';
          break;
        case 'entidad':
          endpoint = 'login/entidad';
          break;
        case 'asesorInterno':
          endpoint = 'login/asesorInterno';
          break;
        case 'asesorExterno':
          endpoint = 'login/asesorExterno';
          break;
        default:
          throw new Error('Tipo de usuario no válido');
      }

      const { data } = await axios.post(`http://localhost:3001/${endpoint}`, { email, password });

      const userName = data.nombre || data.nombreUsuario || data.nombreEntidad;

      Swal.fire({
        position: 'center',
        icon: 'success',
        html: `Bienvenido/a <strong>${userName}</strong>`,
        showConfirmButton: false,
        timer: 2000,
      });

      const dataCom = {
        id: data.numControl || data.entidadID || data.alumnoID || data.asesorInternoID || data.asesorExternoID,
        company: data.nombreEntidad || data.nombre,
        username: data.nombreUsuario || data.nombreEntidad || data.nombre,
        email: data.correo,
        logo: data.fotoPerfil,
        type: userType,
      };

      const idSession = md5(dataCom.id + dataCom.email + dataCom.username);
      localStorage.setItem('user', JSON.stringify(dataCom));
      localStorage.setItem('idSession', idSession);
      setUser(dataCom); // Establecer el usuario en el estado de App
      setGoInicio(true); // Navegar a /inicio
    } catch (err) {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: err.message.includes('401') ? 'Datos de acceso incorrectos' : err.message,
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  if (goInicio) {
    switch (userType) {
      case 'alumno':
        return <Navigate to="/inicioAlumno" />;
      case 'asesorInterno':
        return <Navigate to="/inicioAsesorInterno" />;
      case 'asesorExterno':
        return <Navigate to="/inicioAsesorExterno" />;
      case 'entidad':
        return <Navigate to="/inicioEntidad" />;
      case 'administrador':
        return <Navigate to="/inicioAdministrador" />;
      default:
        return <Navigate to="/" />;
    }
  }

  return (
    <>
      <form onSubmit={login} style={{ maxWidth: '500px', margin: 'auto' }}>
        <div className="card border mb-3">
          <div className="card-body">
            <h2 className="card-title text-center">Iniciar sesión</h2>
            <div className="mb-3 text-center">
              <FaUser className="icono-usuario" size={130} />
            </div>
            <div className="mb-3">
              <label className="form-label">Tipo de usuario</label>
              <select
                className="form-control"
                onChange={(e) => setUserType(e.target.value)}
                value={userType}
              >
                <option value="entidad">Entidad Receptora</option>
                <option value="alumno">Alumno</option>
                <option value="asesorInterno">Asesor Interno</option>
                <option value="asesorExterno">Asesor Externo</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
            </div>
            <div className="d-grid gap-2 d-md-flex justify-content-md-end mb-3">
              <button className="btn btn-success me-md-2" type="submit">
                Acceder
              </button>
            </div>
            {error && <Error mensaje="Todos los campos son obligatorios" />}
          </div>
        </div>
      </form>
    </>
  );
};

export default Login;
