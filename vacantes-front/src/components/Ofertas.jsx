import React from 'react'
import Titulo from './common/Titulo'
import VacantesPublicas from './VacantesPublicas'

const Ofertas = () => {
  return (
    <>
    <div className="mt-5 mb-5">
    <Titulo titulo='Ofertas disponibles'/>
    </div>
    <VacantesPublicas />
    </>
  )
}

export default Ofertas