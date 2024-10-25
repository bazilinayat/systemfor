const { basename } = require("path");

const BaseUrl = "http:localhost:3000"

function CallGetAPI(url) {
    fetch(url)
    .then(response => {
        // Check if the response is successful
        if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
        }
        // Parse the JSON from the response
        return response.json();
    })
    .then(data => {
        // Handle the data from the API
        console.log(data);
    })
    .catch(error => {
        // Handle any errors that occurred during the fetch
        console.error("There was a problem with fetching categories:", error);
    });
}

function CallPostAPI(url, data) {
    // Define the request options
    const options = {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
    };
    
    // Conditionally add the body if data is present
    if (Object.keys(data).length > 0) {
        options.body = JSON.stringify(data);
    }

    // Make the fetch request with the conditional body
    fetch(url, options)
    .then(response => {
        if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

function GetAllCategories() {
    const url = BaseUrl + "/api/menu/categories";
    return CallGetAPI(url);
}

function GetItemsForCategories(category) {
    const url = BaseUrl + "/api/menu?category=" + category;
    return CallGetAPI(url);
}

function GetTables() {
    const url = BaseUrl + "/api/tables";
    return CallGetAPI(url);
}

function GetOrder(ordreId) {
    const url = BaseUrl + "/api/getorder/" + orderId;
    return CallGetAPI(url);
}

function ReserveATable(tableId) {
    const url = BaseUrl + "/api/tables/" + tableId;
    return CallPostAPI(url, {})
}

function ClearTable(tableId) {
    const url = BaseUrl + "/api/tables/clear/" + tableId;
    return CallPostAPI(url, {})
}

function PlaceFirstOrder(tableId) {
    const url = BaseUrl + "/api/order/" + tableId;

    // Prepare the data
    let data = {}

    return CallPostAPI(url, data)
}

function AddToOrder(orderId) {
    const url = BaseUrl + "/api/order/add/" + orderId;

    //Preapre the data
    let data = {}

    return CallPostAPI(url, data);
}

function AddTipToOrder(orderId, tip) {
    const url = BaseUrl + "/api/order/tip/:tableId/" + orderId + "/" + tip;

    // Prepare the data
    let data = {}

    return CallPostAPI(url, data)
}

function GenerateBill(tableId, orderId) {
    const url = BaseUrl + "/api/order/bill/" + tableId + "/" + orderId;

    return CallPostAPI(url)
}

function GenerateBill(tableId, orderId) {
    const url = BaseUrl + "/api/order/invoice" + tableId + "/" + orderId;

    return CallPostAPI(url)
}