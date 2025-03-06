import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './perfilEntidadRec.css';
import imageCompression from 'browser-image-compression';

const PerfilEntidadReceptora = ({ user, setUser }) => {
    const [entidad, setEntidad] = useState(null);
    const [editing, setEditing] = useState(false);
    const [initialCorreo, setInitialCorreo] = useState('');
    const [initialNumCelular, setInitialNumCelular] = useState('');
    const [formValues, setFormValues] = useState({
        foto: '',
        nombreEntidad: '',
        nombreUsuario: '',
        direccion: '',
        categoria: '',
        correo: '',
        numCelular: '',
        fotoFile: null,
    });

    const defaultImage = 'ruta/a/imagen/predeterminada.png'; // Cambia esta ruta por la de tu imagen predeterminada

    useEffect(() => {
        const fetchData = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                const entidadId = storedUser ? storedUser.id : null;

                if (!entidadId) {
                    throw new Error('No se encontró el ID de la entidad logueada');
                }

                const response = await axios.get(`https://gestor-practicas-back.onrender.com/entidadReceptora/${entidadId}`);
                const entidadData = response.data;
                entidadData.foto = entidadData.fotoPerfil ? `data:image/jpeg;base64,${entidadData.fotoPerfil}` : defaultImage;

                setEntidad(entidadData);
                setFormValues({
                    ...entidadData,
                    categoria: entidadData.categoria || '',  // Asegúrate de que la categoría se establezca aquí
                });
                setInitialCorreo(entidadData.correo);
                setInitialNumCelular(entidadData.numCelular);

                // Agregar console.log para depuración
                console.log('Datos de la entidad:', entidadData);
                console.log('Categoría obtenida:', entidadData.categoria);
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

        if (name === 'nombreEntidad' || name === 'nombreUsuario') {
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

            await axios.put(`https://gestor-practicas-back.onrender.com/entidadReceptora/${formValues.entidadID}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const updatedEntidad = { ...formValues, foto: formValues.fotoFile ? URL.createObjectURL(formValues.fotoFile) : formValues.foto };
            setEntidad(updatedEntidad);
            setEditing(false);

            // Actualiza el estado del usuario en el componente de inicio
            const updatedUser = {
                username: `${formValues.nombreEntidad}`,
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
        setFormValues(entidad);
        setEditing(false);
    };

    const verificarCorreoDuplicado = async () => {
        try {
            const { data } = await axios.post('https://gestor-practicas-back.onrender.com/checkDuplicateEmailExceptCurrent', {
                correo: formValues.correo,
                id: formValues.entidadID,
                userType: 'entidadReceptora'
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
            const { data } = await axios.post('https://gestor-practicas-back.onrender.com/checkDuplicatePhoneExceptCurrent', {
                numCelular: formValues.numCelular,
                id: formValues.entidadID,
                userType: 'entidadReceptora'
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

    if (!entidad) return <div>Loading...</div>;

    return (
        <div className="perfil-entidad-rec-card">
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                {editing ? (
                    <>
                        <div className="perfil-entidad-rec-foto-container">
                            <img src={formValues.foto} alt="Foto de la Entidad" className="perfil-entidad-rec-foto" />
                        </div>
                        <input type="file" name="foto" onChange={handleChange} className="form-control mb-3" accept=".jpg,.jpeg,.png" />
                        <div className="perfil-entidad-rec-form">
                            <input
                                type="text"
                                name="nombreEntidad"
                                value={formValues.nombreEntidad}
                                onChange={handleChange}
                                placeholder="Nombre de la Entidad"
                                className="form-control mb-3"
                                required
                                minLength="3"
                                maxLength="30"
                                pattern="[A-Za-zÀ-ÿ\s]+"
                                title="El nombre de la entidad debe tener al menos 3 caracteres y solo puede contener letras"
                            />
                            <input
                                type="text"
                                name="nombreUsuario"
                                value={formValues.nombreUsuario}
                                onChange={handleChange}
                                placeholder="Nombre de Usuario"
                                className="form-control mb-3"
                                required
                                minLength="3"
                                maxLength="20"
                                pattern="[A-Za-zÀ-ÿ\s]+"
                                title="El nombre de usuario debe tener al menos 3 caracteres y solo puede contener letras"
                            />
                            <input
                                type="text"
                                name="direccion"
                                value={formValues.direccion}
                                onChange={handleChange}
                                placeholder="Dirección"
                                className="form-control mb-3"
                                required
                                minLength="10"
                                maxLength="50"
                                title="La dirección debe tener entre 10 y 200 caracteres"
                            />

                            <select
                                name="categoria"
                                value={formValues.categoria}
                                onChange={handleChange}
                                className="form-control mb-3"
                                required
                            >
                                <option value="">Selecciona una categoría</option>
                                <option value="Privada">Privada</option>
                                <option value="Pública">Pública</option>
                                <option value="Académica">Académica</option>
                            </select>
                            <input
                                type="email"
                                name="correo"
                                value={formValues.correo}
                                onChange={handleChange}
                                placeholder="Correo Electrónico"
                                className="form-control mb-3"
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
                            <div className="perfil-entidad-rec-buttons">
                                <button className="btn btn-primary me-2" type="submit">Guardar</button>
                                <button onClick={handleCancel} className="btn btn-secondary cancel-button" type="button">Cancelar</button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="perfil-entidad-rec-foto-container">
                            <img src={entidad.foto} alt="Foto de la Entidad" className="perfil-entidad-rec-foto" />
                        </div>
                        <div className="perfil-entidad-rec-info">
                            <h2>{entidad.nombreEntidad}</h2>
                            <div className="perfil-entidad-rec-info-grid">
                                <div>
                                    <p><strong>Nombre de Usuario:</strong></p>
                                    <p>{entidad.nombreUsuario}</p>
                                </div>
                                <div>
                                    <p><strong>Dirección:</strong></p>
                                    <p>{entidad.direccion}</p>
                                </div>
                                <div>
                                    <p><strong>Categoría:</strong></p>
                                    <p>{entidad.categoria}</p>
                                </div>
                                <div>
                                    <p><strong>Correo Electrónico:</strong></p>
                                    <p>{entidad.correo}</p>
                                </div>
                                <div className="perfil-entidad-rec-celular">
                                    <p><strong>Número Celular:</strong></p>
                                    <p>{entidad.numCelular}</p>
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

export default PerfilEntidadReceptora;
