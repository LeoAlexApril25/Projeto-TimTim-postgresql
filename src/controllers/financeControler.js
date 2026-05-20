const db = require('../config/db');
 
// GET /api/finance/summary
// Retorna: faturamento mensal atual, comparativo, gastos, lucro estimado
const getMonthlySummary = async (req, res) => {
    try {
        const month_year = req.query.month_year || new Date().toISOString().slice(0, 7); // "YYYY-MM"
 
        // Faturamento bruto do mês atual
        const [[currentGross]] = await db.query(`
            SELECT COALESCE(SUM(s.quantity * p.sale_price), 0) AS total
            FROM sales s JOIN products p ON s.product_id = p.id
            WHERE TO_CHAR(s.sale_date, 'YYYY-MM') = ?
        `, [month_year]);
 
        // Faturamento bruto do mês anterior
        const [[prevGross]] = await db.query(`
            SELECT COALESCE(SUM(s.quantity * p.sale_price), 0) AS total
            FROM sales s JOIN products p ON s.product_id = p.id
            WHERE TO_CHAR(s.sale_date, 'YYYY-MM') = TO_CHAR((TO_DATE(? || '-01', 'YYYY-MM-DD') - INTERVAL '1 month'), 'YYYY-MM')
        `, [month_year]);
 
        // Gastos do mês atual
        const [[currentExpenses]] = await db.query(`
            SELECT COALESCE(SUM(amount), 0) AS total
            FROM expenses
            WHERE TO_CHAR(expense_date, 'YYYY-MM') = ?
        `, [month_year]);
 
        // Meta de faturamento do mês (orçamento planejado)
        const [[goal]] = await db.query(`
            SELECT COALESCE(target_amount, 0) AS target_amount
            FROM goals WHERE month_year = ?
            LIMIT 1
        `, [month_year]);
 
        // Custo dos produtos vendidos no mês (CMV)
        const [[cmv]] = await db.query(`
            SELECT COALESCE(SUM(
                s.quantity * (
                    SELECT COALESCE(SUM(ri.quantity * i.cost_per_unit), 0)
                    FROM recipe_items ri JOIN ingredients i ON ri.ingredient_id = i.id
                    WHERE ri.product_id = p.id
                )
            ), 0) AS total
            FROM sales s JOIN products p ON s.product_id = p.id
            WHERE TO_CHAR(s.sale_date, 'YYYY-MM') = ?
        `, [month_year]);
 
        const faturamento = Number(currentGross.total);
        const gastos = Number(currentExpenses.total);
        const custoMercadoria = Number(cmv.total);
        const lucroEstimado = faturamento - gastos - custoMercadoria;
        const prevFaturamento = Number(prevGross.total);
        const comparativo = prevFaturamento > 0
            ? (((faturamento - prevFaturamento) / prevFaturamento) * 100).toFixed(1)
            : null;
        const orcamento = Number(goal?.target_amount || 0);
        const percentGastos = orcamento > 0 ? ((gastos / orcamento) * 100).toFixed(1) : null;
 
        res.json({
            month_year,
            faturamento_mensal: faturamento,
            comparativo_mes_anterior: comparativo ? Number(comparativo) : null, // ex: 12.5
            gastos_atuais: gastos,
            orcamento_planejado: orcamento,
            percent_gastos: percentGastos ? Number(percentGastos) : null, // ex: 38
            lucro_estimado: lucroEstimado,
        });
 
    } catch (err) {
        res.status(500).json({ error: 'Erro ao gerar resumo financeiro', detalhes: err.message });
    }
};
 
// GET /api/finance/previous-month
// Retorna: faturamento bruto, líquido e despesas do mês anterior
const getPreviousMonthSummary = async (req, res) => {
    try {
        const month_year = req.query.month_year || new Date().toISOString().slice(0, 7);
 
        // Mês anterior
        const [[prevMonth]] = await db.query(`
            SELECT TO_CHAR((TO_DATE(? || '-01', 'YYYY-MM-DD') - INTERVAL '1 month'), 'YYYY-MM') AS prev
        `, [month_year]);
        const prev = prevMonth.prev;
 
        // Faturamento bruto
        const [[gross]] = await db.query(`
            SELECT COALESCE(SUM(s.quantity * p.sale_price), 0) AS total
            FROM sales s JOIN products p ON s.product_id = p.id
            WHERE TO_CHAR(s.sale_date, 'YYYY-MM') = ?
        `, [prev]);
 
        // Despesas
        const [[expenses]] = await db.query(`
            SELECT COALESCE(SUM(amount), 0) AS total
            FROM expenses WHERE TO_CHAR(expense_date, 'YYYY-MM') = ?
        `, [prev]);
 
        // CMV
        const [[cmv]] = await db.query(`
            SELECT COALESCE(SUM(
                s.quantity * (
                    SELECT COALESCE(SUM(ri.quantity * i.cost_per_unit), 0)
                    FROM recipe_items ri JOIN ingredients i ON ri.ingredient_id = i.id
                    WHERE ri.product_id = p.id
                )
            ), 0) AS total
            FROM sales s JOIN products p ON s.product_id = p.id
            WHERE TO_CHAR(s.sale_date, 'YYYY-MM') = ?
        `, [prev]);
 
        const faturamentoBruto = Number(gross.total);
        const despesas = Number(expenses.total);
        const custoMercadoria = Number(cmv.total);
        const faturamentoLiquido = faturamentoBruto - custoMercadoria;
 
        res.json({
            month_year: prev,
            faturamento_bruto: faturamentoBruto,
            faturamento_liquido: faturamentoLiquido,
            despesas,
        });
 
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar resumo do mês anterior', detalhes: err.message });
    }
};
 
// GET /api/finance/movements
// Retorna últimas movimentações (despesas + vendas)
const getMovements = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
 
        const [rows] = await db.query(`
            SELECT 'despesa' AS tipo, e.expense_date AS data, e.description AS descricao,
                   e.amount AS valor, e.category AS categoria, NULL AS produto
            FROM expenses e
            UNION ALL
            SELECT 'receita' AS tipo, s.sale_date AS data, NULL AS descricao,
                   (s.quantity * p.sale_price) AS valor, 'Receita' AS categoria, p.name AS produto
            FROM sales s JOIN products p ON s.product_id = p.id
            ORDER BY data DESC
            LIMIT ?
        `, [limit]);
 
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar movimentações', detalhes: err.message });
    }
};
 
module.exports = { getMonthlySummary, getPreviousMonthSummary, getMovements };
