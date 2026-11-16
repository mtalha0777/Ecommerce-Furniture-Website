// Demo data for a fresh database. Runs at startup only when SEED_DEMO=true.
// It never overwrites anything: each block is skipped once its data exists.
const bcrypt = require('bcryptjs');
const User = require('./model/user');
const Bed = require('./model/bed');
const Sofa = require('./model/sofa');
const Table = require('./model/table');
const Shop = require('./model/shop');
const Product = require('./model/product');

const beds = [
    { name: 'Cushion-01', price: 74000, imageUrl: '/images/bed.webp', description: 'Cushioned headboard bed.' },
    { name: 'Wooden-01', price: 56099, imageUrl: '/images/bed2.jpeg', description: 'Solid wooden bed.' },
    { name: 'Rounded-Cushion-01', price: 97000, imageUrl: '/images/bed3.jpeg', description: 'Rounded cushion bed.' },
    { name: 'Cushion-02', price: 82000, imageUrl: '/images/bed4.jpeg', description: 'Cushioned bed with storage.' },
];
const sofas = [
    { name: 'Leather Sofa', price: 85000, imageUrl: '/images/sofa1.jpeg', description: 'Three-seater leather sofa.' },
    { name: 'Fabric Sofa', price: 45000, imageUrl: '/images/sofa2.jpeg', description: 'Comfortable fabric sofa.' },
    { name: 'Corner Sofa', price: 68000, imageUrl: '/images/sofa3.jpeg', description: 'L-shaped corner sofa.' },
];
const tables = [
    { name: 'Wooden Dining Table', price: 65000, imageUrl: '/images/table1.jpeg', description: 'Elegant wooden dining table.' },
    { name: 'Glass Coffee Table', price: 25000, imageUrl: '/images/table2.jpeg', description: 'Modern glass coffee table.' },
    { name: 'Study Table', price: 18000, imageUrl: '/images/table3.jpeg', description: 'Compact study table.' },
];
// Product images are files committed in server/uploads, so they survive redeploys.
const products = [
    { productName: 'Cushion Bed', category: 'Beds', price: 74000, images: ['demo-bed.webp'] },
    { productName: 'Classic Wooden Bed', category: 'Beds', price: 56000, images: ['demo-bed2.jpeg'] },
    { productName: 'Rounded Cushion Bed', category: 'Beds', price: 97000, images: ['demo-bed3.jpeg'] },
    { productName: 'Storage Bed', category: 'Beds', price: 82000, images: ['demo-bed4.jpeg'] },
    { productName: 'Leather Sofa', category: 'Sofa', price: 85000, images: ['demo-sofa1.jpeg'] },
    { productName: 'Fabric Sofa', category: 'Sofa', price: 45000, images: ['demo-sofa2.jpeg'] },
    { productName: 'Corner Sofa', category: 'Sofa', price: 68000, images: ['demo-sofa3.jpeg'] },
    { productName: 'Wooden Dining Table', category: 'Tables', price: 65000, images: ['demo-table1.jpeg'] },
    { productName: 'Glass Coffee Table', category: 'Tables', price: 25000, images: ['demo-table2.jpeg'] },
    { productName: 'Study Table', category: 'Tables', price: 18000, images: ['demo-table3.jpeg'] },
    { productName: 'Side Table', category: 'Tables', price: 12000, images: ['demo-table4.jpeg'] },
];

const DEMO_USERS = {
    customer: { name: 'Demo Customer', email: 'customer@demo.furniture', role: '1', firstLogin: false },
    seller: { name: 'Demo Seller', email: 'seller@demo.furniture', role: '2', firstLogin: false },
    admin: { name: 'Demo Admin', email: 'admin@demo.furniture', role: '3', firstLogin: false },
};

async function seedCatalogue(Model, items) {
    if ((await Model.countDocuments()) > 0) return 0;
    for (const item of items) await Model.create(item);
    return items.length;
}

async function seedDemo({ password = process.env.SEED_DEMO_PASSWORD, log = console.log } = {}) {
    const summary = {
        beds: await seedCatalogue(Bed, beds),
        sofas: await seedCatalogue(Sofa, sofas),
        tables: await seedCatalogue(Table, tables),
        users: 0,
        shops: 0,
        products: 0,
    };

    // Demo accounts are created only when a password is supplied through the
    // environment, so no credential ever lives in the repository.
    if (typeof password !== 'string' || password.length < 8) {
        log('Demo seed: catalogue only (set SEED_DEMO_PASSWORD, 8+ characters, to add demo accounts and a demo shop).');
        return summary;
    }

    const hash = await bcrypt.hash(password, 10);
    const accounts = {};
    for (const [key, details] of Object.entries(DEMO_USERS)) {
        accounts[key] = await User.findOne({ email: details.email });
        if (!accounts[key]) {
            accounts[key] = await User.create({ ...details, password: hash });
            summary.users += 1;
        }
    }

    let shop = await Shop.findOne({ userID: accounts.seller.id });
    if (!shop) {
        shop = await Shop.create({
            shopName: 'Demo Furniture House',
            street: 'Main Boulevard',
            city: 'Lahore',
            productCategories: 'Beds, Sofa, Tables',
            userID: accounts.seller.id,
        });
        summary.shops = 1;
    }

    if ((await Product.countDocuments({ shopID: shop.id })) === 0) {
        for (const product of products) await Product.create({ ...product, shopID: shop.id });
        summary.products = products.length;
    }

    log('Demo seed complete:', JSON.stringify(summary));
    return summary;
}

module.exports = { seedDemo, DEMO_USERS, products };
