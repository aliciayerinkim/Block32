const pg = require('pg')
const express = require('express')
const client = new pg.Client(
    // process.env.DATABASE_URL || 'postgres://localhost/the_acme_notes_db'
    "postgres://alici:1234@localhost:5432/acme_icecream_db"
)
const app = express()
app.use(express.json());
app.use(require('morgan')('dev'));

app.get('/api/flavors', async (req, res, next) => {
    try {
        const SQL = `
            SELECT * 
            FROM icecream 
            ORDER BY id;
        `;
        const response = await client.query(SQL);
        res.send(response.rows);
    } catch (error) {
        next(error);
    }
});

app.get('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `
            SELECT *
            FROM icecream
            WHERE id=$1
        `;
        const response = await client.query(SQL, [req.params.id]);
        res.send(response.rows[0]);
    } catch (error) {
        next(error);
    }
});

app.post('/api/flavors', async (req, res, next) => {
    try {
        const SQL = `
            INSERT INTO icecream(name)
            VALUES($1)
            RETURNING *
        `;
        const response = await client.query(SQL, [req.body.name]);
        res.send(response.rows[0]);
    } catch (error) {
        next(error);
    }
});

app.delete('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `
            DELETE
            FROM icecream
            WHERE id=$1
        `;
        const response = await client.query(SQL, [req.params.id]);
        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
});

app.put('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `
            UPDATE icecream
            SET name=$1, is_favorite=$2, updated_at=now()
            WHERE id=$3
            RETURNING *
        `;
        const response = await client.query(SQL, [req.body.name, req.body.is_favorite, req.params.id]);
        res.send(response.rows[0]);
    } catch (error) {
        next(error);
    }
});

const init = async () => {
    await client.connect();
    console.log('connected to database');
    let SQL = `
        DROP TABLE IF EXISTS icecream;
        CREATE TABLE icecream(
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            is_favorite BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now()
        );
    `;
    await client.query(SQL);
    console.log('tables created');
    SQL = ` 
        INSERT INTO icecream(name) VALUES('vanilla');
        INSERT INTO icecream(name, is_favorite) VALUES('strawberry', FALSE);
        INSERT INTO icecream(name, is_favorite) VALUES('chocolate', TRUE);
    `;
    await client.query(SQL);
    console.log('data seeded');

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`listening on port ${port}`))
};

init();