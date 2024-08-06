import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import Db from '@/utils/db'
import Response from '@/models/response'
import User from '@/models/user'
import Quiz from '@/models/quiz'

export async function GET(req) {
  await Db()
  const url = new URL(req.url)
  const quizid = url.searchParams.get('id')

  let responseDets = await Response.find({ quizid })

  if (!responseDets || responseDets.length === 0) {
    return NextResponse.json({
      message: 'No responses'
    }, {
      status: 403
    })
  }

  const responsesWithUserDetails = await Promise.all(
    responseDets.map(async (response) => {
      if (response.userid) {
        const userDets = await User.findById(response.userid).select('-password')
        if (userDets) {
          return {
            ...response._doc,
            username: userDets.name
          }
        }
      }
      return response
    })
  )

  return NextResponse.json({
    message: 'Working',
    data: {
      quizid,
      responses: responsesWithUserDetails
    }
  }, {
    status: 200
  })
}