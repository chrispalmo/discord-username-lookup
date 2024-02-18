require("dotenv").config();
const axios = require("axios");

// Use the token from an environment variable for security
const userToken = process.env.DISCORD_USER_TOKEN;

axios
  .get("https://discord.com/api/v9/users/@me", {
    headers: {
      Authorization: userToken,
    },
  })
  .then((response) => {
    console.log("User Profile:", response.data);
  })
  .catch((error) => {
    console.error("Error fetching user profile:", error);
  });
