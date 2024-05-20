const express = require("express"); // express alinir
const router = express.Router(); // Router adnidaki interface kullanilir

const db = require("../data/db"); // db.js modülünü import ediyoruz
db.query("SELECT * FROM blog", function (err, res) {
  // console.log(res.rows[0].title);
}); // Test for Connection to DB

// ---------------------------------------------
//  category route
// ---------------------------------------------
router.use("/blogs/category/:id", async (req, res) => {
  const id = req.params.id; // ustteki id ismini biz verdik parametre gonderdik bu satirda aynen id olarak aldik

  try {
    const result_blog = await db.query(
      "SELECT * FROM blog WHERE category_id=$1",
      [id]
    );
    const result_categories = await db.query("SELECT * FROM category");

    res.render("users/blogs", {
      title: "Courses",
      blogs: result_blog.rows,
      categories: result_categories.rows,
      selectedCategory: id,
    });
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).send("Error executing query");
  }
});

// ---------------------------------------------
//  blogs details route
// ---------------------------------------------
router.use("/blogs/:blogid", async (req, res) => {
  //"/blogs/:blogid",  sondaki :blogid verdik adini alttaki req.params.blogid deki blogid oradan gelir
  const id = req.params.blogid;
  //console.log("BLOG ID", id);
  try {
    const result_blog = await db.query("SELECT * FROM blog WHERE blogid=$1", [
      id,
    ]);
    //const result_blog = await db.query("SELECT * FROM blog WHERE blogid=? and title=?",[id, title_name]); birden fazla parametre gecilebilir
    //console.log(result_blog.rows[0]);
    if (result_blog.rows.length > 0) {
      return res.render("users/blog-details", {
        blog: result_blog.rows[0],
      });
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).send("Error executing query");
  }
});

// ---------------------------------------------
//  blogs route
// ---------------------------------------------
// Route for displaying all blogs with static data
// router.use("/blogs", function (req, res) {
//   res.render("users/blogs", data); //data render methodunun 2. parametresi olarak eklenir boylece ulasima acilir.
// });

router.use("/blogs", async (req, res) => {
  try {
    const result_blogs = await db.query("SELECT * FROM blog WHERE approval");
    //console.log(result_blogs.rows);
    const result_categories = await db.query("SELECT * FROM category");
    //console.log(result_categories.rows);

    //console.log(blogs); // Dönüştürülmüş veriyi kontrol etme

    res.render("users/blogs", {
      title: "Courses",
      blogs: result_blogs.rows,
      categories: result_categories.rows,
      selectedCategory: null,
    });
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).send("Error executing query");
  }
});

// ---------------------------------------------
//  index route
// ---------------------------------------------
// router.use("/", function (req, res) {
//   res.render("users/index", data);
// });

// Route for the homepage that fetches data from the database
router.use("/", async (req, res) => {
  try {
    const result_blogs = await db.query(
      "SELECT * FROM blog WHERE approval AND homepage"
    );
    //console.log(result_blogs.rows);
    const result_categories = await db.query("SELECT * FROM category");
    //console.log(result_categories.rows);

    res.render("users/index", {
      title: "All Courses",
      blogs: result_blogs.rows,
      categories: result_categories.rows,
      selectedCategory: null,
    });
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).send("Error executing query");
  }
});

module.exports = router; // export edilir

// router.post("", data)
// const path = require("path");

// router.use("/blogs/:blogid", function(req, res) {
//     res.sendFile(path.join(__dirname, "../views/users","blog-details.html"));   // dosya yollari .. olarak dizin ayarlanir
// });

// router.use("/blogs", function(req, res) {
//     res.sendFile(path.join(__dirname, "../views/users","blogs.html"));
// });

// router.use("/", function(req, res) {
//     res.sendFile(path.join(__dirname, "../views/users","index.html"));
// });
