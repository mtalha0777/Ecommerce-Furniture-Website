process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const { installMemoryStore, resetStores, rowsOf } = require('./helpers/memoryStore');

const User = require('../model/user');
const Bed = require('../model/bed');
const Sofa = require('../model/sofa');
const Table = require('../model/table');
const Shop = require('../model/shop');
const Product = require('../model/product');

[User, Bed, Sofa, Table, Shop, Product].forEach(installMemoryStore);

const fs = require('fs');
const path = require('path');
const app = require('../index');
const { seedDemo, products } = require('../seedDemo');

const quiet = { log: () => {} };

beforeEach(resetStores);

test('without a password only the catalogue is seeded', async () => {
    const summary = await seedDemo({ password: undefined, ...quiet });
    expect(summary.users).toBe(0);
    expect(rowsOf(User)).toHaveLength(0);
    expect(rowsOf(Product)).toHaveLength(0);
    expect(rowsOf(Bed).length).toBeGreaterThan(0);
    expect(rowsOf(Sofa).length).toBeGreaterThan(0);
    expect(rowsOf(Table).length).toBeGreaterThan(0);
});

test('with a password it creates hashed demo accounts, a shop and products', async () => {
    await seedDemo({ password: 'demo-password-1', ...quiet });
    expect(rowsOf(User).map((u) => u.role).sort()).toEqual(['1', '2', '3']);
    expect(rowsOf(User).every((u) => u.password !== 'demo-password-1')).toBe(true);
    expect(rowsOf(Shop)).toHaveLength(1);
    expect(rowsOf(Product)).toHaveLength(products.length);
    expect(String(rowsOf(Product)[0].shopID)).toBe(String(rowsOf(Shop)[0]._id));
});

test('running it twice changes nothing', async () => {
    await seedDemo({ password: 'demo-password-1', ...quiet });
    const second = await seedDemo({ password: 'demo-password-1', ...quiet });
    expect(second).toEqual({ beds: 0, sofas: 0, tables: 0, users: 0, shops: 0, products: 0 });
    expect(rowsOf(User)).toHaveLength(3);
    expect(rowsOf(Product)).toHaveLength(products.length);
});

test('a seeded demo account can log in and search finds seeded products', async () => {
    await seedDemo({ password: 'demo-password-1', ...quiet });
    const login = await request(app).post('/login').send({ email: 'seller@demo.furniture', password: 'demo-password-1' });
    expect(login.status).toBe(200);
    expect(login.body.role).toBe('2');
    const search = await request(app).post('/searchedProduct').send({ searchTerm: 'Sofa' });
    expect(search.body.products.length).toBe(products.filter((p) => p.category === 'Sofa').length);
});

test('every seeded product image exists in uploads', () => {
    for (const product of products) {
        for (const image of product.images) {
            expect(fs.existsSync(path.join(__dirname, '..', 'uploads', image))).toBe(true);
        }
    }
});
