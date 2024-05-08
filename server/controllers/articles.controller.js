const {
	selectArticleById,
	selectArticleComments,
	selectArticles,
	updateArticle,
} = require("../models/articles.model");

exports.getArticleById = (req, res, next) => {
	const { article_id } = req.params;

	selectArticleById(article_id)
		.then((article) => {
			res.status(200).send({ article });
		})
		.catch((err) => {
			next(err);
		});
};

exports.getArticles = (req, res, next) => {
	const { topic, sort_by, order, p } = req.query;
	selectArticles(topic, sort_by, order, p)
		.then((articles) => {
			res.status(200).send({ articles });
		})
		.catch((err) => {
			next(err);
		});
};

exports.getArticleComments = (req, res, next) => {
	selectArticleComments(req)
		.then((comments) => {
			res.status(200).send({ comments });
		})
		.catch((err) => {
			next(err);
		});
};

exports.patchArticle = (req, res, next) => {
	updateArticle(req.body, req.params)
		.then((article) => {
			res.status(200).send({ article });
		})
		.catch((err) => next(err));
};
