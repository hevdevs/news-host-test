\c nc_news_test;
-- select all article columns, COUNT(comments) = INT AS name FROM articles (left table) JOIN comments (right table to get access to the comments) ON foreign key
SELECT articles.*, COUNT(comments.comment_id)::INT AS comment_count FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id GROUP BY articles.article_id ORDER BY articles.created_at DESC;

-- get articles with comment count - need LEFT JOIN to get all articles, evne ones with zero comments
SELECT articles.*, COUNT(comments.comment_id)::INT AS comment_count FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id WHERE articles.article_id = 4 GROUP BY articles.article_id;

-- author which is the username from the users table
-- title
-- article_id
-- topic
-- created_at
-- votes
-- comment_count which is the total count of all the comments with this article_id - you should make use of queries to the database in order to achieve this.
-- the articles should be sorted by date in descending order. 

SELECT articles.author,articles.title,articles.article_id ,articles.topic,articles.created_at,articles.votes, COUNT(comments.article_id) AS comment_count FROM articles JOIN  users ON articles.author=users.username
    LEFT JOIN comments ON articles.article_id=comments.article_id
    GROUP BY comments.article_id, articles.article_id
    ORDER BY articles.created_at DESC
    ;

-- get article comments
SELECT * FROM comments WHERE article_id = 1;

-- -- an array of comments for the given article_id of which each comment should have the following properties:
-- comment_id
-- votes
-- created_at
-- author
-- body
-- comments

SELECT * FROM articles WHERE article_id=4;