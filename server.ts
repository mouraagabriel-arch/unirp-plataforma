import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
    const app = express();
    const PORT = 3000;

    app.use(express.json());

    // API para envio de e-mail via SMTP
    app.post('/api/send-email', async (req, res) => {
        const { to, subject, text, smtp } = req.body;

        if (!smtp || !smtp.host || !smtp.user || !smtp.pass) {
            return res.status(400).json({ success: false, error: 'Configurações SMTP incompletas.' });
        }

        try {
            const nodemailer = await import('nodemailer');
            const transporter = nodemailer.default.createTransport({
                host: smtp.host,
                port: parseInt(smtp.port) || 587,
                secure: parseInt(smtp.port) === 465,
                auth: {
                    user: smtp.user,
                    pass: smtp.pass
                }
            });

            await transporter.sendMail({
                from: `"uniRP Enterprise" <${smtp.user}>`,
                to: to || smtp.user, // Se não houver destinatário, envia para si mesmo (teste)
                subject: subject,
                text: text
            });

            res.json({ success: true });
        } catch (error) {
            console.error('Erro ao enviar e-mail:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Vite middleware para desenvolvimento
    if (process.env.NODE_ENV !== 'production') {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    } else {
        // Em produção, serve arquivos estáticos da pasta dist
        const distPath = path.join(__dirname, 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Preview Server running on http://localhost:${PORT}`);
    });
}

startServer();
