const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../Models/Categoria");
const Categoria = mongoose.model("categorias");

router.get("/", (req, res) => {
  res.render("admin/index");
});

router.get("/posts", (req, res) => {
  res.send("Pagina de posts");
});

router.get("/categorias", (req, res) => {
  Categoria.find()
    .sort({ date: "desc" })
    .then(categorias => {
      console.log(categorias);
      res.render("admin/categorias", { categorias: categorias });
    })
    .catch(erro => {
      req.flash("error_msg", "houve um erro ao listar as categorias");
      res.redirect("/admin");
    });
});

router.get("/categorias/add", (req, res) => {
  res.render("admin/addcategorias");
});

router.post("/categorias/nova", (req, res) => {
  var erros = [];
  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    erros.push({ texto: "Nome Inválido" });
  }
  if (
    !req.body.slug ||
    typeof req.body.slug == undefined ||
    req.body.slug == null
  ) {
    erros.push({ texto: "Slug Inválido" });
  }
  if (req.body.nome.length < 2) {
    erros.push({ texto: "Nome Muito Pequeno" });
  }
  if (erros.length > 0) {
    res.render("admin/addcategorias", { erros: erros });
  }
  const novaCategoria = {
    nome: req.body.nome,
    slug: req.body.slug
  };

  new Categoria(novaCategoria)
    .save()
    .then(() => {
      req.flash("success_msg", "Categoria criada com sucesso!");
      res.redirect("/admin/categorias");
    })
    .catch(err => {
      req.flash("error_msg", "Houve um erro ao salvar a categoria!");
      res.redirect("/admin");
    });
});

module.exports = router;
