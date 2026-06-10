
import { MongoClient, ObjectId } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/todos';
const MONGO_DB = process.env.MONGO_DB || 'todos';

let db = null;
let collection = null;
export default class DB {
    connect() {
        return MongoClient.connect(MONGO_URI)
            .then(function (client) {
                db = client.db(MONGO_DB);
                collection = db.collection('todos');
            })
    }

    queryAll() {
        return collection.find().toArray();
    }

    queryById(id) {
        const _id = typeof id === 'string' ? new ObjectId(id) : id;
        return collection.findOne({ _id });
    }

    update(id, order) {
        const _id = typeof id === 'string' ? new ObjectId(id) : id;
        // Entferne _id aus dem Update-Objekt, da es unveränderlich ist
        const updateData = { ...order };
        delete updateData._id;
        return collection.findOneAndUpdate(
            { _id },
            { $set: updateData },
            { returnDocument: 'after' }
        ).then(result => {
            if (!result.value) {
                return null;
            }
            return result.value;
        });
    }

    delete(id) {
        const _id = typeof id === 'string' ? new ObjectId(id) : id;
        return collection.deleteOne({ _id });
    }

    insert(todo) {
        return collection.insertOne(todo)
        .then(result => {
            todo._id = result.insertedId;
            return todo;
        })
    }
}
