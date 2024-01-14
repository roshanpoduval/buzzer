const socket = io()
const body = document.querySelector('.js-body')
const form = document.querySelector('.js-join')
const joined = document.querySelector('.js-joined')
const buzzer = document.querySelector('.js-buzzer')
const joinedInfo = document.querySelector('.js-joined-info')
// const editInfo = document.querySelector('.js-edit')

const do_logging = false

let user = {}
let buzz_active = false

const getUserInfo = () => {
  user = JSON.parse(localStorage.getItem('user')) || {}
  if (user.name) {
    form.querySelector('[name=name]').value = user.name
    form.querySelector('[name=team]').value = user.team
  }
}
const saveUserInfo = () => {
  localStorage.setItem('user', JSON.stringify(user))
}

form.addEventListener('submit', (e) => {
  e.preventDefault()
  user.name = form.querySelector('[name=name]').value
  user.team = form.querySelector('[name=team]').value
  if (user.name && user.team) {
    if (!user.id) {
      user.id = Math.floor(Math.random() * new Date())
    }
    socket.emit('join', user)
    saveUserInfo()
    joinedInfo.innerText = `${user.name} on Team ${user.team}`
    form.classList.add('hidden')
    joined.classList.remove('hidden')
    body.classList.add('buzzer-mode')
  }
})

buzzer.addEventListener('click', () => {
  if (buzz_active) {
    socket.emit('buzz', user) // only index needs to see the user buzz... for now
    buzzer.style.backgroundColor='yellow'
  }
})

socket.on('tivate', (tivate, usr) => {
  if (do_logging) { console.log(`Log: ${tivate}tivate ${usr.id} (this - ${user.id})`) }
  if (tivate == 'ac') {
    if (usr.id == 'all' || usr.id != user.id) {
      buzz_active = true
      buzzer.style.backgroundColor='greenyellow'
      if (do_logging) { console.log(`Log: ${tivate}tivated != ${(usr.id != user.id)}`) }
    }
  } else {
    if (usr.id == 'all' || usr.id == user.id) {
      buzz_active = false
      buzzer.style.backgroundColor='lightcoral'
      if (do_logging) { console.log(`Log: ${tivate}tivated == ${(usr.id == user.id)}`) }
    }
  }
})

// editInfo.addEventListener('click', () => {
//   joined.classList.add('hidden')
//   form.classList.remove('hidden')
//   body.classList.remove('buzzer-mode')
//   // socket.emit('remove', user)
// })

getUserInfo()
