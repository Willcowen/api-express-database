const express = require("express");

const db = require("../utils/database");
const petsRouter = express.Router();

petsRouter.get("/", (req, res) => {

  let selectAllPetsQuery = "SELECT * FROM pets"
  const selectValues = []
  const queries = []
  if(req.query.name) {
    queries.push({col:'name', val: req.query.name})
  }
  if(req.query.age) {
    queries.push({col:'age', val: req.query.age})
  }
  if(req.query.breed) {
    queries.push({col:'breed', val: req.query.breed})
  }
  if(req.query.type) {
    queries.push({col:'type', val: req.query.type})
  }
  if(req.query.microchip) {
    queries.push({col:'microchip', val: req.query.microchip})
  }
  if(queries.length>0) {
    let whereClauses = []
    queries.forEach( (query, index) => {
      whereClauses.push(query.col + " = $" + (index+1))
      selectValues.push(query.val) 
    })
    selectAllPetsQuery += ' WHERE ' + whereClauses.join(' AND ')
  }

  db.query(selectAllPetsQuery, selectValues)
    .then((databaseResult) => {
      res.json({ books: databaseResult.rows })
    })

    .catch((error) => {
      res.status(500)
      res.json({ error: "unexpected Error" })
      console.log(error)
    })
})

petsRouter.get("/:id", (req, res) => {
  const selectPetQuery = `SELECT * from pets WHERE id = $1`;
  db.query(selectPetQuery, [req.params.id])
    .then((dbResult) => {
      if (dbResult.rowCount === 0) {
        res.status(404);
        pet = "This book does not exist";
        res.json({ error: "This book does not exist" });
      } else {
        res.json({ pet: dbResult.rows[0] });
      }
    })
    .catch((e) => {
      res.status(500);
      res.json({ error: "Unexpected Error" });
    });
});

petsRouter.post("/", (req, res) => {
  const sql = {
    text: "INSERT INTO pets(name, age, type, breed, microchip) VALUES($1, $2, $3, $4, $5) RETURNING *",
    values: [
      req.body.name,
      req.body.age,
      req.body.type,
      req.body.breed,
      req.body.microchip,
    ],
  };
  db.query(sql.text, sql.values)
    .then((dbResult) => {
      res.json({ pet: dbResult.rows[0] });
    })
    .catch((e) => {
      res.status(500);
      res.json({ error: "Unexpected Error" });
    });
});

petsRouter.delete("/:id", (req, res) => {
  const deleteBookQuery = `DELETE FROM pets WHERE id = $1 RETURNING *`;

  const deleteValues = [req.params.id];

  db.query(deleteBookQuery, deleteValues)
    .then((dbResult) => {
      if (dbResult.rowCount === 0) {
        res.status(404);
        res.json({ error: "This pet does not exist" });
      } else {
        res.json({ book: dbResult.rows[0] });
      }
    })
    .catch((e) => {
      res.status(500);
      res.json({ error: "Unexpected Error" });
    });
});

petsRouter.put("/:id", (req, res) => {
  const updatePetsQuery = `
    UPDATE pets SET 
      name = $1,
      age = $2,
      type = $3,
      breed = $4,
      microchip = $5
    WHERE id = $6
    RETURNING *`;
  const updateValues = [
    req.body.name,
    req.body.age,
    req.body.type,
    req.body.breed,
    req.body.microchip,
    req.params.id
  ];
  db.query(updatePetsQuery, updateValues)
    .then((dbResult) => {
      if (dbResult.rowCount === 0) {
        res.status(404);
        res.json({ error: "This pet does not exist" });
      } else {
        res.json({ pet: dbResult.rows[0] });
      }
    })
    .catch((e) => {
      res.status(500);
      res.json({ error: "Unexpected Error" });
    });
});

module.exports = petsRouter;
