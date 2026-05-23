const db = require("../config/db");

const createDevilery = async(req, res) => {
    const { customer_id, production_id, scheduled_at} = req.body;
    try{
        const [result] = await db.query(`
            INSERT INTO deliveries (customer_id, production_id, scheduled_at)
            VALUES (?,?,?)`, [customer_id, production_id, scheduled_at]
        );
        res.status(201).json({ message: "Entrega criada com sucesso!", deliveryId: result.insertId });

    }catch (err){
       res.status(500).json({error : 'Erro ao criar entrega', detalhes: err.message})

    }
};

const getDeliveries = async(req, res) => {
    try{
        const[deliveries] = await db.query(`
            SELECT d.id, c.name as customer_name, p.name as product_name, d.status, d.scheduled_at, d.created_at
            FROM deliveries d
            JOIN customers c ON d.customer_id = c.id
            JOIN productions pr ON d.production_id = pr.id
            JOIN products p ON pr.product_id = p.id
            ORDER BY d.scheduled_at DESC
            `);
        res.json(deliveries);
            

    }catch(err){
        res.status(500).json({ error: "Erro ao buscar entregas", detalhes: err.message})       
    }
};

const updateDeliveryStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try{
        const [result] = await db.query(`
            UPDATE deliveries SET status = ? WHERE id = ?`, 
            [status, id] 
        );
        if (result.affectedRows === 0){
            return res.status(404).json({ message: 
                "Entrega não encontrada"});
        }
        res.json({ message: "Status da entrega atualizada com sucesso !"})

    }catch(err){
        res.status(500).json({error: "Erro ao atualizar status a entrega",
            detalhes: err.message
        })

    }
};

module.exports = {createDevilery, getDeliveries,updateDeliveryStatus};