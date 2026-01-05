const app = require("./src/app"); // hoặc "./src/app.js" đều được

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("🚀 Server running at :" + PORT));
