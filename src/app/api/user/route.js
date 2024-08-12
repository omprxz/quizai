import Db from "@/utils/db"
import User from "@/models/user"
import jwt from "jsonwebtoken"
import { cookies } from 'next/headers';
import { NextResponse } from "next/server"

export async function POST(req){
  const cookiesStore = cookies()
  const {
    name, email
  } = await req.json()
  
  if(!name && !email){
    return NextResponse.json({
      message: "Atleast one field required to change"
    }, {
      status: 401
      })
  }
  
  
  const token = cookiesStore.get("token")?.value
  if(!token){
    return NextResponse.json({
      message: 'No user logged in'
    }, {
      status: 403
      })
  }
  let userDetails
  try{
    userDetails = jwt.verify(token, process.env.JWT_SECRET)
  }catch (e){
    if(e.name === "TokenExpiredError"){
      return NextResponse.json({
          message: "Token expired, login again"
        },
        {
          status: 401
        })
    }else{
      return NextResponse.json({
          message: "AUTH ERR: "+e.message
        },
        {
          status: 500
        })
    }
  }
  
  const curUserDetails = await User.findById(userDetails?.data?._id)
  
  const updateUser = await User.updateOne({
  _id: userDetails?.data?._id
}, {
  $set: {
    name: name ? name : curUserDetails?.data?.name,
    email: email ? email : curUserDetails?.data?.email
  }
});

    
  if(!updateUser){
    return NextResponse.json({
      message: "Something wemt wron"
    }, {
      status: 401
      })
  }
  if(updateUser.modifiedCount == 0){
    return NextResponse.json({
      message: "Nothing changed"
    }, {
      status: 200
      })
  }
  
  const updatedDetails = await User.findById(userDetails?.data?._id)
  
  const updatedToken = jwt.sign({
    data: updatedDetails
  }, process.env.JWT_SECRET, {
    expiresIn: '10d'
  })
  
  return NextResponse.json({
    message: "Profile updated",
    token: updatedToken
  },{
    status: 200
    })
  
}

export async function GET(req) {
  await Db();
  
  const token = cookies().get('token')?.value;

  if (!token) {
    return NextResponse.json({
      message: "Unauthorised user"
    }, {
      status: 400
    });
  }

  try {
    const userDetails = jwt.verify(token, process.env.JWT_SECRET);
    const userData = await User.findById(userDetails?.data?._id).select("name email createdAt image");

    return NextResponse.json({
      message: "User data fetched",
      data: userData, 
      success: true
    }, {
      status: 200
    });
  } catch (e) {
    return NextResponse.json({
      message: 'Invalid token'
    }, {
      status: 401
    });
  }
}