import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Navigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { FaEye, FaEyeSlash, FaUser } from 'react-icons/fa';
import './Registrar.css';

const RegistrarAsesorExterno = () => {
    const [fotoPerfil, setFotoPerfil] = useState(null);
    const [fotoPerfilUrl, setFotoPerfilUrl] = useState(null);
    const [nombre, setNombre] = useState('');
    const [apellidoPaterno, setApellidoPaterno] = useState('');
    const [apellidoMaterno, setApellidoMaterno] = useState('');
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [numCelular, setNumCelular] = useState('');
    const [entidadID, setEntidadID] = useState('');
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [goLogin, setGoLogin] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [step, setStep] = useState(1);
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Obtener la entidad ID del usuario logueado
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setEntidadID(storedUser.id);
        }
    }, []);

    const prevFoto = async (e) => {
        e.preventDefault();

        const file = e.target.files[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Solo se permiten archivos JPG, JPEG y PNG',
                showConfirmButton: false,
                timer: 1500
            });
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'El tamaño máximo de la foto es 50 MB',
                showConfirmButton: false,
                timer: 1500
            });
            return;
        }

        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 500,
            useWebWorker: true
        };

        try {
            const compressedFile = await imageCompression(file, options);
            const lector = new FileReader();
            lector.readAsDataURL(compressedFile);
            lector.onload = () => {
                setFotoPerfilUrl(lector.result);
                setFotoPerfil(compressedFile);
            };
        } catch (error) {
            console.error('Error al comprimir la imagen:', error);
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Error al comprimir la imagen',
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

    const limpiarCampos = () => {
        setNombre('');
        setApellidoPaterno('');
        setApellidoMaterno('');
        setCorreo('');
        setPassword('');
        setPasswordConfirm('');
        setNumCelular('');
        setFotoPerfil(null);
        setFotoPerfilUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };

    const verificarCorreoDuplicado = async () => {
        try {
            const { data } = await axios.post('https://gestor-practicas-back-production.up.railway.app/checkDuplicateEmail', { correo });
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
            const { data } = await axios.post('https://gestor-practicas-back-production.up.railway.app/checkDuplicatePhone', { numCelular });
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

    const validarFormulario = () => {
        if (!fotoPerfil) {
            setError(true);
            setErrorMessage('Debe subir una foto de perfil');
            return false;
        }

        if (password !== passwordConfirm) {
            setError(true);
            setErrorMessage('Las contraseñas no coinciden');
            return false;
        }

        const passwordRegex = /^(?!.*(\d)\1{2})(?=.*[A-Z]).{8,}$/;
        if (!passwordRegex.test(password)) {
            setError(true);
            setErrorMessage('La contraseña debe tener al menos 8 caracteres, una mayúscula y no debe tener números consecutivos');
            return false;
        }

        const celularRegex = /^\d{10}$/;
        if (!celularRegex.test(numCelular)) {
            setError(true);
            setErrorMessage('Número de celular inválido o menor a 10 dígitos');
            return false;
        }

        return true;
    };

    const registro = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) {
            return;
        }

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

        try {
            const formData = new FormData();
            formData.append('nombre', nombre);
            formData.append('apellidoPaterno', apellidoPaterno);
            formData.append('apellidoMaterno', apellidoMaterno);
            formData.append('correo', correo);
            formData.append('password', password);
            formData.append('numCelular', numCelular);
            formData.append('entidadID', entidadID); // Se incluye el ID de la entidad obtenida
            formData.append('fotoPerfil', fotoPerfil);

            const { data } = await axios.post(`https://gestor-practicas-back-production.up.railway.app/register/asesorExterno`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            Swal.fire({
                position: 'center',
                icon: 'success',
                title: data.message,
                showConfirmButton: false,
                timer: 1500
            });

            setGoLogin(true);
        } catch (err) {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: err.message,
                showConfirmButton: false,
                timer: 1500
            });
        }
        limpiarCampos();
    };

    if (goLogin) {
        return <Navigate to="/inicioEntidad/AsesorExterno" />;
    }

    const handleNumericInput = (e, setter, maxLength) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= maxLength) {
            setter(value);
        }
    };

    return (
        <>
            <form onSubmit={registro} style={{ maxWidth: '500px', margin: 'auto' }}>
                <div className="card border mb-3">
                    <div className="card-body">
                        <h5 className="card-title text-center titulo-ingresar-datos">Registro de Asesor Externo</h5>
                        <div className="mb-3 text-center">
                            {fotoPerfilUrl ? (
                                <img id="foto" className="icono-usuario" src={fotoPerfilUrl} alt="User Icon" width={100}/>
                            ) : (
                                <FaUser id="foto" className="icono-usuario" size={130} />
                            )}
                        </div>
                        {step === 1 && (
                            <>
                                <div className="mb-3">
                                    <label className="form-label">Foto del Asesor</label>
                                    <input ref={fileInputRef} type="file" className="form-control" accept=".jpg,.jpeg,.png" onChange={prevFoto} required={fotoPerfil === null} />
                                    <small className="form-text text-muted">
                                        Tamaño permitido: 50 MB. Tipos válidos: JPG, JPEG, PNG.
                                    </small>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Nombre</label>
                                    <input type="text" className="form-control" onChange={(e) => setNombre(e.target.value)} value={nombre} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Apellido Paterno</label>
                                    <input type="text" className="form-control" onChange={(e) => setApellidoPaterno(e.target.value)} value={apellidoPaterno} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Apellido Materno</label>
                                    <input type="text" className="form-control" onChange={(e) => setApellidoMaterno(e.target.value)} value={apellidoMaterno} required />
                                </div>
                            </>
                        )}
                        {step === 2 && (
                            <>
                                <div className="mb-3">
                                    <label className="form-label">Correo Electrónico</label>
                                    <input type="email" className="form-control" onChange={(e) => setCorreo(e.target.value)} value={correo} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Contraseña</label>
                                    <div className="input-group">
                                        <input type={showPassword ? "text" : "password"} className="form-control" pattern="^(?!.*(\d)\1{2})(?=.*[A-Z]).{8,}$" required onChange={(e) => setPassword(e.target.value)} value={password} />
                                        <span className="input-group-text" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </span>
                                    </div>
                                    <small className="form-text text-muted">
                                        La contraseña debe tener al menos 8 caracteres, una mayúscula y no debe tener números consecutivos.
                                    </small>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Confirmar Contraseña</label>
                                    <div className="input-group">
                                        <input type={showPasswordConfirm ? "text" : "password"} className="form-control" pattern="^(?!.*(\d)\1{2})(?=.*[A-Z]).{8,}$" required onChange={(e) => setPasswordConfirm(e.target.value)} value={passwordConfirm} />
                                        <span className="input-group-text" onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}>
                                            {showPasswordConfirm ? <FaEyeSlash /> : <FaEye />}
                                        </span>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Número Celular</label>
                                    <input 
                                        type="tel" 
                                        className="form-control" 
                                        onChange={(e) => handleNumericInput(e, setNumCelular, 10)} 
                                        value={numCelular} 
                                        required 
                                        pattern="\d{10}" 
                                        title="El número de celular debe tener 10 dígitos" 
                                    />
                                    <small className="form-text text-muted">
                                        Número de celular debe tener 10 dígitos.
                                    </small>
                                </div>
                            </>
                        )}
                        <div className="d-grid gap-2 d-md-flex justify-content-md-end mb-3">
                            {step > 1 && <button type="button" className="btn btn-secondary" onClick={() => setStep(step - 1)}>Anterior</button>}
                            {step < 2 && <button type="button" className="btn btn-primary" onClick={() => {
                                const form = document.querySelector('form');
                                
                                if (!form.checkValidity()) {
                                    form.reportValidity();
                                } else {
                                    setStep(step + 1);
                                }
                            }}>
                                Siguiente
                            </button>}
                            {step === 2 && <button className="btn btn-success me-md-2" type="submit">Registrar Asesor</button>}
                            <button onClick={() => { limpiarCampos(); setStep(1); }} className="btn btn btn-danger" type="button">Cancelar</button>
                        </div>

                        {error && <div className="alert alert-danger mt-3">{errorMessage}</div>}
                    </div>
                </div>
            </form>
        </>
    );
};

export default RegistrarAsesorExterno;
