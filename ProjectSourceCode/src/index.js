// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require("express"); // To build an application server or API
const app = express();
const handlebars = require("express-handlebars");
const Handlebars = require("handlebars");
const path = require("path");
const pgp = require("pg-promise")(); // To connect to the Postgres DB from the node server
const bodyParser = require("body-parser");
const session = require("express-session"); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require("bcrypt"); //  To hash passwords
const axios = require("axios"); // To make HTTP requests from our server. We'll learn more about it in Part C.
const { group } = require("console");

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: "hbs",
  layoutsDir: __dirname + "/views/layouts",
  partialsDir: __dirname + "/views/partials",
});

// database configuration
const dbConfig = {
  host: "db", // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then((obj) => {
    console.log("Database connection successful"); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch((error) => {
    console.log("ERROR:", error.message || error);
  });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

// TODO - Include your API routes here

// * MISCELLANEOUS ENDPOINTS * //

// Dummy endpoint from lab 11
app.get("/welcome", (req, res) => {
  res.json({ status: "success", message: "Welcome!" });
});

// Home
app.get("/", (req, res) => {
  res.redirect("/register");
});

// Home
// GET
app.get("/home", (req, res) => {
  res.render("pages/home");
});

app.get("/test", (req, res) => {
  res.status(302).redirect("http://127.0.0.1:3000/login");
});

// Manage Account
app.get("/manageAccount", (req, res) => {
  res.render("pages/manageAccount");
});

// * GROUP ENDPOINTS * //

// createGroup
// GET
app.get("/createGroup", (req, res) => {
  res.render("pages/createGroup", {username: req.session.username });
});

// createGroup
// Post
app.post("/createGroup", async (req, res) => {
  const { groupName } = req.body;
  const username = req.session.user.username; // or from req.body, depending on your setup

  try {
    const maxIdResult = await db.one("SELECT MAX(id) FROM groups;");
    const newId = maxIdResult.max + 1;

    // Insert the new group into the 'groups' table
    const query = "INSERT INTO groups (id, group_admin_username, group_name) VALUES ($1, $2, $3);";
    await db.none(query, [newId, username, groupName]);

    res.json({ status: 200, message: "Group created successfully" });
  } catch (error) {
    console.error(error);
    res.json({ status: 400, message: "Failed to create group" });
  }
});



app.get("/searchFriends", async (req, res) => {
  const searchQuery = req.query.q;
  const username = req.session.username; 

  const query = `
    SELECT users.*
    FROM users
    INNER JOIN friendships ON users.username = friendships.friend_username
    WHERE friendships.username = $1 AND users.username LIKE $2
  `;

  const friends = await db.any(query, [username, '%' + searchQuery + '%']);

  res.json(friends);
});

let usersToAdd = [];

app.post("/addUserToGroup", (req, res) => {
  const { username, groupName } = req.body;

  // Add the user to the list of users to be added to the group
  usersToAdd.push({ username, groupName });

  res.json({ status: "success", message: `${username} will be added to group` });
});

app.post("/addGroupMembers", async (req, res) => {
  const { groupName, usernames } = req.body;
  db.one('SELECT id FROM groups WHERE group_name = $1', [groupName])
  .then(data => {
    console.log(data.id); // this will log the group id
  })
  .catch(error => {
    console.error(error);
  });

  try {
    // Start a database transaction
    await db.tx(async t => {
      // For each username in the array, insert a new row in the group_members table
      for (const username of usernames) {
        await t.none("INSERT INTO group_members (group_id, username) VALUES ($1, $2)", [data.id, username]);
      }
    });

    res.json({ status: 200, message: "Group members added successfully" });
  } catch (error) {
    console.error(error);
    res.json({ status: 400, message: "Failed to add group members" });
  }
});


// createGroup
// GET
app.get("/addFriends", (req, res) => {
  res.render("pages/addFriends", {});
});

// * REGISTER ENDPOINTS * //
// GET
app.get("/register", (req, res) => {
  res.render("pages/register", {});
});

// POST Register
app.post("/register", async (req, res) => {
  // Get the user data from the request body
  const { username, password } = req.body;

  // Validate the user data
  if (!username || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Check if the user already exists
  const existingUser = await db.oneOrNone(
    "SELECT * FROM users WHERE username = $1",
    [req.body.username]
  );
  if (existingUser) {
    //return res.status(400).json({ error: "User already exists" });
    res
      .status(400)
      .render("pages/register", { message: "User already exists" });
    return;
  }

  // Password Hashing
  const hash = await bcrypt.hash(req.body.password, 10);

  // Create a new user
  await db.none("INSERT INTO users (username, password) VALUES ($1, $2)", [
    req.body.username,
    hash,
  ]);

  // Send a success response
  res
    .status(200)
    .render("pages/login", { message: "User created successfully" });
});

// * LOGIN ENDPOINTS * //

// GET
app.get("/login", (req, res) => {
  res.render("pages/login");
});

// POST
app.post("/login", async (req, res) => {
  try {
    // Find the user from the users table where the username is the same as the one entered by the user
    const user = await db.oneOrNone("SELECT * FROM users WHERE username = $1", [
      req.body.username,
    ]);

    if (user) {
      // Use bcrypt.compare to encrypt the password entered from the user and compare if the entered password is the same as the registered one
      const match = await bcrypt.compare(req.body.password, user.password);
      console.log("User found");

      if (match) {
        // Save the user in the session variable
        req.session.user = user;
        req.session.save();
        console.log("Password matched successfully");

        // Redirect to /discover route after setting the session
        console.log("match");
        res.redirect("/home");
        console.log("Logged in successfully");
      } else {
        // If the password doesn't match, render the login page and send a message to the user stating "Incorrect username or password"
        res.render("pages/login", {
          message: "Incorrect username or password",
        });
        console.log("Password match unsuccessful");
      }
    } else {
      console.log("register");
      // If the user is not found in the table, redirect to GET /register route
      res.redirect("/register");
    }
  } catch (error) {
    console.error(error);
    // If an error occurs, render the login page and send a generic error message
    res.render("pages/login", { message: "An error occurred" });
    console.log("An error has occurred");
  }
});

// * LOGOUT ENDPOINTS * //

// GET
app.get("/logout", (req, res) => {
  // Destroy the session
  req.session.destroy();
  // render lgoout page
  res.render("pages/login", { message: "Successfully Logged Out." });
});

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests

module.exports = app.listen(3000, () => {
  /*const insertTestFriendships = `
    INSERT INTO friendships (username, friend_username)
    VALUES ('a', 'c');
  `;
  db.none(insertTestFriendships)
    .then(() => {
      console.log('Test friendships inserted successfully');
    })
    .catch(error => {
      console.error('Failed to insert test friendships:', error);
    });*/

  console.log("Server is listening on port 3000");
});
