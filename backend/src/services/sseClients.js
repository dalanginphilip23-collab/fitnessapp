// Originally this Map lived inline in route/notification.js and was
// accessed from route/foodLogs.js via `require('./notification').clients`.
// Pulled out into its own module so both the notification and foodLogs
// services can import the exact same Map instance without coupling a
// service to another resource's controller/router.
const clients = new Map();

module.exports = clients;
