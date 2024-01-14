const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const app = express();
const server = http.Server(app);
const io = socketio(server);

const title = 'Buffer Buzzer'

const all_dict = {id: 'all'}

let data = {
  users: new Set(),
  buzzes: new Set(),
}

let buzz_active = false
const do_logging = false

const getData = () => ({
  users: [...data.users],
  buzzes: [...data.buzzes].map(b => {
    const [ name, team , id] = b.split('-')
    return { name, team , id}
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
    if (buzz_active) {
      // socket.broadcast.emit('activate', all_dict)
    } else {
      socket.broadcast.emit('tivate', 'deac', user)
    }
    socket.emit('active', [...data.users].length)
    if (do_logging) { console.log(`Log: ${user.name} joined!`) }
  })

  socket.on('remove', (user) => {
    data.users.delete(user.id)
    io.emit('active', [...data.users].length)
    if (do_logging) { console.log(`Log: ${user.name} left.`) }
  })

  socket.on('buzz', (user) => {
    if (buzz_active) {
      if (data.users.has(user.id)) {
        if (data.buzzes.has(`${user.name}-${user.team}`)) {
          if (do_logging) { console.log(`Log: ${user.name} already buzzed in!`) }
        } else {
          buzz_active = false
          data.buzzes.add(`${user.name}-${user.team}-${user.id}`)
          io.emit('buzzes', [...data.buzzes])
          socket.broadcast.emit('tivate', 'deac', user)
          // should allow only one user to buzz in at a time
          // if they answer wrong, the buzzers can be reactivated
          // for one more buzz
          socket.broadcast.emit('tivate', 'deac', all_dict)
          if (do_logging) { console.log(`Log: ${user.name} buzzed in!`) }
        }
      } else {
        if (do_logging) { console.log(`Log: Old user '${user.name}' buzzed in! (not counted)`) }
      }
    } else {
      if (do_logging) { console.log(`Log: ${user.name} is buzzing when deactivated.`) }
    }
  })

  socket.on('clear', () => {
    const cnt = data.buzzes.size
    if (cnt > 0) {
      const p = [...data.buzzes][(cnt-1)].split('-')
      let last = {name: p[0], team: p[1], id: p[2]}
      io.emit('correct', [...data.users].length, last)
    }
    data.buzzes.clear()
    io.emit('buzzes', [...data.buzzes])
    if (do_logging) { console.log(`Log: Clear buzzes`) }
  })

  socket.on('reset', () => {
    data.users.clear()
    data.buzzes.clear()
    if (do_logging) { console.log([...data.users].length) }
    io.emit('active', [...data.users].length)
    io.emit('buzzes', [...data.buzzes])
    if (do_logging) { console.log(`Log: Reset game`) }
  })

  socket.on('tivate', (tivate, user) => {
    if (do_logging) { console.log(`Log: ${tivate}tivate ${user.id}`) }
    if (user) {
      socket.broadcast.emit('tivate', tivate, user)
      if (user.id == 'all') {
        if (tivate == 'ac') {
          buzz_active = true
          io.emit('active', [...data.users].length)
        } else {
          buzz_active = false
        }
      }
    }
  })

  socket.on('incorrect', () => {
    const cnt = data.buzzes.size
    if (cnt > 0) {
      for (let step = 0; step < cnt; step++) {
        // const p = data.buzzes.values().next().value.split('-')
        const p = [...data.buzzes][step].split('-')
        let first = {name: p[0], team: p[1], id: p[2]}
        if (do_logging) { console.log(`Log: Incorrect (${cnt}) ${first.id} (${first.name}-${first.team}-${first.id})`) }
        socket.broadcast.emit('tivate', 'deac', first)
        // socket.broadcast.emit('tivate', 'deac', all_dict)
        socket.broadcast.emit('tivate', 'ac', first)
      }
    }
  })

})

server.listen(8090, () => console.log('Listening on 8090'))
