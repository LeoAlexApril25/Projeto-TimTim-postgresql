const request = require('supertest');
 
// ─── MOCK DO BANCO DE DADOS ───────────────────────────────────────────────────
// Intercepta todas as chamadas ao banco antes de qualquer require do app
jest.mock('../src/config/db', () => {
  const mockQuery = jest.fn();
  const mockConnection = {
    query: jest.fn(),
    beginTransaction: jest.fn().mockResolvedValue(),
    commit: jest.fn().mockResolvedValue(),
    rollback: jest.fn().mockResolvedValue(),
    release: jest.fn(),
  };
 
  return {
    pool: {},
    query: mockQuery,
    getConnection: jest.fn().mockResolvedValue(mockConnection),
    _mockConnection: mockConnection,
    _mockQuery: mockQuery,
  };
});
 
const db = require('../src/config/db');
const app = require('../server');
 
// ─── HELPERS ─────────────────────────────────────────────────────────────────
let token = '';
let createdIngredientId = 1;
let createdProductId = 1;
let createdCustomerId = 1;
let createdProductionId = 1;
let createdSaleId = 1;
 
const auth = () => ({ Authorization: `Bearer ${token}` });
 
// Resetar mocks entre testes
beforeEach(() => {
  jest.resetAllMocks();
  // Default: query retorna resultado de SELECT vazio
  db.query.mockResolvedValue([[], []]);
  db._mockConnection.query.mockResolvedValue([[], []]);
  db._mockConnection.beginTransaction.mockResolvedValue();
  db._mockConnection.commit.mockResolvedValue();
  db._mockConnection.rollback.mockResolvedValue();
  db.getConnection.mockResolvedValue(db._mockConnection);
});
 
// ─── AUTH ─────────────────────────────────────────────────────────────────────
describe('🔐 Auth', () => {
  it('POST /api/auth/register → 201 ou 409 (usuário já existe)', async () => {
    db.query.mockResolvedValueOnce([[{ insertId: 1, affectedRows: 1 }], []]);
 
    const res = await request(app).post('/api/auth/register').send({
      name: 'Teste TimTim',
      email: 'teste@timtim.com',
      password: '123456',
    });
    expect([201, 409]).toContain(res.status);
  });
 
  it('POST /api/auth/login → 200 + token', async () => {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('123456', 10);
 
    db.query.mockResolvedValueOnce([
      [{ id: 1, name: 'Teste TimTim', email: 'teste@timtim.com', password: hashedPassword }],
      [],
    ]);
 
    const res = await request(app).post('/api/auth/login').send({
      email: 'teste@timtim.com',
      password: '123456',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });
});
 
// ─── INGREDIENTES ─────────────────────────────────────────────────────────────
describe('🧂 Ingredientes', () => {
  it('POST /api/ingredients → 201', async () => {
    db.query.mockResolvedValueOnce([{ insertId: 1, affectedRows: 1 }, []]);
 
    const res = await request(app).post('/api/ingredients').send({
      name: 'Farinha de Trigo',
      unit: 'kg',
      cost_per_unit: 4.5,
      stock_quantity: 10,
    });
    expect(res.status).toBe(201);
    createdIngredientId = res.body.id ?? 1;
  });
 
  it('GET /api/ingredients → 200 + array', async () => {
    db.query.mockResolvedValueOnce([
      [{ id: 1, name: 'Farinha de Trigo', unit: 'kg', cost_per_unit: 4.5 }],
      [],
    ]);
 
    const res = await request(app).get('/api/ingredients');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
 
// ─── PRODUTOS ─────────────────────────────────────────────────────────────────
describe('🍫 Produtos', () => {
  it('POST /api/products → 201', async () => {
    db.query.mockResolvedValueOnce([{ insertId: 1, affectedRows: 1 }, []]);
 
    const res = await request(app).post('/api/products').send({
      name: 'Brigadeiro',
      type: 'doce',
      flavor: 'chocolate',
      sale_price: 3.5,
    });
    expect(res.status).toBe(201);
    createdProductId = res.body.id ?? 1;
  });
 
  it('GET /api/products → 200 + array', async () => {
    db.query.mockResolvedValueOnce([
      [{ id: 1, name: 'Brigadeiro', type: 'doce', flavor: 'chocolate', sale_price: 3.5 }],
      [],
    ]);
 
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
 
  it('GET /api/products/:id/cost → 200', async () => {
    db.query.mockResolvedValueOnce([
      [{ product_name: 'Brigadeiro', total_cost: 1.2 }],
      [],
    ]);
 
    const res = await request(app).get(`/api/products/${createdProductId}/cost`);
    expect(res.status).toBe(200);
  });
});
 
// ─── RECEITAS ─────────────────────────────────────────────────────────────────
describe('📋 Receitas', () => {
  it('POST /api/recipes → 201', async () => {
    db.query.mockResolvedValueOnce([{ insertId: 1, affectedRows: 1 }, []]);
 
    const res = await request(app).post('/api/recipes').send({
      product_id: createdProductId,
      ingredient_id: createdIngredientId,
      quantity: 0.2,
    });
    expect(res.status).toBe(201);
  });
});
 
// ─── CLIENTES ─────────────────────────────────────────────────────────────────
describe('👥 Clientes', () => {
  it('POST /api/customers → 201', async () => {
    db.query.mockResolvedValueOnce([{ insertId: 1, affectedRows: 1 }, []]);
 
    const res = await request(app).post('/api/customers').send({
      name: 'Maria Silva',
      phone: '11999999999',
      email: 'maria@email.com',
      address: 'Rua das Flores, 10',
    });
    expect(res.status).toBe(201);
    createdCustomerId = res.body.id ?? 1;
  });
 
  it('GET /api/customers → 200 + array', async () => {
    db.query.mockResolvedValueOnce([
      [{ id: 1, name: 'Maria Silva', phone: '11999999999', status: 'ativo' }],
      [],
    ]);
 
    const res = await request(app).get('/api/customers');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
 
  it('GET /api/customers/summary → 200', async () => {
    // getSummary faz 5 queries encadeadas
    db.query
      .mockResolvedValueOnce([[{ saldo_devedor: 0 }], []])
      .mockResolvedValueOnce([[{ encomendas_ativas_count: 0 }], []])
      .mockResolvedValueOnce([[], []])
      .mockResolvedValueOnce([[], []])
      .mockResolvedValueOnce([[], []]);
 
    const res = await request(app).get('/api/customers/summary');
    expect(res.status).toBe(200);
  });
 
  it('GET /api/customers/search?q=Maria → 200', async () => {
    db.query.mockResolvedValueOnce([
      [{ id: 1, name: 'Maria Silva' }],
      [],
    ]);
 
    const res = await request(app).get('/api/customers/search?q=Maria');
    expect(res.status).toBe(200);
  });
});
 
// ─── PRODUÇÕES ────────────────────────────────────────────────────────────────
describe('🏭 Produções', () => {
  it('POST /api/productions → 201', async () => {
    // create usa getConnection (transação)
    db._mockConnection.query
      .mockResolvedValueOnce([{ insertId: 1, affectedRows: 1 }, []])  // INSERT productions
      .mockResolvedValueOnce([[], []])                                  // SELECT recipe_items (sem ingredientes)
 
    const res = await request(app).post('/api/productions').send({
      product_id: createdProductId,
      quantity: 50,
      production_date: new Date().toISOString().split('T')[0],
    });
    expect(res.status).toBe(201);
    createdProductionId = res.body.id ?? 1;
  });
 
  it('GET /api/productions → 200 + array', async () => {
    // getAll: query 1 returns rows array, query 2 returns [[{ total }], []]
    db.query
      .mockResolvedValueOnce([[{ id: 1, product_id: 1, quantity: 50 }], []])
      .mockResolvedValueOnce([[{ total: 1 }], []]);
 
    const res = await request(app).get('/api/productions');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
 
  it('GET /api/productions/summary → 200', async () => {
    // getSummary: [[{ lotes_ativos }]] then [[{ total, sem_problema }]]
    db.query
      .mockResolvedValueOnce([[{ lotes_ativos: 2 }], []])
      .mockResolvedValueOnce([[{ total: 5, sem_problema: 5 }], []]);
 
    const res = await request(app).get('/api/productions/summary');
    expect(res.status).toBe(200);
  });
 
  it('GET /api/productions/stats → 200', async () => {
    // getStats: 4 queries each returning [[{ field }], []]
    db.query
      .mockResolvedValueOnce([[{ total_kg: 100 }], []])
      .mockResolvedValueOnce([[{ avg_minutes: 45 }], []])
      .mockResolvedValueOnce([[{ this_week: 200 }], []])
      .mockResolvedValueOnce([[{ last_week: 150 }], []]);
 
    const res = await request(app).get('/api/productions/stats');
    expect(res.status).toBe(200);
  });
});
 
// ─── VENDAS ───────────────────────────────────────────────────────────────────
describe('💰 Vendas', () => {
  it('POST /api/sales → 201', async () => {
    db.query.mockResolvedValueOnce([{ insertId: 1, affectedRows: 1 }, []]);
 
    const res = await request(app).post('/api/sales').send({
      product_id: createdProductId,
      customer_id: createdCustomerId,
      quantity: 10,
      sale_date: new Date().toISOString().split('T')[0],
    });
    expect(res.status).toBe(201);
    createdSaleId = res.body.id ?? 1;
  });
 
  it('GET /api/sales → 200 + array', async () => {
    db.query.mockResolvedValueOnce([
      [{ id: 1, product_name: 'Brigadeiro', quantity: 10 }],
      [],
    ]);
 
    const res = await request(app).get('/api/sales');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
 
  it('GET /api/sales/stats → 200', async () => {
    // getStats: [[{ total_produced }]], [[{ total_sold }]], [[{ produced_today }]]
    db.query
      .mockResolvedValueOnce([[{ total_produced: 100 }], []])
      .mockResolvedValueOnce([[{ total_sold: 80 }], []])
      .mockResolvedValueOnce([[{ produced_today: 20 }], []]);
 
    const res = await request(app).get('/api/sales/stats');
    expect(res.status).toBe(200);
  });
});
 
// ─── DESPESAS ─────────────────────────────────────────────────────────────────
describe('🧾 Despesas', () => {
  it('POST /api/expenses → 201', async () => {
    db.query.mockResolvedValueOnce([{ insertId: 1, affectedRows: 1 }, []]);
 
    const res = await request(app).post('/api/expenses').send({
      description: 'Embalagens plásticas',
      amount: 50.0,
      category: 'embalagens',
      expense_date: new Date().toISOString().split('T')[0],
    });
    expect(res.status).toBe(201);
  });
 
  it('GET /api/expenses → 200 + array', async () => {
    db.query.mockResolvedValueOnce([
      [{ id: 1, description: 'Embalagens plásticas', amount: 50 }],
      [],
    ]);
 
    const res = await request(app).get('/api/expenses');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
 
// ─── METAS ────────────────────────────────────────────────────────────────────
describe('🎯 Metas', () => {
  it('POST /api/goals → 201 ou 200', async () => {
    db.query.mockResolvedValueOnce([{ insertId: 1, affectedRows: 1 }, []]);
 
    const res = await request(app).post('/api/goals').send({
      month_year: new Date().toISOString().slice(0, 7),
      target_amount: 5000,
      daily_order_target: 60,
    });
    expect([200, 201]).toContain(res.status);
  });
 
  it('GET /api/goals → 200', async () => {
    db.query.mockResolvedValueOnce([
      [{ id: 1, month_year: '2026-05', target_amount: 5000 }],
      [],
    ]);
 
    const res = await request(app).get('/api/goals');
    expect(res.status).toBe(200);
  });
 
  it('GET /api/goals/progress → 200', async () => {
    db.query
      .mockResolvedValueOnce([[{ target_amount: 5000, daily_order_target: 60 }], []])
      .mockResolvedValueOnce([[{ total: 1200 }], []]);
 
    const res = await request(app).get('/api/goals/progress');
    expect(res.status).toBe(200);
  });
});
 
// ─── RELATÓRIOS ───────────────────────────────────────────────────────────────
describe('📊 Relatórios', () => {
  it('GET /api/reports/profit → 200', async () => {
    db.query.mockResolvedValueOnce([
      [{ produto: 'Brigadeiro', total_vendido: 10, preco_venda: 3.5, faturamento: 35, custo_unitario: 1 }],
      [],
    ]);
 
    const res = await request(app).get('/api/reports/profit');
    expect(res.status).toBe(200);
  });
});
 
// ─── DASHBOARD ────────────────────────────────────────────────────────────────
describe('📈 Dashboard', () => {
  it('GET /api/dashboard/summary → 200', async () => {
    // dashboardController.getSummary faz várias queries
    db.query
      .mockResolvedValueOnce([[{ profit: 0 }], []])
      .mockResolvedValueOnce([[{ total: 0 }], []])
      .mockResolvedValueOnce([[{ daily_order_target: 50 }], []])
      .mockResolvedValueOnce([[], []])
      .mockResolvedValueOnce([[], []])
      .mockResolvedValueOnce([[], []])
      .mockResolvedValueOnce([[], []])
      .mockResolvedValueOnce([[], []]);
 
    const res = await request(app).get('/api/dashboard/summary');
    expect(res.status).toBe(200);
  });
 
  it('GET /api/dashboard/activities → 200', async () => {
    db.query.mockResolvedValueOnce([[], []]);
 
    const res = await request(app).get('/api/dashboard/activities');
    expect(res.status).toBe(200);
  });
});
 
// ─── FINANÇAS ─────────────────────────────────────────────────────────────────
describe('💳 Finanças', () => {
  it('GET /api/finance/summary → 200', async () => {
    // getMonthlySummary: 5 queries, each [[{ total/target_amount }], []]
    db.query
      .mockResolvedValueOnce([[{ total: 5000 }], []])   // currentGross
      .mockResolvedValueOnce([[{ total: 4000 }], []])   // prevGross
      .mockResolvedValueOnce([[{ total: 500 }], []])    // currentExpenses
      .mockResolvedValueOnce([[{ target_amount: 6000 }], []])  // goal
      .mockResolvedValueOnce([[{ total: 1000 }], []]);  // cmv
 
    const res = await request(app).get('/api/finance/summary');
    expect(res.status).toBe(200);
  });
 
  it('GET /api/finance/previous-month → 200', async () => {
    // getPreviousMonthSummary: [[{prev}]], [[{total}]], [[{total}]], [[{total}]]
    db.query
      .mockResolvedValueOnce([[{ prev: '2026-04' }], []])  // prevMonth string query
      .mockResolvedValueOnce([[{ total: 4000 }], []])       // gross
      .mockResolvedValueOnce([[{ total: 300 }], []])        // expenses
      .mockResolvedValueOnce([[{ total: 800 }], []]);       // cmv
 
    const res = await request(app).get('/api/finance/previous-month');
    expect(res.status).toBe(200);
  });
 
  it('GET /api/finance/movements → 200', async () => {
    db.query.mockResolvedValueOnce([[], []]);
 
    const res = await request(app).get('/api/finance/movements');
    expect(res.status).toBe(200);
  });
});
 
// ─── ENTREGAS ─────────────────────────────────────────────────────────────────
describe('🚚 Entregas', () => {
  it('POST /api/deliveries → 201', async () => {
    db.query.mockResolvedValueOnce([{ insertId: 1, affectedRows: 1 }, []]);
 
    const res = await request(app).post('/api/deliveries').send({
      customer_id: createdCustomerId,
      production_id: createdProductionId,
      scheduled_at: new Date().toISOString(),
    });
    expect(res.status).toBe(201);
  });
 
  it('GET /api/deliveries → 200', async () => {
    db.query.mockResolvedValueOnce([
      [{ id: 1, customer_name: 'Maria Silva', status: 'Pendente' }],
      [],
    ]);
 
    const res = await request(app).get('/api/deliveries');
    expect(res.status).toBe(200);
  });
});