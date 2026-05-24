const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port:     process.env.DB_PORT || 5432,
    // ⚠️ Remover o SSL pois é banco local — SSL é só para Render/produção
    ssl: { rejectUnauthorized: false } //ssl: false
});

// Helper para converter sintaxe de placeholder de ? para $1, $2, etc.
const convertPlaceholders = (text) => {
    let index = 1;
    return text.replace(/\?/g, () => `$${index++}`);
};

// Wrapper para o cliente de conexão para suportar transações (compatível com mysql2)
class ConnectionWrapper {
    constructor(client) {
        this.client = client;
    }

    async query(text, params) {
        const convertedText = convertPlaceholders(text);
        const res = await this.client.query(convertedText, params);
        
        if (res.command === 'INSERT' || res.command === 'UPDATE' || res.command === 'DELETE') {
            const resultObj = {
                insertId: res.rows[0] ? res.rows[0].id : null,
                affectedRows: res.rowCount
            };
            return [resultObj, []];
        }
        return [res.rows, []];
    }

    async beginTransaction() {
        await this.client.query('BEGIN');
    }

    async commit() {
        await this.client.query('COMMIT');
    }

    async rollback() {
        await this.client.query('ROLLBACK');
    }

    release() {
        this.client.release();
    }
}

// Helper para manter a compatibilidade com a sintaxe [rows] do mysql2
const query = async (text, params) => {
    const convertedText = convertPlaceholders(text);
    const res = await pool.query(convertedText, params);
    
    if (res.command === 'INSERT' || res.command === 'UPDATE' || res.command === 'DELETE') {
        const resultObj = {
            insertId: res.rows[0] ? res.rows[0].id : null,
            affectedRows: res.rowCount
        };
        return [resultObj, []];
    }
    
    return [res.rows, []];
};

const getConnection = async () => {
    const client = await pool.connect();
    return new ConnectionWrapper(client);
};

module.exports = {
    pool,
    query,
    getConnection
};
