import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    //TODO: for users
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

    const fileName = `${uniqueSuffix}_${file.originalname}`

    cb(null, fileName);
  }
})

export const upload = multer({
    storage
})