const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv').config();
const crypto = require('crypto');



const app = express();
app.use(express.static('assets'));
app.use(express.static('static'))

// Configuración de middleware mailer
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());
// Configuración de archivos estáticos

// Configuración del transportador de correos
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASS
    }
});



// Ruta para el index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
app.use('/screenshots', express.static(path.join(__dirname, 'screenshots')));

app.get('/preview', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).send('Se requiere una URL.');
    }

    const outputDir = path.join(__dirname, 'screenshots');
    const hash = crypto.createHash('md5').update(url).digest('hex');
    const cachedImagePath = path.join(outputDir, `${hash}.jpg`);

    if (fs.existsSync(cachedImagePath)) {
        return res.json({ imageUrl: `/screenshots/${path.basename(cachedImagePath)}` });
    }

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1920, height: 1080 });
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 20000 });

        await page.evaluate(async () => {
            await new Promise(resolve => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= document.body.scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });

        await page.evaluate(async () => {
            const images = Array.from(document.images);
            await Promise.all(images.map(img => img.complete ? null : new Promise(resolve => img.onload = resolve)));

            const fonts = document.fonts;
            await fonts.ready;
        });

        await page.screenshot({ path: cachedImagePath, fullPage: true });

        await browser.close();

        res.json({ imageUrl: `/screenshots/${path.basename(cachedImagePath)}` });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al generar la captura.');
    }
});


app.post('/send-email', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).send('Por favor, completa todos los campos.');
    }

    try {
        const mailOptions = {
            from: `"Formulario de Contacto" <${process.env.MAILER_USER}>`,
            to: 'joeltroncoso2002@gmail.com',
            subject: 'Nuevo mensaje del formulario de contacto',
            html: `
              <h3>Nuevo mensaje recibido</h3>
              <p><strong>Nombre:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Mensaje:</strong> ${message}</p>
          `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado:', info);
        res.json({ success: true });
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        res.status(400).json({ success: false, message: 'Faltan datos en la solicitud.' });
    }
});

app.post('/send-email-modal', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).send('Por favor, completa todos los campos.');
    }

    try {
        const mailOptions = {
            from: `"Formulario de Contacto" <${process.env.MAILER_USER}>`,
            to: 'joeltroncoso2002@gmail.com',
            subject: 'Nuevo mensaje del formulario de contacto',
            html: `
              <h3>Nuevo mensaje recibido</h3>
              <p><strong>Nombre:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Mensaje:</strong> ${message}</p>
          `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado:', info);
        res.json({ success: true });



    } catch (error) {
        console.error('Error al enviar el correo:', error);
        res.status(400).json({ success: false, message: 'Faltan datos en la solicitud.' });
    }
});



// Servidor escuchando en el puerto 3000
app.listen(3000, () => console.log('App corriendo en p 3000'));
