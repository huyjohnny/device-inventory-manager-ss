// Imports
import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Paper, Table, TableHead, TableBody, TableRow, TableCell, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, Typography, InputLabel, FormControl } from "@mui/material";
import { useTheme } from "@mui/material/styles";

// Main dashboard component
const Dashboard = () => {
    // Set States
    const [warehouses, setWarehouses] = useState([]);
    const [devices, setDevices] = useState([]);

    // Open States for adding modals
    const [openAddWarehouse, setOpenAddWarehouse] = useState(false);
    const [openAddDevice, setOpenAddDevice] = useState(false);

    // Edit States
    const [editingWarehouse, setEditingWarehouse] = useState(null);
    const [editingDevice, setEditingDevice] = useState(null);

    // Delete State
    const [confirmDelete, setConfirmDelete] = useState({ open: false, type: "", id: null });

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
        d.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.storageLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.warehouse && d.warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Theme insert
    const theme = useTheme();

    // For Warehouse Usage Chart
    const warehouseChartData = warehouses.map(w => ({
        name: w.name,
        used: w.capacityUsed,
        total: w.capacity
    }));   
    // For Device Quantity by Brand Chart
    const deviceBrandData = Object.values(
        devices.reduce((acc, d) => {
            acc[d.brand] = acc[d.brand] || { brand: d.brand, quantity: 0 };
            acc[d.brand].quantity += d.quantity;
            return acc;
        }, {})
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

        // Close warehouse modal
        setOpenAddWarehouse(false);
    }

    const deleteWarehouse = async (id) => {
        await fetch(`http://localhost:8080/api/warehouses/${id}`, { method: "DELETE"});
        fetchWarehouses();
        fetchDevices();
    }

    const updateWarehouse = async () => {
        // Check that you aren't lowering the capicity to less than what is currently being used
        if (editingWarehouse.capacity < editingWarehouse.capacityUsed) {
            alert(`Cannot set capacity lower than used capacity (${editingWarehouse.capacityUsed})`);
            return;
        }

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

        // Close device modal
        setOpenAddDevice(false);
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
        <Box sx={{ p: 3, minHeight: "100vh", backgroundColor: "background.default" }}> 
        <Typography variant="h4" mb={4} fontWeight="bold">
        OVERVIEW </Typography>
        <Box display="flex" gap={2} mb={4}>
            {/* Warehouse Usage Chart */}
            <Paper sx={{ flex: 1, p: 2 }}>
                <Typography variant="h6" mb={2} color={theme.palette.text.primary}>
                Warehouse Usage
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                <BarChart data={warehouseChartData}>
                    <CartesianGrid stroke={theme.palette.text.secondary} strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke={theme.palette.text.primary} />
                    <YAxis stroke={theme.palette.text.primary} />
                    <Tooltip contentStyle={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }} />
                    <Legend wrapperStyle={{ color: theme.palette.text.primary }} />
                    <Bar dataKey="used" fill={theme.palette.primary.main} name="Used Capacity" />
                    <Bar dataKey="total" fill={theme.palette.secondary.main} name="Total Capacity" />
                </BarChart>
                </ResponsiveContainer>
            </Paper>

            {/* Device Quantity by Brand Chart */}
            <Paper sx={{ flex: 1, p: 2 }}>
                <Typography variant="h6" mb={2} color={theme.palette.text.primary}>
                Devices by Brand
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                <BarChart data={deviceBrandData}>
                    <CartesianGrid stroke={theme.palette.text.secondary} strokeDasharray="3 3" />
                    <XAxis dataKey="brand" stroke={theme.palette.text.primary} />
                    <YAxis stroke={theme.palette.text.primary} />
                    <Tooltip contentStyle={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }} />
                    <Legend wrapperStyle={{ color: theme.palette.text.primary }} />
                    <Bar dataKey="quantity" fill={theme.palette.primary.main} name="Quantity" />
                </BarChart>
                </ResponsiveContainer>
            </Paper>
        </Box>

        {/* --- Warehouses Section --- */}
        <Paper sx={{ mb: 5, p: 3, borderRadius: 2, boxShadow: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight="medium">
            WAREHOUSES
            </Typography>
            <Button variant="contained" onClick={() => setOpenAddWarehouse(true)}>
            Add Warehouse
            </Button>
        </Box>

        <Table sx={{ minWidth: 650, borderRadius: 1 }}>
            <TableHead sx={{}}>
            <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Used Capacity</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
            {warehouses.map((w) => (
                <TableRow key={w.id} hover>
                <TableCell>{w.name}</TableCell>
                <TableCell>{w.location}</TableCell>
                <TableCell>{w.capacityUsed}</TableCell>
                <TableCell>{w.capacity}</TableCell>
                <TableCell>{w.description}</TableCell>
                <TableCell>
                    <Box display="flex" gap={1}>
                    <Button variant="outlined" size="small" onClick={() => setEditingWarehouse(w)}>Edit</Button>
                    <Button variant="outlined" size="small" color="error" onClick={() => setConfirmDelete({ open: true, type: "warehouse", id: w.id })}>Delete</Button>
                    </Box>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
        </Paper>

        {/* --- Devices Section --- */}
        <Paper sx={{ mb: 5, p: 3, borderRadius: 2, boxShadow: 3}}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight="medium">
            DEVICES
            </Typography>
            <Button variant="contained" onClick={() => setOpenAddDevice(true)}>
            Add Device
            </Button>
        </Box>

        {/* Search bar */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <TextField
            placeholder="Search devices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: "40%" }}
            />
        </Box>

        <Table sx={{ minWidth: 650, borderRadius: 1 }}>
            <TableHead sx={{}}>
            <TableRow>
                <TableCell>Model</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Storage</TableCell>
                <TableCell>Warehouse</TableCell>
                <TableCell>Actions</TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
            {filteredDevices.map((d) => (
                <TableRow key={d.id} hover>
                <TableCell>{d.modelName}</TableCell>
                <TableCell>{d.brand}</TableCell>
                <TableCell>{d.category}</TableCell>
                <TableCell>{d.sku}</TableCell>
                <TableCell>{d.quantity}</TableCell>
                <TableCell>{d.description}</TableCell>
                <TableCell>{d.storageLocation}</TableCell>
                <TableCell>{d.warehouse ? d.warehouse.name : "N/A"}</TableCell>
                <TableCell>
                    <Box display="flex" gap={1}>
                    <Button variant="outlined" size="small" onClick={() => setEditingDevice({ ...d, warehouseId: d.warehouse?.id || "" })}>Edit</Button>
                    <Button variant="outlined" size="small" color="error" onClick={() => setConfirmDelete({ open: true, type: "device", id: d.id })}>Delete</Button>
                    </Box>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
        </Paper>

        {/* --- Add / Edit Warehouse Modal --- */}
        <Dialog open={openAddWarehouse || !!editingWarehouse} onClose={() => { setOpenAddWarehouse(false); setEditingWarehouse(null); }}>
        <DialogTitle>{editingWarehouse ? "Edit Warehouse" : "Add Warehouse"}</DialogTitle>
        <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField fullWidth label="Name" value={editingWarehouse?.name || newWarehouse.name} onChange={(e) => editingWarehouse ? setEditingWarehouse({ ...editingWarehouse, name: e.target.value }) : setNewWarehouse({ ...newWarehouse, name: e.target.value })} />
            <TextField fullWidth label="Location" value={editingWarehouse?.location || newWarehouse.location} onChange={(e) => editingWarehouse ? setEditingWarehouse({ ...editingWarehouse, location: e.target.value }) : setNewWarehouse({ ...newWarehouse, location: e.target.value })} />
            <TextField fullWidth label="Capacity" type="number" value={editingWarehouse?.capacity || newWarehouse.capacity} onChange={(e) => editingWarehouse ? setEditingWarehouse({ ...editingWarehouse, capacity: parseInt(e.target.value) }) : setNewWarehouse({ ...newWarehouse, capacity: parseInt(e.target.value) })} />
            <TextField fullWidth label="Description" value={editingWarehouse?.description || newWarehouse.description} onChange={(e) => editingWarehouse ? setEditingWarehouse({ ...editingWarehouse, description: e.target.value }) : setNewWarehouse({ ...newWarehouse, description: e.target.value })} />
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={editingWarehouse ? updateWarehouse : addWarehouse}>{editingWarehouse ? "Save" : "Add"}</Button>
            <Button onClick={() => { setOpenAddWarehouse(false); setEditingWarehouse(null); }}>Cancel</Button>
        </DialogActions>
        </Dialog>

        {/* --- Add / Edit Device Modal --- */}
        <Dialog open={openAddDevice || !!editingDevice} onClose={() => { setOpenAddDevice(false); setEditingDevice(null); }}>
        <DialogTitle>{editingDevice ? "Edit Device" : "Add Device"}</DialogTitle>
        <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField fullWidth label="Model Name" value={editingDevice?.modelName || newDevice.modelName} onChange={(e) => editingDevice ? setEditingDevice({ ...editingDevice, modelName: e.target.value }) : setNewDevice({ ...newDevice, modelName: e.target.value })} />
            <TextField fullWidth label="Brand" value={editingDevice?.brand || newDevice.brand} onChange={(e) => editingDevice ? setEditingDevice({ ...editingDevice, brand: e.target.value }) : setNewDevice({ ...newDevice, brand: e.target.value })} />
            <TextField fullWidth label="Category" value={editingDevice?.category || newDevice.category} onChange={(e) => editingDevice ? setEditingDevice({ ...editingDevice, category: e.target.value }) : setNewDevice({ ...newDevice, category: e.target.value })} />
            <TextField fullWidth label="SKU" value={editingDevice?.sku || newDevice.sku} onChange={(e) => editingDevice ? setEditingDevice({ ...editingDevice, sku: e.target.value }) : setNewDevice({ ...newDevice, sku: e.target.value })} />
            <TextField fullWidth label="Quantity" type="number" value={editingDevice?.quantity || newDevice.quantity} onChange={(e) => editingDevice ? setEditingDevice({ ...editingDevice, quantity: parseInt(e.target.value) }) : setNewDevice({ ...newDevice, quantity: parseInt(e.target.value) })} />
            <TextField fullWidth label="Description" value={editingDevice?.description || newDevice.description} onChange={(e) => editingDevice ? setEditingDevice({ ...editingDevice, description: e.target.value }) : setNewDevice({ ...newDevice, description: e.target.value })} />
            <TextField fullWidth label="Storage Location" value={editingDevice?.storageLocation || newDevice.storageLocation} onChange={(e) => editingDevice ? setEditingDevice({ ...editingDevice, storageLocation: e.target.value }) : setNewDevice({ ...newDevice, storageLocation: e.target.value })} />
            <FormControl fullWidth>
                <InputLabel>Warehouse</InputLabel>
                <Select value={editingDevice?.warehouseId || newDevice.warehouseId} onChange={(e) => editingDevice ? setEditingDevice({ ...editingDevice, warehouseId: e.target.value }) : setNewDevice({ ...newDevice, warehouseId: e.target.value })}>
                {warehouses.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
                </Select>
            </FormControl>
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={editingDevice ? updateDevice : addDevice}>{editingDevice ? "Save" : "Add"}</Button>
            <Button onClick={() => { setOpenAddDevice(false); setEditingDevice(null); }}>Cancel</Button>
        </DialogActions>
        </Dialog>

        {/* --- Delete Modal --- */}
        <Dialog
            open={confirmDelete.open}
            onClose={() => setConfirmDelete({ ...confirmDelete, open: false })}
            >
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
                Are you sure you want to delete this {confirmDelete.type}?
            </DialogContent>
            <DialogActions>
                <Button
                onClick={() => {
                    if (confirmDelete.type === "device") deleteDevice(confirmDelete.id);
                    if (confirmDelete.type === "warehouse") deleteWarehouse(confirmDelete.id);
                    setConfirmDelete({ open: false, type: "", id: null });
                }}
                color="error"
                >
                Yes, Delete
                </Button>
                <Button
                onClick={() => setConfirmDelete({ open: false, type: "", id: null })}
                color="primary"
                >
                Cancel
                </Button>
            </DialogActions>
        </Dialog>


        </Box>
    );

};

export default Dashboard;