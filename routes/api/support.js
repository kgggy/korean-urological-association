var express = require('express');
var router = express.Router();
var connection = require('../../config/db').conn;
const models = require("../../models");
//후원 광고 조회
router.get('/', async (req, res) => { 
    try {
        const all = [];
        const support = await models.support.findAll({
            raw: true
        })
        // console.log(support[0].supportId)
        for (let i = 0; i < support.length; i++) {
            const supportAll = await models.file.findAll({
                where: {
                    supportId: support[i].supportId
                },
                attributes: ["fileRoute", "fileOrgName", "fileType"],
                raw: true
            });
            support[i]['fileRoute'] = supportAll;
            all[i] = support[i];
        }
        res.status(200).json(all);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;