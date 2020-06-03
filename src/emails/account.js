const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email , name) => {

    sgMail.send({
        to: email ,
        from: 'viralthaker27@gmail.com' , 
        subject : 'Thanks for joining in!' ,
        text: `Welcome to the app , ${name}`
    })
}

const sendExitEmail = (email , name) => {

    sgMail.send({
        to: email ,
        from: 'viralthaker27@gmail.com' , 
        subject : 'GoodBye!' ,
        text: `Hope we see you again , ${name}`
    })
}

module.exports = {
    sendWelcomeEmail ,
    sendExitEmail
}