import React, { useState, useEffect } from "react";

// Main dashboard component
const Dashboard = () => {
    // Set States
    const [warehouses, setWarehouses] = useState([]);
    const [devices, setDevices] = useState([]);

    // Edit States
    const [editingWarehouse, setEditingWarehouse] = useState(null);
    const [editingDevice, setEditingDevice] = useState(null);

    // Capacity State
    const [warehouseUsage, setWarehouseUsage] = useState({});

    // Search State
    const [searchTerm, setSearchTerm] = useState("");

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

    // Fetch warehouses, warehouse usage (capacity used) and devices
    useEffect(() => {
        fetchWarehouses();
        fetchDevices();
    }, []);

    const fetchWarehouses = async () => {
        const res = await fetch("http://localhost:8080/api/warehouses");
        const data = await res.json();
        
        // Fetch capacity used for each warehouse
        const updatedData = await Promise.all(
            data.map(async (w) => {
                const capRes = await fetch(`http://localhost:8080/api/warehouses/${w.id}/capacityUsed`);
                const capacityUsed = await capRes.json();
                return { ...w, capacityUsed };
            })
        );

        setWarehouses(updatedData);
    };

    const fetchWarehouseUsage = async (warehouseId) => {
        if (!warehouseId) return;
        const res = await fetch(`http://localhost:8080/api/warehouses/${warehouseId}/capacityUsed`);
        const data = await res.json();
        setWarehouseUsage((prev) => ({ ...prev, [warehouseId]: data }));
    };


    const fetchDevices = async () => {
        const res = await fetch("http://localhost:8080/api/devices");
        const data = await res.json();
        setDevices(data);
    };

    // Filter
    const filteredDevices = devices.filter(d =>
        d.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.storageLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.warehouse && d.warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
        fetchDevices();
    }

    const deleteWarehouse = async (id) => {
        await fetch(`http://localhost:8080/api/warehouses/${id}`, { method: "DELETE"});
        fetchWarehouses();
        fetchDevices();
    }

    const updateWarehouse = async () => {
        await fetch(`http://localhost:8080/api/warehouses/${editingWarehouse.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editingWarehouse),
        });

        setEditingWarehouse(null);
        fetchWarehouses();
    };


    // Device CRUD
    const addDevice = async () => {
        if (!newDevice.warehouseId) return alert("Select a warehouse");

        // Find the selected warehouse
        const warehouse = warehouses.find(w => w.id === Number(newDevice.warehouseId));
        if (!warehouse) return alert("Warehouse not found");

        // Check if adding the device exceeds capacity
        if ((warehouse.capacityUsed || 0) + newDevice.quantity > warehouse.capacity) {
            return alert("Cannot add device: exceeds warehouse capacity!");
        }

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
            storageLocation: "",
            warehouseId: ""
        });
        fetchDevices();
        fetchWarehouses();
    }

    const deleteDevice = async (id) => {
        await fetch(`http://localhost:8080/api/devices/${id}`, { method: "DELETE"});
        fetchWarehouses();
        fetchDevices();
    }

    const updateDevice = async () => {
        if (!editingDevice || !editingDevice.warehouseId) {
            alert("Please select a warehouse");
            return;
        }

        const warehouse = warehouses.find(w => w.id === Number(editingDevice.warehouseId));
        if (!warehouse) return alert("Warehouse not found");

        // Calculate capacity after update
        const currentQty = devices.find(d => d.id === editingDevice.id)?.quantity || 0;
        const newTotal = (warehouse.capacityUsed || 0) - currentQty + editingDevice.quantity;

        if (newTotal > warehouse.capacity) {
            return alert("Cannot update device: exceeds warehouse capacity!");
        }

        await fetch(`http://localhost:8080/api/devices/${editingDevice.id}?warehouseId=${editingDevice.warehouseId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                modelName: editingDevice.modelName,
                brand: editingDevice.brand,
                category: editingDevice.category,
                sku: editingDevice.sku,
                quantity: editingDevice.quantity,
                description: editingDevice.description,
                storageLocation: editingDevice.storageLocation
            }),
        })
        .then(res => {
            if (!res.ok) throw new Error("Update failed");
            return res.json();
        })
        .then(data => {
            console.log("Updated device:", data);
            setEditingDevice(null);
            // refresh
            fetchDevices();
            fetchWarehouses();
        })
        .catch(err => console.error(err));
    };




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
                        <th>Used Capacity</th>
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
                            <td>{w.capacityUsed}</td>
                            <td>{w.capacity}</td>
                            <td>{w.description}</td>
                            <td>
                            <button onClick={() => setEditingWarehouse(w)}>Edit</button>
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

                    {editingWarehouse && (
                        <div style={{ marginTop: "20px", padding: "10px", border: "1px solid gray" }}>
                            <h3>Edit Warehouse</h3>

                            <input
                                placeholder="Name"
                                value={editingWarehouse.name}
                                onChange={(e) =>
                                    setEditingWarehouse({ ...editingWarehouse, name: e.target.value })
                                }
                            />
                            <input
                                placeholder="Location"
                                value={editingWarehouse.location}
                                onChange={(e) =>
                                    setEditingWarehouse({ ...editingWarehouse, location: e.target.value })
                                }
                            />
                            <input
                                type="number"
                                placeholder="Capacity"
                                value={editingWarehouse.capacity}
                                onChange={(e) =>
                                    setEditingWarehouse({ ...editingWarehouse, capacity: parseInt(e.target.value) })
                                }
                            />
                            <input
                                placeholder="Description"
                                value={editingWarehouse.description}
                                onChange={(e) =>
                                    setEditingWarehouse({ ...editingWarehouse, description: e.target.value })
                                }
                            />

                            <button onClick={updateWarehouse}>Save</button>
                            <button onClick={() => setEditingWarehouse(null)}>Cancel</button>
                        </div>
                    )}

            </section>

            {/* --- Devices Section --- */}
            <section style={{ marginTop: "40px" }}>
                <h2>Devices</h2>
                <input
                    placeholder="Search devices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
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
                        {filteredDevices.map((d) => (
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
                            <button onClick={() => setEditingDevice(d)}>Edit</button>
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

                {editingDevice && (
                    <div style={{ marginTop: "20px", padding: "10px", border: "1px solid gray" }}>
                        <h3>Edit Device</h3>

                        <input
                            placeholder="Model Name"
                            value={editingDevice.modelName}
                            onChange={(e) =>
                                setEditingDevice({ ...editingDevice, modelName: e.target.value })
                            }
                        />
                        <input
                            placeholder="Brand"
                            value={editingDevice.brand}
                            onChange={(e) =>
                                setEditingDevice({ ...editingDevice, brand: e.target.value })
                            }
                        />
                        <input
                            placeholder="Category"
                            value={editingDevice.category}
                            onChange={(e) =>
                                setEditingDevice({ ...editingDevice, category: e.target.value })
                            }
                        />
                        <input
                            placeholder="SKU"
                            value={editingDevice.sku}
                            onChange={(e) =>
                                setEditingDevice({ ...editingDevice, sku: e.target.value })
                            }
                        />
                        <input
                            type="number"
                            placeholder="Quantity"
                            value={editingDevice.quantity}
                            onChange={(e) =>
                                setEditingDevice({
                                    ...editingDevice,
                                    quantity: parseInt(e.target.value)
                                })
                            }
                        />
                        <input
                            placeholder="Description"
                            value={editingDevice.description}
                            onChange={(e) =>
                                setEditingDevice({ ...editingDevice, description: e.target.value })
                            }
                        />
                        <input
                            placeholder="Storage Location"
                            value={editingDevice.storageLocation}
                            onChange={(e) =>
                                setEditingDevice({
                                    ...editingDevice,
                                    storageLocation: e.target.value
                                })
                            }
                        />

                        {/* Warehouse dropdown */}
                        <select
                            value={editingDevice.warehouseId || ""}
                            onChange={(e) =>
                                setEditingDevice({
                                    ...editingDevice,
                                    warehouseId: e.target.value
                                })
                            }
                        >
                            <option value="">Select Warehouse</option>
                            {warehouses.map((w) => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>


                        <button onClick={updateDevice}>Save</button>
                        <button onClick={() => setEditingDevice(null)}>Cancel</button>
                    </div>
                )}

            </section>
        </div>
    );
};

export default Dashboard;