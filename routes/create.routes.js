const {} = require("express-validator");

const {body,validationResult} = require("express-validator");
const {Router} = require('express')
const router = Router()


router.post(
  '/',
  [
    body(['width', 'height', 'length'], 'Min: 1').isFloat({min: 1})
  ],


  async (req, res) => {

    try {
      const errors = validationResult(req)
      if(!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Некоректные данные'
        })
      }

      const {width: x, height: y, length: z} = req.body

      const vertices = [  //Вершины модели относительно начала системы координат
        -x/2, -y/2,  z/2, //0
         x/2, -y/2,  z/2, //1
        -x/2,  y/2,  z/2, //2
         x/2,  y/2,  z/2, //3
        -x/2, -y/2, -z/2, //4
         x/2, -y/2, -z/2, //5
        -x/2,  y/2, -z/2, //6
         x/2,  y/2, -z/2, //7
      ]

      const triangles = [
        0, 3, 2, // front
        0, 1, 3, // front
        1, 7, 3, // right
        1, 5, 7, // right
        5, 6, 7, // back
        5, 4, 6, // back
        4, 2, 6, // left
        4, 0, 2, // left
        2, 7, 6, // top
        2, 3, 7, // top
        4, 1, 0, // bottom
        4, 5, 1, // bottom
      ]

      res.status(201).json({vertices, triangles})
    } catch (e) {
      res.status(500).json({message: 'Что то пошло не так попробуйте снова'})
    }
  })

module.exports = router