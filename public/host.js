const socket = io()
const active = document.querySelector('.js-active')
const buzzList = document.querySelector('.js-buzzes')
const activate = document.querySelector('.js-activate')
const deactivate = document.querySelector('.js-deactivate')
const clear = document.querySelector('.js-clear')
const reset = document.querySelector('.js-reset')
const buzzer = document.querySelector('.js-buzzer')

socket.on('active', (numberActive) => {
  active.innerText = `${numberActive} joined`
})

socket.on('buzzes', (buzzes) => {
  buzzList.innerHTML = buzzes
    .map(buzz => {
      const p = buzz.split('-')
      return { name: p[0], team: p[1] }
    })
    .map(user => `<li>${user.name} on Team ${user.team}</li>`)
    .join('')
})

clear.addEventListener('click', () => {
  socket.emit('clear')
})

reset.addEventListener('click', () => {
  socket.emit('reset')
})

activate.addEventListener('click', () => {
  socket.emit('activate')
})

deactivate.addEventListener('click', () => {
  socket.emit('deactivate')
})