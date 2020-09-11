'use strict'

var express = require('express');
var topicController = require('../controllers/topic');

var router = express.Router(); //cargo el router de express
var md_auth = require('../middlewares/authenticated'); //cargo el middleware de authenticación

router.get('/test', topicController.test);
router.post('/topic', md_auth.authenticated, topicController.save);
router.get('/topics/:page?', topicController.getTopics);
router.get('/user-topics/:user?', topicController.getTopicsByUser);
router.get('/topic/:id', topicController.getTopic);

module.exports = router;
