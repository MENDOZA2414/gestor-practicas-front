import PropTypes from 'prop-types';

const Error = (props) => {
  return (
    <div className="alert alert-danger" role="alert">
      {props.mensaje || 'Error'}
    </div>
  );
}

Error.propTypes = {
  mensaje: PropTypes.string
};

export default Error;
