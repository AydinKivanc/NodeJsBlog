const multer = require("multer");
const path = require("path"); // File name icin kullanmak icin ekledik

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/')
    },
    filename: function (req, file, cb) {
        cb(null, path.parse(file.originalname).name + "-" + Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage })

module.exports.upload = upload;

// ! cb  islem bitince cagrilacak bir callback func.
// ! path.parse(file.originalname).name = Dosyanin orjinal adi
// ! Date.now() = Milisecond cinsinden eklenecek benzersiz deger
// ! path.extname(file.originalname) = uzanti ismi eklenir ornek .jpeg

