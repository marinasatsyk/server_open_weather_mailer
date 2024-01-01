import nodemailer from 'nodemailer';

const {SMTP_HOST, SMTP_PORT_TLS, SMTP_USER, SMTP_APP_PASSWORD} =  process.env

class MailService{
    constructor(){
        this.transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT_TLS,
            secure: false,
            auth: {
                user: SMTP_USER,
                pass: SMTP_APP_PASSWORD
            }
        })
    }
    
    async sendActivationMail (to, link) {
        await this.transporter.sendMail({
            from: SMTP_USER,
            to,
            subject: `Account activation to OpenWeatherApp`,
            text: '',
            html:
            `
            <div>
                <div>Hello, this is a  test of application for a student project</div>
                <div>If I accidentally sent you this email I'm apologize for  your concern.</div>
                <div>Happy New Year, have a nice day</div>
                
                <div>Hello ${to}</div>
                <div>For activation  your account click here</div>
                <a href='${link}'>Activate my account Open Weather App</a>
                <div>If you didn't request this, please ignore this email.</div>

            </div>
            `
        })
    }

    async sendResetPasswordMail (to, link) {

        await this.transporter.sendMail({
            from: SMTP_USER,
            to,
            subject: `Password change request recieved to OpenWeatherApp`,
            text: '',
            html:
            `
            <div>
                <div>Hello, this is a  test of application for a student project</div>
                <div>If I accidentally sent you this email I'm apologize for  your concern.</div>
                <div>Happy New Year, have a nice day</div>

                <div>Hello ${to}</div>
                <div>Someone has requested a link to change your password. You can do this through the link below.</div>
                <div>This link is valid for 10 minutes</div>
                <a href='${link}'>Reset my password</a>
                <div>If you didn't request this, please ignore this email.</div>
                <div>Your password won't change until you access the link above and create a new one.</div>
            </div>
            `
        })
    }

}

export default MailService;




