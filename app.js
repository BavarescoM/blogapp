//carregando modulos
const express = require("express");
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const admin = require("./Routes/admin");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
//configurações
//sessão
app.use(
  session({
    secret: "root",
    resave: true,
    saveUninitialized: true
  })
);
app.use(flash());
//middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

//body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//handlebars
app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
//mongoose
mongoose
  .connect("mongodb://localhost/blogapp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(() => {
    console.log("conectado mongo");
  })
  .catch(error => {
    console.log("erro mgdb" + error);
  });

//public
app.use(express.static(path.join(__dirname, "public")));

//Rotas
app.get("/", (req, res) => {
  res.send("Rota Pricipal");
});
app.get("/posts", (req, res) => {
  res.send("Lista Posts");
});
app.use("/admin", admin);
//Outros;
const PORT = 8081;
app.listen(PORT, () => {
  console.log("servidor rodando");
});
