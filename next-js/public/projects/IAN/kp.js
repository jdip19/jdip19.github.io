const mouse = require('node-mouse');

const listener = mouse.createMouse();
listener.on('mousemove', (event) => {
  console.log('Mousemove:', event.x, event.y);
});
