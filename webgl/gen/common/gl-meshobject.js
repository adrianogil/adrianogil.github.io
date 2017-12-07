class GLMeshObject extends GLObject
{
    constructor(objectname)
    {
        super(objectname)

        this.vertices = [];
        this.triangles = [];

        this.buffers = {};

        this.bufferPositionName = "aVertexPosition";

        var attribNames = [this.bufferPositionName];
        var uniformNames = ["uModelViewMatrix", "uProjectionMatrix"];

        this.material = new GLMaterial(attribNames, uniformNames);
    }

    onStart(gl)
    {
        super.onStart(gl);

        this.createBuffers(gl);

        this.material.onStart(gl);
    }

    enableBuffers(gl)
    {
        this.buffers[this.bufferPositionName].enableBuffer(gl,
              this.material.getAttrib(this.bufferPositionName));
        this.buffers["triangles"].enableBuffer(gl);
    }

    draw(gl)
    {
        super.draw(gl);

        this.enableBuffers(gl);

        this.material.enableMaterial(gl);

        // Set the shader uniform
        gl.uniformMatrix4fv(
        this.material.getUniform("uProjectionMatrix"),
        false,
        GLManager.projectionMatrix
        );
      gl.uniformMatrix4fv(
        this.material.getUniform("uModelViewMatrix"),
        false,
        this.getModelViewMatrix(gl)
        );

      {
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        const vertexCount = this.triangles.length;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
      }
    }

    onFrameBegin(gl)
    {
        super.onFrameBegin(gl);
    }

    getVerticesData()
    {
        var verticeData = []

        const totalVertices = this.vertices.length;

        for (var i = 0; i < totalVertices; i++)
        {
            verticeData = verticeData.concat(
                    this.vertices[i].x,
                    this.vertices[i].y,
                    this.vertices[i].z
                );
        }

        return verticeData;
    }

    createBuffers(gl)
    {
        // Create buffers for vertices
        this.buffers[this.bufferPositionName] = new GLBuffer(
            gl.ARRAY_BUFFER,
            gl.FLOAT,
            3
            );
        this.buffers[this.bufferPositionName].createBuffer(gl, this.getVerticesData());

        // Create buffers for triangles
        this.buffers["triangles"] = new GLBuffer(
            gl.ELEMENT_ARRAY_BUFFER
            );
        this.buffers["triangles"].createBuffer(gl, this.triangles);
    }

    getModelViewMatrix(gl)
    {
        // Set the drawing position to the 'identity' point, which is
          // the center of the scene
          const modelViewMatrix = mat4.create();

          // Now move the drawing position a bit to where we want to
          // start drawing the square
          mat4.translate(modelViewMatrix,    // destination matrix
                         modelViewMatrix,    // matrix to translate
                         [this.transform.position.x,
                         this.transform.position.y,
                         this.transform.position.z]); // amount to translate

          mat4.rotate(modelViewMatrix,       // destination matrix
                      modelViewMatrix,       // matrix to rotate
                      this.transform.rotation.x,        // amount to rotate in radians
                      [1, 0, 0]              // axis to rotate around
          );

          mat4.rotate(modelViewMatrix,       // destination matrix
                      modelViewMatrix,       // matrix to rotate
                      this.transform.rotation.y,        // amount to rotate in radians
                      [0, 1, 0]              // axis to rotate around
          );

          mat4.rotate(modelViewMatrix,       // destination matrix
                      modelViewMatrix,       // matrix to rotate
                      this.transform.rotation.z,        // amount to rotate in radians
                      [0, 0, 1]              // axis to rotate around
          );

          this.modelViewMatrix = modelViewMatrix;

          return modelViewMatrix;
    }
}