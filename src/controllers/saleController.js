const db = require('../config/db');

const create = async (req, res) => {
    try{
        const { product_id, quantity, sale_date, customer_id } = req.body;

        const [result] = await db.query (
           'INSERT INTO sales ( product_id, quantity, sale_date, customer_id) VALUES (?,?,?,?)', 
           [product_id, quantity, sale_date || new Date(), customer_id || null]
        );

        res.status(201).json({
            success: true,
            message: 'Venda registrada com sucesso!',
            id: result.insertId
        });
    } catch(err){
        res.status(500).json({
            error: 'Erro ao registrar venda',
            detalhes: err.message
        });
    }
}

const getAll = async (req, res) => {
    try{
        const [rows] = await db.query(`
            SELECT s.id, p.name AS product_name, c.name AS customer_name, s.quantity, TO_CHAR(s.sale_date, 'HH24:MI') as sale_time, (s.quantity * p.sale_price) as total_value
            FROM sales s JOIN products p ON s.product_id = p.id LEFT JOIN customers c ON s.customer_id = c.id
            ORDER BY s.sale_date DESC LIMIT 10`);

            res.json(rows);
    } catch (err) {
        res.status(500).json({
            error: 'Erro ao listar vendas', detalhes: err.message
        });
    }
};

const getStats = async( req, res) => {
    try{
        const [[{ total_produced}]] = await db.query('SELECT SUM(quantity) as total_produced FROM productions');
        const [[{ total_sold }]] = await db.query('SELECT SUM(quantity) as total_sold FROM sales');
        const disponivel = (total_produced || 0 ) - (total_sold || 0);
        const [[{ produced_today }]] = await db.query('SELECT SUM(quantity) as produced_today FROM productions WHERE DATE(production_date) = CURRENT_DATE');
        res.json({ success: true, data: { total_produced, total_sold, disponivel, produced_today } });
    }catch(err){
        res.status(500).json({ error: 'Erro ao buscar estatísticas de vendas', detalhes: err.message});
    }
}





module.exports = { create, getAll, getStats};