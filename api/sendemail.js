import nodemailer from "nodemailer"
import mongoose from "mongoose"

let isConnected = false

async function connectDB() {

  if (isConnected) return

  await mongoose.connect(
    "mongodb+srv://krishnaapranav576:Pranav%402026@cluster0.absqqdo.mongodb.net/passkey"
  )

  isConnected = true
}

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).send("Only POST")
  }

  await connectDB()

  const credential = mongoose.model(
    "credential",
    {},
    "bulkmail"
  )

  const data = await credential.find()

  const user = data[0].user
  const pass = data[0].pass

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  })

  const { subject, msg, emailList } = req.body

  for (let i = 0; i < emailList.length; i++) {

    await transporter.sendMail({
      from: user,
      to: emailList[i],
      subject,
      text: msg,
    })

  }

  res.status(200).json(true)
}