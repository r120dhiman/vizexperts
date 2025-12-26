const express = require('express');
const cors = require('cors');

const uploadRoutes = require('./routes/upload.routes');
const { connectDB } = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

(async () => {
  await connectDB();              
  app.use(uploadRoutes);   

  app.listen(3001, () => {
    console.log(' Server running on port 3001');
  });
})();