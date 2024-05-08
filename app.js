const express = require("express");
const app = express();
const cors = require("cors");
const { getTopics } = require("./server/controllers/topics.controller");
const {
	getArticleById,
	getArticleComments,
	getArticles,
	patchArticle,
} = require("./server/controllers/articles.controller");
const {
	postComment,
	deleteComment,
} = require("./server/controllers/comments.controller");
const { getUsers } = require("./server/controllers/users.controller");
app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
	res.sendStatus(200);
});

app.get("/api/topics", getTopics);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", getArticleById);
app.patch("/api/articles/:article_id", patchArticle);
app.get("/api/articles/:article_id/comments", getArticleComments);
app.post("/api/articles/:article_id/comments", postComment);
app.delete("/api/comments/:comment_id", deleteComment);
app.get("/api/users", getUsers);

app.use("/*", (req, res, next) => {
	res.status(404).send({ msg: "Route not found" });
	next();
});

app.use((err, req, res, next) => {
	console.log(err, "error in postgresql err handler");
	if (err.code === "22P02") {
		res.status(400).send({ msg: "Bad request" });
	} else if (err.code === "23503" || err.code === "23502") {
		res.status(404).send({ msg: "Not found" });
	} else next(err);
});

app.use((err, req, res, next) => {
	console.log(err, "error in custom err handler");
	if (err.status && err.msg) {
		res.status(err.status).send({ msg: err.msg });
	} else {
		next(err);
	}
});

app.use((err, req, res, next) => {
	res.status(500).send({ msg: "Internal server error!" });
});

module.exports = app;
