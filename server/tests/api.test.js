process.env.JWT_SECRET = 'test-secret';
process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';

const mockRetrieve = jest.fn();
const mockCreate = jest.fn();
jest.mock('stripe', () => () => ({ paymentIntents: { retrieve: mockRetrieve, create: mockCreate } }));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { installMemoryStore, resetStores, rowsOf } = require('./helpers/memoryStore');

const User = require('../model/user');
const Bed = require('../model/bed');
const Sofa = require('../model/sofa');
const Table = require('../model/table');
const Order = require('../model/order');
const Shop = require('../model/shop');
const Product = require('../model/product');
const Favorite = require('../model/favourite');
const Cart = require('../model/cart');

[User, Bed, Sofa, Table, Order, Shop, Product, Favorite, Cart].forEach(installMemoryStore);

const app = require('../index');

const newId = () => new mongoose.Types.ObjectId().toString();
const bearer = (token) => ({ Authorization: `Bearer ${token}` });

async function makeUser(overrides = {}) {
    const user = await User.create({
        name: 'Test User',
        email: `user-${newId()}@example.com`,
        password: await bcrypt.hash('password123', 4),
        role: '1',
        firstLogin: false,
        ...overrides,
    });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return { user, token };
}

const cartItem = (productID = newId()) => ({
    productID,
    productName: 'Oak Table',
    category: 'Table',
    price: 500,
    images: ['a.png'],
    shopName: 'Wood Works',
    address: 'Lahore',
});

const orderBody = (extra = {}) => ({
    name: 'Ali',
    address: 'Street 1',
    postalCode: '54000',
    phoneNumber: '03001234567',
    paymentMethod: 'cod',
    products: [{ name: 'Oak Table', price: 500 }],
    totalAmount: 500,
    shippingCharges: 200,
    grandTotal: 700,
    ...extra,
});

beforeEach(() => {
    resetStores();
    mockRetrieve.mockReset();
    mockCreate.mockReset();
});

describe('authentication middleware', () => {
    test('missing Authorization header returns 401, not a 500 crash', async () => {
        const res = await request(app).get('/cart/abc');
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('No token provided');
    });

    test('malformed header returns 401', async () => {
        const res = await request(app).get('/cart/abc').set('Authorization', 'Bearer');
        expect(res.status).toBe(401);
    });

    test('token signed with another secret returns 403', async () => {
        const forged = jwt.sign({ id: newId(), role: '3' }, 'wrong-secret');
        const res = await request(app).get('/users').set(bearer(forged));
        expect(res.status).toBe(403);
    });

    test('expired token returns 401', async () => {
        const expired = jwt.sign({ id: newId(), role: '1' }, process.env.JWT_SECRET, { expiresIn: -10 });
        const res = await request(app).get('/cart/abc').set(bearer(expired));
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Token has expired');
    });
});

describe('POST /register', () => {
    const valid = { name: 'Talha', email: 'talha@example.com', password: 'password123', role: 1 };

    test('stores a bcrypt hash and never returns the password', async () => {
        const res = await request(app).post('/register').send(valid);
        expect(res.status).toBe(201);
        expect(res.body.password).toBeUndefined();
        const stored = rowsOf(User)[0];
        expect(stored.password).not.toBe('password123');
        expect(await bcrypt.compare('password123', stored.password)).toBe(true);
        expect(stored.firstLogin).toBe(true);
    });

    test('cannot self-register as admin', async () => {
        const res = await request(app).post('/register').send({ ...valid, role: 3 });
        expect(res.status).toBe(201);
        expect(rowsOf(User)[0].role).toBe('1');
    });

    test('seller role is kept', async () => {
        await request(app).post('/register').send({ ...valid, role: 2 });
        expect(rowsOf(User)[0].role).toBe('2');
    });

    test('duplicate email is rejected with 409', async () => {
        await request(app).post('/register').send(valid);
        const res = await request(app).post('/register').send(valid);
        expect(res.status).toBe(409);
        expect(rowsOf(User)).toHaveLength(1);
    });

    test.each([
        ['missing name', { ...valid, name: '' }],
        ['invalid email', { ...valid, email: 'not-an-email' }],
        ['short password', { ...valid, password: 'short' }],
        ['object password', { ...valid, password: { $gt: '' } }],
    ])('rejects %s with 400', async (_label, body) => {
        const res = await request(app).post('/register').send(body);
        expect(res.status).toBe(400);
        expect(rowsOf(User)).toHaveLength(0);
    });
});

describe('POST /login', () => {
    test('correct password returns a token for that user', async () => {
        const { user } = await makeUser({ email: 'a@example.com' });
        const res = await request(app).post('/login').send({ email: 'a@example.com', password: 'password123' });
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Success');
        expect(res.body.userID).toBe(user.id);
        expect(jwt.verify(res.body.token, process.env.JWT_SECRET).id).toBe(user.id);
    });

    test('wrong password and unknown email give the same 401', async () => {
        await makeUser({ email: 'a@example.com' });
        const wrong = await request(app).post('/login').send({ email: 'a@example.com', password: 'nope-nope' });
        const unknown = await request(app).post('/login').send({ email: 'x@example.com', password: 'nope-nope' });
        expect(wrong.status).toBe(401);
        expect(unknown.status).toBe(401);
        expect(wrong.body).toBe(unknown.body);
    });

    test('legacy plain-text password still logs in and is upgraded to a hash', async () => {
        await makeUser({ email: 'old@example.com', password: 'legacy-pass' });
        const res = await request(app).post('/login').send({ email: 'old@example.com', password: 'legacy-pass' });
        expect(res.status).toBe(200);
        const stored = rowsOf(User)[0].password;
        expect(stored).not.toBe('legacy-pass');
        expect(await bcrypt.compare('legacy-pass', stored)).toBe(true);
        const again = await request(app).post('/login').send({ email: 'old@example.com', password: 'legacy-pass' });
        expect(again.status).toBe(200);
    });

    test('a bcrypt hash cannot be used as the password', async () => {
        const { user } = await makeUser({ email: 'a@example.com' });
        const res = await request(app).post('/login').send({ email: 'a@example.com', password: user.password });
        expect(res.status).toBe(401);
    });

    test('NoSQL operator objects are rejected', async () => {
        await makeUser();
        const res = await request(app).post('/login').send({ email: { $gt: '' }, password: { $gt: '' } });
        expect(res.status).toBe(400);
    });

    test('missing body fields return 400', async () => {
        const res = await request(app).post('/login').send({});
        expect(res.status).toBe(400);
    });
});

describe('account deletion', () => {
    test('requires a login', async () => {
        const { user } = await makeUser();
        const res = await request(app).delete(`/logins/${user.email}`);
        expect(res.status).toBe(401);
        expect(rowsOf(User)).toHaveLength(1);
    });

    test("a user cannot delete someone else's account", async () => {
        const victim = await makeUser();
        const attacker = await makeUser();
        const res = await request(app).delete(`/logins/${victim.user.email}`).set(bearer(attacker.token));
        expect(res.status).toBe(403);
        expect(rowsOf(User)).toHaveLength(2);
    });

    test('a user can delete their own account', async () => {
        const { user, token } = await makeUser();
        const res = await request(app).delete(`/logins/${user.email}`).set(bearer(token));
        expect(res.status).toBe(200);
        expect(rowsOf(User)).toHaveLength(0);
    });
});

describe('admin-only routes', () => {
    test.each([
        ['get', '/users'],
        ['get', '/orders'],
        ['get', '/shops'],
    ])('%s %s is forbidden for normal users and allowed for admins', async (method, url) => {
        const normal = await makeUser();
        const admin = await makeUser({ role: '3' });
        expect((await request(app)[method](url).set(bearer(normal.token))).status).toBe(403);
        expect((await request(app)[method](url).set(bearer(admin.token))).status).toBe(200);
    });

    test('a normal user cannot promote themselves to admin', async () => {
        const { user, token } = await makeUser();
        const res = await request(app).put(`/users/${user.id}/role`).set(bearer(token)).send({ role: '3' });
        expect(res.status).toBe(403);
        expect(rowsOf(User)[0].role).toBe('1');
    });

    test('an admin can change a role, but only to a valid one', async () => {
        const target = await makeUser();
        const admin = await makeUser({ role: '3' });
        const bad = await request(app).put(`/users/${target.user.id}/role`).set(bearer(admin.token)).send({ role: 'superuser' });
        expect(bad.status).toBe(400);
        const ok = await request(app).put(`/users/${target.user.id}/role`).set(bearer(admin.token)).send({ role: 2 });
        expect(ok.status).toBe(200);
        expect(ok.body.user.password).toBeUndefined();
        expect(rowsOf(User)[0].role).toBe('2');
    });

    test('a normal user cannot delete other users', async () => {
        const victim = await makeUser();
        const attacker = await makeUser();
        const res = await request(app).delete(`/users/${victim.user.id}`).set(bearer(attacker.token));
        expect(res.status).toBe(403);
        expect(rowsOf(User)).toHaveLength(2);
    });

    test('order status accepts only known values', async () => {
        const admin = await makeUser({ role: '3' });
        const order = await Order.create(orderBody());
        const bad = await request(app).put(`/orders/${order.id}/status`).set(bearer(admin.token)).send({ status: 'Hacked' });
        expect(bad.status).toBe(400);
        const ok = await request(app).put(`/orders/${order.id}/status`).set(bearer(admin.token)).send({ status: 'Delivered' });
        expect(ok.status).toBe(200);
        expect(rowsOf(Order)[0].status).toBe('Delivered');
    });
});

describe('cart', () => {
    test('add, check, read and toggle off', async () => {
        const { user, token } = await makeUser();
        const item = cartItem();
        const added = await request(app).post('/addToCart').set(bearer(token)).send({ userID: user.id, ...item });
        expect(added.status).toBe(201);
        const check = await request(app).post('/checkInCart').set(bearer(token)).send({ userID: user.id, productID: item.productID });
        expect(check.body.isInCart).toBe(true);
        const cart = await request(app).get(`/cart/${user.id}`).set(bearer(token));
        expect(cart.body.products).toHaveLength(1);
        const removed = await request(app).post('/addToCart').set(bearer(token)).send({ userID: user.id, ...item });
        expect(removed.status).toBe(200);
        expect(rowsOf(Cart)[0].products).toHaveLength(0);
    });

    test('an invalid item answers 400 once and stores nothing', async () => {
        const { user, token } = await makeUser();
        const res = await request(app).post('/addToCart').set(bearer(token)).send({ userID: user.id, productID: newId() });
        expect(res.status).toBe(400);
        expect(rowsOf(Cart)).toHaveLength(0);
    });

    test("a user cannot read or change another user's cart", async () => {
        const owner = await makeUser();
        const other = await makeUser();
        const item = cartItem();
        await request(app).post('/addToCart').set(bearer(owner.token)).send({ userID: owner.user.id, ...item });

        expect((await request(app).get(`/cart/${owner.user.id}`).set(bearer(other.token))).status).toBe(403);
        expect((await request(app).post('/addToCart').set(bearer(other.token)).send({ userID: owner.user.id, ...item })).status).toBe(403);
        expect((await request(app).delete(`/cart/${owner.user.id}/remove/${item.productID}`).set(bearer(other.token))).status).toBe(403);
        expect(rowsOf(Cart)[0].products).toHaveLength(1);
    });

    test('clearcart without a userID clears only the caller, never every cart', async () => {
        const a = await makeUser();
        const b = await makeUser();
        await request(app).post('/addToCart').set(bearer(a.token)).send({ userID: a.user.id, ...cartItem() });
        await request(app).post('/addToCart').set(bearer(b.token)).send({ userID: b.user.id, ...cartItem() });

        const res = await request(app).delete('/clearcart').set(bearer(a.token)).send({});
        expect(res.status).toBe(200);
        expect(rowsOf(Cart).map((c) => c.userID)).toEqual([b.user.id]);
    });

    test("clearcart cannot target another user's cart", async () => {
        const a = await makeUser();
        const b = await makeUser();
        await request(app).post('/addToCart').set(bearer(b.token)).send({ userID: b.user.id, ...cartItem() });
        const res = await request(app).delete('/clearcart').set(bearer(a.token)).send({ userID: b.user.id });
        expect(res.status).toBe(403);
        expect(rowsOf(Cart)).toHaveLength(1);
    });
});

describe('orders', () => {
    test("placing an order clears only the buyer's cart", async () => {
        const buyer = await makeUser();
        const bystander = await makeUser();
        await request(app).post('/addToCart').set(bearer(buyer.token)).send({ userID: buyer.user.id, ...cartItem() });
        await request(app).post('/addToCart').set(bearer(bystander.token)).send({ userID: bystander.user.id, ...cartItem() });

        // The frontend does not send userID with the order, exactly as here.
        const res = await request(app).post('/orders').set(bearer(buyer.token)).send(orderBody());
        expect(res.status).toBe(201);
        expect(rowsOf(Cart).map((c) => c.userID)).toEqual([bystander.user.id]);
    });

    test('cash on delivery is stored as pending even if the client claims paid', async () => {
        const { token } = await makeUser();
        const res = await request(app).post('/orders').set(bearer(token))
            .send(orderBody({ paymentStatus: 'paid', status: 'Delivered' }));
        expect(res.status).toBe(201);
        expect(res.body.order.paymentStatus).toBe('pending');
        expect(res.body.order.status).toBe('Pending');
        expect(mockRetrieve).not.toHaveBeenCalled();
    });

    test('card order is paid only when Stripe confirms the payment succeeded', async () => {
        const { token } = await makeUser();
        mockRetrieve.mockResolvedValue({ id: 'pi_1', status: 'succeeded' });
        const res = await request(app).post('/orders').set(bearer(token))
            .send(orderBody({ paymentMethod: 'card', paymentIntentID: 'pi_1' }));
        expect(res.status).toBe(201);
        expect(res.body.order.paymentStatus).toBe('paid');
        expect(mockRetrieve).toHaveBeenCalledWith('pi_1');
    });

    test('unfinished or unknown payments are refused with 402 and no order is saved', async () => {
        const { token } = await makeUser();
        mockRetrieve.mockResolvedValueOnce({ id: 'pi_2', status: 'requires_payment_method' });
        const unfinished = await request(app).post('/orders').set(bearer(token)).send(orderBody({ paymentIntentID: 'pi_2' }));
        mockRetrieve.mockRejectedValueOnce(new Error('No such payment_intent'));
        const unknown = await request(app).post('/orders').set(bearer(token)).send(orderBody({ paymentIntentID: 'pi_fake' }));
        expect(unfinished.status).toBe(402);
        expect(unknown.status).toBe(402);
        expect(rowsOf(Order)).toHaveLength(0);
    });

    test('one payment cannot pay for two orders', async () => {
        const { token } = await makeUser();
        mockRetrieve.mockResolvedValue({ id: 'pi_1', status: 'succeeded' });
        await request(app).post('/orders').set(bearer(token)).send(orderBody({ paymentIntentID: 'pi_1' }));
        const second = await request(app).post('/orders').set(bearer(token)).send(orderBody({ paymentIntentID: 'pi_1' }));
        expect(second.status).toBe(409);
        expect(rowsOf(Order)).toHaveLength(1);
    });

    test('incomplete order returns 400, not 500', async () => {
        const { token } = await makeUser();
        const res = await request(app).post('/orders').set(bearer(token)).send({ name: 'Ali' });
        expect(res.status).toBe(400);
    });
});

describe('payment intent', () => {
    test.each([[undefined], ['abc'], [0], [-5]])('amount %p is rejected with 400', async (amount) => {
        const { token } = await makeUser();
        const res = await request(app).post('/create-payment-intent').set(bearer(token)).send({ amount });
        expect(res.status).toBe(400);
        expect(mockCreate).not.toHaveBeenCalled();
    });

    test('valid amount is converted to the smallest currency unit', async () => {
        const { token } = await makeUser();
        mockCreate.mockResolvedValue({ client_secret: 'secret_1' });
        const res = await request(app).post('/create-payment-intent').set(bearer(token)).send({ amount: 19.99 });
        expect(res.status).toBe(200);
        expect(res.body.clientSecret).toBe('secret_1');
        expect(mockCreate.mock.calls[0][0].amount).toBe(1999);
    });
});

describe('search', () => {
    beforeEach(async () => {
        const shopID = newId();
        await Product.create({ productName: 'Oak Table (Large)', category: 'Table', shopID, images: ['a.png'], price: 10 });
        await Product.create({ productName: 'King Bed', category: 'Bed', shopID, images: ['b.png'], price: 20 });
    });

    test('regex special characters are treated as plain text', async () => {
        const broken = await request(app).post('/search').send({ query: '(', category: 'All Categories' });
        expect(broken.status).toBe(200);
        expect(broken.body).toHaveLength(1);
        const wildcard = await request(app).post('/search').send({ query: '.*', category: 'All Categories' });
        expect(wildcard.body).toHaveLength(0);
    });

    test('a request without a category still gets an answer', async () => {
        const res = await request(app).post('/search').send({ query: 'king' });
        expect(res.status).toBe(200);
        expect(res.body.map((p) => p.productName)).toEqual(['King Bed']);
    });

    test('category filter and name fallback to category work', async () => {
        const byCategory = await request(app).post('/search').send({ query: '', category: 'bed' });
        expect(byCategory.body).toHaveLength(1);
        const fallback = await request(app).post('/search').send({ query: 'table', category: 'All Categories' });
        expect(fallback.body).toHaveLength(1);
    });

    test('searchedProduct rejects non-string terms and escapes input', async () => {
        expect((await request(app).post('/searchedProduct').send({ searchTerm: { $ne: '' } })).status).toBe(400);
        const res = await request(app).post('/searchedProduct').send({ searchTerm: '[' });
        expect(res.status).toBe(200);
        expect(res.body.products).toHaveLength(0);
    });
});

describe('shops and products', () => {
    async function makeShop(owner) {
        return Shop.create({ shopName: 'Wood Works', street: 'S1', city: 'Lahore', productCategories: 'Table', userID: owner.user.id });
    }

    test('createshop ties the shop to the logged-in user and clears firstLogin', async () => {
        const seller = await makeUser({ role: '2', firstLogin: true });
        const res = await request(app).post('/createshop').set(bearer(seller.token))
            .field('shopName', 'Wood Works').field('street', 'S1').field('city', 'Lahore').field('productCategories', 'Table');
        expect(res.status).toBe(201);
        expect(rowsOf(Shop)[0].userID).toBe(seller.user.id);
        expect(rowsOf(User)[0].firstLogin).toBe(false);
    });

    test('createshop cannot be used to create a shop for another user', async () => {
        const seller = await makeUser({ role: '2' });
        const other = await makeUser({ role: '2' });
        const res = await request(app).post('/createshop').set(bearer(seller.token))
            .field('shopName', 'X').field('street', 'S').field('city', 'C').field('productCategories', 'Bed')
            .field('userID', other.user.id);
        expect(res.status).toBe(403);
        expect(rowsOf(Shop)).toHaveLength(0);
    });

    test('only the owner or an admin can add, edit or delete products of a shop', async () => {
        const owner = await makeUser({ role: '2' });
        const stranger = await makeUser({ role: '2' });
        const admin = await makeUser({ role: '3' });
        const shop = await makeShop(owner);

        const denied = await request(app).post('/createproduct').set(bearer(stranger.token))
            .field('productName', 'Chair').field('category', 'Chair').field('price', '10').field('shopID', shop.id);
        expect(denied.status).toBe(403);

        const created = await request(app).post('/createproduct').set(bearer(owner.token))
            .field('productName', 'Chair').field('category', 'Chair').field('price', '10').field('shopID', shop.id);
        expect(created.status).toBe(201);
        const productID = created.body.product._id;

        const editDenied = await request(app).put('/updateProduct').set(bearer(stranger.token))
            .field('productID', productID).field('price', '1');
        expect(editDenied.status).toBe(403);
        expect(rowsOf(Product)[0].price).toBe(10);

        const edited = await request(app).put('/updateProduct').set(bearer(owner.token))
            .field('productID', productID).field('price', '25');
        expect(edited.status).toBe(200);
        expect(Number(rowsOf(Product)[0].price)).toBe(25);

        const deleteDenied = await request(app).delete('/deleteProduct').set(bearer(stranger.token)).send({ id: productID });
        expect(deleteDenied.status).toBe(403);
        expect(rowsOf(Product)).toHaveLength(1);

        const deleted = await request(app).delete('/deleteProduct').set(bearer(admin.token)).send({ id: productID });
        expect(deleted.status).toBe(200);
        expect(rowsOf(Product)).toHaveLength(0);
    });

    test('only the owner can update a shop', async () => {
        const owner = await makeUser({ role: '2' });
        const stranger = await makeUser({ role: '2' });
        const shop = await makeShop(owner);
        const denied = await request(app).put('/updateShop').set(bearer(stranger.token)).field('shopID', shop.id).field('shopName', 'Stolen');
        expect(denied.status).toBe(403);
        expect(rowsOf(Shop)[0].shopName).toBe('Wood Works');
    });

    test('malformed and unknown IDs return 400 and 404, not 500 or 200', async () => {
        const { token } = await makeUser();
        expect((await request(app).get('/shop/not-an-id').set(bearer(token))).status).toBe(400);
        expect((await request(app).get(`/shop/${newId()}`).set(bearer(token))).status).toBe(404);
        expect((await request(app).delete('/deleteProduct').set(bearer(token)).send({ id: 'xyz' })).status).toBe(400);
        expect((await request(app).get('/user/not-an-id').set(bearer(token))).status).toBe(400);
    });
});

describe('favourites and profile', () => {
    test("a user cannot delete another user's favourite", async () => {
        const owner = await makeUser();
        const other = await makeUser();
        await request(app).post('/favorite').set(bearer(owner.token)).send({ userID: owner.user.id, ...cartItem() });
        const favoriteId = String(rowsOf(Favorite)[0]._id);

        expect((await request(app).delete(`/favorites/${favoriteId}`).set(bearer(other.token))).status).toBe(403);
        expect((await request(app).get(`/favorites/${owner.user.id}`).set(bearer(other.token))).status).toBe(403);
        expect((await request(app).delete(`/favorites/${favoriteId}`).set(bearer(owner.token))).status).toBe(200);
        expect(rowsOf(Favorite)).toHaveLength(0);
    });

    test("a user cannot edit another user's profile", async () => {
        const owner = await makeUser({ name: 'Owner' });
        const other = await makeUser();
        const denied = await request(app).put(`/user/${owner.user.id}`).set(bearer(other.token)).send({ name: 'Hacked' });
        expect(denied.status).toBe(403);
        const ok = await request(app).put(`/user/${owner.user.id}`).set(bearer(owner.token)).send({ name: 'New Name' });
        expect(ok.status).toBe(200);
        expect(ok.body.user.password).toBeUndefined();
        expect(rowsOf(User)[0].name).toBe('New Name');
    });
});

describe('catalogue and plumbing', () => {
    test('reading beds is public, changing them needs a login', async () => {
        expect((await request(app).get('/beds')).status).toBe(200);
        expect((await request(app).post('/beds').send({ name: 'B', price: 1, imageUrl: 'x' })).status).toBe(401);
        expect((await request(app).delete('/sofas/any')).status).toBe(401);
        expect((await request(app).delete('/tables/any')).status).toBe(401);
    });

    test('bed description is saved and delete reports success', async () => {
        const { token } = await makeUser();
        const created = await request(app).post('/beds').set(bearer(token)).send({ name: 'B1', price: 1, imageUrl: 'x', description: 'Soft' });
        expect(created.status).toBe(201);
        expect(created.body.description).toBe('Soft');
        const deleted = await request(app).delete('/beds/B1').set(bearer(token));
        expect(deleted.body.success).toBe(true);
    });

    test('logout endpoint exists', async () => {
        expect((await request(app).post('/logout')).status).toBe(200);
    });

    test('unknown routes and broken JSON answer in JSON', async () => {
        const missing = await request(app).get('/nope');
        expect(missing.status).toBe(404);
        expect(missing.body.message).toBe('Route not found');
        const broken = await request(app).post('/login').set('Content-Type', 'application/json').send('{bad');
        expect(broken.status).toBe(400);
        expect(broken.body.message).toMatch(/valid JSON/);
    });
});
