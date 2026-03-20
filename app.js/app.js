const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const express = require('express');
const app = express();

app.use(express.json());

let articles = [];
let id = 1;

// 🔹 Validation
function validateArticle(data) {
  const { title, content, author, date, category, tags } = data;

  if (!title || !content || !author) {
    return "Title, content and author are required";
  }

  return null;
}

// 🔹 CREATE
/**
 * @swagger
 * /api/articles:
 *   post:
 *     summary: Créer un article
 *     description: Ajoute un nouvel article
 *     responses:
 *       201:
 *         description: Article créé
 */
app.post('/api/articles', (req, res) => {
  const error = validateArticle(req.body);
  if (error) return res.status(400).json({ error });

  const article = {
    id: id++,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    date: req.body.date || new Date(),
    category: req.body.category || "",
    tags: req.body.tags || []
  };

  articles.push(article);

  res.status(201).json(article);
});

// 🔹 GET ALL + FILTER
/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: Récupérer tous les articles
 *     responses:
 *       200:
 *         description: Liste des articles
 */
app.get('/api/articles', (req, res) => {
  let result = articles;

  const { category, author, date } = req.query;

  if (category) {
    result = result.filter(a => a.category === category);
  }

  if (author) {
    result = result.filter(a => a.author === author);
  }

  if (date) {
    result = result.filter(a => a.date.includes(date));
  }

  res.json(result);
});

// 🔹 GET ONE
/**
 * @swagger
 * /api/articles/{id}:
 *   get:
 *     summary: Récupérer un article par ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Article trouvé
 *       404:
 *         description: Article non trouvé
 */
app.get('/api/articles/:id', (req, res) => {
  const article = articles.find(a => a.id == req.params.id);

  if (!article) {
    return res.status(404).json({ error: "Article not found" });
  }

  res.json(article);
});

// 🔹 UPDATE
/**
 * @swagger
 * /api/articles/{id}:
 *   put:
 *     summary: Modifier un article
 */
app.put('/api/articles/:id', (req, res) => {
  const article = articles.find(a => a.id == req.params.id);

  if (!article) {
    return res.status(404).json({ error: "Article not found" });
  }

  Object.assign(article, req.body);

  res.json(article);
});

// 🔹 DELETE
/**
 * @swagger
 * /api/articles/{id}:
 *   delete:
 *     summary: Supprimer un article
 */
app.delete('/api/articles/:id', (req, res) => {
  const index = articles.findIndex(a => a.id == req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Article not found" });
  }

  articles.splice(index, 1);

  res.json({ message: "Article deleted" });
});

// 🔹 SEARCH
/**
 * @swagger
 * /api/articles/search:
 *   get:
 *     summary: Rechercher des articles
 */
app.get('/api/articles/search', (req, res) => {
  const q = req.query.query;

  if (!q) {
    return res.status(400).json({ error: "Query is required" });
  }

  const result = articles.filter(a =>
    a.title.includes(q) || a.content.includes(q)
  );

  res.json(result);
});
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Blog API",
      version: "1.0.0",
      description: "API pour gérer les articles",
    },
  },
  apis: ["./app.js"],
};

const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.port || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});