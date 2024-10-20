function GetItemsTotal(menuItems, menu) {

    const outputArray = menuItems.map(inputItem => {
        const originalItem = menu.find(item => item.itemId === inputItem.itemId);
        
        return {
            itemId: inputItem.itemId,
            name: originalItem.name,
            qty: inputItem.qty,
            price: originalItem.price * inputItem.qty
        };
    });

    return outputArray
}

function GetItemsIncludingExisting(existingItems, menuItems, menu) {

    menuItems.forEach(newItem => {
        const existingItem = existingItems.find(item => item.itemId === newItem.itemId);
    
        if (existingItem) {
            // Update qty and recalculate price for existing items
            existingItem.qty += newItem.qty;
            const pricePerItem = menu.find(item => item.itemId === newItem.itemId).price;
            existingItem.price = existingItem.qty * pricePerItem;
        } else {
            // Add new item to result with calculated price
            const pricePerItem = menu.find(item => item.itemId === newItem.itemId).price;
            const name = menu.find(item => item.itemId === newItem.itemId).name;
            existingItems.push({
                itemId: newItem.itemId,
                name: name,
                qty: newItem.qty,
                price: newItem.qty * pricePerItem
            });
        }
    });
    return existingItems
}

function TransformData(menu) {
    return menu.reduce((acc, item) => {
        // Find if the category already exists
        let category = acc.find(c => c.category === item.category);
        
        if (!category) {
            // If category doesn't exist, create a new one with empty items array
            category = { category: item.category, items: [] };
            acc.push(category);
        }
        
        // Add the current item to the items array, adjusting field names
        const newItem = {
            id: item.itemId,
            name: item.name,
            price: item.price
        };
    
        // Only add 'veg' if it exists in the item
        if (item.hasOwnProperty('veg')) {
            newItem.veg = item.veg;
        }
    
        category.items.push(newItem);
        
        return acc;
    }, []);
}

function FindOrder(orders, orderId) {
    const itemIndex = orders.findIndex(item => item.orderId === orderId);

    return itemIndex
}

function CalculateOrderTotalBeforeTax(order) {
    return order.items.reduce((acc, item) => acc + item.price, 0)
}

function CalculateCSGST(order) {
    return order.totalBeforeTax * 0.25
}

function CalculateTotal(order) {
    if (order.tip > 0)
        return order.totalBeforeTax + order.sgstamount + order.cgstamount + order.tip
    else 
    return order.totalBeforeTax + order.sgstamount + order.cgstamount
}

function GetGSTTotal(order) {
    return order.sgstamount + order.cgstamount
}


module.exports = {
    GetItemsTotal,
    TransformData,
    GetItemsIncludingExisting,
    FindOrder,
    CalculateOrderTotalBeforeTax,
    CalculateCSGST,
    CalculateTotal,
    GetGSTTotal
}