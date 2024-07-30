"use client"
import Script from "next/script"

export default function Eruda(){
  return (
    <div>
      <Script
      src="//cdn.jsdelivr.net/npm/eruda"
      onLoad={()=>{eruda.init()}}
      />
    </div>
    )
}