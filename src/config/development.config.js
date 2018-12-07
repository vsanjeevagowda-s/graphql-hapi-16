module.exports = {
  "registrations": [{
    "plugin": {
      "register": "@hpe/entmon-metrics",
      "options": {
        "enableentmon": false,
        "environment": "development"
      }
    }
  }, {
    "plugin": {
      "register": "@hpe/entmon-registration",
      "options": {
        "environment": "development"
      }
    }
  }],
  connections: [
    {
      host: '0.0.0.0',
      port: '6005',
      routes: {
        log: true,
      },
    },
  ],
}
