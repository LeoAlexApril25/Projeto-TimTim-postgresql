const db = require('../config/db');

const getSummary = async (req, res ) => {
    try{
      // 1. Lucro Líquido de Hoje (Ponto 1)
      const [todayProfitResult] = await db.query(`
         SELECT SUM(s.quantity * (p.sale_price - (SELECT SUM( ri.quantity * i.cost_per_unit) FROM recipe_items ri JOIN ingredients i ON ri.ingredient_id = i.id WHERE ri.product_id = p.id))) AS profit
         FROM sales s JOIN products p ON s.product_id = p.id WHERE DATE(s.sale_date) = CURRENT_DATE
        `);

      const todayProfit = todayProfitResult[0].profit || 0;


      // 2. Total de Vendas e Progresso da Meta (Ponto 2 e 9)
      const [salesCountResult] = await db.query(`SELECT COUNT(*) AS total FROM sales WHERE DATE(sale_date) = CURRENT_DATE`);
      const salesToday = salesCountResult[0].total;
      const [goalResult] = await db.query(`SELECT daily_order_target FROM goals ORDER BY created_at DESC LIMIT 1`)
      const salesGoal = goalResult[0]?.daily_order_target || 50;

      //3. Produção do Dia por Produto (Ponto 3 e 10)
      const [ProductionToday] = await db.query(`
        SELECT p.name, SUM(pr.quantity) AS total
        FROM productions pr JOIN products p ON pr.product_id = p.id
        WHERE DATE(pr.production_date) = CURRENT_DATE GROUP BY p.id`
       );

      // 4. Alertas de estoque baixo (Ponto 4)
      const [lowStock] = await db.query(`
        SELECT name, stock_quantity
        FROM ingredients
        WHERE stock_quantity < 5`
        );

     // 5. Histórico de 7 dias para o Gráfico (Ponto 7)
     const [weeklyHistory] = await db.query(`
        SELECT DATE(sale_date) AS date, 
        SUM(quantity) AS sales 
        FROM sales WHERE sale_date >= (CURRENT_DATE - INTERVAL '7 days') 
        GROUP BY DATE (sale_date) ORDER BY date ASC`
    );

    res.json({
        today_profit: todayProfit,
        sales_today: salesToday,
        sales_goal: salesGoal,
        production_today: ProductionToday,
        low_stock_alerts: lowStock,
        week_history: weeklyHistory
    });

    } catch(err){
        res.status(500).json({ error: 'Erro ao gerar dashboard', detalhes: err.message});

    }

};

const getActivities = async(req, res) => {
    try{
        const [activities] = await db.query(`
            SELECT 'Venda' as type, s.sale_date as date, p.name as item, s.quantity, (s.quantity * p.sale_price) as value
            FROM sales s JOIN products p ON s.product_id = p.id
            UNION ALL
            SELECT 'Produção' as type, pr.production_date as date, p.name as item, pr.quantity, NULL as value
            FROM productions pr JOIN products p ON pr.product_id = p.id
            UNION ALL
            SELECT 'Despesa' as type, e.expense_date as date, e.description as item, NULL as quantity, e.amount as value
            FROM expenses e
            ORDER BY date DESC
            LIMIT 10
        `);
        res.json(activities);

    } catch(err){
        res.status(500).json({ error: 'error ao buscar atividades', detalhes: err.message});

    }
};

module.exports = { getSummary, getActivities};
