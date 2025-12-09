const express = require('express');
const Habit = require('../models/Habit');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all habits for current user
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.userId });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new habit for current user
router.post('/', async (req, res) => {
  try {
    const habit = new Habit({
      ...req.body,
      user: req.userId
    });

    const newHabit = await habit.save();
    res.status(201).json(newHabit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update habit completion (only owner can update)
router.patch('/:id', async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.userId });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    if (req.body.completed !== undefined) {
      habit.completed = req.body.completed;
    }

    if (req.body.streak !== undefined) {
      habit.streak = req.body.streak;
    }

    if (req.body.name !== undefined) {
      habit.name = req.body.name;
    }

    if (req.body.color !== undefined) {
      habit.color = req.body.color;
    }

    if (req.body.goal !== undefined) {
      habit.goal = req.body.goal;
    }

    const updatedHabit = await habit.save();
    res.json(updatedHabit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a habit (only owner can delete)
router.delete('/:id', async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.userId 
    });
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    res.json({ message: 'Habit deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;