const express = require("express");
const router = express.Router();

const db = require("../data/db"); // db.js modülünü import ediyoruz
db.query("SELECT * FROM blog", function (err, res) {
  // console.log(res.rows[0].title);
});

// ======================
//    Blog DELETE route
// ======================
router.get("/blog/delete/:blogid", async (req, res) => {
  const blogid = req.params.blogid;
  try {
    const result_blog = await db.query("SELECT * FROM blog WHERE blogid=$1", [
      blogid,
    ]);
    const blog = result_blog.rows[0];
    res.render("admin/blog-delete", {
      title: "Delete Blog",
      blog: blog,
    });
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).send("Error executing query");
  }
});

router.post("/blog/delete/:blogid", async (req, res) => {
  const bodyBlogId = req.body.blogid;
  const paramBlogId = req.params.blogid;
  // Blog ID'lerinin eşitliğini kontrol et
  if (paramBlogId !== bodyBlogId) {
    return res.status(400).send("Blog ID'si eşleşmiyor");
  }
  try {
    await db.query("DELETE FROM blog WHERE blogid=$1", [paramBlogId]);
    res.redirect("/admin/blogs?action:delete"); // Silme işlemi başarılı olursa blog listesine yönlendirme
    // ?action:delete i sonrada sadece QUERY String ile url uzerinden sayfaya bilgi tasimaya ornek yaptik.
    // ! Olmasada sonuc degismez bu sadece extra parametredir. Ama buna bir sey baglaya biliriz mesela bir popup acip
    //! delete isleminiz basarili oldu yazdirabiliriz.
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).send("Error executing query");
  }
});

// ======================
//    Blog CREATE route
// ======================
router.get("/blog/create", async (req, res) => {
  try {
    const result_categories = await db.query("SELECT * FROM category");
    res.render("admin/blog-create", {
      title: "Add Blog",
      categories: result_categories.rows,
    });
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).send("Error executing query");
  }
});

// Blog create işlemini handle eden POST route
router.post("/blog/create", async (req, res) => {
  //console.log(req.body); // Form verilerini konsola yazdırır
  // Form verilerini veritabanına kaydetme
  try {
    const { baslik, aciklama, resim, kategori, anasayfa, onay } = req.body;
    const homepage = anasayfa ? true : false;
    const approved = onay ? true : false;

    const result = await db.query(
      "INSERT INTO blog (title, description, picture, category_id, homepage, approval) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [baslik, aciklama, resim, kategori, homepage, approved]
    );

    console.log(result.rows[0]);
    res.redirect("/admin/blogs?action=create"); // Başarılı olursa blog listesine yönlendirme
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).send("Error executing query");
  }
});

// ======================
//    Blog EDIT route
// ======================
router.get("/blogs/:blogid", async (req, res) => {
  //console.log(">>> Calisiyor", req);
  const blogid = req.params.blogid;
  try {
    const result_blog = await db.query("SELECT * FROM blog WHERE blogid=$1", [
      blogid,
    ]);
    const result_categories = await db.query("SELECT * FROM category");
    const blog = result_blog.rows[0];
    //console.log(">>>>>>>", blog);
    if (blog) {
      return res.render("admin/blog-edit", {
        title: "Edit Blog",
        blog: blog,
        categories: result_categories.rows,
      });
    }
    res.redirect("admin/blogs");
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).send("Error executing query");
  }
});
// Blog edit işlemini handle eden POST route
router.post("/blogs/:blogid", async (req, res) => {
  try {
    const {
      blogid: bodyBlogId,
      baslik,
      aciklama,
      resim,
      kategori,
      anasayfa,
      onay,
    } = req.body;
    const homepage = anasayfa ? true : false;
    const approved = onay ? true : false;
    const paramBlogId = req.params.blogid;

    // Blog ID'lerinin eşitliğini kontrol et
    if (paramBlogId !== bodyBlogId) {
      return res.status(400).send("Blog ID'si eşleşmiyor");
    }

    await db.query(
      "UPDATE blog SET title=$1, description=$2, picture=$3, category_id=$4, homepage=$5, approval=$6 WHERE blogid=$7 RETURNING *",
      [baslik, aciklama, resim, kategori, homepage, approved, paramBlogId]
    );

    res.redirect("/admin/blogs?action=edit&blogid=" + paramBlogId); // Başarılı olursa blog listesine yönlendirme
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).send("Error executing query");
  }
});

router.use("/blogs", async (req, res) => {
  try {
    const result_blogs = await db.query(
      "SELECT blogid, title, picture FROM blog"
    );

    res.render("admin/blog-list", {
      title: "Blog List",
      blogs: result_blogs.rows,
      action: req.query.action,
      blogid: req.query.blogid,
    });
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).send("Error executing query");
  }
});

module.exports = router;

// ---------- Eski hali ---------
// const path = require("path");

// router.use("/blog/create", function(req, res) {
//     res.sendFile(path.join(__dirname, "../views/admin","blog-create.html"));
// });

// router.use("/blogs/:blogid", function(req, res) {
//     res.sendFile(path.join(__dirname, "../views/admin","blog-edit.html"));
// });

// router.use("/blogs", function(req, res) {
//     res.sendFile(path.join(__dirname, "../views/admin","blog-list.html"));
// });
