const express = require('express')
const morgan = require('morgan')
const amqp = require('amqplib');
const api = require('./api')
const { connectToDb } = require('./lib/mongo')

const app = express()
const port = process.env.PORT || 8000
const rabbitmqHost = process.env.RABBITMQ_HOST;
const rabbitmqUrl = `amqp://${rabbitmqHost}`;
async function main() {
  try {
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();
    await channel.assertQueue('echo');
    
  } catch (err) {
    console.error(err);
  }
}
main();
/*
 * Morgan is a popular logger.
 */
app.use(morgan('dev'))

app.use(express.json())
app.use(express.static('public'))

/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */
app.use('/', api)

app.use('*', function (req, res, next) {
  res.status(404).json({
    error: "Requested resource " + req.originalUrl + " does not exist"
  })
})

connectToDb(function () {
  app.listen(port, function () {
    console.log("== Server is running on port", port)
  })
})
