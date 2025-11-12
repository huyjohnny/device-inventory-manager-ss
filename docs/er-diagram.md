# Entity Relationship Diagram (ERD)

This ERD defines the database schema for the **Device Inventory Manager** system.  
It models warehouses, devices, and optional administrator accounts.  
Updated to include **descriptions** and **storage locations** for more realistic inventory tracking.

---

## Entities and Relationships

### **Warehouse**
| Field | Type | Description |
|-------|------|-------------|
| id | BIGSERIAL (PK) | Unique identifier for each warehouse |
| name | VARCHAR(100) | Warehouse name |
| location | VARCHAR(150) | City or physical address |
| capacity | INTEGER | Maximum stock capacity allowed |
| description | TEXT | Optional notes or details about the warehouse |

---

### **Device**
| Field | Type | Description |
|-------|------|-------------|
| id | BIGSERIAL (PK) | Unique identifier for each device |
| model_name | VARCHAR(100) | Device model (e.g., iPhone 15 Pro) |
| brand | VARCHAR(50) | Device manufacturer (e.g., Apple, Samsung) |
| category | VARCHAR(50) | Type of device (e.g., Smartphone, Tablet) |
| sku | VARCHAR(50) | Stock Keeping Unit code |
| quantity | INTEGER | Number of units available |
| description | TEXT | Optional details about the device (specs, notes, etc.) |
| storage_location | VARCHAR(100) | Specific location within the warehouse (e.g., “Aisle 3, Shelf B”) |
| warehouse_id | BIGINT (FK) | References `Warehouse.id` |

**Relationships:**
- One **Warehouse** can store **many Devices** (`1:N`).
- A **Device** belongs to **one Warehouse**.

---

### **Admin** (optional for authentication)
| Field | Type | Description |
|-------|------|-------------|
| id | BIGSERIAL (PK) | Unique identifier for each admin |
| username | VARCHAR(100) | Admin login name |
| email | VARCHAR(150) | Admin email address |
| password | VARCHAR(255) | Hashed password for login |

**Relationships:**
- One **Admin** can manage **multiple Warehouses** (`1:N`).

---

## 🔗 ERD Diagram (Mermaid)

```mermaid
erDiagram
    WAREHOUSE {
        BIGSERIAL id PK
        VARCHAR name
        VARCHAR location
        INTEGER capacity
        TEXT description
    }

    DEVICE {
        BIGSERIAL id PK
        VARCHAR model_name
        VARCHAR brand
        VARCHAR category
        VARCHAR sku
        INTEGER quantity
        TEXT description
        VARCHAR storage_location
        BIGINT warehouse_id FK
    }

    ADMIN {
        BIGSERIAL id PK
        VARCHAR username
        VARCHAR email
        VARCHAR password
    }

    WAREHOUSE ||--o{ DEVICE : "stores"
    ADMIN ||--o{ WAREHOUSE : "manages"
