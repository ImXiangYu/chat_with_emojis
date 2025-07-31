require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 导入并使用API路由
const apiRouter = require('./server/api');
app.use('/api', apiRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});