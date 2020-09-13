var express = require('express');
var router = express.Router();
const fs = require('fs');

var queue = [];
var orders = [];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'LIT Postmates Handler' });
});

module.exports = router;

/* POST home page. */
router.post("/", (req, res) => {
  res.status(200);
  res.send();
  //TODO do delivery id check here (we only want one post)
  queue.push(req.body);
})

/* Get useful data from post request data. */
setInterval( function () {
  if(queue.length > 0) {
    console.log("data queue has " + queue.length + " items in it");
    //push the post data to an orders queue
    orders.push(getOrderInfo(queue.shift()));
  }
}, 3000 );

/* Add printer information to order objects */
setInterval( function () {
  if(orders.length > 0) {
    console.log("order queue has " + orders.length + " items in it");
    assignItemsToPrinters(orders);
    makeHTMLReceipts(orders);
    sendReciptsToPrinters(orders);
  }
}, 3000 );
/* Use AXIOS to post data to integromat */
function sendReciptsToPrinters(postObject){
  //TODO
}
/* HTML Receipt Template Helper*/

function makeHTMLReceipts(myOrders){
  console.log(myOrders.length);
  var postData = {
    orderId: '',
    foodrunHTML: '',
    entreeHTML: '',
    appHTML: '',
    dessertHTML: ''
  };
  let p_types = ["Foodrun", "App", "Entree", "Dessert"];
  for(let i = 0; i < myOrders.length ; i++) {
    for( let p = 0; p < p_types.length; p++) {
      if(myOrders[i].foodrun_items.length > 0 && p_types[p] === "Foodrun"){
        console.log("Constructing receipt for " + p_types[p]);
      }
      if(myOrders[i].app_items.length > 0 && p_types[p] === "App"){
        console.log("Constructing receipt for " + p_types[p]);
      }
      if(myOrders[i].entree_items.length > 0 && p_types[p] === "Entree"){
        console.log("Constructing receipt for " + p_types[p]);
      }
      if(myOrders[i].dessert_items.length > 0 && p_types[p] === "Dessert"){
        console.log("Constructing receipt for " + p_types[p]);
      }
      //THIS WHERE FUNCTION GOING TO DO HEAVY LIFTING
    }
    console.log(myOrders.shift());
    console.log(postData);
  }
}
var receipt_template =`
  <!DOCTYPE html>
  <html>
  <head> 
    <style>
      .right {float: right;}
      .left {float: left;}
    </style>
  </head> 
  <body>
    <h3>
      <div> gType </div>
      <div> gName </div>
      <div> gPhone </div>  
      <div> gDelivery </div>  
    </h3>
    <p> gTimestamp </p> 
    <p> gReadyBy </p> 
    <div>
      <span class= "right">Foodrun</span>
      <span class= "left">Grubhub</span>
    </div>
    <br>
    <hr>
    <div>
      <h4> gMarkup</h4>
    </div>
    <hr>
    <p>gComment</p>
    <p>gDelComment</p>
  </body>
  </html>
`;

/*Helper functions*/
function getOrderInfo(request_body) {
  let order = {};
  order.delivery_id = request_body.delivery_id;
  order.order_number = request_body.data.manifest.reference;
  order.customer_name = request_body.data.dropoff.name; 
  order.phone_number = request_body.data.dropoff.phone_number;
  order.all_items = request_body.data.manifest_items;
  order.placed_at = new Date(request_body.data.created).toString();
  order.ready_by = new Date(request_body.data.pickup_ready).toString();
  return order;
}
function readMenu() {
  try {
    const jsonString = fs.readFileSync('./menu.json')
    const menu = JSON.parse(jsonString)
    return menu
  } catch(err) {
    console.log(err)
    return
  }
}
function getPrinters(item_name){
  let menu = readMenu();
  let printer_ids = ''
  for(let i = 0; i < menu.length; i++){
    if(item_name == menu[i].name){
      return menu[i].printers;
    }
  }
}
function assignItemsToPrinters(orderQueue){
  for(let i = 0; i < orderQueue.length; i++){
    if(typeof orderQueue[i].foodrun_items === 'undefined'){
      orderQueue[i].foodrun_items = orderQueue[i].all_items;
      orderQueue[i].app_items = [];
      orderQueue[i].entree_items = [];
      orderQueue[i].dessert_items = [];
      for(let item = 0; item < orderQueue[i].all_items.length; item++){
        if(getPrinters(orderQueue[i].all_items[item].name).includes("A")){
          orderQueue[i].app_items.push(orderQueue[i].all_items[item]);
        }
        if(getPrinters(orderQueue[i].all_items[item].name).includes("E")){
          orderQueue[i].entree_items.push(orderQueue[i].all_items[item]);
        }
        if(getPrinters(orderQueue[i].all_items[item].name).includes("D")){
          orderQueue[i].dessert_items.push(orderQueue[i].all_items[item]);
        }
      }
    }
  }
}
