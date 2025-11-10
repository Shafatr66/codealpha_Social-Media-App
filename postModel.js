const sqlite3 = require('sqlite3').verbose();
const db = require('../db/index');

class PostModel {
    constructor() {
        this.tableName = 'posts';
    }

    createPost(title, content, userId) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO ${this.tableName} (title, content, user_id) VALUES (?, ?, ?)`;
            db.run(sql, [title, content, userId], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve({ id: this.lastID, title, content, userId });
            });
        });
    }

    getPostById(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
            db.get(sql, [id], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row);
            });
        });
    }

    getAllPosts() {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM ${this.tableName}`;
            db.all(sql, [], (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
        });
    }

    updatePost(id, title, content) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE ${this.tableName} SET title = ?, content = ? WHERE id = ?`;
            db.run(sql, [title, content, id], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve({ id, title, content });
            });
        });
    }

    deletePost(id) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
            db.run(sql, [id], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve({ deletedId: id });
            });
        });
    }
}

module.exports = new PostModel();