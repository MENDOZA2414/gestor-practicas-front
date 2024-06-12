import PropTypes from 'prop-types';

const Titulo = ({ titulo }) => {
  return (
    <h1 className='text-center'>{titulo}</h1>
  );
}

Titulo.propTypes = {
  titulo: PropTypes.string.isRequired
};

export default Titulo;
