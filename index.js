const express = require("express");

const app = express();

app.set("view engine", "ejs");
//console.log(app.get("view engine")); // Sadece teyit icin. console da tamlete engine olarak ejs in set edildigini test ettik gorduk

//Body icinde gelen datayi JSON a cevirmek icin kullandigimiz middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//  extended: true parametresinin anlami= gelen datayi jsona hangi kutuphane cevirsin secimi icindir questin veya quest

const path = require("path");
const userRoutes = require("./routes/user"); // hazirladigimiz route middleware i import ederiz
const adminRoutes = require("./routes/admin"); // hazirladigimiz route middleware i import ederiz

app.use("/libs", express.static(path.join(__dirname, "node_modules")));
app.use("/static", express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes); // import ettigimiz route u kullaniyoruz
app.use(userRoutes); // import ettigimiz route u kullaniyoruz

app.listen(3000, function () {
  console.log("listening on port 3000");
});
