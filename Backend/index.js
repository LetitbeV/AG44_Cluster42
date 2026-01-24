const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();
const port = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
    console.log('Request Method:', req.method);
    console.log('Request URL:', req.originalUrl);
    console.log('Request Body:', req.body);
    next();
});

const authRoutes = require('./routes/authRoutes');
const batteryRoutes = require('./routes/batteryRoutes');
const priceRoutes = require('./routes/priceRoutes');
const batteryStateRoutes = require('./routes/batteryStateRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const financialRoutes = require('./routes/financialRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

app.get('/', (req, res) => {
    res.send('ShockMarket Backend is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/battery', batteryRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/state', batteryStateRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);

// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});
