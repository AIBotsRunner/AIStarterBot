const express = require('express');
const fs = require('fs');
const fse = require('fs-extra');
const { exec } = require('child_process');
const { spawn } = require('child_process');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const corsOptions = {
  origin: 'https://cyberkun.com/',
  optionsSuccessStatus: 200
};

app.post('/Bot_Create', cors(corsOptions), (req, res) => {
  // Add CORS headers to the response
  res.setHeader('Access-Control-Allow-Origin', 'https://cyberkun.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  const username = req.body.username.toString();
  const userFolder = `./Users/Users_Bots/${username}`;

  // Check if user folder exists, create it if it doesn't
  if (!fs.existsSync(userFolder)){
    fs.mkdirSync(userFolder);
  }

  // Copy BotAI folder to user folder
  const botAIFolder = './Users/BotsForUsers/BotAI';
  const userBotAIFolder = `${userFolder}`;
  exec(`cp -R ${botAIFolder} ${userBotAIFolder}`, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error copying bot AI folder');
      return;
    }
    // console.log('Bot AI folder copied to user folder');
  });  

  // Read the original bot code from the file
  const BOT_FILE = '../BotAI/dist/index.js';
  fs.readFile(BOT_FILE, 'utf8', (err, botCode) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading bot code file');
      return;
    }

    // Generate the bot script code with the user's configuration
    const botScript = `
const server = require('../../../../../Create_Bot.js');
${botCode}
server.listen(3000, () => {
    console.log('File for ${username} start listening on port 3000');
});
    `;

      // Write the new bot script to a file with a unique name
      const fileName = `${userFolder}/BotAI/dist/index.js`;
      fs.writeFile(fileName, botScript, (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error writing bot script to file');
          return;
        }

        // Spawn the bot script process
        const botProcess = spawn('node', [fileName]);

	    console.log(`[*] Session created for ${username}`);

        // Send a success response to the user
        res.send('Bot script created and running');

        // Log any errors from the bot process
        botProcess.stderr.on('data', (data) => {
            console.error(data.toString());
        });
      });
   });
});

const server = app.listen(3000, () => {
    console.log('Server running on port 3000');
});

module.exports = server;
