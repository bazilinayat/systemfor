// DineInTab.jsx
import React, { useEffect, useState } from 'react';

const DineInTab = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [items, setItems] = useState([]);
  const [categoryItems, setCategoryItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [orderHistory, setOrderHistory] = useState({});

  const BaseUrl = "https://systemfor.onrender.com"
  
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch(`${BaseUrl}/api/tables`);
        const data = await response.json();
        setTables(data);
      } catch (error) {
        console.error('Error fetching tables:', error);
      }
    };

    fetchTables();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`${BaseUrl}/api/menu/categories`);
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, []);

  const handleItemClick = async (itemKey) => {
    try {
      const response = await fetch(`${BaseUrl}/api/menu?category=${itemKey}`);
      const data = await response.json();
      const updatedData = data.map((category) => ({
        ...category,
        items: category.items.map((item) => ({ ...item, quantity: 0, selected: false })),
      }));
      setCategoryItems(updatedData);
    } catch (error) {
      console.error('Error fetching category items:', error);
    }
  };

  const handleTableChange = (event) => {
    setSelectedTable(event.target.value);
  };

  const toggleItemSelection = (categoryIndex, itemIndex) => {
    const updatedCategoryItems = [...categoryItems];
    const item = updatedCategoryItems[categoryIndex].items[itemIndex];
    item.selected = !item.selected;
    setCategoryItems(updatedCategoryItems);

    const selected = updatedCategoryItems.flatMap(category =>
      category.items.filter(item => item.selected)
    );
    setSelectedItems(selected);
  };

  const increaseQuantity = (categoryIndex, itemIndex) => {
    const updatedCategoryItems = [...categoryItems];
    updatedCategoryItems[categoryIndex].items[itemIndex].quantity += 1;
    setCategoryItems(updatedCategoryItems);
  };

  const decreaseQuantity = (categoryIndex, itemIndex) => {
    const updatedCategoryItems = [...categoryItems];
    if (updatedCategoryItems[categoryIndex].items[itemIndex].quantity > 0) {
      updatedCategoryItems[categoryIndex].items[itemIndex].quantity -= 1;
      setCategoryItems(updatedCategoryItems);
    }
  };

  const handleOrder = async () => {
    if (!selectedTable) {
      alert('Select the table first');
      return;
    }

    const orderItems = selectedItems.map((item) => ({
      itemId: item.id,
      qty: item.quantity,
    }));

    const existingOrderId = orderHistory[selectedTable];

    // Determine URL based on whether the order already exists for the table
    const url = existingOrderId
      ? `${BaseUrl}/api/order/add/${existingOrderId}`
      : `${BaseUrl}/api/order/${selectedTable}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderItems),
      });
      const data = await response.json();
      
      if (!existingOrderId) {
        // Save orderId if this is a new order
        setOrderHistory((prevHistory) => ({
          ...prevHistory,
          [selectedTable]: data.orderId,
        }));
      }

      alert(data.message);
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  const handleViewOrder = async () => {
    if (!selectedTable) {
      alert('Select the table first');
      return;
    }

    const orderId = orderHistory[selectedTable];
    if (!orderId) {
      alert('No order found for this table.');
      return;
    }

    try {
      const response = await fetch(`${BaseUrl}/api/getorder/${orderId}`);
      const orderData = await response.json();
      const orderWindow = window.open('', '_blank');
      orderWindow.document.write(`
        <html>
          <head>
            <title>Order Details for Table ${selectedTable}</title>
            <style>
              body { font-family: Arial, sans-serif; }
              .order-container { padding: 20px; max-width: 600px; margin: auto; }
              .header { font-size: 1.2em; font-weight: bold; margin-bottom: 10px; }
              .table, .table th, .table td { border: 1px solid #ddd; border-collapse: collapse; padding: 8px; }
              .table th { background-color: #f2f2f2; }
              .table th, .table td { text-align: left; }
              .table-container { margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="order-container">
              <div class="header">Order Details</div>
              <div>Table Id: ${selectedTable}</div>
              <div>Order Id: ${orderData.orderId}</div>
              <div class="table-container">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Qty</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${orderData.items.map(item => `
                      <tr>
                        <td>${item.name}</td>
                        <td>${item.qty}</td>
                        <td>${item.price}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </body>
        </html>
      `);
      orderWindow.document.close();
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handleGetBill = async () => {
    if (!selectedTable) {
      alert('Select the table first');
      return;
    }

    const orderId = orderHistory[selectedTable];
    if (!orderId) {
      alert('No order found for this table.');
      return;
    }

    try {
      const response = await fetch(`${BaseUrl}/api/order/bill/${selectedTable}/${orderId}`);
      const billData = await response.json();

      const billWindow = window.open('', '_blank');
      billWindow.document.write(`
        <html>
          <head>
            <title>Bill for Table ${selectedTable}</title>
          </head>
          <body>
            <h1>Total: ₹${billData.total}</h1>
            <div>Scan the QR code to pay:</div>
            <img src="${billData.qrCode}" alt="QR Code" />
          </body>
        </html>
      `);
      billWindow.document.close();
    } catch (error) {
      console.error('Error fetching bill:', error);
    }
  };

  const handleGenerateInvoice = async () => {

    if (!selectedTable) {
      alert('Select the table first');
      return;
    }

    const orderId = orderHistory[selectedTable];
    if (!orderId) {
      alert('No order found for this table.');
      return;
    }

    try {
      // Fetch the invoice PDF
      const response = await fetch(`${BaseUrl}/api/order/invoice/${selectedTable}/${orderId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url);

      // Clear the table after invoice generation
      await fetch(`${BaseUrl}/api/tables/clear/${selectedTable}`, { method: 'POST' });

      // Clear the orderId from the order history
      setOrderHistory((prevHistory) => {
        const updatedHistory = { ...prevHistory };
        delete updatedHistory[selectedTable]; // Remove orderId for the cleared table
        return updatedHistory;
      });

      alert('Table cleared successfully');
    } catch (error) {
      console.error('Error generating invoice or clearing table:', error);
    }

  };

  return (
    <div>
      <button onClick={handleViewOrder} style={styles.viewOrderButton}>View Order</button>
      <button onClick={handleGetBill} disabled={!selectedTable} style={styles.getBillButton}>
        Get Bill
      </button>
      <button onClick={handleGenerateInvoice} disabled={!selectedTable} style={styles.generateInvoiceButton}>

        Generate Invoice

      </button>

      <div style={styles.dropdownContainer}>
        <label htmlFor="table-select">Select a Table: </label>
        <select id="table-select" value={selectedTable} onChange={handleTableChange} style={styles.dropdown}>
          <option value="">-- Select a Table --</option>
          {tables.map((table) => (
            <option key={table.id} value={table.id}>
              Table {table.id}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.container}>
        <div style={styles.listContainer}>
          <ul style={styles.list}>
            {items.map((item, index) => (
              <li 
                key={index} 
                style={styles.listItem}
                onClick={() => handleItemClick(item)}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div style={styles.checkboxContainer}>
          {categoryItems.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h3>{category.category}</h3>
              {category.items.map((item, itemIndex) => (
                <div key={item.id} style={styles.itemRow}>
                  <label>
                    <input 
                      type="checkbox" 
                      name={item.name} 
                      value={item.id}
                      checked={item.selected}
                      onChange={() => toggleItemSelection(categoryIndex, itemIndex)}
                      style={styles.checkbox}
                    />
                    {item.name} - ₹{item.price} {item.veg ? '(Veg)' : '(Non-Veg)'}
                  </label>
                  <div style={styles.quantityContainer}>
                    <button onClick={() => decreaseQuantity(categoryIndex, itemIndex)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increaseQuantity(categoryIndex, itemIndex)}>+</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleOrder} disabled={selectedItems.length === 0} style={styles.orderButton}>
        Place Order
      </button>
    </div>
  );
};

const styles = {
  dropdownContainer: {
    marginBottom: '10px',
  },
  dropdown: {
    padding: '5px',
    fontSize: '16px',
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    border: '1px solid #ccc',
    padding: '20px',
  },
  viewOrderButton: {
    marginRight: '10px',
  },
  getBillButton: {
    marginBottom: '10px',
    padding: '8px 16px',
    cursor: 'pointer',
  },
  listContainer: {
    width: '30%',
    padding: '10px',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
  },
  listItem: {
    padding: '10px',
    backgroundColor: '#f0f0f0',
    cursor: 'pointer',
  },
  checkboxContainer: {
    width: '70%',
    padding: '10px',
    overflowY: 'auto',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
  },
  checkbox: {
    marginRight: '8px',
  },
  quantityContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  orderButton: {
    marginTop: '10px',
    padding: '8px 16px',
    cursor: 'pointer',
  },
};

export default DineInTab;
