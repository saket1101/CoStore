const {createTransport} = require("nodemailer")


module.exports.EmailSend = async(to,subject,text)=>{
    const transporter = createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })

    await transporter.sendMail({
        to,subject,text,from:"saketjha1101@gmail.com"
    })
}
