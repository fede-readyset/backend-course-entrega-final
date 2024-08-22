import multer from "multer";

// Función local para generar el nuevo nombre del archivo
// Tomo la extensión original, pero cambio el nombre utilizando el código del producto para identificar el archivo
function generateFileName(req, file, callback) {
    const articleCode = req.body.code; 
    const originalFileName = file.originalname;
    const extension = originalFileName.split('.').pop();
    const newFileName = `${articleCode}.${extension}`;
    callback(null, newFileName);
}

// Configuro multer para subir los thumbnails
const productsStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./src/public/img");        //Carpeta donde se guardan las imagenes
    },
    filename: generateFileName // Uso la función local generateFileName para definir el nombre del archivo
})

export const uploadProdFile = multer({storage:productsStorage});


const storage = multer.diskStorage({
    destination: (req,file,cb) =>{
        let destinationFolder;
        switch(file.fieldname) {
            case "profile":
                destinationFolder = "./src/public/uploads/profiles";
                break;
            case "products":
                destinationFolder = "./src/public/uploads/products";
                break;
            case "document":
                destinationFolder = "./src/public/uploads/documents";
        }
        cb(null, destinationFolder);

    },
    filename: (req,file,cb) => {
        cb(null,file.originalname);
    }  
})

const upload = multer({storage:storage});




export default upload;