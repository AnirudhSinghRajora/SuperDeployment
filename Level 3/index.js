const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const app = express();


dotenv.config();


app.use(express.json());


const initializeDatabase = () => {
    return new Promise((resolve, reject) => {
        try {
            
            if (process.env.VERCEL) {
                console.log('Using production database configuration');
                
                const db = new sqlite3.Database(':memory:', (err) => {
                    if (err) {
                        console.error('Error opening in-memory database:', err.message);
                        reject(err);
                        return;
                    }
                    console.log('Connected to in-memory database');
                    createTable(db).then(() => resolve(db)).catch(reject);
                });
            } else {
                
                const dbDir = path.join(__dirname, 'db');
                if (!fs.existsSync(dbDir)) {
                    fs.mkdirSync(dbDir, { recursive: true });
                }

                const dbPath = path.join(dbDir, 'todos.db');
                console.log('Database path:', dbPath);

                const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
                    if (err) {
                        console.error('Error opening database:', err.message);
                        reject(err);
                        return;
                    }
                    console.log('Connected to SQLite database');
                    createTable(db).then(() => resolve(db)).catch(reject);
                });
            }
        } catch (err) {
            console.error('Error initializing database:', err.message);
            reject(err);
        }
    });
};

const createTable = (db) => {
    return new Promise((resolve, reject) => {
        db.run(`CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            completed INTEGER DEFAULT 0
        )`, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
                reject(err);
                return;
            }
            console.log('Table "todos" created or already exists');
            resolve();
        });
    });
};

const startServer = async () => {
    try {
        const db = await initializeDatabase();
        
        
        app.get('/todos', (req, res) => {
            db.all('SELECT * FROM todos', (err, rows) => {
                if (err) {
                    console.error('Error fetching todos:', err.message);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }
                res.json({ todos: rows });
            });
        });

        app.post('/todos', (req, res) => {
            const { title } = req.body;
            if (!title) {
                return res.status(400).json({ error: 'Title is required' });
            }
            db.run('INSERT INTO todos (title) VALUES (?)', [title], function (err) {
                if (err) {
                    console.error('Error creating todo:', err.message);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }
                res.status(201).json({ id: this.lastID, title });
            });
        });

        app.put('/todos/:id', (req, res) => {
            const { id } = req.params;
            const { title, completed } = req.body;
            
            if (!title && completed === undefined) {
                return res.status(400).json({ error: 'Title or completed status is required' });
            }

            const updates = [];
            const values = [];
            
            if (title) {
                updates.push('title = ?');
                values.push(title);
            }
            if (completed !== undefined) {
                updates.push('completed = ?');
                values.push(completed ? 1 : 0);
            }
            
            values.push(id);
            
            const query = `UPDATE todos SET ${updates.join(', ')} WHERE id = ?`;
            
            db.run(query, values, function (err) {
                if (err) {
                    console.error('Error updating todo:', err.message);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }
                if (this.changes === 0) {
                    res.status(404).json({ error: 'Todo not found' });
                    return;
                }
                res.json({ id, title, completed });
            });
        });

        app.delete('/todos/:id', (req, res) => {
            const { id } = req.params;
            db.run('DELETE FROM todos WHERE id = ?', [id], function (err) {
                if (err) {
                    console.error('Error deleting todo:', err.message);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }
                if (this.changes === 0) {
                    res.status(404).json({ error: 'Todo not found' });
                    return;
                }
                res.json({ message: 'Todo deleted successfully' });
            });
        });

        
        app.use((err, req, res, next) => {
            console.error('Unhandled error:', err);
            res.status(500).json({ error: 'Internal server error' });
        });

        
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        
        process.on('SIGINT', () => {
            db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                } else {
                    console.log('Database connection closed');
                }
                process.exit(0);
            });
        });
    } catch (err) {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    }
};

startServer();
