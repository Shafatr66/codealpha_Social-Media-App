const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize the SQLite database
const db = new sqlite3.Database(path.resolve(__dirname, '../../database.db'), (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Export the database instance
module.exports = db;