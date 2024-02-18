const axios = require("axios");
const fs = require("fs");
const parse = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
require("dotenv").config();

const inputFile = process.argv[2];
const outputFile = process.argv[3];
const token = process.env.DISCORD_USER_AUTH_TOKEN;

const csvWriter = createCsvWriter({
  path: outputFile,
  header: [
    { id: "username", title: "Username" },
    { id: "available", title: "Available? [y/n]" },
    { id: "checked", title: "Checked [yyyy-mm-dd-tttt]" },
    { id: "log", title: "Log" },
  ],
});

const checkUsername = async (username) => {
  try {
    const response = await axios.post(
      "https://discord.com/api/v9/users/@me/relationships",
      {
        username: username,
        discriminator: null,
      },
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );

    return { available: "n", log: "Username exists" }; // Assuming 204 and other success codes mean existence
  } catch (error) {
    if (
      error.response &&
      error.response.data &&
      error.response.data.code === 80004
    ) {
      return { available: "y", log: "No users with DiscordTag exist" };
    } else {
      return {
        available: "n",
        log: `Error or user exists: ${
          error.response ? error.response.data.message : "Unknown error"
        }`,
      };
    }
  }
};

const processFile = async (inputFile) => {
  const results = [];

  fs.createReadStream(inputFile)
    .pipe(parse({ headers: false }))
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      const outputData = [];
      for (const row of results) {
        const username = row[0];
        const { available, log } = await checkUsername(username);
        const checkedTime = new Date().toISOString();
        outputData.push({ username, available, checked: checkedTime, log });
        console.log(
          `Checked: ${username}, Available: ${available}, Log: ${log}`
        );
      }
      csvWriter
        .writeRecords(outputData)
        .then(() => console.log("The CSV file was written successfully"));
    });
};

processFile(inputFile);
