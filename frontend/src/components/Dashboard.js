import React, { useState, useEffect } from "react";

// Main dashboard component
const Dashboard = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [devices, setDevices] = useState([]);

    // Form states
    const [newWarehouse, setNewWarehouse] = useState({
        name: "",
        location: "",
        capacity: 0,
        description: ""
    });

    const [newDevice, setNewDevice] = useState({
        modelName: "",
        brand: "",
        category: "",
        sku: "",
        quantity: 0,
        description: "",
        storageLocation: "",
        warehouseId: ""
    });

    // Fetch warehouses and devices
    useEffect(() => {
        fetchWarehouses();
        fetchDevices();
    }, []);

    const fetchWarehouses = async () => {
        const res = await fetch("http://localhost:8080/api/warehouses");
        const data = await res.json();
        setWarehouses(data);
    };

    const fetchDevices = async () => {
        const res = await fetch("http://localhost:8080/api/devices");
        const data = await res.json();
        setDevices(data);
    };

    // Warehouse CRUD
    const addWarehouse = async () => {
        await fetch("http://localhost:8080/api/warehouses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newWarehouse),
        });
        setNewWarehouse({ name: "", 
            location: "", 
            capacity: 0, 
            description: "" 
        });
        fetchWarehouses();
    }

    const deleteWarehouse = async (id) => {
        await fetch(`http://localhost:8080/api/warehouses/${id}`, { method: "DELETE"});
        fetchWarehouses();
    }

    // Device CRUD
    const addDevice = async () => {
        await fetch(`http://localhost:8080/api/devices?warehouseId=${newDevice.warehouseId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newDevice),
        });
        setNewDevice({ modelName: "", 
            brand: "", 
            category: "", 
            sku: "", 
            quantity: 0, 
            description: "", 
            storageLocation: ""
        });
        fetchDevices();
    }

    const deleteDevice = async (id) => {
        await fetch(`http://localhost:8080/api/devices/${id}`, { method: "DELETE"});
        fetchWarehouses();
    }

    return (
        <div style={{ padding: "20px" }}>
            <h1>Device Inventory Dashboard</h1>

            {/* --- Warehouses Section --- */}
            <section>
                <h2>Warehouses</h2>
                    <table border="1" cellPadding="5">
                    <thead>
                        <tr>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Capacity</th>
                        <th>Description</th>
                        <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {warehouses.map((w) => (
                        <tr key={w.id}>
                            <td>{w.name}</td>
                            <td>{w.location}</td>
                            <td>{w.capacity}</td>
                            <td>{w.description}</td>
                            <td>
                            <button onClick={() => deleteWarehouse(w.id)}>Delete</button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>

                    <h3>Add Warehouse</h3>
                    <input placeholder="Name" value={newWarehouse.name} onChange={(e) => setNewWarehouse({...newWarehouse, name: e.target.value})} />
                    <input placeholder="Location" value={newWarehouse.location} onChange={(e) => setNewWarehouse({...newWarehouse, location: e.target.value})} />
                    <input type="number" placeholder="Capacity" value={newWarehouse.capacity} onChange={(e) => setNewWarehouse({...newWarehouse, capacity: parseInt(e.target.value)})} />
                    <input placeholder="Description" value={newWarehouse.description} onChange={(e) => setNewWarehouse({...newWarehouse, description: e.target.value})} />
                    <button onClick={addWarehouse}>Add Warehouse</button>
            </section>

            {/* --- Devices Section --- */}
            <section style={{ marginTop: "40px" }}>
                <h2>Devices</h2>
                <table border="1" cellPadding="5">
                    <thead>
                        <tr>
                        <th>Model</th>
                        <th>Brand</th>
                        <th>Category</th>
                        <th>SKU</th>
                        <th>Quantity</th>
                        <th>Description</th>
                        <th>Storage</th>
                        <th>Warehouse</th>
                        <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {devices.map((d) => (
                        <tr key={d.id}>
                            <td>{d.modelName}</td>
                            <td>{d.brand}</td>
                            <td>{d.category}</td>
                            <td>{d.sku}</td>
                            <td>{d.quantity}</td>
                            <td>{d.description}</td>
                            <td>{d.storageLocation}</td>
                            <td>{d.warehouse ? d.warehouse.name : "N/A"}</td>
                            <td>
                            <button onClick={() => deleteDevice(d.id)}>Delete</button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>

                <h3>Add Device</h3>
                <input placeholder="Model Name" value={newDevice.modelName} onChange={(e) => setNewDevice({...newDevice, modelName: e.target.value})} />
                <input placeholder="Brand" value={newDevice.brand} onChange={(e) => setNewDevice({...newDevice, brand: e.target.value})} />
                <input placeholder="Category" value={newDevice.category} onChange={(e) => setNewDevice({...newDevice, category: e.target.value})} />
                <input placeholder="SKU" value={newDevice.sku} onChange={(e) => setNewDevice({...newDevice, sku: e.target.value})} />
                <input type="number" placeholder="Quantity" value={newDevice.quantity} onChange={(e) => setNewDevice({...newDevice, quantity: parseInt(e.target.value)})} />
                <input placeholder="Description" value={newDevice.description} onChange={(e) => setNewDevice({...newDevice, description: e.target.value})} />
                <input placeholder="Storage Location" value={newDevice.storageLocation} onChange={(e) => setNewDevice({...newDevice, storageLocation: e.target.value})} />
                <select value={newDevice.warehouseId} onChange={(e) => setNewDevice({...newDevice, warehouseId: e.target.value})}>
                    <option value="">Select Warehouse</option>
                    {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                <button onClick={addDevice}>Add Device</button>
            </section>
        </div>
    );
};

export default Dashboard;