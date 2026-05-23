const request = require('supertest');

const BASE = 'http://localhost:3000';

// Token JWT gerado no login (preenchido automaticamente)
let token = '';
let createdIngredientId, createdProductId, createdCustomerId, createdProductionId, createdSaleId;

// ─── HELPERS ────────────────────────────────────────────────────────────────
const auth = () => ({ Authorization: `Bearer ${token}` });

// ─── AUTH ────────────────────────────────────────────────────────────────────
describe('🔐 Auth', () => {
  it('POST /api/auth/register → 201 ou 409 (usuário já existe)', async () => {
    const res = await request(BASE).post('/api/auth/register').send({
      name: 'Teste TimTim',
      email: 'teste@timtim.com',
      password: '123456',
    });
    expect([201, 409]).toContain(res.status);
  });

  it('POST /api/auth/login → 200 + token', async () => {
    const res = await request(BASE).post('/api/auth/login').send({
      email: 'teste@timtim.com',
      password: '123456',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });
});

// ─── INGREDIENTES ────────────────────────────────────────────────────────────
describe('🧂 Ingredientes', () => {
  it('POST /api/ingredients → 201', async () => {
    const res = await request(BASE).post('/api/ingredients').send({
      name: 'Farinha de Trigo',
      unit: 'kg',
      cost_per_unit: 4.5,
      stock_quantity: 10,
    });
    expect(res.status).toBe(201);
    createdIngredientId = res.body.id ?? res.body.ingredient?.id;
  });

  it('GET /api/ingredients → 200 + array', async () => {
    const res = await request(BASE).get('/api/ingredients');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// ─── PRODUTOS ────────────────────────────────────────────────────────────────
describe('🍫 Produtos', () => {
  it('POST /api/products → 201', async () => {
    const res = await request(BASE).post('/api/products').send({
      name: 'Brigadeiro',
      type: 'doce',
      flavor: 'chocolate',
      sale_price: 3.5,
    });
    expect(res.status).toBe(201);
    createdProductId = res.body.id ?? res.body.product?.id;
  });

  it('GET /api/products → 200 + array', async () => {
    const res = await request(BASE).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/products/:id/cost → 200', async () => {
    if (!createdProductId) return;
    const res = await request(BASE).get(`/api/products/${createdProductId}/cost`);
    expect(res.status).toBe(200);
  });
});

// ─── RECEITAS ────────────────────────────────────────────────────────────────
describe('📋 Receitas', () => {
  it('POST /api/recipes → 201', async () => {
    if (!createdProductId || !createdIngredientId) return;
    const res = await request(BASE).post('/api/recipes').send({
      product_id: createdProductId,
      ingredient_id: createdIngredientId,
      quantity: 0.2,
    });
    expect(res.status).toBe(201);
  });
});

// ─── CLIENTES ────────────────────────────────────────────────────────────────
describe('👥 Clientes', () => {
  it('POST /api/customers → 201', async () => {
    const res = await request(BASE).post('/api/customers').send({
      name: 'Maria Silva',
      phone: '11999999999',
      email: 'maria@email.com',
      address: 'Rua das Flores, 10',
    });
    expect(res.status).toBe(201);
    createdCustomerId = res.body.id ?? res.body.customer?.id;
  });

  it('GET /api/customers → 200 + array', async () => {
    const res = await request(BASE).get('/api/customers');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/customers/summary → 200', async () => {
    const res = await request(BASE).get('/api/customers/summary');
    expect(res.status).toBe(200);
  });

  it('GET /api/customers/search?q=Maria → 200', async () => {
    const res = await request(BASE).get('/api/customers/search?q=Maria');
    expect(res.status).toBe(200);
  });
});

// ─── PRODUÇÕES ───────────────────────────────────────────────────────────────
describe('🏭 Produções', () => {
  it('POST /api/productions → 201', async () => {
    if (!createdProductId) return;
    const res = await request(BASE).post('/api/productions').send({
      product_id: createdProductId,
      quantity: 50,
      production_date: new Date().toISOString().split('T')[0],
    });
    expect(res.status).toBe(201);
    createdProductionId = res.body.id ?? res.body.production?.id;
  });

  it('GET /api/productions → 200 + array', async () => {
    const res = await request(BASE).get('/api/productions');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/productions/summary → 200', async () => {
    const res = await request(BASE).get('/api/productions/summary');
    expect(res.status).toBe(200);
  });

  it('GET /api/productions/stats → 200', async () => {
    const res = await request(BASE).get('/api/productions/stats');
    expect(res.status).toBe(200);
  });
});

// ─── VENDAS ──────────────────────────────────────────────────────────────────
describe('💰 Vendas', () => {
  it('POST /api/sales → 201', async () => {
    if (!createdProductId) return;
    const res = await request(BASE).post('/api/sales').send({
      product_id: createdProductId,
      customer_id: createdCustomerId ?? null,
      quantity: 10,
      sale_date: new Date().toISOString().split('T')[0],
    });
    expect(res.status).toBe(201);
    createdSaleId = res.body.id ?? res.body.sale?.id;
  });

  it('GET /api/sales → 200 + array', async () => {
    const res = await request(BASE).get('/api/sales');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/sales/stats → 200', async () => {
    const res = await request(BASE).get('/api/sales/stats');
    expect(res.status).toBe(200);
  });
});

// ─── DESPESAS ────────────────────────────────────────────────────────────────
describe('🧾 Despesas', () => {
  it('POST /api/expenses → 201', async () => {
    const res = await request(BASE).post('/api/expenses').send({
      description: 'Embalagens plásticas',
      amount: 50.0,
      category: 'embalagens',
      expense_date: new Date().toISOString().split('T')[0],
    });
    expect(res.status).toBe(201);
  });

  it('GET /api/expenses → 200 + array', async () => {
    const res = await request(BASE).get('/api/expenses');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// ─── METAS ───────────────────────────────────────────────────────────────────
describe('🎯 Metas', () => {
  it('POST /api/goals → 201 ou 200', async () => {
    const res = await request(BASE).post('/api/goals').send({
      month_year: new Date().toISOString().slice(0, 7),
      target_amount: 5000,
      daily_order_target: 60,
    });
    expect([200, 201]).toContain(res.status);
  });

  it('GET /api/goals → 200', async () => {
    const res = await request(BASE).get('/api/goals');
    expect(res.status).toBe(200);
  });

  it('GET /api/goals/progress → 200', async () => {
    const res = await request(BASE).get('/api/goals/progress');
    expect(res.status).toBe(200);
  });
});

// ─── RELATÓRIOS ──────────────────────────────────────────────────────────────
describe('📊 Relatórios', () => {
  it('GET /api/reports/profit → 200', async () => {
    const res = await request(BASE).get('/api/reports/profit');
    expect(res.status).toBe(200);
  });
});

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
describe('📈 Dashboard', () => {
  it('GET /api/dashboard/summary → 200', async () => {
    const res = await request(BASE).get('/api/dashboard/summary');
    expect(res.status).toBe(200);
  });

  it('GET /api/dashboard/activities → 200', async () => {
    const res = await request(BASE).get('/api/dashboard/activities');
    expect(res.status).toBe(200);
  });
});

// ─── FINANÇAS ────────────────────────────────────────────────────────────────
describe('💳 Finanças', () => {
  it('GET /api/finance/summary → 200', async () => {
    const res = await request(BASE).get('/api/finance/summary');
    expect(res.status).toBe(200);
  });

  it('GET /api/finance/previous-month → 200', async () => {
    const res = await request(BASE).get('/api/finance/previous-month');
    expect(res.status).toBe(200);
  });

  it('GET /api/finance/movements → 200', async () => {
    const res = await request(BASE).get('/api/finance/movements');
    expect(res.status).toBe(200);
  });
});

// ─── ENTREGAS ────────────────────────────────────────────────────────────────
describe('🚚 Entregas', () => {
  it('POST /api/deliveries → 201', async () => {
    if (!createdCustomerId || !createdProductionId) return;
    const res = await request(BASE).post('/api/deliveries').send({
      customer_id: createdCustomerId,
      production_id: createdProductionId,
      scheduled_at: new Date().toISOString(),
    });
    expect(res.status).toBe(201);
  });

  it('GET /api/deliveries → 200', async () => {
    const res = await request(BASE).get('/api/deliveries');
    expect(res.status).toBe(200);
  });
});
