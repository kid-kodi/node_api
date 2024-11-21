const User = require("./models/User");

const getUsers = async () => {
  const users = await User.find();
  console.log(users);
};

getUsers();
