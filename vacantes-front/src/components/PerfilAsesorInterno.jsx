import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './perfilAsesorInterno.css';
import moment from 'moment';
import imageCompression from 'browser-image-compression';

const PerfilAsesorInterno = ({ user, setUser }) => {
  const [asesor, setAsesor] = useState(null);
  const [editing, setEditing] = useState(false);
  const [initialCorreo, setInitialCorreo] = useState('');
  const [initialNumCelular, setInitialNumCelular] = useState('');
  const [formValues, setFormValues] = useState({
    foto: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    correo: '',
    numCelular: '',
    fotoFile: null,
  });

  const defaultImage = 'ruta/a/imagen/predeterminada.png'; // Cambia esta ruta por la de tu imagen predeterminada

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const asesorId = storedUser ? storedUser.id : null;

        if (!asesorId) {
          throw new Error('No se encontró el ID del asesor logueado');
        }

        const response = await axios.get(`http://localhost:3001/asesorInterno/${asesorId}`);
        const asesorData = response.data;
        asesorData.foto = asesorData.fotoPerfil ? `data:image/jpeg;base64,${asesorData.fotoPerfil}` : defaultImage;
        setAsesor(asesorData);
        setFormValues(asesorData);
        setInitialCorreo(asesorData.correo);
        setInitialNumCelular(asesorData.numCelular);
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

    if (formValues.correo !== initialCorreo) {
      const correoDuplicado = await verificarCorreoDuplicado();
      if (correoDuplicado) {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Correo ya existente en el sistema',
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
          title: 'Número de celular ya existente en el sistema',
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

      await axios.put(`http://localhost:3001/asesorInterno/${formValues.asesorInternoID}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedAsesor = { ...formValues, foto: formValues.fotoFile ? URL.createObjectURL(formValues.fotoFile) : formValues.foto };
      setAsesor(updatedAsesor);
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
    setFormValues(asesor);
    setEditing(false);
  };

  const verificarCorreoDuplicado = async () => {
    try {
      const { data } = await axios.post('http://localhost:3001/checkDuplicateEmailExceptCurrent', {
        correo: formValues.correo,
        id: formValues.asesorInternoID,
        userType: 'asesorInterno'
      });
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
      const { data } = await axios.post('http://localhost:3001/checkDuplicatePhoneExceptCurrent', {
        numCelular: formValues.numCelular,
        id: formValues.asesorInternoID,
        userType: 'asesorInterno'
      });
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

  if (!asesor) return <div>Loading...</div>;

  return (
    <div className="perfil-asesorInt-card">
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        {editing ? (
          <>
            <div className="perfil-asesorInt-foto-container">
              <img src={formValues.foto} alt="Foto del Asesor" className="perfil-asesorInt-foto" />
            </div>
            <input type="file" name="foto" onChange={handleChange} className="form-control mb-3" accept=".jpg,.jpeg,.png" />
            <div className="perfil-asesorInt-form">
              <input
                type="text"
                name="nombre"
                value={formValues.nombre}
                onChange={handleChange}
                placeholder="Nombre"
                className="form-control mb-3"
                required
                minlength="3"
                maxLength="30"
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
                type="email"
                name="correo"
                value={formValues.correo}
                onChange={handleChange}
                placeholder="Correo Electrónico"
                className="form-control mb-3"
                maxLength="20"
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
              <div className="perfil-asesorInt-buttons">
                <button className="btn btn-primary me-2" type="submit">Guardar</button>
                <button onClick={handleCancel} className="btn btn-secondary cancel-button" type="button">Cancelar</button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="perfil-asesorInt-foto-container">
              <img src={asesor.foto} alt="Foto del Asesor" className="perfil-asesorInt-foto" />
            </div>
            <div className="perfil-asesorInt-info">
              <h2>{`${asesor.nombre} ${asesor.apellidoPaterno} ${asesor.apellidoMaterno}`}</h2>
              <div className="perfil-asesorInt-info-correo">
                <div>
                  <p><strong>Correo Electrónico:</strong></p>
                  <p>{asesor.correo}</p>
                </div>
                <div className="perfil-asesorInt-celular">
                  <p><strong>Número Celular:</strong></p>
                  <p>{asesor.numCelular}</p>
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

export default PerfilAsesorInterno;
