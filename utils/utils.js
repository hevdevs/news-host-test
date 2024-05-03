const db = require('../db/connection');

exports.checkExists = (id) => {
	return db
		.query(`SELECT * FROM articles WHERE article_id=$1`, [id])
		.then((response) => {
			if (response.rows.length === 0) {
				return Promise.reject({
					status: 404,
					msg: 'Article not found',
				});
			}
		});
};

exports.checkTopicExists = (topic) => {
	return db
		.query(`SELECT * FROM topics WHERE slug=$1`, [topic])
		.then((response) => {
			if (response.rows.length === 0) {
				return Promise.reject({
					status: 404,
					msg: 'not found',
				});
			}
		});
}
