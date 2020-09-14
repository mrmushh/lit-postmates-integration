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
    postData.orderId = myOrders[i].delivery_id;
    for( let p = 0; p < p_types.length; p++) {
      var manifestHTML = "";
      if(myOrders[i].foodrun_items.length > 0 && p_types[p] === "Foodrun"){
        for(let j = 0; j < myOrders[i].foodrun_items.length; j++){
          manifestHTML += `
            <p> ${myOrders[i].foodrun_items[j].quantity} ${myOrders[i].foodrun_items[j].name} </p>
            <ul style="list-style-type:none">
            <li>${myOrders[i].foodrun_items[j].additional_data}</li>
            </ul>
          `
        }
        let r = createReceipt(myOrders[i].customer_name, myOrders[i].order_number, myOrders[i].placed_at, myOrders[i].ready_by, p_types[p], manifestHTML);
        postData.foodrunHTML = r;
      }
      if(myOrders[i].app_items.length > 0 && p_types[p] === "App"){
        for(let j = 0; j < myOrders[i].app_items.length; j++){
          manifestHTML += `
            <p> ${myOrders[i].app_items[j].quantity} ${myOrders[i].app_items[j].name} </p>
            <ul style="list-style-type:none">
            <li>${myOrders[i].app_items[j].additional_data}</li>
            </ul>
          `
        }
        let r = createReceipt(myOrders[i].customer_name, myOrders[i].order_number, myOrders[i].placed_at, myOrders[i].ready_by, p_types[p], manifestHTML);
        postData.appHTML = r;
      }
      if(myOrders[i].entree_items.length > 0 && p_types[p] === "Entree"){
        for(let j = 0; j < myOrders[i].entree_items.length; j++){
          manifestHTML += `
            <p> ${myOrders[i].entree_items[j].quantity} ${myOrders[i].entree_items[j].name} </p>
            <ul style="list-style-type:none">
            <li>${myOrders[i].entree_items[j].additional_data}</li>
            </ul>
          `
        }
        let r = createReceipt(myOrders[i].customer_name, myOrders[i].order_number, myOrders[i].placed_at, myOrders[i].ready_by, p_types[p], manifestHTML);
        postData.entreeHTML = r;
      }
      if(myOrders[i].dessert_items.length > 0 && p_types[p] === "Dessert"){
        for(let j = 0; j < myOrders[i].dessert_items.length; j++){
          manifestHTML += `
            <p> ${myOrders[i].dessert_items[j].quantity} ${myOrders[i].dessert_items[j].name} </p>
            <ul style="list-style-type:none">
            <li>${myOrders[i].dessert_items[j].additional_data}</li>
            </ul>
          `
        }
        let r = createReceipt(myOrders[i].customer_name, myOrders[i].order_number, myOrders[i].placed_at, myOrders[i].ready_by, p_types[p], manifestHTML);
        postData.dessertHTML = r;
      }
    }
    console.log(myOrders.shift());
    console.log(postData);
  }
}

/*Helper functions*/
function createReceipt(name, orderNo, placed, ready, printer, itemLog){
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
        <div> ${name} ${orderNo} no p (default) </div>  
      </h3>
      <p> ${placed} </p> 
      <p> ${ready} </p> 
      <div>
        <span class= "right"> ${printer} </span>
        <span class= "left"> Postmates </span>
      </div>
      <br>
      <hr>
      <div>
        <h4> ${itemLog}</h4>
      </div>
      <hr>
      <p> order comment </p>
    </body>
    </html>
  `;
  receipt_template = receipt_template.split("\n").join('')
  return receipt_template;
}
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
