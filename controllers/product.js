const router = require('express').Router()
const Product = require('../models/Product')
const { verifyTokenAndAdmin } = require('../controllers/verifyToken')

const upload = require('./multer')


// ADD PRODUCT
router.post('/add', verifyTokenAndAdmin,upload.single("image"),async (req, res) => {
    try {
     const image = req.file.filename
    
  let {
    title,
    desc,
  
    categories,
    subCategories,
    size,
    color,
    price
  } = req.body
 price = parseInt(price)

const newProducts ={title,desc,image,categories,subCategories,size,color,price}



        const product = new Product(newProducts)
        const result = await product.save()
        if(result){
          res.status(200).json("Product add successfully")
        }
      
    }
    catch (err) {
        res.status(500).json(err)
    }
})

//UPDATE PRODUCT
router.put('/update/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id,
            {
                $set: req.body
            }, { new: true })
          res.status(200).json("Product updated successfully")
    }
    catch (err) {
        res.status(500).json(err)
    }
})


// DELETE PRODUCT
router.delete('/delete/:id',verifyTokenAndAdmin,async(req,res)=>{
    try{
           Product.findByIdAndDelete(req.params.id,(err,result)=>{
               res.status(200).json("successfully delete product")
           })
    }
    catch(err){
        res.status(500).json(err)
    }
})



//GET ALL PRODUCTS
router.get("/get", async (req, res) => {
    const qNew = req.query.new;
    const qCategory = req.query.category;
    try {
      let products;
  
      if (qNew) {
        products = await Product.find().sort({ createdAt: -1 }).limit(10);
      } else if (qCategory) {
        products = await Product.find({
          categories: {
            $in: [qCategory],
          },
        });
      } else {
        products = await Product.find();
      }
  
      res.status(200).json(products);
    } catch (err) {
      res.status(500).json(err);
    }
  });


module.exports = router