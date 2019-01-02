const express = require('express');
const create = express.Router();
const bodyParser = require('body-parser');
const _ = require('lodash');

create.use(bodyParser.json());

const util = require('./util.js');

create.post('/', (req, res, next) => {
    let name;
    let category;
    let price;
    let quantity;

    console.log(req.body);

    req.body.items.forEach((item) => {
        name = item.name;
        category = item.category;
        price = item.price;
        quantity = item.quantity;
    });
    util.doRequest(
        {
            query:
                `mutation {
                    create (transaction: {
                    order_id: "` + 'ORDER_123' + `",
                    total_amount: ` + 2 + `,
                    currency: "` + 'HKD' + `"},
                    items: [{
                        name: "` + name + `",
                        category: "` + category + `",
                        price: ` + price + `,
                        quantity:` + quantity + `
                    }],
                    customer: {
                        first_name: "` + req.body.customer.first_name + `",
                        last_name: "` + req.body.customer.last_name + `",
                        email: "` + req.body.customer.email + `",
                        phone: "` + req.body.customer.phone + `"
                    },
                    expiry: {
                        start_time: "` + req.body.expiry.start_time + `",
                        unit: "` + req.body.expiry.unit + `",
                        duration: ` + req.body.expiry.duration + `
                    }) {transaction_id}}`
        },
        (err, response) => {
            if(_.isNil(response)){
                res.send(500).send('Internal Server Error');
                return;
            }

            if(err && response.statusCode > 200){
                res.status(400).send({error_message: 'error Bad Request'});
                return;
            }
            res.send({message: response});
        }
    );
});

module.exports = create;
