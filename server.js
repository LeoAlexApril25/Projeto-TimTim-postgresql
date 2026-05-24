require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./src/config/db');
const ingredientRoutes = require('./src/routes/ingredientRoutes');
const productRoutes = require('./src/routes/productRoutes');
const recipeRoutes = require('./src/routes/recipeRoutes');
const productionRoutes = require('./src/routes/productionRoutes');
const saleRoutes = require('./src/routes/saleRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const expenseRoutes = require('./src/routes/expenseRoutes');
const goalRoutes = require('./src/routes/goalRoutes');
const logger = require('./src/middlewares/logger'); 
const authRoutes =  require('./src/routes/authRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const deliveryRoutes = require('./src/routes/deliveryRoutes');
const financeRoutes = require('./src/routes/financeRoutes');
const PORT = process.env.PORT || 3000;



app.use(cors());
app.use(logger);
app.use(express.json());

app.use('/api/ingredients', ingredientRoutes); //Diz ao servidor para usar as rotas de ingredientes no caminho /api/ingredients

app.use('/api/products', productRoutes);

app.use('/api/recipes', recipeRoutes);

app.use('/api/productions', productionRoutes);

app.use('/api/sales', saleRoutes);

app.use('/api/reports', reportRoutes);

app.use('/api/expenses', expenseRoutes);

app.use('/api/goals', goalRoutes);

app.use('/api/auth', authRoutes);

app.use('/api/customers', customerRoutes);

app.use('/api/dashboard', dashboardRoutes);

app.use('/api/deliveries', deliveryRoutes);

app.use('/api/finance', financeRoutes);

app.get('/teste-banco', async (req, res) =>{
    try{
        const [rows] = await db.query('SELECT 1 + 1 AS resultado');
        res.json({ mensagem: "Conexão com o banco OK!", resultado: rows[0].resultado});
    } catch (err) {
        console.error("❌ ERRO NO BANCO:", err);
        res.status(500).json({ erro: "Erro ao conectar no banco", detalhes: err.message});

    }
});

// Adicione temporariamente este teste no seu server.js, logo abaixo do app.get('/teste-banco')
app.get('/verificar-tabelas', async (req, res) => {
  try {
    const [rows] = await db.query('SHOW TABLES');
    res.json({ tabelas_no_banco: rows });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});


app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));

