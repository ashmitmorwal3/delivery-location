import React from 'react'
import  React,{ useState } from 'react';

const {name,setname}=useState('');

function search() {
 function change(e){
    
    setname=e.target.value

 }


  return (
   <>
   
   <input type='text' value={name} onChange={change}/>
   </>
  )
}

export default search