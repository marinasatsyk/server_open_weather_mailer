import nodemailer from 'nodemailer';

const {SMTP_HOST, SMTP_PORT_TLS, SMTP_USER, SMTP_APP_PASSWORD, API_URL} =  process.env

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
            subject: `Account activation to ${API_URL}`,
            text: '',
            html:
            `
            <div>
                <h1>For activation  your account click here</h1>
                <a href='${link}'>${link}</a>
            </div>
            `
        })
    }

}

export default MailService;




