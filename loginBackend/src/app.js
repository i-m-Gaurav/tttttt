const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const multer = require("multer");

require("./db/conn");
const register = require("./models/registerss");
const port = process.env.port || 3000;

const static_path = path.join(__dirname, "../public");
const tempelates_path = path.join(__dirname, "../tempelates/views");
const partials_path = path.join(__dirname, "../tempelates/partials");
app.use("/public", express.static(path.join(__dirname, "../public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(static_path));

app.set("view engine", "hbs");
app.set("views", tempelates_path);
hbs.registerPartials(partials_path);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/landing", (req, res) => {
  res.render("landing");
});
// app.get("/adminLogin", (req, res) => {
//   res.render("adminLogin");
// });

app.post("/register", async (req, res) => {
  try {
    // console.log(req.body.name)
    const name = req.body.name;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const confirmpassword = req.body.confirmpassword;
    if (password === confirmpassword) {
      const resLogin = new register({
        name: name,
        username: username,
        email: email,
        password: password,
        confirmpassword: confirmpassword,
      });

      const registered = await resLogin.save();
      res.status(200).render("register");
    } else {
      res.send(
        "<h1 style='color : red'>password not matching ,please check it</h1>"
      );
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

//login check
app.post("/login", async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    const user = await register.findOne({ username: username });

    if (user.password === password) {
      if (user.type === "user")
        res.status(200).render("landing", { name: user.username });
      else {
        const users = await register.find(
          { type: "user" },
          { username: 1, location: 1, image: 1 }
        );
        res.status(200).render("adminLanding", { users: users });
      }
    } else {
      res.status(401).json({ message: "Invalid Password" });
    }

    // console.log(`${}`)
  } catch (error) {
    res.status(400).json({ message: "invalid login detail " });
  }
});

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Middleware to handle file uploads
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400);
  }
  res.status(200);
  res.render("landing");
});
app.post("/getLocation", async (req, res) => {
  const { long, lat } = req.body;

  const data = await register.findByIdAndUpdate("65057cc1b691d2e37d1bfa82", {
    location: [long, lat],
  });
  return res.status(200).json({ msg: "Location Saved" });
});

app.listen(port, () => {
  console.log(`server is running at port number ${port}`);
});
