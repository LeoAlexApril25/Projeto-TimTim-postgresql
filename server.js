require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const ingredientRoutes = require('./src/routes/ingredientRoutes');
const productRoutes = require('./src/routes/productRoutes');
const recipeRoutes = require('./src/routes/recipeRoutes');
const productionRoutes = require('./src/routes/productionRoutes');
const saleRoutes = require('./src/routes/saleRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const expenseRoutes = require('./src/routes/expenseRoutes');
const goalRoutes = require('./src/routes/goalRoutes');
const logger = require('./src/middlewares/logger');
const authRoutes = require('./src/routes/authRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const deliveryRoutes = require('./src/routes/deliveryRoutes');
const financeRoutes = require('./src/routes/financeRoutes');

app.use(cors());
app.use(logger);
app.use(express.json());

app.use('/api/ingredients', ingredientRoutes);
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

// Exporta o app para testes (sem iniciar o servidor)
module.exports = app;

// Só inicia o servidor se este arquivo for executado diretamente
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
}