const db = require('../config/db');

// Função para criar um novo ingrediente
const create = async (req, res) => {
    try{
        const{ name, unit, cost_per_unit} = req.body;

        // Comando SQL para inserir no banco
        const [result] = await db.query(
            'INSERT INTO ingredients (name, unit, cost_per_unit) VALUES (?, ?, ?)', [name,unit, cost_per_unit]
        );

        res.status(201).json({
            success: true,
            message: 'Ingrediente cadastrado com sucesso!',
            id: result.insertId
        });
    } catch (err){
        res.status(500).json({ error: 'Erro ao salvar ingrediente', detalhes: err.message });
    }
};

// Função para listar todos os ingredientes cadastrados
const getAll = async (req, res) => {
    try{
         // Busca todos os ingredientes e ordena por nome
        const [rows] = await db.query('SELECT * FROM ingredients ORDER BY name ASC');

        res.json(rows);
       
    } catch(err){
      res.status(500).json({ error: 'Erro ao buscar ingredientes', detalhes: err.message });
    }
};

const checkPriceIncrease = async(id, newPrice) => {
    const [oldData] = await db.query('SELECT cost_per_unit FROM ingredients WHERE id = ?', [id]);
    if (oldData.length > 0 && newPrice > oldData[0].cost_per_unit){
        await db.query('INSERT INTO price_history (ingredient_id, old_price, new_price) VALUES(?,?,?)',
            [id, oldData[0].cost_per_unit, newPrice]);
            return true;
    }
    return false;
}


module.exports = { create, getAll };