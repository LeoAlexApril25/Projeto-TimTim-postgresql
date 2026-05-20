const db = require('../config/db');
const { get } = require('express');

const create = async (req, res) => {
    try{
        const { name, phone, email, address} = req.body;
        const [result] = await db.query(
            'INSERT INTO customers (name, phone, email, address) VALUES (?,?,?,?)',[name, phone, email,
                address]
        );
        res.status(201).json({ success: true, id: result.insertId, message: 'Cliente criado com sucesso' });
    } catch (err){
        res.status(500).json({ error: 'Erro ao criar cliente', detalhes: err.message });
    }
};

const getAll = async (req, res) => {
    try{
        const [rows] = await db.query('SELECT id, name, phone, email, status, balance, created_at FROM customers ORDER BY name ASC');
        res.json(rows);

    } catch (err){
        res.status(500).json({ error: 'Erro ao obter listas clientes', detalhes: err.message });

    }
};

const getSummary = async (req, res) => {

    const [[{ saldo_devedor }]] = await db.query('SELECT SUM(balance) AS saldo_devedor FROM customers WHERE balance > 0');
    
    const [[{ encomendas_ativas_count }]] = await db.query(
        `SELECT COUNT(*) AS encomendas_ativas_count FROM sales`);

    const [clientes_recentes] = await db.query(
        "SELECT id, name, status, created_at FROM customers ORDER BY created_at DESC LIMIT 5"
    );

const [cobrancas_urgentes] = await db.query(
	        "SELECT id, name, status, (CURRENT_DATE - created_at::date) as dias_atraso FROM customers WHERE status = 'EM DÉBITO' ORDER BY created_at ASC"
	    );

    const [encomendas_ativas] = await db.query(
        `
            SELECT d.id, c.name as destinatario, p.name as produto, d.status, d.scheduled_at
            FROM deliveries d
            JOIN customers c ON d.customer_id = c.id
            JOIN productions pr ON d.production_id = pr.id
            JOIN products p ON pr.product_id = p.id
            WHERE d.status != 'Entregue'
            ORDER BY d.scheduled_at ASC
        `
    );

    res.json({success: true, data: { saldo_devedor, encomendas_ativas_count, clientes_recentes, cobrancas_urgentes, encomendas_ativas }});
};

const getDefaulters = async (req, res) => {
const [rows] = await db.query(
	        `SELECT id, name, balance,
	           (CURRENT_DATE - updated_at::date) AS dias_atraso
	        FROM customers
	        WHERE status = 'em_debito' AND balance > 0
	        ORDER BY dias_atraso DESC`);
    res.json(rows)
}

const getActiveOrders = async (Req, res) => {
    const [rows] = await db.query (
        `SELECT s.id, p.name AS product_name, c.name AS customer_name,
           s.status, s.sale_date
         FROM sales s
         JOIN products p ON s.product_id = p.id
         JOIN customers c ON s.customer_id = c.id
         WHERE s.status = 'ativo'
         ORDER BY s.sale_date DESC
         `);

    res.json(rows);


}

const search = async (req, res) => {
    const { q } = req.query;
    const [ rows ] = await db.query(
        `SELECT id, name, phone, email, status, balance
         FROM customers
         WHERE name ILIKE $1 OR phone ILIKE $2
         ORDER BY name ASC`,
         [`%${q}%`, `%${q}%`]
    );
    res.json(rows);
}

module.exports = { create, getAll, getSummary, getDefaulters, getActiveOrders, search};