"use client"
import Link from "next/link"

export default function Page(){
  return(
    <div className='bg-red-500'>
    <h1 className="">Home</h1>
      <Link href="/register">Go to register page</Link> <br/>
      <Link href="/login">Go to login page</Link> <br/>
      <Link href="/password/reset">Go to password</Link>
    </div>
    )
}