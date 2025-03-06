import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Navigate, useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { FaEye, FaEyeSlash, FaUser } from 'react-icons/fa';
import './Registrar.css';

const RegistrarAlumno = () => {
    const [foto, setFoto] = useState(null);
    const [fotoUrl, setFotoUrl] = useState(null);
    const [numeroControl, setNumeroControl] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellidoPaterno, setApellidoPaterno] = useState('');
    const [apellidoMaterno, setApellidoMaterno] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('');
    const [carrera, setCarrera] = useState('');
    const [semestre, setSemestre] = useState('');
    const [turno, setTurno] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [celular, setCelular] = useState('');
    const [asesorInternoID, setAsesorInternoID] = useState('');
    const [asesoresInternos, setAsesoresInternos] = useState([]);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [goLogin, setGoLogin] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [step, setStep] = useState(1);
    const fileInputRef = useRef(null);
    const navigate = useNavigate(); // Hook para navegación

    useEffect(() => {
        const fetchAsesoresInternos = async () => {
            try {
                const { data } = await axios.get('https://gestor-practicas-back.onrender.com/asesoresInternos');
                setAsesoresInternos(data);
            } catch (err) {
                console.error('Error al obtener asesores internos:', err);
            }
        };

        fetchAsesoresInternos();
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
                setFotoUrl(lector.result);
                setFoto(compressedFile);
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
        setNumeroControl('');
        setNombre('');
        setApellidoPaterno('');
        setApellidoMaterno('');
        setFechaNacimiento('');
        setCarrera('');
        setSemestre('');
        setTurno('');
        setEmail('');
        setPassword('');
        setPasswordConfirm('');
        setCelular('');
        setAsesorInternoID('');
        setFoto(null);
        setFotoUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };

    const verificarCorreoDuplicado = async () => {
        try {
            const { data } = await axios.post('https://gestor-practicas-back.onrender.com/checkDuplicateEmail', { correo: email });
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
            const { data } = await axios.post('https://gestor-practicas-back.onrender.com/checkDuplicatePhone', { numCelular: celular });
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
        if (!foto) {
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
        if (!celularRegex.test(celular)) {
            setError(true);
            setErrorMessage('Número de celular inválido o menor a 10 dígitos');
            return false;
        }

        const numeroControlRegex = /^\d{10}$/;
        if (!numeroControlRegex.test(numeroControl)) {
            setError(true);
            setErrorMessage('Número de control inválido o menor a 10 dígitos');
            return false;
        }

        const fechaMinima = new Date();
        fechaMinima.setFullYear(fechaMinima.getFullYear() - 17);
        if (new Date(fechaNacimiento) > fechaMinima) {
            setError(true);
            setErrorMessage('Debe tener al menos 17 años');
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
            formData.append('numeroControl', numeroControl);
            formData.append('nombre', nombre);
            formData.append('apellidoPaterno', apellidoPaterno);
            formData.append('apellidoMaterno', apellidoMaterno);
            formData.append('fechaNacimiento', fechaNacimiento);
            formData.append('carrera', carrera);
            formData.append('semestre', semestre);
            formData.append('turno', turno);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('celular', celular);
            formData.append('asesorInternoID', asesorInternoID);
            formData.append('foto', foto);

            const { data } = await axios.post(`https://gestor-practicas-back.onrender.com/register/alumno`, formData, {
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
        return <Navigate to="/login" />;
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
                        <h5 className="card-title text-center titulo-ingresar-datos">Registro de Alumno</h5>
                        <div className="mb-3 text-center">
                            {fotoUrl ? (
                                <img id="foto" className="icono-usuario" src={fotoUrl} alt="User Icon" width={100}/>
                            ) : (
                                <FaUser id="foto" className="icono-usuario" size={130} />
                            )}
                        </div>
                        {step === 1 && (
                            <>
                                <div className="mb-3">
                                    <label className="form-label">Foto del Alumno</label>
                                    <input ref={fileInputRef} type="file" className="form-control" accept=".jpg,.jpeg,.png" onChange={prevFoto} required={foto === null} />
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
                                <div className="mb-3">
                                    <label className="form-label">Fecha de Nacimiento</label>
                                    <input type="date" className="form-control" onChange={(e) => setFechaNacimiento(e.target.value)} value={fechaNacimiento} required />
                                </div>
                            </>
                        )}
                        {step === 2 && (
                            <>
                                <div className="mb-3">
                                    <label className="form-label">Número de Control</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        onChange={(e) => handleNumericInput(e, setNumeroControl, 10)} 
                                        value={numeroControl} 
                                        required 
                                        pattern="\d{10}" 
                                        title="El número de control debe tener 10 dígitos" 
                                    />
                                    <small className="form-text text-muted">
                                        El número de control debe tener 10 dígitos.
                                    </small>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Carrera</label>
                                    <select className="form-control" onChange={(e) => setCarrera(e.target.value)} value={carrera} required>
                                        <option value="">Seleccione...</option>
                                        <option value="IDS">IDS</option>
                                        <option value="ITC">ITC</option>
                                        <option value="LATI">LATI</option>
                                        <option value="LITI">LITI</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Semestre</label>
                                    <select className="form-control" onChange={(e) => setSemestre(e.target.value)} value={semestre} required>
                                        <option value="">Seleccione...</option>
                                        {Array.from({ length: 9 }, (_, i) => i + 1).map(sem => (
                                            <option key={sem} value={sem}>{sem}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Turno</label>
                                    <select className="form-control" onChange={(e) => setTurno(e.target.value)} value={turno} required>
                                        <option value="">Seleccione...</option>
                                        <option value="TM">TM</option>
                                        <option value="TV">TV</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Asesor Interno</label>
                                    <select className="form-control" onChange={(e) => setAsesorInternoID(e.target.value)} value={asesorInternoID} required>
                                        <option value="">Seleccione...</option>
                                        {asesoresInternos.map(asesor => (
                                            <option key={asesor.asesorInternoID} value={asesor.asesorInternoID}>
                                                {asesor.nombreCompleto}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}
                        {step === 3 && (
                            <>
                                <div className="mb-3">
                                    <label className="form-label">Correo Electrónico</label>
                                    <input type="email" className="form-control" onChange={(e) => setEmail(e.target.value)} value={email} required />
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
                                        onChange={(e) => handleNumericInput(e, setCelular, 10)} 
                                        value={celular} 
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
                            {step < 3 && <button type="button" className="btn btn-primary" onClick={() => {
                                const form = document.querySelector('form');
                                
                                if (!form.checkValidity()) {
                                    form.reportValidity();
                                } else {
                                    setStep(step + 1);
                                }
                            }}>
                                Siguiente
                            </button>}
                            {step === 3 && <button className="btn btn-success me-md-2" type="submit">Registrar Alumno</button>}
                            {step === 1 && <button onClick={() => { navigate('/preRegistro'); limpiarCampos(); setStep(1); }} className="btn btn btn-danger" type="button">Cancelar</button>}
                            {step > 1 && <button onClick={() => { limpiarCampos(); setStep(1); }} className="btn btn btn-danger" type="button">Cancelar</button>}
                        </div>
    
                        {error && <div className="alert alert-danger mt-3">{errorMessage}</div>}
                    </div>
                </div>
            </form>
        </>
    );
};

export default RegistrarAlumno;
