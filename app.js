const express = require('express');
const mongoose = require('mongoose');

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
app.use(express.json());

 ===========================
    CONNEXION MONGODB
=========================== 


// 👉 RENDER (MongoDB Atlas)
mongoose.connect("mongodb+srv://admin:liHhwnul8LUTkxdf@cluster0.9jv9bdh.mongodb.net/blogDB?retryWrites=true&w=majority")
  .then(() => console.log("MongoDB connecté"))
  .catch(err => console.log(err));


===========================
    MODELE
=========================== 

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  date: { type: Date, default: Date.now },
  category: String,
  tags: [String]
});

const Article = mongoose.model('Article', articleSchema);

===========================
   SWAGGER
=========================== 

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Blog API",
      version: "1.0.0",
      description: "API avec MongoDB"
    },
  },
  apis: ["./app.js"],
};

const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

===========================
   ROUTES
=========================== 

/**
 * @swagger
 * /api/articles:
 *   post:
 *     summary: Créer un article
 */
app.post('/articles', async (req, res) => {
  try {
    const article = new Article(req.body);
    await article.save();
    res.status(201).json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /articles:
 *   get:
 *     summary: Récupérer tous les articles
 */
app.get('/articles', async (req, res) => {
     const articles = await Article.find();
     res.json(articles);
});

/**
 * @swagger
 * /articles/{id}:
 *   get:
 *     summary: Récupérer un article
 */
app.get('articles/:id', async (req, res) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    return res.status(404).json({ error: "Article non trouvé" });
  }

  res.json(article);
});

/**
 * @swagger
 * /api/articles/{id}:
 *   put:
 *     summary: Modifier un article
 */
app.put('/articles/:id', async (req, res) => {
  const article = await Article.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(article);
});

/**
 * @swagger
 * /api/articles/{id}:
 *   delete:
 *     summary: Supprimer un article
 */
app.delete('/articles/:id', async (req, res) => {
  await Article.findByIdAndDelete(req.params.id);
  res.json({ message: "Article supprimé" });
});

/**
 * @swagger
 * /api/articles/search:
 *   get:
 *     summary: Rechercher des articles
 */
app.get('/api/articles/search', async (req, res) => {
  const q = req.query.query;

  const articles = await Article.find({
    $or: [
      { title: { $regex: q, $options: 'i' } },
      { content: { $regex: q, $options: 'i' } }
    ]
  });

  res.json(articles);
});

===========================
   SERVEUR
=========================== 

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});