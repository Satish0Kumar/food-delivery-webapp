// ⚠️ dotenv MUST be the very first line — before any require() that reads process.env
const dotenv = require('dotenv')
dotenv.config()

const express  = require('express')
const mongoose = require('mongoose')
const cors     = require('cors')
const http     = require('http')
const { Server } = require('socket.io')
const cloudinary = require('cloudinary').v2

// Configure Cloudinary once globally
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const authRoutes    = require('./routes/auth')
const itemRoutes    = require('./routes/items')
const orderRoutes   = require('./routes/orders')
const uploadRoutes  = require('./routes/upload')
const paymentRoutes = require('./routes/payment')       // ← Phase 5

const app    = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin:  process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
})

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())

// Make io accessible in controllers
app.set('io', io)

// Routes
app.use('/api/auth',    authRoutes)
app.use('/api/items',   itemRoutes)
app.use('/api/orders',  orderRoutes)
app.use('/api/upload',  uploadRoutes)
app.use('/api/payment', paymentRoutes)                 // ← Phase 5

app.get('/', (req, res) => res.send('Food Delivery API is running...'))

// Socket.io
io.on('connection', (socket) => {
  console.log('Admin connected:', socket.id)
  socket.on('disconnect', () => console.log('Admin disconnected:', socket.id))
})

// MongoDB + server start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    server.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    )
  })
  .catch((err) => console.error('MongoDB connection error:', err))
