const { insertComment, removeComment } = require("../models/comments.model");

exports.postComment = (req, res, next) => {
	const { article_id } = req.params;
	const { username, body } = req.body;
	insertComment(article_id, username, body)
		.then((comment) => {
			res.status(201).send({ comment });
		})
		.catch((err) => {
			console.log(err);
			next(err);
		});
};

exports.deleteComment = (req, res, next) => {
	//make sure they are sending back the status or it can time out in tests!
	removeComment(req.params)
		.then(() => {
			res.sendStatus(204);
		})
		.catch((err) => {
			console.log(err);
			next(err);
		});
};
