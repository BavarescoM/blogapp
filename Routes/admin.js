const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../Models/Categoria");
const Categoria = mongoose.model("categorias");
require("../Models/Postagem");
const Postagem = mongoose.model("postagens");
const { eAdmin } = require("../Helpers/eAdmin");

router.get("/", eAdmin, (req, res) => {
  res.render("admin/index");
});

router.get("/posts", eAdmin, (req, res) => {
  res.send("Pagina de posts");
});

router.get("/categorias", eAdmin, (req, res) => {
  Categoria.find()
    .sort({ date: "desc" })
    .then(categorias => {
      res.render("admin/categorias", { categorias: categorias });
    })
    .catch(erro => {
      req.flash("error_msg", "houve um erro ao listar as categorias");
      res.redirect("/admin");
    });
});

router.get("/categorias/add", eAdmin, (req, res) => {
  res.render("admin/addcategorias");
});

router.post("/categorias/nova", eAdmin, (req, res) => {
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
router.get("/categorias/edit/:id", eAdmin, (req, res) => {
  Categoria.findOne({ _id: req.params.id })
    .then(categoria => {
      res.render("admin/editartegorias", { categoria: categoria });
    })
    .catch(eror => {
      req.flash("error_msg", "Esta Categoria não existe");
      res.redirect("/admin/categorias");
    });
  router.post("/categorias/edit", eAdmin, (req, res) => {
    Categoria.findOne({ _id: req.body.id })
      .then(categoria => {
        (categoria.nome = req.body.nome), (categoria.slug = req.body.slug);
        categoria
          .save()
          .then(() => {
            req.flash("success_msg", "Categoria editada com sucesso");
            res.redirect("/admin/categorias");
          })
          .catch(eror => {
            req.flash("error_msg", "Houve um erro ao salvar a Categoria");
            res.redirect("/admin/categorias");
          });
      })
      .catch(error => {
        req.flash("error_msg", "Houve um erro ao editar a categoria");
        res.redirect("/admin/categorias");
      });
  });
});

router.post("/categorias/deletar", eAdmin, (req, res) => {
  Categoria.deleteOne({ _id: req.body.id })
    .then(() => {
      req.flash("success_msg", "Categoria Deletada com Sucesso");
      res.redirect("/admin/categorias");
    })
    .catch(error => {
      req.flash("error_msg", "Erro ao Deletar Categoria");
      res.redirect("/admin/categorias");
    });
});

router.get("/postagens", eAdmin, (req, res) => {
  Postagem.find()
    .populate("categoria")
    .sort({ data: "desc" })
    .then(postagens => {
      res.render("admin/postagens", { postagens: postagens });
    })
    .catch(erro => {
      req.flash("error_msg", "houve um erro ao listar as Postagens");
      res.redirect("/admin");
    });
});

router.get("/postagens/add", eAdmin, (req, res) => {
  Categoria.find()
    .then(categorias => {
      res.render("admin/addpostagem", { categorias: categorias });
    })
    .catch(error => {
      req.flash("error_msg", "Houve um erro ao carregar o formulário");
      res.redirect("/admin");
    });
});
router.post("/postagens/nova", eAdmin, (req, res) => {
  var erros = [];
  if (req.body.categoria == "0") {
    erros.push({ texto: "categoria inválida" });
  }
  if (erros.length > 0) {
    res.render("admin/addpostagem", { erros: erros });
  } else {
    const novaPostagem = {
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria,
      slug: req.body.slug
    };
    new Postagem(novaPostagem)
      .save()
      .then(() => {
        req.flash("success_msg", "Postagem Criada com sucesso");
        res.redirect("/admin/postagens");
      })
      .catch(error => {
        req.flash("error_msg", "Erro ao criar Postagem");
        res.redirect("/admin/postagens");
      });
  }
});

router.get("/postagens/edit/:id", eAdmin, (req, res) => {
  Postagem.findOne({ _id: req.params.id })
    .then(postagens => {
      Categoria.find()
        .then(categorias => {
          res.render("admin/editpostagens", {
            categorias: categorias,
            postagens: postagens
          });
        })
        .catch(erro => {
          req.flash("error_msg", "Houve um erro ao listar as categorias");
          res.redirect("admin/postagens");
        });
    })
    .catch(erro => {
      req.flash("error_msg", "Houve um erro ao carregar o formulario");
      res.redirect("admin/postagens");
    });
});

router.post("/postagens/edit", eAdmin, (req, res) => {
  Postagem.findOne({ _id: req.body.id })
    .then(postagem => {
      (postagem.titulo = req.body.titulo),
        (postagem.slug = req.body.slug),
        (postagem.conteudo = req.body.conteudo),
        (postagem.descricao = req.body.descricao),
        (postagem.categoria = req.body.categoria);
      postagem
        .save()
        .then(() => {
          req.flash("success_msg", "Postagem editada com sucesso");
          res.redirect("/admin/postagens");
        })
        .catch(error => {
          req.flash("error_msg", "Houve um erro ao editar a postagem");
          res.redirect("admin/postagens");
        });
    })
    .catch(error => {
      req.flash("error_msg", "Houve um erro ao salvar a edição");
      res.redirect("admin/postagens");
    });
});
router.get("/postagens/deletar/:id", eAdmin, (req, res) => {
  Postagem.remove({ _id: req.params.id })
    .then(() => {
      res.redirect("/admin/postagens");
    })
    .catch(error => {
      req.flash("error_msg", "Houve um erro ao excluir");
      res.redirect("admin/postagens");
    });
});
module.exports = router;
