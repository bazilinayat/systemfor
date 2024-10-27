import React, { useState } from 'react';

const RestaurantDashboard = () => {
  const [tables, setTables] = useState([
    { id: 1, status: 'Available', orders: [] },
    { id: 2, status: 'Occupied', orders: [{ item: 'Pizza', quantity: 2, status: 'Preparing' }] },
    { id: 3, status: 'Needs Service', orders: [] },
    { id: 4, status: 'Occupied', orders: [{ item: 'Pasta', quantity: 1, status: 'Served' }] },
    { id: 5, status: 'Available', orders: [] },
  ]);

  const updateTableStatus = (id, newStatus) => {
    setTables(tables.map(table => table.id === id ? { ...table, status: newStatus } : table));
  };

  const updateOrderStatus = (tableId, orderIndex, newStatus) => {
    const updatedTables = [...tables];
    const order = updatedTables.find(table => table.id === tableId).orders[orderIndex];
    order.status = newStatus;
    setTables(updatedTables);
  };

  const addOrderToTable = (id) => {
    const item = prompt("Enter item name:");
    const quantity = parseInt(prompt("Enter quantity:"), 10);
    if (item && quantity > 0) {
      const updatedTables = tables.map(table =>
        table.id === id ? { 
          ...table, 
          status: 'Occupied',
          orders: [...table.orders, { item, quantity, status: 'Preparing' }] 
        } : table
      );
      setTables(updatedTables);
    }
  };

  const styles = {
    dashboard: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
    },
    header: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '20px',
    },
    tableGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '20px',
      width: '100%',
      maxWidth: '800px',
    },
    tableCard: {
      padding: '15px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      textAlign: 'center',
      backgroundColor: '#f9f9f9',
    },
    tableStatus: {
      marginBottom: '10px',
      fontSize: '16px',
    },
    orderList: {
      listStyleType: 'none',
      padding: 0,
      margin: '10px 0',
    },
    orderItem: {
      marginBottom: '5px',
      fontSize: '14px',
    },
    button: {
      padding: '6px 12px',
      margin: '5px 0',
      fontSize: '14px',
      cursor: 'pointer',
      borderRadius: '4px',
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
    },
    availableButton: {
      backgroundColor: '#28a745',
    },
    occupiedButton: {
      backgroundColor: '#ffc107',
    },
  };

  return (
    <div style={styles.dashboard}>
      <div style={styles.header}>Restaurant Management Dashboard</div>
      <div style={styles.tableGrid}>
        {tables.map(table => (
          <div key={table.id} style={styles.tableCard}>
            <div style={styles.tableStatus}>
              <strong>Table {table.id}</strong> - {table.status}
            </div>
            {table.orders.length > 0 && (
              <ul style={styles.orderList}>
                {table.orders.map((order, index) => (
                  <li key={index} style={styles.orderItem}>
                    {order.item} x {order.quantity} - {order.status}
                    <button
                      style={{ ...styles.button, backgroundColor: '#6c757d' }}
                      onClick={() => updateOrderStatus(table.id, index, 'Served')}
                    >
                      Mark as Served
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              style={{ ...styles.button, ...styles.availableButton }}
              onClick={() => updateTableStatus(table.id, 'Available')}
            >
              Mark as Available
            </button>
            <button
              style={{ ...styles.button, ...styles.occupiedButton }}
              onClick={() => addOrderToTable(table.id)}
            >
              Add Order
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantDashboard;