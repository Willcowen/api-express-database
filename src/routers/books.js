const express = require("express");

const db = require("../utils/database");
const booksRouter = express.Router();

booksRouter.get("/", (req, res) => {

  let selectAllBooksQuery = "SELECT * FROM books"
  const selectValues = []
  const queries = []
  if(req.query.title) {
    queries.push({col:'title', val: req.query.title})
  }
  if(req.query.type) {
    queries.push({col:'type', val: req.query.type})
  }
  if(req.query.author) {
    queries.push({col:'author', val: req.query.author})
  }
  if(req.query.topic) {
    queries.push({col:'topic', val: req.query.topic})
  }
  if(queries.length>0) {

    let whereClauses = []
    queries.forEach( (query, index) => {
      whereClauses.push(query.col + " = $" + (index+1))
      selectValues.push(query.val) 
    })
    selectAllBooksQuery += ' WHERE ' + whereClauses.join(' AND ')
  }
  
  console.log(selectValues)
  console.log(selectAllBooksQuery)

  db.query(selectAllBooksQuery, selectValues)
    .then((databaseResult) => {
      res.json({ books: databaseResult.rows })
    })
    .catch((error) => {
      res.status(500)
      res.json({ error: "unexpected Error" })
      console.log(error)
    })
})


booksRouter.get("/:id", (req, res) => {
  const selectBookQuery = `SELECT * from books WHERE id = $1`;
  db.query(selectBookQuery, [req.params.id])
    .then((dbResult) => {
      if (dbResult.rowCount === 0) {
        res.status(404);
        book = "This book does not exist";
        res.json({ error: "This book does not exist" });
      } else {
        res.json({ book: dbResult.rows[0] });
      }
    })
    .catch((e) => {
      res.status(500);
      res.json({ error: "Unexpected Error" });
    });
});

booksRouter.post("/", (req, res) => {
  const sql = {
    text: "INSERT INTO books(title, type, author, topic, publicationDate, pages) VALUES($1, $2, $3, $4, $5, $6) RETURNING *",
    values: [
      req.body.title,
      req.body.type,
      req.body.author,
      req.body.topic,
      req.body.publicationDate,
      req.body.pages,
    ],
  };
  db.query(sql.text, sql.values)
    .then((dbResult) => {
      res.json({ book: dbResult.rows[0] });
    })
    .catch((e) => {
      res.status(500);
      res.json({ error: "Unexpected Error" });
    });
});

booksRouter.delete("/:id", (req, res) => {
  const deleteBookQuery = `DELETE FROM books WHERE id = $1 RETURNING *`;

  const deleteValues = [req.params.id];

  db.query(deleteBookQuery, deleteValues)
    .then((dbResult) => {
      console.log(dbResult);
      if (dbResult.rowCount === 0) {
        res.status(404);
        res.json({ error: "This book does not exist" });
      } else {
        res.json({ book: dbResult.rows[0] });
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500);
      res.json({ error: "Unexpected Error" });
    });
});

booksRouter.put("/:id", (req, res) => {
  const updateBooksQuery = `
  UPDATE books SET 
    title = $1,
    type = $2,
    author = $3,
    topic = $4,
    publicationDate = $5,
    pages = $6
  WHERE id = $7
  RETURNING *`;
  const updateValues = [
    req.body.title,
    req.body.type,
    req.body.author,
    req.body.topic,
    req.body.publicationDate,
    req.body.pages,
    req.params.id,
  ];

  db.query(updateBooksQuery, updateValues)
    .then((dbResult) => {
      if (dbResult.rowCount === 0) {
        res.status(404);
        res.json({ error: "This book does not exist" });
      } else {
        res.json({ book: dbResult.rows[0] });
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500);
      res.json({ error: "Unexpected Error" });
    });
});

module.exports = booksRouter;
