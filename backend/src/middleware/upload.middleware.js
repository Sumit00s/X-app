import multer from "multer"

const storage = multer.memoryStorage();

function fileFilter (req, file, cb) {
  if(file.mimetype.startWith("image/")){
    // To accept the file pass `true`, like so:
    cb(null, true)
  }
  else{
    // You can always pass an error if something goes wrong:
    cb(new Error('Only Image files are allowed'),false);
  }
};

const upload = multer({ 
    storage: storage,
    fileFilter:fileFilter,
    limits: {fileSize: 5*1024*1024}
})

export default upload;