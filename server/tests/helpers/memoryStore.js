// In-memory replacement for the MongoDB driver layer, used by the API tests.
// The real Mongoose models and schemas stay in place, so casting, strict mode
// and validation behave as in production. Only persistence is replaced.
const mongoose = require('mongoose');

const stores = new Map();

const getPath = (obj, path) => path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);

function matches(record, filter) {
    return Object.entries(filter).every(([key, expected]) => {
        const actual = getPath(record, key);
        if (expected && typeof expected === 'object' && '$regex' in expected) {
            return new RegExp(expected.$regex, expected.$options || '').test(String(actual ?? ''));
        }
        return String(actual) === String(expected);
    });
}

// Mongoose drops undefined values from filters, so { userID: undefined } becomes {}.
const clean = (filter = {}) => Object.fromEntries(Object.entries(filter).filter(([, v]) => v !== undefined));

function project(record, projection) {
    const copy = { ...record };
    const select = typeof projection === 'string' ? projection : projection && projection.select;
    if (typeof select === 'string') {
        select.split(/\s+/).filter((f) => f.startsWith('-')).forEach((f) => delete copy[f.slice(1)]);
    }
    return copy;
}

function listQuery(Model, records) {
    let result = records;
    const query = {
        skip(n) { result = result.slice(n); return query; },
        limit(n) { result = result.slice(0, n); return query; },
        sort() { return query; },
        then(resolve, reject) {
            return Promise.resolve(result.map((r) => Model.hydrate(r))).then(resolve, reject);
        },
    };
    return query;
}

function installMemoryStore(Model) {
    const rows = [];
    stores.set(Model.modelName, rows);
    const hydrate = (record, projection) => (record ? Model.hydrate(project(record, projection)) : null);
    const byId = (id) => rows.find((r) => String(r._id) === String(id));
    const assertId = (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            const error = new Error(`Cast to ObjectId failed for value "${id}"`);
            error.name = 'CastError';
            throw error;
        }
    };

    Model.prototype.save = async function save() {
        await this.validate();
        const record = this.toObject();
        const index = rows.findIndex((r) => String(r._id) === String(record._id));
        if (index === -1) rows.push(record); else rows[index] = record;
        return this;
    };
    Model.create = async (data) => new Model(data).save();
    Model.find = (filter, projection) =>
        listQuery(Model, rows.filter((r) => matches(r, clean(filter))).map((r) => project(r, projection)));
    Model.findOne = async (filter) => hydrate(rows.find((r) => matches(r, clean(filter))));
    Model.findById = async (id, projection) => { assertId(id); return hydrate(byId(id), projection); };
    Model.countDocuments = async (filter) => rows.filter((r) => matches(r, clean(filter))).length;
    Model.deleteOne = async (filter) => {
        const index = rows.findIndex((r) => matches(r, clean(filter)));
        if (index === -1) return { deletedCount: 0 };
        rows.splice(index, 1);
        return { deletedCount: 1 };
    };
    Model.deleteMany = async (filter) => {
        const keep = rows.filter((r) => !matches(r, clean(filter)));
        const deletedCount = rows.length - keep.length;
        rows.length = 0;
        rows.push(...keep);
        return { deletedCount };
    };
    Model.findByIdAndUpdate = async (id, update, options) => {
        assertId(id);
        const record = byId(id);
        if (!record) return null;
        Object.assign(record, clean(update));
        return hydrate(record, options);
    };
    Model.findByIdAndDelete = async (id) => {
        assertId(id);
        const record = byId(id);
        if (!record) return null;
        rows.splice(rows.indexOf(record), 1);
        return hydrate(record);
    };
    return rows;
}

const resetStores = () => stores.forEach((rows) => { rows.length = 0; });
const rowsOf = (Model) => stores.get(Model.modelName);

module.exports = { installMemoryStore, resetStores, rowsOf };
