const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());


const connectionString = process.env.DB_URL; 
console.log(`Connecting to MongoDB at ${connectionString}`); 


mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Could not connect to MongoDB', err));


const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  price: { type: Number, required: true },
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);


app.post('/menu', async (req, res) => {
  const { name, description, price } = req.body;


  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required.' });
  }

  try {
   
    const newItem = new MenuItem({ name, description, price });
    await newItem.save();

    res.status(201).json({
      message: 'Menu item created successfully!',
      item: newItem,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});


app.get('/menu', async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.status(200).json(menuItems);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching menu items. Please try again later.' });
  }
});


app.put('/menu/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;


  if (!name && !description && !price) {
    return res.status(400).json({ error: 'At least one field (name, description, price) must be provided.' });
  }

  try {

    const updatedItem = await MenuItem.findByIdAndUpdate(
      id,
      { name, description, price },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ error: 'Menu item not found.' });
    }

    res.status(200).json({
      message: 'Menu item updated successfully!',
      item: updatedItem,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error updating menu item. Please try again later.' });
  }
});

app.delete('/menu/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedItem = await MenuItem.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ error: 'Menu item not found.' });
    }

    res.status(200).json({
      message: 'Menu item deleted successfully!',
    });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting menu item. Please try again later.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});