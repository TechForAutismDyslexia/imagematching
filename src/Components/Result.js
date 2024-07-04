import React from 'react'
import './Result.css'
export default function Result({tries,timer}) {
  return (
    <div className='main container mt-5 flex justify-content-center align-items-center'>
        <h1>Result Page</h1>
        <p>The number of tries : {localStorage.getItem('tries')}</p>
        <p>The time taken : {(localStorage.getItem('timer')/1000)} seconds</p>
    </div>
  )
}
