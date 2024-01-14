const socket = io()
const active = document.querySelector('.js-active')
const incorrect = document.querySelector('.js-incorrect')
const buzzList = document.querySelector('.js-buzzes')
const activate = document.querySelector('.js-activate')
const deactivate = document.querySelector('.js-deactivate')
const clear = document.querySelector('.js-clear')
const reset = document.querySelector('.js-reset')
const buzzer = document.querySelector('.js-buzzer')

const do_logging = false
const all_dict = {id: 'all'}

socket.on('active', (numberActive) => {
  active.innerText = `${numberActive} joined`
})

socket.on('correct', (numberActive, player) => {
  active.innerText = `${numberActive} joined - ${player.name} on Team ${player.team} chooses`
})

socket.on('buzzes', (buzzes) => {
  buzzList.innerHTML = buzzes
    .map(buzz => {
      const p = buzz.split('-')
      return { name: p[0], team: p[1], id: p[2]}
    })
    .map(user => `<li>${user.name} on Team ${user.team}</li>`)
    .join('')
})

clear.addEventListener('click', () => {
  socket.emit('clear')
  socket.emit('tivate', 'deac', all_dict)
})

reset.addEventListener('click', () => {
  socket.emit('reset')
})

activate.addEventListener('click', () => {
  socket.emit('tivate', 'ac', all_dict)
})

incorrect.addEventListener('click', () => {
  socket.emit('incorrect')
})

deactivate.addEventListener('click', () => {
  socket.emit('tivate', 'deac', all_dict)
})