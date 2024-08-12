const mongoose = require('mongoose');

const Db = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  await mongoose.connect(process.env.MONGODB_URI);
};

module.exports = Db;