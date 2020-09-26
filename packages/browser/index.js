const Engage = require('@engage_so/core')

// Browser specific will come here

// Run pending queues
// console.log(Engage.queue)
const queue = window.engage && window.engage.queue ? window.engage.queue.slice(0) : []
// const queue = []
for (const q of queue) {
  Engage[q[0]].apply(Engage, q.splice(1))
}

module.exports = Engage
