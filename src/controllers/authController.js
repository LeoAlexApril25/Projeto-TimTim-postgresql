const db = require ('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { error } = require('console');

const register = async (req, res) => {
    try{
        const { name, email, password }= req.body;


        // 1.Criptografar a senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. Salvar no banco de dados
        const [result] = await db.query(
            'INSERT INTO users (name,email, password) VALUES (?,?,?)',[name, email, hashedPassword]
        );

        res.status(201).json({ sucess: true, message: 'Usuário criado com sucesso' });
    } catch (err){
        if (err.code === '23505') return res.status(409).json({ error: 'E-mail já cadastrado' });
        res.status(500).json({ error: 'Erro ao registrar usuário', detalhes: err.message });
    }

};

const login = async (req, res) => {
    try{
        const { email, password} = req.body;

        //1. Buscar usuário
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(401).json({ error: 'E-mail ou senha incorretos'});
        
        const user = users[0];

        // 2. Verificar senha
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'E-mail ou senha incorretos'})

        // 3. Gerar Token senha
        const token = jwt.sign({ id: users.id}, process.env.JWT_SECRET, { expiresIn: '1d'});

        res.json({ sucess:true, token, user: {id: user.id, name: user.name, email: user.name}}); 
    } catch(err) {
        res.status(500).json({ error: 'Erro no login', detalhes: err.message});
    }

};

// Configuração do "Carteiro" (E-mail)
const transporter = nodemailer.createTransport({
    host: "stmp.mailtrap.io", // Use os dado do seu Mailtrap ou Gmail aqui
    port: 2525,
    auth: {
        user: "seu_usuario",
        pass: "sua_senha"
    }
});

const forgotPassword = async (req, res) => {
    try{
        const { email } = req.body;
        const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) return res.status(404).json({ error: 'E-mail não encontrando'});
        
        // 1. Gerar Token Aleatório
        const token = crypto.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 3600000); //Expira em hora

        // 2. Salvar no Banco
        await db.query('UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?',
             [token, expires, email]);

        // 3.Enviar E-mail
        const resetUrl = `http://localhost:3000/reset-password/${token}`;
        await transporter.sendMail({
            to: email,
            subject:'Recuperação e Senha',
            text:` Você solicitou a troca de senha.Clique no link para redefinir: ${resetUrl}`
        });
          
            res.json({ success: true,message: 'E-mail de   recuperação enviado!'});
        }catch(err){
            res.status(500).json({ error: 'Erro ao processar', detalhes: err.message})
        }
};

const resetPassword = async (req, res) => {
    try{
        const {token, newPassword} = req.body;

        //1. Validar Token e Expiração
        const [users] = await db.query(
            'SELECT * FROM USERS WHERE rest_token = ? AND reset_expires > NOW()',
            [token]
        );

        if (users.length === 0) return res.status(400).json({error: 'Token inválido ou expiração'});


        //2. Criptografar nova senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);


        //3. Atualizar e Limpar Token
        await db.query(
            'UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
            [hashedPassword, users[0].id]
        );
         res.json({ success: true, message: 'Senha altera com sucesso!'});

    }catch (err){
        res.status(500).json({ error: 'Erro ao resetar senha', detalhes: err.message});
    }
}

module.exports = { register, login, forgotPassword, resetPassword};