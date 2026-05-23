const db = require ('../config/db');

// Função para criar um novo produto
const create = async (req, res) => {
    try{
        // 1 Pegue os dados do corpo da requisição (req.body)
        const {name, type, flavor, sale_price} = req.body;
        // Escreva o comando SQL para inserir na tabela 'products'
        const [result] = await db.query(
            'INSERT INTO products (name, type, flavor, sale_price) VALUES(?,?,?,?)', [name,type,flavor, sale_price]
        );
        // 3 Retorne uma resposta de sucesso com o ID do produto criado
        res.status(201).json({
            success: true,
            message: 'Produto cadastrado com sucesso',
            id: result.insertId
        });

    }catch(err){
       res.status(500).json({error: 'Erro ao cadastrar produto', detalhes: err.message});
    }
}

const getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produtos', detalhes: err.message });
  }
};

const getProductCost = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(`
            SELECT 
                p.name AS product_name,
                SUM(ri.quantity * i.cost_per_unit) AS total_cost
            FROM products p
            JOIN recipe_items ri ON p.id = ri.product_id
            JOIN ingredients i ON ri.ingredient_id = i.id
            WHERE p.id = ?
            GROUP BY p.id
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Produto não encontrado ou sem receita cadastrada' });
        }

        res.json({
            success: true,
            product: rows[0].product_name,
            cost_production: rows[0].total_cost
        });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao calcular custo', detalhes: err.message });
    }
};



// Não esqueça de exportar a função !
module.exports = {create, getAll, getProductCost};