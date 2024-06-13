import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../public/dasc.png';
const Encabezado = ({ user, logOut }) => {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-body-tertiary">
        <div className="container-fluid px-5">
          <Link to="/" className="navbar-brand mx-auto mx-lg-0 d-flex align-items-center">
            <img src= {logo} className="bi me-5" width="150" height="52" alt="Logo" />
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="offcanvasNavbarLabel">Menú</h5>
              <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <Link to="/" className="nav-link active" aria-current="page">Inicio</Link>
                </li>
                <li className="nav-item">
                  <Link to="#" className="nav-link">Estudiantes</Link>
                </li>
                <li className="nav-item">
                  <a href="#" className="nav-link">google</a>
                </li>
                <li className="nav-item">
                  <a href="#" className="nav-link">DASC</a>
                </li>
                <li className="nav-item">
                  <a href="#" className="nav-link">Contacto</a>
                </li>
              </ul>
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link to="/login" className="nav-link">Iniciar sesión</Link>
                </li>
                <li className="nav-item">
                  <Link to="/preRegistro" className="nav-link">Registro</Link>
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
