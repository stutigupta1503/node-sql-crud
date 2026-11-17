require('dotenv').config(); 
const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require('express');
const app = express();
const port = 8080;
const path = require('path')
const methodOverride = require('method-override');

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password()
  ];
}
// HOME PAGE
app.get('/', (req, res) => {
   let q = `SELECT COUNT(*) FROM user`;
   try {
    connection.query(q, (err, result) => {
        if(err) throw err;
        // res.send(result[0]["COUNT(*)"]);
        let count = result[0]["COUNT(*)"];
        res.render("home.ejs", {count});
    })
   } catch(err) {
    console.log(err);
    res.send("Something is wrong in DB");
   }
})

// SHOW USERS
app.get("/users", (req, res) => {
  let q =  `SELECT * FROM user`;
  try {
    connection.query(q, (err, users) => {
      if(err) throw err;
      res.render("show.ejs" , {users});
    })
  } catch (err) {
      console.log(err);
      res.send("Something is wrong in DB");    
  }
})

// EDIT USER
app.get("/users/:id/edit", (req, res) => {
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("edit.ejs" , {user});
    })
  } catch(err) {
    console.log(err);
    res.send("Something is wrong in DB");
  }
})
app.patch("/user/:id/edit", (req, res) => {
  let {id} = req.params;
  let {username : newUsername, password: formPass} = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;
  try {
    connection.query(q, (err, result) => {
      if(err) throw err;
      let user = result[0];
      if(formPass != user.password) {
        res.send("Wrong Password");
      } else{
        let q2 = `UPDATE user SET username = '${newUsername}' WHERE id = '${id}'`;
        connection.query(q2, (err, result) => {
          if(err) throw err;
          res.redirect("/users");
        })
      }
    })
  } catch (err) {
    console.log(err);
    res.send("Something is wrong in DB");
  }
})

// app.get('/', async (req, res) => {
//    let q = `SELECT COUNT(*) FROM user`;
//    try {
//        const [result] = await connection.promise().query(q);
//        res.send(result[0]);
//    } catch (err) {
//        console.log(err);
//        res.status(500).send("Something is wrong in DB");
//    }
// });


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})

//  console.log(getRandomUser());

// let q = "INSERT INTO user (id, username, email, password) VALUES ?";

// let data = [];
// for(let i = 0; i<100 ; i++) {
//     data.push(getRandomUser());
// }

// try {
//     connection.query(q, [data], (err, result) => {
//         if (err) {
//             console.log(err);
//         }
//         console.log(result);
//     }
// )} catch (err) {
//     console.log(err);
// }

// connection.end();