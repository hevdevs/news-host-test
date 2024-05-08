const db = require("../../db/connection");
const { checkExists, checkTopicExists } = require("../../utils/utils");

exports.selectArticles = (topic, sortBy = "created_at", order = "DESC", p) => {
	order = order.toUpperCase();
	// nice to validate sort by/order with a util func but cba with handling more promises
	const validSort = [
		"title",
		"topic",
		"author",
		"body",
		"created_at",
		"votes",
		"comment_count",
	];
	const validOrder = ["ASC", "DESC"];

	if (!validSort.includes(sortBy)) {
		return Promise.reject({ status: 404, msg: "Not found" });
	}
	if (!validOrder.includes(order)) {
		return Promise.reject({ status: 400, msg: "Bad request" });
	}
	const queries = [];
	const queryVals = [];

	let queryStr = `SELECT articles.*, COUNT(comments.comment_id)::INT AS comment_count FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id`;

	if (topic) {
		//when we return a db.query promise in here to check topic, we get stuck - we've returned out of the func and we can't climb back out now because of "async stuff". we can only dig deeper which would be wet af getting into nested queries and repetitive code. solution is to use Promise.all to return array of our promises all at once to avoid falling in to that trap in the first place
		queries.push(checkTopicExists(topic));
		queryStr += ` WHERE articles.topic = $1`;
		queryVals.push(topic);
	}

	queryStr += ` GROUP BY articles.article_id ORDER BY ${sortBy} ${order}`;
	if (p) {
		queryStr += ` LIMIT 10 OFFSET (${10 * p - 10})`;
		queryVals.push(p);
	}
	console.log(queryStr);
	queries.push(db.query(queryStr, queryVals));

	return Promise.all(queries).then((resultArr) => {
		// returns arr containing the resolution/result vals of both promises in our queries array. IF there's no err thrown by checkTopicExists func then our resultArr index 0 is undefined (because of how my func works - throw error or do nothing) and the successful response of the db.query

		// console.log(resultArr[0], '<<<<< result of checkTopicExists')
		// console.log(resultArr[1], '<<<<< result of main db.query');

		//if we return resultArr[1].rows now, this will pass tests for topic queries, BUT breaks all tests where we don't have a topic query, so need a check to see if we have been given a topic value (or alternatively if resultArr[0] is undefined) and return the right thing accordingly
		if (topic) {
			return resultArr[1].rows;
		} else {
			return resultArr[0].rows;
		}
		//TLDR this is so much nicer to handle with async/await lol 🫠😑
	});
};

exports.selectArticleById = (article_id) => {
	return db
		.query(`SELECT * FROM articles WHERE article_id = $1;`, [article_id])
		.then((response) => {
			if (response.rows.length === 0) {
				return Promise.reject({
					status: 404,
					msg: "Not found",
				});
			} else return response.rows[0];
		});
};

exports.selectArticleComments = (req) => {
	const { article_id } = req.params;

	return Promise.all([
		checkExists(article_id),
		db.query(`SELECT * FROM comments WHERE article_id = $1`, [article_id]),
	]).then((response) => {
		return response[1].rows;
	});
};

exports.updateArticle = ({ inc_votes }, { article_id }) => {
	if (inc_votes !== 1 && inc_votes !== -1) {
		return Promise.reject({ status: 400, msg: "Invalid input" });
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
					msg: "Article not found",
				});
			}
			return response.rows[0];
		});
};
