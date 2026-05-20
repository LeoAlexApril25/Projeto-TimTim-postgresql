const db = require('../config/db');

const getProfitReport = async (req, res) => {
    try{
         // Esta query é a "mágica": ela soma as vendas e subtrai os custos
        const [rows] = await db.query(`
            SELECT p.name AS produto,
            SUM(s.quantity) AS total_vendido,
            p.sale_price AS preco_venda,
            (SUM(s.quantity) * p.sale_price) AS faturamento,
            (SELECT SUM(ri.quantity * i.cost_per_unit)
            FROM recipe_items ri
            JOIN ingredients i ON ri.ingredient_id = i.id
            WHERE ri.product_id = p.id) AS custo_unitario
            FROM sales s
            JOIN products p ON s.product_id = p.id
            GROUP BY p.id`);

        // Vamos processar os dados para calcular o lucro final
        const relatorio = rows.map(item =>{
            const custoTotal = item.total_vendido *(item.custo_unitario || 0)
            return{
                produto: item.produto,
                quantidade: item.total_vendido,
                faturamento: item.faturamento,
                custo_total: custoTotal,
                lucro: item.faturamento - custoTotal
            }
        });

        res.json(relatorio);
    } catch (err){
        res.status(500).json({ error:
            'Erro ao gerar relatório de lucros', 
            detalhes: err.message
     });
    }
}

module.exports = { getProfitReport };