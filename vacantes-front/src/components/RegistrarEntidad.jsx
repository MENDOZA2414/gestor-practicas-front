import React, { useState, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Navigate, useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { FaEye, FaEyeSlash, FaUser } from 'react-icons/fa';
import './Registrar.css';

const RegistrarEntidad = () => {
    const [fotoPerfil, setFotoPerfil] = useState(null);
    const [fotoPerfilUrl, setFotoPerfilUrl] = useState(null);
    const [nombreEntidad, setNombreEntidad] = useState('');
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [direccion, setDireccion] = useState('');
    const [categoria, setCategoria] = useState('');
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [numCelular, setNumCelular] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [goLogin, setGoLogin] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [step, setStep] = useState(1);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const prevLogo = async (e) => {
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
        setNombreEntidad('');
        setNombreUsuario('');
        setDireccion('');
        setCategoria('');
        setCorreo('');
        setPassword('');
        setPasswordConfirm('');
        setNumCelular('');
        setFotoPerfil(null);
        setFotoPerfilUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
        document.querySelectorAll('input[name="categoria"]').forEach(input => input.checked = false);
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

    const validarPrimeraTarjeta = () => {
        const categoriaInputs = document.querySelectorAll('input[name="categoria"]');
        let categoriaSeleccionada = false;

        categoriaInputs.forEach(input => {
            if (input.checked) {
                categoriaSeleccionada = true;
            }
        });

        if (!fotoPerfil) {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Debe subir una foto de perfil',
                showConfirmButton: false,
                timer: 1500
            });
            return false;
        }

        if (!categoriaSeleccionada) {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Debe seleccionar una categoría',
                showConfirmButton: false,
                timer: 1500
            });
            return false;
        }

        return true;
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

        setLoading(true);

        const correoDuplicado = await verificarCorreoDuplicado();
        if (correoDuplicado) {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Correo ya existente',
                showConfirmButton: false,
                timer: 1500
            });
            setLoading(false);
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
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('fotoPerfil', fotoPerfil);
            formData.append('nombreEntidad', nombreEntidad);
            formData.append('nombreUsuario', nombreUsuario);
            formData.append('direccion', direccion);
            formData.append('categoria', categoria);
            formData.append('correo', correo);
            formData.append('password', password);
            formData.append('numCelular', numCelular);

            const { data } = await axios.post('https://gestor-practicas-back-production.up.railway.app/register/entidadReceptora', formData, {
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
        setLoading(false);
    };

    const handleNumericInput = (e, setter, maxLength) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= maxLength) {
            setter(value);
        }
    };

    if (goLogin) {
        return <Navigate to="/login" />;
    }

    return (
        <>
            <form onSubmit={registro} style={{ maxWidth: '500px', margin: 'auto' }}>
                <div className="card border mb-3">
                    <div className="card-body">
                        <h5 className="card-title text-center titulo-ingresar-datos">Registro de empresas</h5>
                        <div className="mb-3 text-center">
                            {fotoPerfilUrl ? (
                                <img id="logo" className="icono-usuario" src={fotoPerfilUrl} alt="User Icon" width={100}/>
                            ) : (
                                <FaUser id="logo" className="icono-usuario" size={130} />
                            )}
                        </div>
                        {step === 1 && (
                            <>
                                <div className="mb-3">
                                    <label className="form-label">Foto de perfil</label>
                                    <input ref={fileInputRef} type="file" className="form-control" accept=".jpg,.jpeg,.png" onChange={prevLogo} required={fotoPerfil === null} />
                                    <small className="form-text text-muted">
                                        Tamaño permitido: 50 MB. Tipos válidos: JPG, JPEG, PNG.
                                    </small>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Nombre de la empresa</label>
                                    <input type="text" className="form-control" minLength="3" required onChange={(e) => setNombreEntidad(e.target.value)} value={nombreEntidad} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Nombre del usuario</label>
                                    <input type="text" className="form-control" minLength="3" required onChange={(e) => setNombreUsuario(e.target.value)} value={nombreUsuario} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Dirección</label>
                                    <input type="text" className="form-control" minLength="3" required onChange={(e) => setDireccion(e.target.value)} value={direccion} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Categoría</label>
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="categoria" id="categoria1" value="Privada" onChange={(e) => setCategoria(e.target.value)} checked={categoria === "Privada"} required />
                                        <label className="form-check-label" htmlFor="categoria1">Privada</label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="categoria" id="categoria2" value="Pública" onChange={(e) => setCategoria(e.target.value)} checked={categoria === "Pública"} />
                                        <label className="form-check-label" htmlFor="categoria2">Pública</label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="categoria" id="categoria3" value="Académica" onChange={(e) => setCategoria(e.target.value)} checked={categoria === "Académica"} />
                                        <label className="form-check-label" htmlFor="categoria3">Académica</label>
                                    </div>
                                </div>
                            </>
                        )}
                        {step === 2 && (
                            <>
                                <div className="mb-3">
                                    <label className="form-label">Correo</label>
                                    <input type="email" className="form-control" minLength="3" required onChange={(e) => setCorreo(e.target.value)} value={correo} />
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
                                    <input type="tel" className="form-control" pattern="^\d{10}$" onChange={(e) => handleNumericInput(e, setNumCelular, 10)} value={numCelular} required title="El número de celular debe tener 10 dígitos" />
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
                                const categoriaInputs = document.querySelectorAll('input[name="categoria"]');
                                let categoriaSelected = false;
                                categoriaInputs.forEach(input => {
                                    if (input.checked) {
                                        categoriaSelected = true;
                                    }
                                });

                                // Forzar la validación del formulario
                                if (!form.checkValidity()) {
                                    form.reportValidity();
                                } else if (!categoriaSelected) {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Oops...',
                                        text: 'Por favor selecciona una categoría.',
                                    });
                                } else {
                                    setStep(step + 1);
                                }
                            }}>
                                Siguiente
                            </button>}
                            {step === 2 && <button className="btn btn-success me-md-2" type="submit">Crear cuenta empresa</button>}
                            {step === 1 && <button onClick={() => { navigate('/preRegistro'); limpiarCampos(); setStep(1); }} className="btn btn btn-danger" type="button">Cancelar</button>}
                            {step > 1 && <button onClick={() => { limpiarCampos(); setStep(1); }} className="btn btn btn-danger" type="button">Cancelar</button>}
                        </div>

                        {error && <Error mensaje={errorMessage} />}
                    </div>
                </div>
            </form>
        </>
    );
};

export default RegistrarEntidad;
