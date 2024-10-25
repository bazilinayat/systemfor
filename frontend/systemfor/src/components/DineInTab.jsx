// DineInTab.jsx
import React, { useEffect, useState } from 'react';

const DineInTab = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [items, setItems] = useState([]);
  const [categoryItems, setCategoryItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [orderHistory, setOrderHistory] = useState({});
  
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch('http://localhost:3005/api/tables');
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
        const response = await fetch('http://localhost:3005/api/menu/categories');
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
      const response = await fetch(`http://localhost:3005/api/menu?category=${itemKey}`);
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

    const menuItems = selectedItems.map((item) => ({
      itemId: item.id,
      qty: item.quantity,
    }));

    try {
      const response = await fetch(`http://localhost:3005/api/order/${selectedTable}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuItems),
      });
      const data = await response.json();
      setOrderHistory((prevHistory) => ({
        ...prevHistory,
        [selectedTable]: data.orderId,
      }));
      alert(`Order placed successfully! Order ID: ${data.orderId}`);
    } catch (error) {
      alert(error);
      console.error('Error placing order:', error);
    }
  };

  return (
    <div>
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
                    {item.name} - ${item.price} {item.veg ? '(Veg)' : '(Non-Veg)'}
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
        <button
          onClick={handleOrder}
          disabled={selectedItems.length === 0}
          style={styles.orderButton}
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

const styles = {
  dropdownContainer: {
    marginBottom: '10px',
  },
  dropdown: {
    padding: '5px',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '400px',
    border: '1px solid #ddd',
  },
  listContainer: {
    width: '30%',
    padding: '10px',
    borderRight: '1px solid #ddd',
    overflowY: 'auto',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
  },
  listItem: {
    padding: '8px 0',
    borderBottom: '1px solid #f0f0f0',
    cursor: 'pointer',
    color: '#007bff',
  },
  checkboxContainer: {
    width: '70%',
    padding: '10px',
    overflowY: 'auto',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  checkbox: {
    marginRight: '10px',
  },
  quantityContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  orderButton: {
    alignSelf: 'flex-end',
    marginTop: '10px',
    padding: '10px 20px',
  },
};

export default DineInTab;
