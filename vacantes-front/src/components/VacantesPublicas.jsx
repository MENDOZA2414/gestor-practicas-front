import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const VacantesPublicas = () => {
  const [vacantes, setVacantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [titulo, setTitulo] = useState("");

  // aplicante
  const [dni, setDni] = useState("");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [foto, setFoto] = useState("");
  const [job_id, setJob_id] = useState(0);
  const [persons_id, setPersons_id] = useState(0);
  const [salary, setSalary] = useState(0);

  const limpiarCampos = () => {
    setDni("");
    setCorreo("");
    setNombre("");
    setFoto("");
    setJob_id(0);
    setPersons_id(0);
    setSalary(0);
  };

  const aplicar = async (e) => {
    e.preventDefault();

    let persona = { dni, name: nombre, email: correo, img: foto };
    // validar
    if ([dni, nombre, correo, foto].includes("")) {
      setError(true);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Debe llenar todos los campos",
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    } else setError(false);

    setLoading(true);
    try {
      const { data } = await axios.post(`http://localhost:3001/persons`, persona);
      let idPersona;
      try {
        idPersona = await data.data.insertId;
      } catch (errooo) {
        idPersona = await data.person_id;
      }
      const respuesta = await axios.post(`http://localhost:3001/apply`, {
        job_id,
        persons_id: idPersona,
        salary,
      });

      Swal.fire({
        position: "center",
        icon: "success",
        title: respuesta.data.message,
        showConfirmButton: false,
        timer: 1500,
      });
      limpiarCampos();
    } catch (err) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: err.message.includes("400") ? "Ya aplico a esta vacante" : err.message,
        showConfirmButton: false,
        timer: 1500,
      });
    }
    setLoading(false);
    limpiarCampos();
  };

  const getVacantes = async () => {
    try {
      const { data } = await axios.get(`http://localhost:3001/job/all/1/5`);
      setVacantes(data);
    } catch (err) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: err.message.includes("401") ? "Datos incorrectos" : err.message,
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  const readImg = async (e) => {
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      setFoto(reader.result);
    };
  };

  const limpiarFoto = () => {
    setFoto("");
  };

  useEffect(() => {
    getVacantes();
  }, []);

  return (
    <>
      <div className="row">
        <div className="col-md-10 mx-auto">
          {vacantes.map((item) => {
            return (
              <div className="card my-2" key={item.job_id}>
                <div className="card-body d-flex flex-row">
                  <div className="flex-grow-1">
                    <h5 className="card-title">{item.title}</h5>
                    <p className="card-text">
                      <img src={`data:image/png;base64,${item.logo}`} width={24} alt="logo" />{" "}
                      {item.company} Ubicación: {item.city} ({item.job_type})
                      <br />
                      <span className="text-secondary">
                        <strong>Experiencia</strong>: {item.experience} años
                      </span>
                      <br />
                      <span className="text-secondary">
                        <strong>Oferta cierra en</strong>: {item.dias} días
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setJob_id(item.job_id);
                      setTitulo(item.title);
                    }}
                    className="btn btn-success my-auto btn-lg"
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModal"
                    data-bs-whatever="@mdo"
                  >
                    Aplicar a vacante
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="modal fade"
        id="exampleModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">
                Aplicar a la vacante <span className="text-success">{titulo}</span>
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form>
                {foto && (
                  <div className="mb-3">
                    <img src={foto} height={100} alt="foto" />
                    <button
                      title="Quitar foto"
                      type="button"
                      onClick={limpiarFoto}
                      className="btn-close"
                    ></button>
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="recipient-name" className="col-form-label">
                    DNI:
                  </label>
                  <input
                    type="number"
                    value={dni}
                    placeholder="Ingrese su DNI"
                    className="form-control"
                    onChange={(e) => {
                      setDni(e.target.value);
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="recipient-name" className="col-form-label">
                    Nombre completo:
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    placeholder="Ingrese su nombre"
                    className="form-control"
                    onChange={(e) => {
                      setNombre(e.target.value);
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="recipient-name" className="col-form-label">
                    Correo:
                  </label>
                  <input
                    type="email"
                    value={correo}
                    placeholder="Ingrese su correo"
                    className="form-control"
                    onChange={(e) => {
                      setCorreo(e.target.value);
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="recipient-name" className="col-form-label">
                    Salario:
                  </label>
                  <input
                    type="number"
                    value={salary}
                    placeholder="Ingrese el salario esperado"
                    className="form-control"
                    onChange={(e) => {
                      setSalary(e.target.value);
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="message-text" className="col-form-label">
                    Foto:
                  </label>
                  <input type="file" className="form-control" onChange={readImg} />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                data-bs-dismiss="modal"
                onClick={aplicar}
              >
                Aplicar a la vacante
              </button>
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VacantesPublicas;
