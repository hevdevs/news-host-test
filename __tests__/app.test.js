const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");
require("jest-sorted");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("GET /api", () => {
	test("200: responds with status 200", () => {
		return request(app).get("/api").expect(200);
	});
	test("404: return bad path error message when path does noth exist", () => {
		return request(app).get("/api/boop").expect(404);
	});
});

describe("GET /api/topics", () => {
	test("status 200: with an array of topic objects, each with the correct keys and values", () => {
		return request(app)
			.get("/api/topics")
			.expect(200)
			.then(({ body }) => {
				expect(body.topics).toBeInstanceOf(Array);
				expect(body.topics).toHaveLength(3);
				body.topics.forEach((topic) => {
					expect(topic).toMatchObject({
						slug: expect.any(String),
						description: expect.any(String),
					});
				});
			});
	});
});

describe("GET /api/articles", () => {
	test("200: responds with array of article objects", () => {
		return request(app)
			.get("/api/articles")
			.expect(200)
			.then(({ body }) => {
				console.log(body.articles, "articles");
				expect(body.articles).toBeInstanceOf(Array);
				body.articles.forEach((article) => {
					expect(article).toMatchObject({
						article_id: expect.any(Number),
						votes: expect.any(Number),
						created_at: expect.any(String),
						author: expect.any(String),
						body: expect.any(String),
						comment_count: expect.any(Number),
					});
				});
			});
	});
	test("404: bad topic", () => {
		return request(app)
			.get("/api/articles?topic=egg")
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe("not found");
			});
	});
	test("200: good topic", () => {
		return request(app)
			.get("/api/articles?topic=cats")
			.expect(200)
			.then(({ body }) => {
				expect(body.articles.length).toBe(1);
			});
	});
	test("200: good topic", () => {
		return request(app)
			.get("/api/articles?topic=mitch")
			.expect(200)
			.then(({ body }) => {
				expect(body.articles.length).toBe(11);
			});
	});
	test("200: articles should be sorted by date in descending order", () => {
		return request(app)
			.get("/api/articles")
			.expect(200)
			.then(({ body }) => {
				expect(body.articles).toBeSortedBy("created_at", {
					descending: true,
				});
			});
	});
	test("200: takes sort by query", () => {
		return request(app)
			.get("/api/articles?sort_by=comment_count")
			.expect(200)
			.then(({ body }) => {
				expect(body.articles).toBeSortedBy("comment_count", {
					descending: "true",
				});
			});
	});
	test("200: takes order query", () => {
		return request(app)
			.get("/api/articles?order=asc")
			.expect(200)
			.then(({ body }) => {
				expect(body.articles).toBeSortedBy("created_at", {
					ascending: "true",
				});
			});
	});
	test("404: sort by does not exist", () => {
		return request(app)
			.get("/api/articles?sort_by=cats")
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe("Not found");
			});
	});
	test("400: bad order", () => {
		return request(app)
			.get("/api/articles?order=cats")
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe("Bad request");
			});
	});
	test("200: chained queries do the thing", () => {
		return request(app)
			.get("/api/articles?order=asc&sort_by=votes&topic=mitch")
			.expect(200)
			.then(({ body }) => {
				expect(body.articles).toBeSortedBy("votes", { ascending: true });
				body.articles.forEach((article) => {
					expect(article.topic).toBe("mitch");
				});
			});
	});
});

describe("GET /api/articles/:article_id", () => {
	test("200: responds with single article object", () => {
		return request(app)
			.get("/api/articles/1")
			.expect(200)
			.then(({ body }) => {
				expect(typeof body.article).toBe("object");
				expect(body.article).toEqual({
					article_id: 1,
					title: "Living in the shadow of a great man",
					topic: "mitch",
					author: "butter_bridge",
					body: "I find this existence challenging",
					created_at: "2020-07-09T20:11:00.000Z",
					votes: 100,
				});
			});
	});
	test("400: article id wrong type", () => {
		return request(app)
			.get("/api/articles/five")
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe("Bad request");
			});
	});
	test("404: requested article does not exist", () => {
		return request(app)
			.get("/api/articles/999")
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe("Not found");
			});
	});
});

describe("GET /api/users", () => {
	test("200: responds with array of users", () => {
		return request(app)
			.get("/api/users")
			.expect(200)
			.then(({ body }) => {
				expect(body.users).toBeInstanceOf(Array);
				body.users.forEach((user) => {
					expect(user).toMatchObject({
						username: expect.any(String),
						name: expect.any(String),
						avatar_url: expect.any(String),
					});
				});
			});
	});
});

describe("GET /api/articles/:article_id/comments", () => {
	test("200: responds with array of the given article's comments", () => {
		return request(app)
			.get("/api/articles/1/comments")
			.expect(200)
			.then(({ body }) => {
				expect(body.comments).toBeInstanceOf(Array);
				body.comments.forEach((comment) => {
					expect(comment).toMatchObject({
						comment_id: expect.any(Number),
						votes: expect.any(Number),
						created_at: expect.any(String),
						author: expect.any(String),
						body: expect.any(String),
					});
				});
			});
	});
	test("200: responds with empty array for article that exists but has no comments", () => {
		return request(app)
			.get("/api/articles/4/comments")
			.expect(200)
			.then(({ body }) => {
				expect(body.comments).toEqual([]);
			});
	});
	test("404: article id does not exist", () => {
		return request(app)
			.get("/api/articles/4000/comments")
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe("Article not found");
			});
	});
	test("400: article id wrong type", () => {
		return request(app)
			.get("/api/articles/five/comments")
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe("Bad request");
			});
	});
});

describe("PATCH /api/articles/article_id", () => {
	test("200: should update inc votes by 1", () => {
		return request(app)
			.patch("/api/articles/1")
			.send({ inc_votes: 1 })
			.expect(200)
			.then(({ body }) => {
				expect(body.article.votes).toEqual(101);
			});
	});
	test("400: rejects body not equal to 1/-1", () => {
		return request(app)
			.patch("/api/articles/1")
			.send({ inc_votes: 222 })
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe("Invalid input");
			});
	});
	test("400: rejects body not a number", () => {
		return request(app)
			.patch("/api/articles/1")
			.send({ inc_votes: "frog" })
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe("Invalid input");
			});
	});
	test("404: Article not found when article does not exist", () => {
		return request(app)
			.patch("/api/articles/19596469")
			.send({ inc_votes: 1 })
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe("Article not found");
			});
	});
	test("400: invalid id type", () => {
		return request(app)
			.patch("/api/articles/baaaa")
			.send({ inc_votes: -1 })
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe("Bad request");
			});
	});
	test("400: inc_vote key missing - throw error", () => {
		return request(app)
			.patch("/api/articles/1")
			.send({ apple: 1 })
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe("Invalid input");
			});
	});
});

describe("POST /api/article/comment_id", () => {
	test("should first", () => {
		return request(app)
			.post("/api/articles/1/comments")
			.send({ username: "hev", body: "heee" })
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe("Not found");
			});
	});
	test("should first", () => {
		return request(app)
			.post("/api/articles/10000/comments")
			.send({ username: "lurker", body: "heee" })
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe("Not found");
			});
	});
	// test('should first', () => {
	// 	return request(app).post().send().expect().then();
	// });
	// test('should first', () => {
	// 	return request(app).post().send().expect().then();
	// });
	// test('should first', () => {
	// 	return request(app).post().send().expect().then();
	// });
});

describe("DELETE /api/comments/comment_id", () => {
	test("204: responds with 204 status and confirmation message", () => {
		return request(app).delete("/api/comments/1").expect(204);
	});
	test("400: error for invalid id type", () => {
		return request(app)
			.delete("/api/comments/one")
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe("Invalid input");
			});
	});
	test("404: comment id does not exist", () => {
		return request(app)
			.delete("/api/comments/9999")
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe("Comment not found");
			});
	});
});
