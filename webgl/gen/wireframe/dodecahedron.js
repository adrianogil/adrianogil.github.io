var Dodecahedron = new function()
{
    this.meshbuilder = null;
    this.create = function(meshObject)
    {
        this.meshBuilder = new MeshBuilder();

        this.meshBuilder.addVertex(new Vector3(-1,-1,-1)); // 0
        this.meshBuilder.addVertex(new Vector3(-1,-1, 1)); // 1
        this.meshBuilder.addVertex(new Vector3(-1, 1,-1)); // 2
        this.meshBuilder.addVertex(new Vector3(-1, 1, 1)); // 3
        this.meshBuilder.addVertex(new Vector3( 1,-1,-1)); // 4
        this.meshBuilder.addVertex(new Vector3( 1,-1, 1)); // 5
        this.meshBuilder.addVertex(new Vector3( 1, 1,-1)); // 6
        this.meshBuilder.addVertex(new Vector3( 1, 1, 1)); // 7

        const phi = (1 + Math.sqrt(5))/2;

        this.meshBuilder.addVertex(new Vector3(0, -1/phi, -phi)); // 8
        this.meshBuilder.addVertex(new Vector3(0, -1/phi,  phi)); // 9
        this.meshBuilder.addVertex(new Vector3(0,  1/phi, -phi)); // 10
        this.meshBuilder.addVertex(new Vector3(0,  1/phi,  phi)); // 11


        this.meshBuilder.addVertex(new Vector3(-1/phi, -phi, 0)); // 12
        this.meshBuilder.addVertex(new Vector3(-1/phi,  phi, 0)); // 13
        this.meshBuilder.addVertex(new Vector3( 1/phi, -phi, 0)); // 14
        this.meshBuilder.addVertex(new Vector3( 1/phi,  phi, 0)); // 15

        this.meshBuilder.addVertex(new Vector3(-phi, 0, -1/phi)); // 16
        this.meshBuilder.addVertex(new Vector3( phi, 0, -1/phi)); // 17
        this.meshBuilder.addVertex(new Vector3(-phi, 0,  1/phi)); // 18
        this.meshBuilder.addVertex(new Vector3( phi, 0,  1/phi)); // 19

        this.addDodecahedronFace(7, 19, 17, 6, 15);
        this.addDodecahedronFace(6, 17, 4, 8, 10);
        this.addDodecahedronFace(15, 6, 10, 2, 13);
        this.addDodecahedronFace(2, 10, 8, 0, 16);
        this.addDodecahedronFace(13, 2, 16, 18, 3);
        this.addDodecahedronFace(7, 15, 13, 3, 11);
        this.addDodecahedronFace(4, 17, 19, 5, 14);
        this.addDodecahedronFace(0, 8, 4, 14, 12);
        this.addDodecahedronFace(18, 16, 0, 12, 1);
        this.addDodecahedronFace(11, 3, 18, 1, 9);
        this.addDodecahedronFace(19, 7, 11, 9, 5);
        this.addDodecahedronFace(5, 9, 1, 12, 14);

        this.addInternalCubeFace( 2, 6, 4, 0);
        this.addInternalCubeFace( 6, 7, 5, 4);
        this.addInternalCubeFace( 7, 3, 1, 5);
        this.addInternalCubeFace( 3, 2, 0, 1);
        this.addInternalCubeFace( 3, 7, 6, 2);
        this.addInternalCubeFace( 5, 1, 0, 4);

        this.meshBuilder.createMesh(meshObject);
    };
    this.addDodecahedronFace = function(v1,v2,v3,v4,v5)
    {
        this.meshBuilder.addTriangle(v1, v4, v5);
        this.meshBuilder.addTriangle(v2, v4, v1);
        this.meshBuilder.addTriangle(v3, v4, v2);
    }

    this.addInternalCubeFace = function(v1,v2,v3,v4)
    {
        this.meshBuilder.addTriangle(v4, v3, v1);
        this.meshBuilder.addTriangle(v3, v2, v1);
    }
}