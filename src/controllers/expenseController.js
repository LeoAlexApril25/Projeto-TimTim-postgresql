const db = require('../config/db');

const create = async (req, res) => {
    try {
        const { description, amount, category, expense_date } = req.body;
        const [result] = await db.query(
            'INSERT INTO expenses (description, amount, category, expense_date) VALUES (?, ?, ?, ?)',
            [description, amount, category, expense_date]
        );

        res.status(201).json({
            success: true,
            message: 'Despesa lançada', 
            id: result.insertId
        });

    } catch(err){
        res.status(500).json({
            error:
            'Erro ao lançar despesa',
            detalhes: err.message
        });
    }
}

const getAll = async (req, res) => {
    try{
        const [rows] = await db.query('SELECT * FROM expenses ORDER BY expense_date DESC');

        res.json(rows);
    } catch(err){
        res.status(500).json({
            error:
            'Erro ao listar despesas',
            detalhes: err.message
            
        });
    }

}

module.exports = { create, getAll };