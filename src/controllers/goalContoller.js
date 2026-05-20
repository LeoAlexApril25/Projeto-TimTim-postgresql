const db = require('../config/db');

const setGoal = async (req, res) => {
    try{
        const{ month_year, target_amount} = req.body;
await db.query('INSERT INTO goals (month_year, target_amount) VALUES (?,?) ON CONFLICT (month_year) DO UPDATE SET target_amount = EXCLUDED.target_amount',
	            [month_year,target_amount]);
        res.json({ 
            sucess: true,
            message: 'Meta definida!'
        });
    }catch(err){
        res.status(500).json({
            error: err.message
        })
    };
}

const getGoals = async (req, res) => {
    try {
        const [goals] = await db.query('SELECT * FROM goals');
        res.json(goals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getProgress = async (req, res) =>{
    try{
        const { month_year } = req.query;
        const [goal] = await db.query('SELECT target_amount FROM goals WHERE month_year = ?', [month_year]);
        const [sales] = await db.query('SELECT SUM(s.quantity * p.sale_price) as total FROM sales s JOIN products p ON s.product_id = p.id WHERE TO_CHAR(s.sale_date, \'YYYY-MM\') = ?', [month_year]);

        const target = goal[0]?.target_amount || 0;
        const current = sales[0]?.total || 0;
        const percent = target > 0 ?(current / target) * 100 : 0;

        res.json({ month_year,target, current, percent: percent.toFixed(2) });
    }catch (err) {
        res.status(500).json({ error: err.message});
    }
};

module.exports = { setGoal, getGoals, getProgress};