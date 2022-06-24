var express = require('express');
var router = express.Router();

const {
    WebhookClient
} = require('dialogflow-fulfillment');
const {
    resolveInclude
} = require('ejs');

// DB 커넥션 생성
var connection = require('../../config/db').conn;

var someVar;
// router.get('/', async (req, res) => res.send('online'));
router.get('/', (req, res) => {
    let route = req.app.get('views') + '/m_user/dialogflow_test.ejs';
    res.render(route);
});

//구글폼
router.post('/googleForm', (req, res) => {
    console.log(req.body);
});


router.post('/dialogflow', express.json(), (req, res) => {
    console.log("aaaaa")
    const agent = new WebhookClient({
        request: req,
        response: res
    })
    console.log("bbbbbbbb")

    function setValue(value) {
        someVar = value;
        console.log(someVar);
    }
    console.log("ccccccc")

    function database(mnumber) {
        connection.query('SELECT name FROM data WHERE mnum = ' + connection.escape(mnumber), function (err, rows) {
            if (err) {
                throw err;
            } else {
                setValue(rows[0].name);
                console.log(String(someVar));
                resolve();
            }
        });
    }
    console.log("ddddddddd")

    function welcome() {
        agent.add('Welcome to my agent! Is it working?')
    }
    console.log("eeeeeeeee")
    async function userinfo() {
        const mnumber = agent.parameters.mnumber;
        await database(mnumber);
        var testVar = String(someVar);
        agent.add("Hello " + testVar + "!");
        console.log("Hello " + testVar + "!");
    }
    console.log("ffffffffff")
    let intentMap = new Map()
    intentMap.set('Default Welcome Intent', welcome)
    intentMap.set('userInformation', userinfo)
    agent.handleRequest(intentMap)
    console.log(intentMap)
});

module.exports = router;