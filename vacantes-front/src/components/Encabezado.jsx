import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../public/dasc.png';

const Encabezado = ({ user, logOut }) => {
  const [isOffcanvasOpen, setOffcanvasOpen] = useState(false);

  const handleToggleOffcanvas = () => {
    setOffcanvasOpen(!isOffcanvasOpen);
  };

  const handleCloseOffcanvas = () => {
    setOffcanvasOpen(false);
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-body-tertiary">
        <div className="container-fluid px-5">
          <Link to="/" className="navbar-brand mx-auto mx-lg-0 d-flex align-items-center">
            <img src={logo} className="bi me-5" width="150" height="52" alt="Logo" />
          </Link>
          <button className="navbar-toggler" type="button" onClick={handleToggleOffcanvas}>
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={`offcanvas offcanvas-end ${isOffcanvasOpen ? 'show' : ''}`} tabIndex="-1" style={{ visibility: isOffcanvasOpen ? 'visible' : 'hidden' }}>
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="offcanvasNavbarLabel">Menú</h5>
              <button type="button" className="btn-close text-reset" onClick={handleCloseOffcanvas} aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <Link to="/" className="nav-link active" aria-current="page" onClick={handleCloseOffcanvas}>Inicio</Link>
                </li>
                <li className="nav-item">
                  <Link to="#" className="nav-link" onClick={handleCloseOffcanvas}>Estudiantes</Link>
                </li>
                <li className="nav-item">
<<<<<<< HEAD
                  <a href="#" className="nav-link" onClick={handleCloseOffcanvas}>Empresas</a>
=======
                  <a href="#" className="nav-link">google</a>
>>>>>>> 46b03f69467a0d5cc92ff793aa9b210c43045f90
                </li>
                <li className="nav-item">
                  <a href="#" className="nav-link" onClick={handleCloseOffcanvas}>DASC</a>
                </li>
                <li className="nav-item">
                  <a href="#" className="nav-link" onClick={handleCloseOffcanvas}>Contacto</a>
                </li>
              </ul>
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link to="/login" className="nav-link" onClick={handleCloseOffcanvas}>Iniciar sesión</Link>
                </li>
                <li className="nav-item">
                  <Link to="/preRegistro" className="nav-link" onClick={handleCloseOffcanvas}>Registro</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Encabezado;
