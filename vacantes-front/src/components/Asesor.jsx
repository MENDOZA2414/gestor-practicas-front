import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './asesor.css';

const Asesor = () => {
  const [asesorInterno, setAsesorInterno] = useState(null);
  const [asesorExterno, setAsesorExterno] = useState(null);
  const [alumnoCorreo, setAlumnoCorreo] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const numControl = storedUser ? storedUser.id : null;

        if (!numControl) {
          throw new Error('No se encontró el número de control del alumno logueado');
        }

        // Obtener datos del alumno
        const responseAlumno = await axios.get(`https://gestor-practicas-back.onrender.com/alumno/${numControl}`);
        const alumnoData = responseAlumno.data;
        setAlumnoCorreo(alumnoData.correo);
        console.log('Datos del alumno:', alumnoData);

        // Obtener datos del asesor interno
        if (alumnoData.asesorInternoID) {
          const responseInterno = await axios.get(`https://gestor-practicas-back.onrender.com/asesorInterno/${alumnoData.asesorInternoID}`);
          const asesorInternoData = responseInterno.data;
          asesorInternoData.foto = `data:image/jpeg;base64,${asesorInternoData.fotoPerfil}`;
          setAsesorInterno(asesorInternoData);
          console.log('Datos del asesor interno:', responseInterno.data);
        } else {
          setAsesorInterno({
            foto: 'https://via.placeholder.com/150',
            nombre: 'Nombre',
            apellidoPaterno: 'ApellidoPaterno',
            apellidoMaterno: 'ApellidoMaterno',
            correo: 'nombre.apellido@example.com',
            numCelular: '123-456-7890',
          });
        }

        // Obtener la práctica profesional del alumno
        try {
          const responsePractica = await axios.get(`https://gestor-practicas-back.onrender.com/practicaProfesional/alumno/${numControl}`);
          const practicaData = responsePractica.data;

          if (practicaData.asesorExternoID) {
            // Obtener datos del asesor externo
            const responseExterno = await axios.get(`https://gestor-practicas-back.onrender.com/asesorExterno/${practicaData.asesorExternoID}`);
            const asesorExternoData = responseExterno.data;
            asesorExternoData.foto = `data:image/jpeg;base64,${asesorExternoData.fotoPerfil}`;
            setAsesorExterno(asesorExternoData);
            console.log('Datos del asesor externo:', responseExterno.data);
          } else {
            setAsesorExterno(null);
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log('No se encontró una práctica profesional para este alumno.');
            setAsesorExterno(null);
          } else {
            throw error;
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setAsesorInterno({
          foto: 'https://via.placeholder.com/150',
          nombre: 'Nombre',
          apellidoPaterno: 'ApellidoPaterno',
          apellidoMaterno: 'ApellidoMaterno',
          correo: 'nombre.apellido@example.com',
          numCelular: '123-456-7890',
        });
        setAsesorExterno(null);
      }
    };
    fetchData();
  }, []);

  const getMailLink = (correo, asesorCorreo) => {
    const subject = encodeURIComponent('Consulta sobre las prácticas profesionales');
    const body = encodeURIComponent('Estimado Asesor,\n\nQuisiera obtener más información sobre las prácticas profesionales.\n\nSaludos,\nNombre del Alumno');
  
    if (correo.includes('@gmail.com')) {
      return `https://mail.google.com/mail/?view=cm&fs=1&to=${asesorCorreo}&su=${subject}&body=${body}`;
    } else if (correo.includes('@hotmail.com') || correo.includes('@outlook.com')) {
      return `https://outlook.live.com/owa/?path=/mail/action/compose&to=${asesorCorreo}&subject=${subject}&body=${body}`;
    }
    return `mailto:${asesorCorreo}?subject=${subject}&body=${body}`;
  };
  

  if (!asesorInterno) return <div>Loading...</div>;

  return (
    <div className="asesor-container">
      <div className="asesor-card">
        <img src={asesorInterno.foto} alt="Foto del Asesor Interno" className="asesor-foto" />
        <div className="asesor-info">
          <h1>Asesor Interno</h1>
          <h2>{`${asesorInterno.nombre} ${asesorInterno.apellidoPaterno} ${asesorInterno.apellidoMaterno}`}</h2>
          <div className="asesor-info-grid">
            <div>
              <p><strong>Correo Electrónico:</strong></p>
              <p>{asesorInterno.correo}</p>
            </div>
            <div>
              <p><strong>Número Celular:</strong></p>
              <p>{asesorInterno.numCelular}</p>
            </div>
          </div>
          <a href={getMailLink(alumnoCorreo, asesorInterno.correo)} target="_blank" rel="noopener noreferrer">
            <button className="contact-button">Contactar</button>
          </a>
        </div>
      </div>
      {asesorExterno ? (
        <div className="asesor-card">
          <img src={asesorExterno.foto} alt="Foto del Asesor Externo" className="asesor-foto" />
          <div className="asesor-info">
            <h1>Asesor Externo</h1>
            <h2>{`${asesorExterno.nombre} ${asesorExterno.apellidoPaterno} ${asesorExterno.apellidoMaterno}`}</h2>
            <div className="asesor-info-grid">
              <div>
                <p><strong>Correo Electrónico:</strong></p>
                <p>{asesorExterno.correo}</p>
              </div>
              <div>
                <p><strong>Número Celular:</strong></p>
                <p>{asesorExterno.numCelular}</p>
              </div>
            </div>
            <a href={getMailLink(alumnoCorreo, asesorExterno.correo)} target="_blank" rel="noopener noreferrer">
              <button className="contact-button">Contactar</button>
            </a>
          </div>
        </div>
      ) : (
        <div className="practica-no-registrada">
          <div className="asesor-info">
            <h1>Práctica no registrada</h1>
            <p>Pronto verás la información de tu próximo asesor externo.</p>
            <a href="/InicioAlumno/vacantes">
              <button className="contact-button">Ver Postulaciones</button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Asesor;
