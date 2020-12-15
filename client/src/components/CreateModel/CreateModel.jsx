import React, {createRef, useEffect, useState} from 'react'
import "./CreateModel.css"
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import useHttp from "../../hooks/http.hook";

const CreateModel = () => {
  const {loading, request, error, clearError} = useHttp()
  const [modelSize, setModelSize] = useState({width: 1, height: 1, length: 1})
  const [modelCoord, setModelCoord] = useState({triangles: null, vertices: null})

  const canvasContainer = createRef()

  const changeInputHandler = (e) => {
    setModelSize({
      ...modelSize,
      [e.target.name]: e.target.value
    })
  }

  const clearHandler = () => {
    canvasContainer.current.innerHTML = ''
    setModelSize({width: 1,  height: 1, length: 1})
  }

  const createHandler = async () => {
    try {
      const data = await request('/api/create', 'POST', {...modelSize})
      clearError()
      setModelCoord({...data})
    } catch (e) {

    }
  }

  useEffect((canvasContainer) => {
    createModel(modelCoord.triangles, modelCoord.vertices, canvasContainer)
  }, [modelCoord])

  const createModel = (triangles, vertices, place) => {
    //Проверка на наличие данных
    if (!triangles || !vertices) return

    //Очистка поля перед вставкой
    canvasContainer.current.innerHTML = ''

    //Размеры canvas
    const width = canvasContainer.current.clientWidth
    const height = canvasContainer.current.clientHeight

    //Создание сцены, камеры. рендера
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.set(2.5, 2.5, 5);

    const renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0)

    canvasContainer.current.append(renderer.domElement)

    //Создание геометрии
    const geometry = new THREE.Geometry();

    //Добавления вершин в геометрию модели
    for (let i = 0; i < vertices.length;) {
      geometry.vertices.push(new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]))
      i += 3
    }

    //Добавления треугольников в геометрию модели
    for (let i = 0; i < triangles.length;) {
      geometry.faces.push(new THREE.Face3(triangles[i], triangles[i + 1], triangles[i + 2]))
      i += 3
    }

    //Создание материалов
    const material = new THREE.MeshBasicMaterial({
      color: 0xdaa520,
      specular: 0xbcbfbc,
    });
    const linesMaterial = new THREE.MeshBasicMaterial({
      color: 0xc30d0d,
      wireframe: true
    })

    //Создание объектов, добавление на сцену
    const lines = new THREE.Mesh(geometry, linesMaterial)
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube)
    scene.add(lines)

    //Добавление контроллера
    const controls = new OrbitControls(camera, renderer.domElement);

    //Start render
    const animate = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate()
  }

  return (
    <div className="createModel">
      <div className="createModel__body">
        <div className="modelView" ref={canvasContainer}>
        </div>
        <div className="createModel__inputs">
          <label htmlFor="width">Ширина
            <input type="number"
                   name="width"
                   min="1" max="100"
                   placeholder="width"
                   className="createModel__input"
                   onChange={changeInputHandler}
                   value={modelSize.width}/>
          </label>

          <label htmlFor="height">Высота
            <input type="number"
                   name="height"
                   min="1" max="100"
                   placeholder="height"
                   className="createModel__input"
                   onChange={changeInputHandler}
                   value={modelSize.height}/>
          </label>

          <label htmlFor="length">Длина
            <input type="number"
                   name="length"
                   min="1" max="100"
                   placeholder="length"
                   className="createModel__input"
                   onChange={changeInputHandler}
                   value={modelSize.length}/>
          </label>
        </div>
        <div className="createModel__buttons">
          <button className="createModel__button"
                  disabled={loading}
                  onClick={createHandler}>
            Создать
          </button>
          <button className="createModel__button"
                  disabled={loading}
                  onClick={clearHandler}>
            Очистить
          </button>
        </div>
        {error && <div className='createModel__error'>{error}</div>}
      </div>
    </div>
  )
}

export default CreateModel
