import { Scene } from "../../../../musigm-3d-v0.0.1/src/js/core/Scene.js";
import { Camera } from "../../../../musigm-3d-v0.0.1/src/js/core/Camera.js";
import { GameObject } from "../../../../musigm-3d-v0.0.1/src/js/core/GameObject.js";
import { DirectionLight } from "../../../src/js/core/component/DirectionLight.js";
import { Material } from "../../../../musigm-3d-v0.0.1/src/js/core/component/Material.js";
import { Mesh } from "../../../../musigm-3d-v0.0.1/src/js/core/component/Mesh.js";
import { Light } from "../../../src/js/core/component/Light.js";

export class Main{
    constructor(){
        // scene
        let scene = new Scene();

        // camera
        let camera = new Camera();
        camera.position.z = -10.0;

        // direction light
        let directionLight = new GameObject();
        directionLight.addComponent(DirectionLight);

        // cube
        let cube = new GameObject();
        cube.addComponent(Mesh);
        cube.addComponent(Material);

        let light = new GameObject();
        let lightCompo = light.addComponent(Light);
        lightCompo.color = [0.0, 1.0, 0.0];

        light.position.x = -5;
        light.position.z = -5;

        /*camera.lockCursor(function(){
            window.addEventListener("mousemove", function(event){
                cube.rotation.y += event.movementX * 0.1;
                cube.rotation.x += event.movementY * 0.1;
            });
        }.bind(this));*/
        
        // add all your objects to the scene
        scene.add(directionLight, cube, light);

        function loop() {

            // rotate the cube
            cube.rotation.x += 0.5;
            cube.rotation.y += 0.5;

            // render
            camera.render(scene);

            requestAnimationFrame(loop.bind(this));
        }
        loop();
    }
}

new Main();