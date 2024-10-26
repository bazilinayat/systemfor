const express = require("express")
const app = express()
const port = 3005

// requirements for functionalities
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const _ = require("underscore");
const fs = require("fs")
var cors = require('cors')
var bodyParser = require('body-parser')

// require for configs
const config = require("config");
const helper = require("./helpers");

app.use(cors({
    origin: ['https://systemfor.onrender.com']
  }))


app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))

//requirements for custom imports

// In-memory storage for menu, to be loaded from menu.json
var menu = []

// In-memory storage for tables, List of tables, to be initialized
const tables = []

// In-memory storage for orders, List of all orders, to be filled from tables
var orders = []; 
/*
Sample Order Object
{
orderId: 1, (incremental - last+1)
items: [
    {
        itemId: 1,
        qty: 1,
        price: 1
    },
    .
    .
    .
],

// Below has to be calculated at the time of billing

tip: 1,

totalBeforeTax: 1, (sum of price from all the items)
sgstamount: 0.25 * totalBeforeTax,
cgstamount: 0.25 * totalBeforeTax,
total: totalBeforeTax + sgstamount + cgstamount
}
*/

app.get("/", (req, res) => {
    res.status(200).json({
        message: "this is index page"
    })
})

// Menu APIs
// API to get whole menu with all items or items for a single category
app.get('/api/menu', cors(), (req, res) => {
    let category = req.query.category

    let menuToDisplay = []
    if (category && category.length > 0)
        menuToDisplay = helper.TransformData(menu.filter(it => it.category == category));
    else
        menuToDisplay = helper.TransformData(menu)

    res.status(200).json(menuToDisplay)
});

// API to get a list of all categories
app.get('/api/menu/categories', cors(), (req, res) => {
    let categories = [...new Set(menu.map(item => item.category))]

    res.status(200).json(categories)
});

// Table APIs
// API to get table list with availability
app.get('/api/tables', cors(), (req, res) => {
    res.status(200).json(tables);
});

// API to reserve a table or to occupy a table
app.get('/api/tables/:tableId', cors(), (req, res) => {
    const { tableId } = req.params;

    const table = tables.find(t => t.id === parseInt(tableId));
    if (!table || !table.available) {
      return res.status(404).json({ message: 'Table not available' });
    }

    if (table) {
        table.available = false;
    }

    res.status(200).json({
        message: `Table - ${tableId} - is reserved.`
    });
});

// API to clear a table, mostly called when billing done
app.post('/api/tables/clear/:tableId', cors(), (req, res) => {
    const { tableId } = req.params;

    const table = tables.find(t => t.id === parseInt(tableId));
    if (!table || !table.available) {
      return res.status(404).json({ message: 'Table not available' });
    }

    if (table) {
        table.available = true
        table.orderId = null
    }

    res.status(200).json({
        message: `Table - ${tableId} - is cleared.`
    })
})

// Order APIs
// API to add item to table's order
app.post('/api/order/:tableId', cors(), (req, res) => {
    const { tableId } = req.params;
    let menuItems = req.body;
    // let menuItems = [
    //     {
    //         itemId: 1,
    //         qty: 1
    //     },
    //     {
    //         itemId: 2,
    //         qty: 1
    //     }
    // ]

    console.log('here I am')
    
    let orderId = null
    let order = {
        items: []
    }    
    let itemsToAdd = helper.GetItemsTotal(menuItems, menu)

    itemsToAdd.forEach((item) => {
        order.items.push(item)
    })
  
    // finalizing the order, adding to table
    const table = tables.find(t => t.id === parseInt(tableId));

    if (table) {
        table.orderId = orders.length + 1
        orderId = table.orderId
    }

    order.orderId = orderId
    orders.push(order)
    console.log(orders)

    res.status(200).json({
        orderId: orderId,
        message: 'New order created!'
    });
});

// API to get order detalis
app.get('/api/getorder/:orderId', cors(), (req, res) => {
    const { orderId } = req.params;

    const order = orders.find(o => o.orderId === parseInt(orderId));
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json(order)
})

// API to add to the existing order
app.post('/api/order/add/:orderId', cors(), (req, res) => {
    const { orderId } = req.params;
    let menuItems = req.body;

    // let menuItems = [
    //     {
    //         itemId: 5,
    //         qty: 1
    //     },
    //     {
    //         itemId: 8,
    //         qty: 1
    //     },
    //     {
    //         itemId: 2,
    //         qty: 2
    //     }
    // ]

    const order = orders.find(o => o.orderId === parseInt(orderId));
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    let existingItems = order.items

    let itemsToAdd = helper.GetItemsIncludingExisting(existingItems, menuItems, menu)

    order.items = []
    itemsToAdd.forEach((item) => {
        order.items.push(item)
    })

    res.status(200).json({
        message: 'Items Added!'
    })
})

// API to add tip to the order, most probably this will not be needed
app.get('/api/order/tip/:tableId/:orderId/:tip', cors(), (req, res) => {
    const { tableId } = req.params;
    const { orderId } = req.params;
    //const { tip } = req.params;

    let tip = 10

    orders.forEach((x) => {
        if (x.orderId === orderId) {
            x.tip = tip
        }
    });

    res.status(200);
  });

// API to generate the bill and QR code
app.get('/api/order/bill/:tableId/:orderId', cors(), async (req, res) => {
    const { tableId } = req.params;
    const { orderId } = req.params;
  
    const order = orders.find(o => o.orderId === parseInt(orderId));
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.totalBeforeTax = helper.CalculateOrderTotalBeforeTax(order)
    order.sgstamount = helper.CalculateCSGST(order)
    order.cgstamount = helper.CalculateCSGST(order)
    order.total = helper.CalculateTotal(order)
  
    // Generate QR code with bill details
    //const qrData = `Table: ${tableId}, Order: ${orderId}, Total: ${order.totalBeforeTax}, Tip: ${order.tip}, GST: ${helper.GetGSTTotal(order)}`;
    const qrData = `${req.protocol}://${req.headers.host}/api/order/invoice/${tableId}/${orderId}`
    const qrCode = await QRCode.toDataURL(qrData);
  
    res.json({ total: order.total, qrCode });
});

// API to generate invoice
app.get('/api/order/invoice/:tableId/:orderId', cors(), (req, res) => {
    const { tableId } = req.params;
    const { orderId } = req.params;
  
    const order = orders.find(o => o.orderId === parseInt(orderId));
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const doc = new PDFDocument();
    doc.text('Invoice', 100, 100);
    doc.text(`Table: ${tableId}`, 100, 120);
    doc.text('Items:', 100, 140);
    order.items.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.name} - ${item.qty} - ${item.price}`, 100, 160 + index * 20);
    });
    doc.text(`Total Before Tax: $${order.totalBeforeTax}`, 100, 500);
    if (order.tip > 0)
        doc.text(`Tip: ${order.tip}`, 100, 520);
    doc.text(`CGST: ${order.cgstamount}`, 100, 540);
    doc.text(`SGST: ${order.sgstamount}`, 100, 560);
    doc.text(`Total GST: ${helper.GetGSTTotal(order)}`, 100, 580);
    doc.text(`Total: ${order.total}`, 100, 600);
  
    res.setHeader('Content-disposition', 'inline; filename=invoice.pdf');
    res.setHeader('Content-type', 'application/pdf');
    doc.pipe(res);
    doc.end();
});
  

function init() {
    let numberOfTables = config.get('noOftables')
    for (let i = 1; i <= numberOfTables; i++) {
        tables.push({
            id: i,
            available: true,
            orderid: null
        })
    }

    menu = JSON.parse(fs.readFileSync("menu.json", "utf8"));

    orders = []
}

app.listen(port, () => {

    init()

    console.log(`Server listening on ${port}`)
})