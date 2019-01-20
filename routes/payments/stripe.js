let express = require('express');
let router = express.Router();
const util = require('../util.js');
const uuid = require('uuid');

// The homepage of the site
router.post('/checkout_action', (req, res, next) => {
    // define DB
    console.log(req.session.customer);
    let db = req.app.db;
    // charge via pointsnet
    let order = {
        order_id: uuid(),
        total_amount: 20,
        currency: 'HKD',
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        phone: req.body.phone_number,
        status: 1
    };

    util.doRequest(
        {
            query:
                `mutation {
                    create (transaction: {
                    order_id: "` + order.order_id + `",
                    total_amount: ` + order.total_amount + `,
                    currency: "` + order.currency + `"},
                    items: [{
                        name: "Baju Mahal",
                        category: "asdasd",
                        price: 200,
                        quantity: 1
                    }],
                    customer: {
                        first_name: "` + req.session.customer.firstName + `",
                        last_name: "` + req.session.customer.lastName + `",
                        email: "kodrat.meden@gmail.com",
                        phone: "` + req.session.customer.phone + `"
                    },
                    expiry: {
                        start_time: "2019-12-21T18:24:34+07:00",
                        unit: "minute",
                        duration: 600
                    }) {transaction_id}}`
        },
        (err, response) => {
            if(!response){
                res.send(500).send('Internal Server Error');
                return;
            }
            if(err && response.statusCode > 200){
                res.status(400).send({error_message: 'error Bad Request'});
                return;
            }
            // db insert to order collections
            db.orders.insert(order, (err, newDoc) => {
                if(err){
                    console.log(err.stack);
                }
                req.session.orderId = newDoc.insertedIds['0'];
            });

            if(req.session.cart){
                req.session.cart = null;
                req.session.orderId = null;
                req.session.totalCartAmount = 0;
            }
            res.send({message: response});
        }
    );
});

router.post('/callback', (req, res, next) => {
    let status = req.body.status;
    let db = req.app.db;
    if(status === 0){
        res.redirect('/success');
    }else if(status === 1){
        db.orders.update({order_id: req.body.order_id}, {$set: {status: status}}, {multi: false}, (err, numReplaced) => {
            if(err){
                console.log(err.stack);
            }
        });
    }else{
        console.log('Failed');
    }
});

router.get('/handle/:id', (req, res, next) => {
    let order_id = req.params.id;
    let db = req.app.db;
    db.orders.findOne({order_id: order_id}, (err, order) => {
        if(err){
            console.info(err.stack);
        }
        let status = order.status;
        if(status === 0){
            req.session.message = 'Payment Approved';
            req.session.messageType = 'danger';
            res.redirect('/');
            return;
        }

        if(status === 1){
            req.session.message = 'Payment Pending';
            req.session.messageType = 'danger';
            res.redirect('/');
            return;
        }
        if(status === 2){
            req.session.message = 'Payment Failed';
            req.session.messageType = 'danger';
            res.redirect('/');
            return;
        }
    });
});

router.get('/success', (req, res, next) => {
    console.log('masuk')
    res.render('success', {
        title: 'Payment Success'
    })
})

module.exports = router;
