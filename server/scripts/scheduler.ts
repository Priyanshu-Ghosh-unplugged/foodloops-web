import cron from 'node-cron';
import { exec } from 'child_process';
import path from 'path';

// Schedule the price update script to run every day at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Running daily price update job...');
  
  const scriptPath = path.resolve(__dirname, 'updatePrices.ts');
  
  exec(`ts-node ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing price update script: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Price update script stderr: ${stderr}`);
      return;
    }
    console.log(`Price update script stdout: ${stdout}`);
  });
}, {
  timezone: "America/New_York"
});

console.log('Cron job for price updates scheduled.'); 