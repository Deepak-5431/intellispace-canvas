"use client"


import { useEffect } from 'react';
import axios from 'axios';

export default function Home() {

useEffect(()=>{
  axios.get('http://localhost:5000/')
  .then((response)=>{
    console.log(response.data)
  });
},[])
  return (
    <>
     empty for now
    </>
  );
}
