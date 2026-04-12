import nodemailer from 'nodemailer';



const sendMail = (to,subject,text)=>{
    const transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    })
    const mailOptions = {
        from:process.env.EMAIL_USER,
        to,
        subject,
        text
    }
    transporter.sendMail(mailOptions,(error,info)=>{
        if(error){
            console.log("Failed to send mail",error);
            return 0;
        }
        else{
            console.log("Mail sent",info);
            return 1;
        }

    })
}
export default sendMail;