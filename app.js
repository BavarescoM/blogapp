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
require("./Models/Postagem");
const Postagem = mongoose.model("postagens");
require("./Models/Categoria");
const Categoria = mongoose.model("categorias");
const usuarios = require("./Routes/usuario");
const passport = require("passport");
require("./Config/auth");
const db = require("./Config/db");
//configurações
//sessão
app.use(
  session({
    secret: "root",
    resave: true,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());
require("./Config/auth")(passport);

app.use(flash());
//middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
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
  .connect(db.mongoURI, {
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
//app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(__dirname + "/public"));

//Rotas
app.get("/", (req, res) => {
  Postagem.find()
    .populate("categoria")
    .sort({ data: "desc" })
    .then(postagens => {
      res.render("index", { postagens: postagens });
    })
    .catch(error => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/404");
    });
});
app.get("/postagem/:slug", (req, res) => {
  Postagem.findOne({ slug: req.params.slug })
    .then(postagem => {
      if (postagem) {
        res.render("postagem/index", { postagem: postagem });
      } else {
        req.flash("error_msg", "Está postagem não existe");
        res.redirect("/");
      }
    })
    .catch(error => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/");
    });
});
app.get("/404", (req, res) => {
  res.send("Erro 404");
});
app.get("/categorias", (req, res) => {
  Categoria.find()
    .then(categorias => {
      res.render("categorias/index", { categorias: categorias });
    })
    .catch(error => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/");
    });
});

app.get("/categorias/:slug", (req, res) => {
  Categoria.findOne({ slug: req.params.slug })
    .then(categoria => {
      if (categoria) {
        Postagem.find({ categoria: categoria._id })
          .then(postagens => {
            res.render("categorias/postagens", {
              postagens: postagens,
              categoria: categoria
            });
          })
          .catch(error => {
            req.flash("error_msg", "Houve um erro ao listar os posts");
            res.redirect("/");
          });
      } else {
        req.flash("error_msg", "Está categoria não existe");
        res.redirect("/");
      }
    })
    .catch(error => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/");
    });
});

app.use("/admin", admin);
app.use("/usuarios", usuarios);
//Outros;
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log("servidor rodando");
});
