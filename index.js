const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const app = express();
const server = http.Server(app);
const io = socketio(server);

const title = 'Buffer Buzzer'

let data = {
  users: new Set(),
  buzzes: new Set(),
}

let buzz_active = false

const getData = () => ({
  users: [...data.users],
  buzzes: [...data.buzzes].map(b => {
    const [ name, team ] = b.split('-')
    return { name, team }
  })
})

app.use(express.static('public'))
app.set('view engine', 'pug')

app.get('/', (req, res) => res.render('index', { title }))
app.get('/host', (req, res) => res.render('host', Object.assign({ title }, getData())))

io.on('connection', (socket) => {
  socket.on('join', (user) => {
    data.users.add(user.id)
    io.emit('active', [...data.users].length)
    socket.emit('active', [...data.users].length)
    console.log(`Log: ${user.name} joined!`)
  })

  socket.on('remove', (user) => {
    data.users.delete(user.id)
    io.emit('active', [...data.users].length)
    console.log(`Log: ${user.name} left.`)
  })

  socket.on('buzz', (user) => {
    if (buzz_active) {
      if (data.users.has(user.id)) {
        if (data.buzzes.has(`${user.name}-${user.team}`)) {
          console.log(`Log: ${user.name} already buzzed in!`)
        } else {
          data.buzzes.add(`${user.name}-${user.team}`)
          io.emit('buzzes', [...data.buzzes])
          console.log(`Log: ${user.name} buzzed in!`)
        }
      } else {
        console.log(`Log: Old user '${user.name}' buzzed in! (not counted)`)
      }
    } else {
      console.log(`Log: ${user.name} is buzzing when deactivated.`)
    }
  })

  socket.on('clear', () => {
    data.buzzes.clear()
    io.emit('buzzes', [...data.buzzes])
    console.log(`Log: Clear buzzes`)
  })

  socket.on('reset', () => {
    data.users.clear()
    data.buzzes.clear()
    console.log([...data.users].length)
    io.emit('active', [...data.users].length)
    io.emit('buzzes', [...data.buzzes])
    console.log(`Log: Reset game`)
  })

  socket.on('activate', () => {
    // console.log(`Debug: Activate buzzer from host ${socket.id}`)
    buzz_active = true
  });

  socket.on('deactivate', () => {
    // console.log(`Debug: Deactivate buzzer from host ${socket.id}`)
    buzz_active = false
  });
})

server.listen(8090, () => console.log('Listening on 8090'))
