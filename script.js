// Imports
import * as THREE from './build/three.module.js';
import {GLTFLoader} from "./build/GLTFLoader.js";

// Scene and Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
const renderer = new THREE.WebGL1Renderer({
    antialias: true
});
renderer.setSize(innerWidth, innerHeight, false);
document.body.appendChild(renderer.domElement);

// Perspective Camera
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.01, 300);
camera.position.set(-1.2, 1.3, 0);
camera.lookAt(-1.2, 0, -1000);
// camera.position.set(0, 10, 0);
// camera.lookAt(0, 0, 0);

// Ambient Light
const hlight = new THREE.AmbientLight(0xffffff, 1);
scene.add(hlight);

// Directional Light
const dlight = new THREE.DirectionalLight(0xffffff, 10);
dlight.position.set(0, 1, 0);
dlight.castShadow = true;
scene.add(dlight);

// Create the ground.
const base_material = new THREE.MeshPhongMaterial({
    color: 0x00ff00
});
const base_geometry = new THREE.BoxGeometry(1000, 1, 10000);
const base = new THREE.Mesh(base_geometry, base_material);
base.position.y = - 0.55;
scene.add(base);

// Create the road
const road_material = new THREE.MeshBasicMaterial({
    color: 0x444444
});
const road_mark_material = new THREE.MeshBasicMaterial({
    color: 0xffffff
})
const road_geometry = new THREE.BoxGeometry(6, 0.01, 4500);
const road_mark_geometry = new THREE.BoxGeometry(0.15, 0.1, 1.5);
const road_base = new THREE.Mesh(road_geometry, road_material);
scene.add(road_base);
road_base.position.y = -0.005;
for (let i = -1000; i < 10000; i++) {
    let road_mark = new THREE.Mesh(road_mark_geometry, road_mark_material);
    scene.add(road_mark);
    road_mark.position.set(0, 0, -4.5 * i);
}

// Load building model.
const loader = new GLTFLoader();
loader.load(
    'build/models/model3/scene.gltf',
    function (build) {
        // Place the buildings in a pattern.
        for (let i = 0; i < 1000; i++) {
            let home = build.scene.clone();
            scene.add(home);
            home.scale.set(0.005, 0.005, 0.005);
            home.position.set(-16, 0, -100 * i);
            let home2 = build.scene.clone();
            scene.add(home2);
            home2.scale.set(0.005, 0.005, 0.005);
            home2.position.set(16, 0, -100 * i - 25);
        }

        // Load the 3d model of the car.
        loader.load(
            'build/models/model1/scene.gltf',
            function (model) {

                // Dummy box to determine the dimensions of the car model.
                const dummy_box = new THREE.Box3().setFromObject(model.scene);
                const size_vector = new THREE.Vector3();
                dummy_box.getSize(size_vector);

                // Factors to accordingly resize the model.
                const x_factor = 1 / size_vector.x, y_factor = 1 / size_vector.y, z_factor = 1 / size_vector.z;

                /** Returns a car object */
                function Car(length, width, height, init_speed, lane, init_x, init_z) {
                    let obj = {};
                    obj.length = length;
                    obj.width = width;
                    obj.height = height;
                    obj.speed = init_speed * 5 / 18;
                    obj.lane = lane;
                    obj.accn = 0;
                    obj.overtaking_phase = false;
                    obj.object = model.scene.clone();
                    obj.object.scale.set(x_factor * width, y_factor * height, z_factor * length);
                    if (lane === 1) obj.object.rotation.y = Math.PI;
                    obj.object.position.set(init_x, 0, init_z);
                    return obj;
                }

                // The array of all cars in the city.
                const cars = [];
                cars.push(new Car(5, 2, 1.5, 140, 1, -1.5, 0));
                scene.add(cars[0].object);
                cars.push(new Car(5, 2, 1.5, 100, 1, -1.5, -20));
                scene.add(cars[1].object);
                cars.push(new Car(5, 2, 1.5, -100, 0, 1.5, -300));
                scene.add(cars[2].object);

                let t0 = $.now(), t1, frame_rate = 60;

                function play() {
                    setInterval(function () {
                        renderer.render(scene, camera);
                        t1 = $.now();

                        cars.forEach(function(car) {
                            car.object.position.z -= car.speed * (t1 - t0) / 1000;
                        });
                        camera.position.z -= cars[0].speed * (t1 - t0) / 1000;

                        t0 = $.now();
                    }, 1000 / frame_rate);
                }
                play();
            }
        );
    }
);
