import { CUBE_MESH, DEFAULT_VERTEX_SHADER_SOURCE } from "../Constant.js";
import { Vector3 } from "../math/Vector3.js";
import { Component } from "./Component.js";
import { Utils } from "../Utils.js";

export class Mesh extends Component{
    constructor(args){

        super();

        if(!args){
            args = {};
        }

        /**
         * @type {Array<number>}
         */
        this.verticesPositions = CUBE_MESH || args.vertices;

        /**
         * @type {number}
         */
        this.dimension = 3 || args.dimension;

        /**
         * @type {Array<Object>}
         */
        this.vertexShaderAttributes = new Array();

        /**
         * @type {Array<Object>}
         */
        this.vertexShaderUniforms = new Array();

        /**
         * @type {String}
         */
        this.vertexShaderSource = DEFAULT_VERTEX_SHADER_SOURCE || args.vertexShaderSource;

        /**
         * @type {String}
         */
        this.vertexShaderAttributeVertexPositionName = "vertPosition";

        /**
         * @type {String}
         */
        this.vertexShaderAttributeVertexNormalName = "vertNormal";

        /**
         * @type {String}
         */
        this.vertexShaderUniformObjectMatrixName = "mObject";

        /**
         * @type {String}
         */
        this.vertexShaderUniformObjectRotationMatrixName = "mObjectRotation";

        /**
         * @type {String}
         */
        this.vertexShaderUniformViewMatrixName = "mView";

        /**
         * @type {String}
         */
        this.vertexShaderUniformProjectionMatrixName = "mProj";

        /**
         * @type {Array<number>}
         */
        this.verticesNormals = new Array() || args.verticesNormal;

        /**
         * @type {Array<number>}
         */
        this.verticesIndex = args.verticesIndex;

        /**
         * @type {number}
         */
        this.verticesIndexCount = args.verticesIndexCount;

        this.computeFlatShadingNormals(true);
    }

    computeFlatShadingNormals(reverse = false){
        const trianglesNormal = new Array();

        // compute triangle normals
        for(let i = 0; i < this.verticesPositions.length; i+= this.dimension * 3){
            const A = new Vector3(this.verticesPositions[i + 0], this.verticesPositions[i + 1], this.verticesPositions[i + 2]);
            const B = new Vector3(this.verticesPositions[i + 3], this.verticesPositions[i + 4], this.verticesPositions[i + 5]);
            const C = new Vector3(this.verticesPositions[i + 6], this.verticesPositions[i + 7], this.verticesPositions[i + 8]);

            const AB = new Vector3(B.x - A.x, B.y - A.y, B.z - A.z);
            const AC = new Vector3(C.x - A.x, C.y - A.y, C.z - A.z);

            const pmid = new Vector3((A.x + B.x + C.x) / 3, (A.y + B.y + C.y) / 3, (A.z + B.z + C.z) / 3).normalized;
            const centroid = new Vector3(0, 0, 0);

            let N = AB.cross(AC);
            N = N.normalized;

            // facing normal
            if(/*pmid.subed(centroid).scalar(N) < 0*/reverse){
                N = N.scaled(-1).normalized;
            }

            for (let j = 0; j < this.dimension; j++) {
                trianglesNormal.push(...[N.x, N.y, N.z]);
            }
        }

        this.verticesNormals = trianglesNormal;
    }

    computeSmoothShadingNormals(){

        this.computeFlatShadingNormals();
        const verticesNormal = new Array();
        const trianglesNormal = this.verticesNormals;

        // compute vertices normal   
        for (let i = 0; i < this.verticesPositions.length; i += this.dimension) {
            let vertex = new Vector3(
                this.verticesPositions[i], this.verticesPositions[i + 1], this.verticesPositions[i + 2]
            );

            let attachedTriangles = this.getAttachedTrianglesIndices(vertex, i);

            let vertexNormal = new Vector3(0, 0, 0);

            for (let j = 0; j < attachedTriangles.length; j += this.dimension){
                let curentTriangleNormal = new Vector3(trianglesNormal[attachedTriangles[j]], trianglesNormal[attachedTriangles[j + 1]], trianglesNormal[attachedTriangles[j + 2]]);
                vertexNormal = vertexNormal.added(curentTriangleNormal);
            }

            vertexNormal = vertexNormal.normalized;

            verticesNormal.push(...[vertexNormal.x, vertexNormal.y, vertexNormal.z]);
        }

        this.verticesNormals = verticesNormal;
    }

    /**
     * @param {Vector3} vertex 
     */
    getAttachedTrianglesIndices(vertex, index){

        let triangles = new Array();

        for(let i = index; i < this.verticesPositions.length; i += this.dimension * 3 /** triangle */){

            // check if you have the same point in the current triangle
            let triangle = new Array();
            triangle.push(new Vector3(this.verticesPositions[i], this.verticesPositions[i + 1], this.verticesPositions[i + 2]));
            triangle.push(new Vector3(this.verticesPositions[i + 3], this.verticesPositions[i + 4], this.verticesPositions[i + 5]));
            triangle.push(new Vector3(this.verticesPositions[i + 6], this.verticesPositions[i + 7], this.verticesPositions[i + 8]));

            for(let j = 0; j < 3; j++){
                if(vertex.subed(triangle[j]).isZero()){
                    triangles.push(
                        ...[
                            i, i + 1, i + 2
                        ]
                    );
                }
            }
        }

        return triangles;
    }

    addVertexAttribute(attribute, value, dimension = 3) {
        let alreadyExist = false;

        this.vertexShaderAttributes.forEach(function(element, i){
            if(element.attribute == attribute){
                this.vertexShaderAttributes[i] = {
                    attribute: attribute,
                    value: value,
                    dimension: dimension
                }

                alreadyExist = true;
            }
        }, this);

        if(!alreadyExist){
            this.vertexShaderAttributes.push({
                attribute: attribute,
                value: value,
                dimension: dimension
            });
        }
    }

    addVertexUniform(uniform, value, dimension = 4) {
        let alreadyExist = false;

        this.vertexShaderUniforms.forEach(function(element, i){
            if(element.uniform == uniform){
                this.vertexShaderUniforms[i] = {
                    uniform: uniform,
                    value: value,
                    dimension: dimension
                }

                alreadyExist = true;
            }
        }, this);

        if(!alreadyExist){
            this.vertexShaderUniforms.push({
                uniform: uniform,
                value: value,
                dimension: dimension
            });
        }
    }

    useShader(vertexShaderSource){
        this.vertexShaderSource = vertexShaderSource;
    }

    addShader(vertexShaderSource){
        this.vertexShaderSource += vertexShaderSource;
    }
}