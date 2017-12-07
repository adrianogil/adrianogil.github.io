function getVertexShader()
{
    const vsSource = `
            attribute vec4 aVertexPosition, aWireQuadCoord;
            varying vec4 vBC;

            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;

            void main(void) {
              gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
              vBC = aWireQuadCoord;
            }
      `;
    return vsSource;
}