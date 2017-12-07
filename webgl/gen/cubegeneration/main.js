
function main()
{
    GLManager.getGLFromSelector("#glcanvas");

    var scene = new GLScene("Teste");

    var quad = new GLMeshObject("quad");

    var p = new Vector3(1,1,0);
    var v1 = new Vector3(1,0,0);
    var v2 = new Vector3(0,1,0);

    MeshBuilder.createQuad(quad, p, v1, v2);
    scene.addObject(quad);

    var v3 = new Vector3(0,0,1);

    var cube = new GLMeshObject("cube");
    MeshBuilder.createCube(cube, p, v1, v2, v3);
    scene.addObject(cube);

    var dode = new GLMeshObject("dodecahedron");
    Dodecahedron.create(dode);
    scene.addObject(dode);

    function update(now)
    {
        quad.transform.rotate(new Vector3(0.0, 0.01, 0.01));
        cube.transform.rotate(new Vector3(0.0, -0.01, -0.01));
        dode.transform.rotate(new Vector3(0.01, 0.01, -0.01));

        requestAnimationFrame(update);
    }
    requestAnimationFrame(update);

    GLManager.currentScene = scene;
    GLManager.run();
}