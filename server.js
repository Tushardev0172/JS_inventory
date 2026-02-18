const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ── MongoDB Connection ──────────────────────────────────────────────────
const MONGO_URI =
  process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ── Item Schema (Disposables / Packaging Shop) ──────────────────────────
const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        "Paper Plates",
        "Carry Bags",
        "Cups & Glasses",
        "Tissue & Napkins",
        "Boxes & Trays",
        "Other",
      ],
      default: "Other",
    },
    size: { type: String, trim: true, default: "" }, // e.g. "8 inch", "500ml"
    material: { type: String, trim: true, default: "" }, // e.g. "Paper", "LDPE", "Aluminium"
    unitType: {
      type: String,
      enum: [
        "Pack",
        "Bundle",
        "Roll",
        "Box",
        "Piece",
        "Dozen",
        "Gross",
        "Kg",
        "Carton",
      ],
      default: "Pack",
    },
    pcsPerUnit: { type: Number, default: 1 }, // pieces per pack/bundle
    quantity: { type: Number, required: true, min: 0, default: 0 },
    costPrice: { type: Number, min: 0, default: 0 },
    sellPrice: { type: Number, min: 0, default: 0 },
    supplier: { type: String, trim: true, default: "" },
    threshold: { type: Number, default: 10 }, // low-stock alert
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

const Item = mongoose.model("Item", itemSchema);

// ── Routes ──────────────────────────────────────────────────────────────

app.get("/api/items", async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (category && category !== "All") query.category = category;
    const items = await Item.find(query).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/items/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/items", async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/items/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/items/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/stats", async (req, res) => {
  try {
    const totalItems = await Item.countDocuments();
    const stockVal = await Item.aggregate([
      {
        $group: {
          _id: null,
          v: { $sum: { $multiply: ["$costPrice", "$quantity"] } },
        },
      },
    ]);
    const sellVal = await Item.aggregate([
      {
        $group: {
          _id: null,
          v: { $sum: { $multiply: ["$sellPrice", "$quantity"] } },
        },
      },
    ]);
    const lowStock = await Item.countDocuments({
      $expr: { $lte: ["$quantity", "$threshold"] },
    });
    const catBreakdown = await Item.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({
      totalItems,
      stockValue: stockVal[0]?.v || 0,
      sellValue: sellVal[0]?.v || 0,
      lowStock,
      catBreakdown,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  const { networkInterfaces } = require("os");
  const nets = networkInterfaces();
  let localIP = "localhost";
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) localIP = net.address;
    }
  }
  console.log(`🚀 Server     → http://localhost:${PORT}`);
  console.log(`📱 On Network → http://${localIP}:${PORT}`);
});
