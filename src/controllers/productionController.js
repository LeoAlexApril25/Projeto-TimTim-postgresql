const db = require('../config/db');


const create = async (req, res) => {
  const connection = await db.getConnection(); //Usamos transação para segurança
    try{
        await connection.beginTransaction();
        const { product_id, quantity, production_date } = req.body;

        // 1. Registrar a Produção
        const { priority, started_at } = req.body;
        const [result] = await connection.query(
            'INSERT INTO productions (product_id, quantity, production_date, priority, started_at, status) VALUES (?,?,?,?,?,?)',
            [product_id, quantity, production_date, priority || 'normal', started_at || new Date(), 'em_andamento']
        );

        // 2. Buscar os ingredientes da receita desde produto
        const [recipeItems] = await connection.query(
            'SELECT ingredient_id, quantity AS qty_per_unit   FROM recipe_items WHERE product_id = ?',
            [product_id]
);

        // 3. Dar baixa no estoque de cada ingrediente
        for (const item of recipeItems){
            const totalUsed = item.qty_per_unit * quantity;
            await connection.query(
            'UPDATE ingredients SET stock_quantity = stock_quantity - ? WHERE id = ?',
            [totalUsed, item.ingredient_id]
);


        }

        await connection.commit();
        res.status(201).json({ success: true, message: 'Produção registrada e estoque atualizado!'})

    } catch(err){
        await connection.rollback();
        res.status(500).json({ error: 'Erro ao processar produção', detalhes: err.message});

    } finally {
        connection.release();
    }
};

const getAll = async (req, res) => {
    try{
        const page = parseInt(req.query.page)  || 1;
        const limit = 5;
        const offset = (page - 1) * limit;
        const [rows] = await db.query(`
            SELECT p.id, pr.name AS product_name, p.quantity, p.production_date, p.started_at, p.status, p.priority, p.current_stage, p.stage_progress
            FROM productions p JOIN products pr ON p.product_id = pr.id WHERE p.status = 'em_andamento' ORDER BY p.started_at DESC LIMIT ? OFFSET ? `,
        [limit, offset]);
        const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM productions WHERE status = 'em_andamento'`);
        res.json(rows);
    }catch(err){
        res.status(500).json({ error: 'Erro ao listar produções', detalhes: err.message });
        

    }
};

const updateStage = async (req, res) => {
    try{
        const { id } = req.params;
        const { current_stage, stage_progress, status} = req.body;
        await db.query('UPDATE productions SET current_stage = ?, stage_progress = ?, status = ? WHERE id = ?', [current_stage, stage_progress, status, id]);
        res.json({ success: true, message: 'Etapa atualizada!' });

    } catch( err ){
        res.status(500).json({ error: 'Erro ao buscar resumo', detalhes: err.message });

    }

};

const getSummary = async (req, res) => {
    try{
        const [[{ lotes_ativos }]] = await db.query(`SELECT COUNT(*) as lotes_ativos FROM productions WHERE status = 'em_andamento'`);
        const [[{ total, sem_problema }]] = await db.query(`SELECT COUNT(*) as total, SUM(CASE WHEN had_issue = FALSE THEN 1 ELSE 0 END) as sem_problema FROM productions WHERE status = 'finalizado'`);
        const eficiencia = total > 0 ? ((sem_problema / total) * 100).toFixed(0) : 100;
        res.json({ success: true, data: { lotes_ativos, eficiencia: `${eficiencia}%` } });

    } catch(err){
        res.status(500).json({ error: 'Erro ao buscar resumo', detalhes: err.message });
    }
};

const getStats = async (req, res) => {
    try {
        const [[{ total_kg }]] = await db.query(`SELECT SUM(stock_quantity) AS total_kg FROM ingredients`);
        const [[{ avg_minutes }]] = await db.query(`SELECT AVG(EXTRACT(EPOCH FROM (production_date - started_at))/60) AS avg_minutes FROM productions WHERE status = 'finalizado' AND started_at IS NOT NULL`);
        const [[{ this_week }]] = await db.query(`SELECT SUM(quantity) AS this_week FROM productions WHERE TO_CHAR(production_date, 'IYYY-IW') = TO_CHAR(CURRENT_DATE, 'IYYY-IW')`);
        const [[{ last_week }]] = await db.query(`SELECT SUM(quantity) AS last_week FROM productions WHERE TO_CHAR(production_date, 'IYYY-IW') = TO_CHAR(CURRENT_DATE - INTERVAL '1 week', 'IYYY-IW')`);
        const growth = last_week > 0 ? (((this_week - last_week) / last_week) * 100).toFixed(0) : 0;
        const horas = Math.floor(avg_minutes / 60) || 0;
        const minutos = Math.round(avg_minutes % 60) || 0;
        res.json({ success: true, data: { material_estoque: `${total_kg || 0}kg`, tempo_medio: `${horas}h ${minutos}m`, crescimento_semanal: `${growth > 0 ? '+' : ''}${growth}%` } });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar estatísticas', detalhes: err.message });
    }
};

module.exports = { create, getAll, updateStage, getSummary, getStats};