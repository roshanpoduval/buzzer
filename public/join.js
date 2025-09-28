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
let locked_out = false
let clockOffset = 0

const getUserInfo = () => {
  user = JSON.parse(localStorage.getItem('user')) || {}
  if (user.name) {
    form.querySelector('[name=name]').value = user.name
    form.querySelector('[name=team]').value = user.team
  }
}

socket.on('please-sync-now', () => {
  socket.emit('time-ping', { t0: Date.now() });
});

socket.on('time-pong', (payload) => {
  const t1 = Date.now();
  const rtt = t1 - payload.t0;
  const latency = rtt / 2;
  const estimatedServerTime = payload.serverTime + latency;
  clockOffset = estimatedServerTime - t1;
  if (do_logging) { console.log(`Log: Clock offset is ${clockOffset}ms`); }
});
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
    buzzer.style.backgroundColor = 'yellow'
  } else if (!locked_out) {
    // Buzzing too early and not already locked out
    locked_out = true
    buzzer.style.backgroundColor = 'darkred'
    setTimeout(() => {
      locked_out = false
      // After lockout, if buzzers are still inactive, return to inactive color.
      // If they became active during lockout, the player missed it, so the color
      // should remain 'lightcoral' until the next 'ac' event.
      buzzer.style.backgroundColor = 'lightcoral'
    }, 250)
  }
})

socket.on('tivate', (tivate, usr) => {
  if (do_logging) { console.log(`Log: ${tivate}tivate ${usr.id} (this - ${user.id})`) }

  if (tivate === 'ac') {
    // Time-synchronized activation for 'all'
    if (usr.activationTime) {
      const localActivationTime = usr.activationTime - clockOffset;
      const delay = localActivationTime - Date.now();

      if (do_logging) { console.log(`Log: Activating in ${delay}ms`); }

      if (delay > 0) {
        setTimeout(() => {
          if (!locked_out) {
            buzz_active = true;
            buzzer.style.backgroundColor = 'greenyellow';
          }
        }, delay);
      } else {
        // High latency or clocks drifted since last sync, activate immediately
        if (!locked_out) {
          buzz_active = true;
          buzzer.style.backgroundColor = 'greenyellow';
        }
      }
    } else if (usr.id != user.id) {
      // Fallback for non-synced activation (e.g. from 'incorrect' button for a single user)
       if (!locked_out) {
        buzz_active = true
        buzzer.style.backgroundColor = 'greenyellow'
      }
    }
  } else { // 'deac'
    if (usr.id == 'all' || usr.id == user.id) {
      buzz_active = false
      if (!locked_out) {
        buzzer.style.backgroundColor = 'lightcoral'
      }
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
