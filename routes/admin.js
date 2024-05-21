const express = require("express");
const router = express.Router();

const db = require("../data/db"); // db.js modülünü import ediyoruz
db.query("SELECT * FROM blog", function (err, res) {
  // console.log(res.rows[0].title);
});

const imageUpload = require("../helpers/image-uploads");

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
    res.redirect("/admin/blogs?action=delete"); // Silme işlemi başarılı olursa blog listesine yönlendirme
    // ?action:delete i sonrada sadece QUERY String ile url uzerinden sayfaya bilgi tasimaya ornek yaptik.
    // ! Olmasada sonuc degismez bu sadece extra parametredir. Ama buna bir sey baglaya biliriz mesela bir popup acip
    //! delete isleminiz basarili oldu yazdirabiliriz.
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).send("Error executing query");
  }
});
// ============================================
//    Blog EDIT route
// ============================================
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
// ============================================
//    Blog CREATE route
// ============================================
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
router.post("/blog/create", imageUpload.upload.single("resim"), async (req, res) => {
  //console.log(req.body); // Form verilerini konsola yazdırır
  // Form verilerini veritabanına kaydetme
  try {
    const { baslik, aciklama, kategori, anasayfa, onay } = req.body;
    const resim = req.file.filename;
    const homepage = anasayfa ? true : false;
    const approved = onay ? true : false;
    console.log("Resim>>>", resim)

    // Resim dosyası yüklenmiş mi kontrol edin
    if (!resim) {
      return res.status(400).send("Resim dosyası yüklenemedi");
    }

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
// ============================================
// MAIN Admin Blogs route
// ============================================
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

//========================================================================================

// ============================================
// Category DELETE route
// ============================================
router.get("/category/delete/:categoryid", async (req, res) => {
  const categoryid = req.params.categoryid;
  try {
    const result_category = await db.query("SELECT * FROM category WHERE id=$1", [
      categoryid,
    ]);
    const category = result_category.rows[0];

    const result = await db.query(
      `SELECT b.* FROM blog b
       JOIN category c ON b.category_id = c.id
       WHERE c.id = $1`,
      [categoryid]
    );
    const related_blogs = result.rows;

    const resultCategories = await db.query("SELECT * FROM category");
    const result_categories = resultCategories.rows;

    res.render("admin/category-delete", {
      title: "Delete Category",
      category: category,
      blogs: related_blogs,
      categories: result_categories,
    });
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).send("Error executing query");
  }
});

router.post("/category/delete/:categoryid", async (req, res) => {
  const bodyCategoryId = req.body.categoryid;
  const paramCategoryId = req.params.categoryid;
  // Blog ID'lerinin eşitliğini kontrol et
  if (paramCategoryId !== bodyCategoryId) {
    return res.status(400).send("Blog ID'si eşleşmiyor");
  }
  try {
    await db.query("DELETE FROM category WHERE id=$1", [paramCategoryId]);
    res.redirect("/admin/categories?action=delete&id=" + paramCategoryId); // Silme işlemi başarılı olursa blog listesine yönlendirme
    // ! action:delete i sonrada sadece QUERY String ile url uzerinden sayfaya bilgi tasimaya ornek yaptik.
    // ! Olmasada sonuc degismez bu sadece extra parametredir. Ama buna bir sey baglaya biliriz mesela bir popup acip
    // ! delete isleminiz basarili oldu yazdirabiliriz.
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).send("Error executing query");
  }
});
// Blog Kategorisini Güncelleme Route'u
router.post("/blog/update-category/:blogid", async (req, res) => {
  const blogid = req.params.blogid;
  const newCategoryId = req.body.kategori;
  try {
    await db.query(
      "UPDATE blog SET category_id=$1 WHERE blogid=$2 RETURNING *",
      [newCategoryId, blogid]
    );
    res.redirect("back"); // İşlemden sonra aynı sayfaya geri dön
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).send("Error executing query");
  }
});

// ============================================
//  Category EDIT route
// ============================================
router.get("/categories/:categoryid", async (req, res) => {
  //console.log(">>> Calisiyor", req);
  const categoryid = req.params.categoryid;
  try {
    const result_categories = await db.query("SELECT * FROM category WHERE id=$1", [
      categoryid,
    ]);
    const category = result_categories.rows[0];
    //console.log(">>>>>>>", blog);
    if (category) {
      return res.render("admin/category-edit", {
        title: category.category_name,
        category: category,
      });
    }
    res.redirect("admin/categories");
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).send("Error executing query");
  }
});
// Category edit işlemini handle eden POST route
router.post("/categories/:categoryid", async (req, res) => {
  try {

    const {
      categoryid: bodyCategoryId,
      category_adi,
    } = req.body;

    const paramCategoryId = req.params.categoryid;

    // Category ID'lerinin eşitliğini kontrol et
    if (paramCategoryId !== bodyCategoryId) {
      return res.status(400).send("Category ID's not same");
    }

    await db.query(
      "UPDATE category SET category_name=$1 WHERE id=$2 RETURNING *",
      [category_adi, paramCategoryId]
    );

    res.redirect("/admin/categories?action=edit&id=" + paramCategoryId); // Başarılı olursa blog listesine yönlendirme
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).send("Error executing query");
  }
});

// ============================================
//  Category CREATE route
// ============================================
router.get("/category/create", async (req, res) => {
  try {
    res.render("admin/category-create", {
      title: "Add New Category",
    });
  } catch (err) {
    // console.error("Error executing query", err.stack);
    res.status(500).send("Error rendering page");
  }
});

// category create işlemini handle eden POST route
router.post("/category/create", async (req, res) => {
  //console.log(req.body); // Form verilerini konsola yazdırır
  // Form verilerini veritabanına kaydetme
  try {
    const { category_adi } = req.body;

    const result = await db.query(
      "INSERT INTO category (category_name) VALUES ($1) RETURNING *",
      [category_adi]
    );

    console.log(result.rows[0]);
    res.redirect("/admin/categories?action=create"); // Başarılı olursa blog listesine yönlendirme
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).send("Error executing query");
  }
});

// ===================================================
//  MAIN Admin Categories route
// ===================================================
router.use("/categories", async (req, res) => {
  try {
    const result_categories = await db.query(
      "SELECT * FROM category"
    );
    //console.log(">>>", result_categories.rows);
    res.render("admin/category-list", {
      title: "Blog List",
      categories: result_categories.rows,
      action: req.query.action,
      categoryid: req.query.id,
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
