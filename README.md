# systemfor

# Files - 

menu.json ->
This is a file to store the pre-defined menu of the restaurant

config/default.json ->
This is a file to store the default configuration of the system
noOftables - total number of tables in the restaurants

# APIs - 

1. Base URL - http://localhost:3000/
    Just to start the application and see if it is running

2. http://localhost:3000/api/menu
    Takes the json from menu.json and formats for display and returns

    Sample Output - (Depends on the menu.json)
        [{"category":"Starters","items":[{"id":1,"name":"Spring Rolls","price":10,"veg":true},{"id":3,"name":"Kebab","price":10,"veg":true}]},{"category":"Starters1","items":[{"id":2,"name":"Spring Rolls1","price":10,"veg":false},{"id":5,"name":"Just Stuffed","price":8,"veg":false}]},{"category":"Main Course","items":[{"id":8,"name":"Curry","price":10,"veg":false}]}]

3. http://localhost:3000/api/menu?category=<filterCategoryName>
    Takes the json from menu.json, filters as per the given category and formats for display and returns

    Sample Url -
        http://localhost:3000/api/menu?category=Starters
    Sample Output - (Depends on the menu.json)
        [{"category":"Starters","items":[{"id":1,"name":"Spring Rolls","price":10,"veg":true},{"id":3,"name":"Kebab","price":10,"veg":true}]}]

4. http://localhost:3000/api/menu/categories
    Takes the json from menu.json, gets out and returns only the unique categories

    Sample Output - (Depends on the menu.json)
        ["Starters","Starters1","Main Course"]

5. http://localhost:3000/api/tables
    Returns the list of table with their availability
    The number of table are taken from /config/default.json

    Sample Data - 
        [{"id":1,"available":true,"orderid":null},{"id":2,"available":true,"orderid":null},{"id":3,"available":true,"orderid":null},{"id":4,"available":true,"orderid":null},{"id":5,"available":true,"orderid":null},{"id":6,"available":true,"orderid":null},{"id":7,"available":true,"orderid":null},{"id":8,"available":true,"orderid":null}]

6. http://localhost:3000/api/tables/<tableId>
    Marks the table with given tableId as occupied or reserved the table

    Output -
        {"message":"Table - <TableId> - is reserved."}

    Sample Url -
        http://localhost:3000/api/tables/3
    Sample Output -
        {"message":"Table - 3 - is reserved."}

7. http://localhost:3000/api/order/<tableId>
    Sets the initial order for the given table id

    Request Body -
        {
            {
                itemId: <itemId>,
                qty: <quantity>
            },
            {
                itemId: <itemId>,
                qty: <quantity>
            }
        }


    Output -
        {"orderId":<orderId>,"message":"New order created!"}

    Sample Url -
        http://localhost:3000/api/order/3
    Sample Body -
        [
            {
                itemId: 1,
                qty: 1
            },
            {
                itemId: 2,
                qty: 1
            }
        ]
    Sample Output -
        {"orderId":1,"message":"New order created!"}

8. http://localhost:3000/api/getorder/<orderId>
    Get the order details for the given orderId

    Output -
        {"items":[{"itemId":<itemId>,"name":<itemName>,"qty":<quantity>,"price":<totalPrice>}],"orderId":<orderId>}

    Sample Url -
        http://localhost:3000/api/order/1
    Sample Output -
        {"items":[{"itemId":5,"name":"Just Stuffed","qty":1,"price":8},{"itemId":8,"name":"Curry","qty":1,"price":10},{"itemId":2,"name":"Spring Rolls1","qty":2,"price":20}],"orderId":1}

9. http://localhost:3000/api/order/add/<orderId>
    Adds items to existing order, with the given orderId

    Request Body -
        [
            {
                itemId: <itemId>,
                qty: <quantity>
            },
            {
                itemId: <itemId>,
                qty: <quantity>
            }
        ]


    Output -
        {"message":"Items Added!"}

    Sample Url -
        http://localhost:3000/api/order/1
    Sample Body -
        [
            {
                itemId: 5,
                qty: 1
            },
            {
                itemId: 8,
                qty: 1
            },
            {
                itemId: 2,
                qty: 2
            }
        ]
    Sample Output -
        {"message":"Items Added!"}

10. http://localhost:3000/api/order/tip/<tableId>/<orderId>/<tipToBeGiven>
    Adds a tip to the given orderId

    Sample Url -
        http://localhost:3000/api/order/tip/3/1/42

11. http://localhost:3000/api/order/bill/<tableId>/<orderId>
    Calculates the order totals and gst.
    Generates a qrCode string
    Returns order total and qrCode string.

    Sample Url -
        http://localhost:3000/api/order/3/1
    Sample Output -
        {"total":57,"qrCode":<qrCodeString>"}

12. http://localhost:3000/api/order/invoice/<tableId>/<orderId>
    Sets up and generates a pdf for the invoice

    Output - 
        Generates a pdf with order details

    Sample Url -
        http://localhost:3000/api/order/invoice/3/1