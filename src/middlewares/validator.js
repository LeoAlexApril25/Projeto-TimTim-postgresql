const VALID_CATEGORIES = ['ingredientes', 'embalagens', 'Outros Custos', 'Novo Valor', 'SUA_NOVA_CATEGORIA'];

const validateExpense = (req, res, next) => {
    const { description, amount, category } = req.body;

    if (!description || !description.trim()) {
        return res.status(400).json({ error: 'Descrição é obrigatória' });
    }
    if (amount === undefined || amount === null || amount === '') {
        return res.status(400).json({ error: 'Valor é obrigatório' });
    }
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({ error: 'Valor deve ser um número maior que zero' });
    }
    if (!category || !VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({ error: `Categoria inválida. Use: ${VALID_CATEGORIES.join(', ')}` });
    }
    next();
};

const validateCustomer = (req, res, next) => {
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'O nome do cliente é obrigatório' });
    }
    next();
};

module.exports = { validateExpense, validateCustomer };
