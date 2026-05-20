const db = require('../config/db');

// Função para adicionar um ingrediente a um produto (Ficha Técnica)

const addItem = async (req, res) => {
    try{
        // 1- Pegamos os IDs e a quantidade que o app enviou
        const { product_id,ingredient_id, quantity } = req.body;

        // 2- Comando SQL para inserir na tabela recipe_items
        //Usamos 3 pontos de interrogação para os 3 valores
        const [result] = await db.query(
            'INSERT INTO recipe_items (product_id,ingredient_id,quantity) VALUES (?,?,?)',
            [product_id,ingredient_id, quantity]
        );

        res.status(201).json({
            success: true,
            message: 'Item adicionado à receita com sucesso!',
            id: result.insertId
        });
    } catch(err) {
        res.status(500).json({error: 'Erro ao adicionar item à receita', detalhes: err.message})
    };
};

module.exports = { addItem };