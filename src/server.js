const app = require("./app");

app.listen(3333, () => {
  const now = new Date()
  const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
  console.log(`[${time}] 🚀 Back-end iniciado.`)
});