const db = require('../../db/connection');
const { checkExists } = require('../../utils/utils');

exports.selectArticles = () => {
	return db
		.query(
			`SELECT articles.*, COUNT(comments.comment_id)::INT AS comment_count FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id GROUP BY articles.article_id ORDER BY articles.created_at DESC`
		)
		.then((response) => {
			return response.rows;
		});
};

exports.selectArticleById = (article_id) => {
	return db
		.query(`SELECT * FROM articles WHERE article_id = $1;`, [article_id])
		.then((response) => {
			if (response.rows.length === 0) {
				return Promise.reject({
					status: 404,
					msg: 'Article not found',
				});
			} else return response.rows[0];
		});
};

exports.selectArticleComments = (req) => {
	const { article_id } = req.params;
	return checkExists(article_id)
		.then(() => {
			return db.query(`SELECT * FROM comments WHERE article_id = $1`, [
				article_id,
			]);
		})
		.then((response) => {
			return response.rows;
		});
};

exports.updateArticle = ({ inc_votes }, { article_id }) => {
	if (inc_votes !== 1 && inc_votes !== -1) {
		return Promise.reject({ status: 400, msg: 'Invalid input' });
	}

	return db
		.query(
			`UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *`,
			[inc_votes, article_id]
		)
		.then((response) => {
			if (response.rows.length === 0) {
				return Promise.reject({
					status: 404,
					msg: 'Article not found',
				});
			}
			return response.rows[0];
		});
};

exports.insertComment = () => {
	return db
		.query(
			`INSERT INTO comments (article_id, author, body) VALUES ($1, $2, $3) RETURNING *`,
			[article_id, username, body]
		)
		.then((response) => {
			if (response.rows.length === 0)
				return Promise.reject({
					status: 404,
					msg: 'Article not found',
				});
			return response.rows[0];
		});
};

exports.removeComment = ({ comment_id }) => {
	if (!Number(comment_id)) {
		return Promise.reject({ status: 400, msg: 'Invalid input' });
	}

	return db
		.query(`DELETE FROM comments WHERE comment_id = $1`, [comment_id])
		.then((response) => {
			if (!response.rowCount) {
				return Promise.reject({
					status: 404,
					msg: 'Comment not found',
				});
			} else return response.rowCount;
		});
};
