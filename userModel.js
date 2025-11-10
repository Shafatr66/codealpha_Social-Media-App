const sqlite3 = require('sqlite3').verbose();
const db = require('../db/index');

class User {
    constructor(id, username, password) {
        this.id = id;
        this.username = username;
        this.password = password;
    }

    static create(username, password) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
            db.run(sql, [username, password], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(new User(this.lastID, username, password));
                }
            });
        });
    }

    static findById(id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE id = ?';
            db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? new User(row.id, row.username, row.password) : null);
                }
            });
        });
    }

    static findByUsername(username) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE username = ?';
            db.get(sql, [username], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? new User(row.id, row.username, row.password) : null);
                }
            });
        });
    }
}

module.exports = User;