import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './perfil.css';
import moment from 'moment';
import imageCompression from 'browser-image-compression';

const Perfil = ({ user, setUser }) => {
  const [alumno, setAlumno] = useState(null);
  const [editing, setEditing] = useState(false);
  const [initialCorreo, setInitialCorreo] = useState('');
  const [initialNumCelular, setInitialNumCelular] = useState('');
  const [formValues, setFormValues] = useState({
    foto: '',
    numControl: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    fechaNacimiento: '',
    carrera: '',
    semestre: '',
    turno: '',
    correo: '',
    numCelular: '',
    fotoFile: null,
  });

  const defaultImage = 'ruta/a/imagen/predeterminada.png'; // Cambia esta ruta por la de tu imagen predeterminada

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const numControl = storedUser ? storedUser.id : null;

        if (!numControl) {
          throw new Error('No se encontró el número de control del alumno logueado');
        }

        const response = await axios.get(`http://localhost:3001/alumno/${numControl}`);
        const alumnoData = response.data;
        alumnoData.foto = alumnoData.fotoPerfil ? `data:image/jpeg;base64,${alumnoData.fotoPerfil}` : defaultImage;
        alumnoData.fechaNacimiento = moment(alumnoData.fechaNacimiento).format('YYYY-MM-DD');
        setAlumno(alumnoData);
        setFormValues(alumnoData);
        setInitialCorreo(alumnoData.correo);
        setInitialNumCelular(alumnoData.numCelular);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleChange = async (e) => {
    const { name, value, files } = e.target;

    if (name === 'nombre' || name === 'apellidoPaterno' || name === 'apellidoMaterno') {
      const regex = /^[A-Za-zÀ-ÿ\s]+$/;
      if (!regex.test(value) && value !== '') {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Solo se permiten letras en este campo',
          showConfirmButton: false,
          timer: 1500
        });
        return;
      }
    }
    
    if (name === 'fechaNacimiento') {
      const fechaNacimiento = moment(value);
      const edad = moment().diff(fechaNacimiento, 'years');
    
      if (edad < 17) {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'La edad debe ser mayor o igual a 17 años',
          showConfirmButton: false,
          timer: 1500
        });
        return;
      }
    }
    
    if (name === 'numCelular') {
      const regex = /^\d*$/;
      if (!regex.test(value) && value !== '') {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Solo se permiten números en este campo',
          showConfirmButton: false,
          timer: 1500
        });
        return;
      }
    }

    if (name === 'foto' && files.length > 0) {
      const file = files[0];
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 500,
        useWebWorker: true
      };

      try {
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormValues({ ...formValues, foto: reader.result, fotoFile: compressedFile });
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error al comprimir la imagen:', error);
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: "Error al comprimir la imagen",
          showConfirmButton: false,
          timer: 1500
        });
      }
    } else {
      setFormValues({ ...formValues, [name]: value });
    }
  };

  const handleSave = async () => {
    const form = document.querySelector('form');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const fechaNacimiento = moment(formValues.fechaNacimiento);
    const edad = moment().diff(fechaNacimiento, 'years');

    if (edad < 17) {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'La edad debe ser mayor o igual a 17 años',
        showConfirmButton: false,
        timer: 1500
      });
      return;
    }


    if (formValues.correo !== initialCorreo) {
      const correoDuplicado = await verificarCorreoDuplicado();
      if (correoDuplicado) {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Correo ya existente',
          showConfirmButton: false,
          timer: 1500
        });
        return;
      }
    }

    if (formValues.numCelular !== initialNumCelular) {
      const celularDuplicado = await verificarCelularDuplicado();
      if (celularDuplicado) {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Número de celular ya existente',
          showConfirmButton: false,
          timer: 1500
        });
        return;
      }
    }

    try {
      const formData = new FormData();
      Object.keys(formValues).forEach(key => {
        if (key !== 'foto' && key !== 'fotoFile') {
          formData.append(key, formValues[key]);
        }
      });
      if (formValues.fotoFile) {
        formData.append('foto', formValues.fotoFile);
      }

      if (formValues.fechaNacimiento) {
        const date = new Date(formValues.fechaNacimiento);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        formData.set('fechaNacimiento', formattedDate);
      }

      await axios.put(`http://localhost:3001/alumno/${formValues.numControl}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedAlumno = { ...formValues, foto: formValues.fotoFile ? URL.createObjectURL(formValues.fotoFile) : formValues.foto };
      setAlumno(updatedAlumno);
      setEditing(false);

      // Actualiza el estado del usuario en el componente de inicio
      const updatedUser = {
        username: `${formValues.nombre}`,
        logo: formValues.fotoFile ? URL.createObjectURL(formValues.fotoFile) : formValues.foto
      };

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), ...updatedUser }));

      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Perfil actualizado con éxito',
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.error('Error saving data:', error);
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Error al guardar los datos. Intenta nuevamente.',
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  const handleCancel = () => {
    setFormValues(alumno);
    setEditing(false);
  };

  const verificarCorreoDuplicado = async () => {
    try {
      const { data } = await axios.post('http://localhost:3001/checkDuplicateEmailAlumno', { correo: formValues.correo, numControl: formValues.numControl });
      return data.exists;
    } catch (err) {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Error al verificar correo duplicado',
        showConfirmButton: false,
        timer: 1500
      });
      return true;
    }
  };

  const verificarCelularDuplicado = async () => {
    try {
      const { data } = await axios.post('http://localhost:3001/checkDuplicatePhoneAlumno', { numCelular: formValues.numCelular, numControl: formValues.numControl });
      return data.exists;
    } catch (err) {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Error al verificar número de celular duplicado',
        showConfirmButton: false,
        timer: 1500
      });
      return true;
    }
  };

  if (!alumno) return <div>Loading...</div>;

  return (
    <div className="perfil-card">
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        {editing ? (
          <>
            <div className="perfil-foto-container">
              <img src={formValues.foto} alt="Foto del Alumno" className="perfil-foto" />
            </div>
            <input type="file" name="foto" onChange={handleChange} className="form-control mb-3" accept=".jpg,.jpeg,.png" />
            <div className="perfil-form">
              <input 
                type="text" 
                name="numControl" 
                value={formValues.numControl} 
                onChange={handleChange} 
                placeholder="Número de Control" 
                readOnly 
                className="form-control mb-3" 
                style={{ backgroundColor: '#e9ecef', pointerEvents: 'none' }} 
              />
              <input 
                type="text" 
                name="nombre" 
                value={formValues.nombre} 
                onChange={handleChange} 
                placeholder="Nombre" 
                className="form-control mb-3" 
                required 
                minlength="3" 
                maxLength="20"
                pattern="[A-Za-zÀ-ÿ\s]+" 
                title="El nombre debe tener al menos 3 caracteres y solo puede contener letras"
              />
              <input 
                type="text" 
                name="apellidoPaterno" 
                value={formValues.apellidoPaterno} 
                onChange={handleChange} 
                placeholder="Apellido Paterno" 
                className="form-control mb-3" 
                required 
                minlength="3" 
                maxLength="20"
                pattern="[A-Za-zÀ-ÿ\s]+" 
                title="El apellido paterno debe tener al menos 3 caracteres y solo puede contener letras"
              />
              <input 
                type="text" 
                name="apellidoMaterno" 
                value={formValues.apellidoMaterno} 
                onChange={handleChange} 
                placeholder="Apellido Materno" 
                className="form-control mb-3" 
                required 
                minlength="3" 
                maxLength="20"
                pattern="[A-Za-zÀ-ÿ\s]+" 
                title="El apellido materno debe tener al menos 3 caracteres y solo puede contener letras"
              />
              <input 
                type="date" 
                name="fechaNacimiento" 
                value={formValues.fechaNacimiento} 
                onChange={handleChange} 
                className="form-control mb-3" 
                required 
              />
              <select 
                name="carrera" 
                value={formValues.carrera} 
                onChange={handleChange} 
                className="form-control mb-3" 
                required 
              >
                <option value="">Seleccione...</option>
                <option value="IDS">IDS</option>
                <option value="ITC">ITC</option>
                <option value="LATI">LATI</option>
                <option value="LITI">LITI</option>
              </select>
              <select 
                name="semestre" 
                value={formValues.semestre} 
                onChange={handleChange} 
                className="form-control mb-3" 
                required 
              >
                <option value="">Seleccione...</option>
                {Array.from({ length: 9 }, (_, i) => i + 1).map(sem => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
              <select 
                name="turno" 
                value={formValues.turno} 
                onChange={handleChange} 
                className="form-control mb-3" 
                required 
              >
                <option value="">Seleccione...</option>
                <option value="TM">TM</option>
                <option value="TV">TV</option>
              </select>
              <input 
                type="email" 
                name="correo" 
                value={formValues.correo} 
                onChange={handleChange} 
                placeholder="Correo Electrónico" 
                className="form-control mb-3" 
                maxLength="30"
                required 
              />
              <input 
                type="text" 
                name="numCelular" 
                value={formValues.numCelular} 
                onChange={handleChange} 
                placeholder="Número Celular" 
                className="form-control mb-3" 
                required 
                pattern="\d{10}" 
                title="El número de celular debe tener 10 dígitos"
                maxLength="10"
                inputMode="numeric"
              />
              <div className="perfil-buttons">
                <button className="btn btn-primary me-2" type="submit">Guardar</button>
                <button onClick={handleCancel} className="btn btn-secondary cancel-button" type="button">Cancelar</button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="perfil-foto-container">
              <img src={alumno.foto} alt="Foto del Alumno" className="perfil-foto" />
            </div>
            <div className="perfil-info">
              <h2>{`${alumno.nombre} ${alumno.apellidoPaterno} ${alumno.apellidoMaterno}`}</h2>
              <div className="perfil-info-grid">
                <div>
                  <p><strong>Número de Control:</strong></p>
                  <p>{alumno.numControl}</p>
                </div>
                <div>
                  <p><strong>Fecha de Nacimiento:</strong></p>
                  <p>{moment(alumno.fechaNacimiento).format('DD/MM/YYYY')}</p>
                </div>
                <div>
                  <p><strong>Carrera:</strong></p>
                  <p>{alumno.carrera}</p>
                </div>
                <div>
                  <p><strong>Semestre:</strong></p>
                  <p>{alumno.semestre}</p>
                </div>
                <div>
                  <p><strong>Turno:</strong></p>
                  <p>{alumno.turno}</p>
                </div>
                <div>
                  <p><strong>Correo Electrónico:</strong></p>
                  <p>{alumno.correo}</p>
                </div>
                <div className="perfil-celular">
                  <p><strong>Número Celular:</strong></p>
                  <p>{alumno.numCelular}</p>
                </div>
              </div>
              <button onClick={handleEdit} className="btn btn-primary">Editar</button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default Perfil;
