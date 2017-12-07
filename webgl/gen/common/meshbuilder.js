class MeshBuilder
{
    constructor()
    {
        this.vertices = [];
        this.triangles = [];
    }

    addVertex(v) {
        this.vertices = this.vertices.concat(v);
    }

    addTriangle(t1,t2,t3) {
        this.triangles = this.triangles.concat(t1,t2,t3);
    }

    addQuad(p,v1,v2)
    {
        var i = this.vertices.length;

        this.addVertex(p);
        this.addVertex(p.add(v1));
        this.addVertex(p.add(v2));
        this.addVertex(p.add(v1).add(v2));

        this.addTriangle(i,i+1,i+3);
        this.addTriangle(i,i+3,i+1);
        this.addTriangle(i,i+2,i+3);
        this.addTriangle(i,i+3,i+2);
    }

    addCube(p,v1,v2,v3)
    {
        this.addQuad(p,v1,v2);
        this.addQuad(p,v1,v3);
        this.addQuad(p,v2,v3);

        this.addQuad(p.add(v3),v1,v2);
        this.addQuad(p.add(v2),v1,v3);
        this.addQuad(p.add(v1),v2,v3);
    }

    createMesh(meshObject)
    {
        meshObject.vertices = this.vertices;
        meshObject.triangles = this.triangles;
    }

    static createQuad(meshObject,p,v1,v2)
    {
        var meshBuilder = new MeshBuilder();
        meshBuilder.addQuad(p,v1,v2);

        return meshBuilder.createMesh(meshObject);
    }

    static createCube(meshObject,p,v1,v2,v3)
    {
        var meshBuilder = new MeshBuilder();
        meshBuilder.addCube(p,v1,v2,v3);

        return meshBuilder.createMesh(meshObject);
    }
}