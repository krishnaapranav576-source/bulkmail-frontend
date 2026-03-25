import nodemailer from "nodemailer";
import mongoose from "mongoose";

const MONGO =
  "mongodb+srv://krishnaapranav576:Pranav%402026@cluster0.absqqdo.mongodb.net/passkey";

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  await mongoose.connect(MONGO);
  isConnected = true;
}

const credentialSchema = new mongoose.Schema({}, { strict: false });

const mailSchema = new mongoose.Schema({
  subject: String,
  body: String,
  emails: [String],
  status: String,
  date: { type: Date, default: Date.now },
});

const Credential =
  mongoose.models.credential ||
  mongoose.model("credential", credentialSchema, "bulkmail");

const Mail =
  mongoose.models.mail ||
  mongoose.model("mail", mailSchema);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Only POST");
  }

  try {
    await connectDB();

    const { subject, msg, emailList } = req.body;

    const data = await Credential.find();

    if (!data.length) {
      return res.status(500).send("No credential");
    }

    const user = data[0].user;
    const pass = data[0].pass;

    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user,
        pass,
      },
    });

    for (let email of emailList) {
      await transporter.sendMail({
        from: user,
        to: email,
        subject,
        text: msg,
      });
    }

    await Mail.create({
      subject,
      body: msg,
      emails: emailList,
      status: "sent",
    });

    res.status(200).json(true);
  } catch (err) {
    console.log(err);
    res.status(500).json(false);
  }
}