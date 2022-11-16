const {
	selectArticleById,
	selectArticleComments,
	selectArticles,
	updateArticle,
	insertComment,
	removeComment,
} = require('../models/articles.model');

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
	selectArticles().then((articles) => {
		res.status(200).send({ articles });
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

exports.postComment = (req, res, next) => {
	insertComment()
		.then((comment) => {
			res.status(201).send({ comment });
		})
		.catch((err) => next(err));
};

exports.deleteComment = (req, res, next) => {
	removeComment(req.params)
		.then(() => {
			res.status(204).send({ msg: `Comment deleted!` });
		})
		.catch((err) => {
			next(err);
		});
};
