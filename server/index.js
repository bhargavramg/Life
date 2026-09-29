require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('./auth');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// --- DEFAULT CATEGORIES ---
const DEFAULT_CATEGORIES = [
  'Personal', 'Study', 'Work', 'Project', 'Fitness', 'Shopping', 'Appointment', 'Other'
];

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await prisma.user.findUnique({ where: { email } });
    if (user) return res.status(400).json({ error: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    // Create default categories for the user
    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map(c => ({ name: c, userId: user.id }))
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- CATEGORIES ROUTES ---
app.get('/api/categories', authMiddleware, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'asc' }
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- TASKS ROUTES ---
app.get('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.userId },
      include: { category: true },
      orderBy: [
        { date: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const { title, description, date, time, categoryId, priority } = req.body;
    const task = await prisma.task.create({
      data: {
        userId: req.user.userId,
        title,
        description,
        date,
        time,
        categoryId,
        priority,
        status: 'Pending'
      },
      include: { category: true }
    });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, time, categoryId, priority, status, carriedForwardFrom } = req.body;
    
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task || task.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title: title !== undefined ? title : task.title,
        description: description !== undefined ? description : task.description,
        date: date !== undefined ? date : task.date,
        time: time !== undefined ? time : task.time,
        categoryId: categoryId !== undefined ? categoryId : task.categoryId,
        priority: priority !== undefined ? priority : task.priority,
        status: status !== undefined ? status : task.status,
        completedAt: status === 'Completed' && task.status !== 'Completed' ? new Date() : (status === 'Pending' ? null : task.completedAt),
        carriedForwardFrom: carriedForwardFrom !== undefined ? carriedForwardFrom : task.carriedForwardFrom
      },
      include: { category: true }
    });
    res.json(updatedTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task || task.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await prisma.task.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
