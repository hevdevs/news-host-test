const db = require("../../db/connection");

exports.insertComment = (article_id, username, body) => {
	return Promise.all([
		db.query(
			`INSERT INTO comments (article_id, author, body) VALUES ($1, $2, $3) RETURNING *`,
			[article_id, username, body]
		),
		db.query(`SELECT * FROM users WHERE username = $1`, [username]),
	]).then((response) => {
		if (response[0].rows.length === 0)
			return Promise.reject({
				status: 404,
				msg: "Article not found",
			});
		return response.rows[0];
	});
};

exports.removeComment = ({ comment_id }) => {
	if (!Number(comment_id)) {
		return Promise.reject({ status: 400, msg: "Invalid input" });
	}

	return db
		.query(`DELETE FROM comments WHERE comment_id = $1`, [comment_id])
		.then((response) => {
			if (!response.rowCount) {
				return Promise.reject({
					status: 404,
					msg: "Comment not found",
				});
			} else return response.rowCount;
		});
};
