var express = require('express');
var router = express.Router();

var queue = [];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'LIT Postmates Handler' });
});

module.exports = router;

/* POST home page. */
router.post("/", (req, res) => {
  res.status(200);
  res.send();
  queue.push(req.body);
})

/* Get useful data from post request data. */
setInterval( function () {
  if(queue.length > 0) {
    console.log("queue has " + queue.length + " items in it");
    let current_order = getOrderInfo(queue.shift());
    console.log(current_order);
  }
  else {
    //console.log("queue is empty");
  }
}, 3000 );

function getOrderInfo(request_body) {
  let order = {};
  order.delivery_id = request_body.delivery_id;
  order.order_number = request_body.data.manifest.reference;
  order.customer_name = request_body.data.dropoff.name; 
  order.phone_number = request_body.data.dropoff.phone_number;
  order.all_items = request_body.data.manifest_items;
  order.placed_at = request_body.data.created;
  order.ready_by = request_body.data.pickup_ready;
  return order;
}
