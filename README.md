# JS - Inventory

A full-stack inventory app built for **disposables & packaging shops** (paper plates, carry bags, cups, tissue etc.)

## Built With
- **Backend**: Node.js + Express + Mongoose
- **Database**: MongoDB
- **Frontend**: Vanilla HTML/CSS/JS (no build step)

---

## Categories Supported
| Icon | Category |
|------|----------|
| 🍽 | Paper Plates |
| 🛍 | Carry Bags |
| 🥤 | Cups & Glasses |
| 🧻 | Tissue & Napkins |
| 📫 | Boxes |
| 🏷 | Other |

## Item Fields
| Field | Description |
|-------|-------------|
| Name | Product name (required) |
| Category | One of the 10 categories above |
| Size | e.g. "8 inch", "500ml", "30×40cm" |
| Material | e.g. Paper, LDPE, Aluminium, Cloth |
| Unit Type | Pack / Bundle / Roll / Box / Carton / etc. |
| Pcs per Unit | How many pieces per pack/bundle |
| Quantity | How many units currently in stock |
| Cost Price | Purchase price per unit (₹) |
| Sell Price | Selling price per unit (₹) |
| Supplier | Supplier name |
| Threshold | Low-stock alert level |
| Notes | Any extra notes |

## Features
- ✅ Add / Edit / Delete items
- ✅ Filter by category (sidebar)
- ✅ Search by product name
- ✅ Table view & Grid view toggle
- ✅ Dashboard: total stock value, low-stock count
- ✅ Low-stock alerts with visual indicators
- ✅ Export inventory to CSV

---

## Setup

### 1. Install
```bash
npm install
```

### 2. Configure
```bash
cp .env.example .env
# Edit .env — set your MONGO_URI
```

### 3. Run
```bash
npm start          # production
npm run dev        # development (auto-restart)
```

### 4. Open
Visit **http://localhost:3000**

---

## API Reference
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/items | List items (supports ?search= & ?category=) |
| GET | /api/items/:id | Get one item |
| POST | /api/items | Create item |
| PUT | /api/items/:id | Update item |
| DELETE | /api/items/:id | Delete item |
| GET | /api/stats | Dashboard stats |
