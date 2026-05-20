const validateExpense = (req, res, next) =>{
    const {description,  amount, category} = req.body;
    if (!description || !amount || !category) {
        return res.status(400).json({ 
            error: 'Descrição, valor e categoria são obrigatórios' 
        });

    }
    next();
};

const validateCustomer = (req, res, next) => {
    const { name } = req.body;
    if(!name) {
        return res.status(400).json({ error: 'O nome do cliente é obrigatório' });
    }
    next();
};

//Evita que no frontend o Timtim não mande em campos vazios

module.exports = {validateExpense, validateCustomer};