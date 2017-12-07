function getFragmentShader()
{
    const fsSource = `

        precision mediump float;

        varying highp vec2 vTextureCoord;
        varying highp vec4 vBC;

        float when_eq(float x, float y) {
            return (1.0 - abs(sign(x - y)));
        }

        float when_lt(float x, float y) {
            return max(sign(y - x), 0.0);
        }

        vec4 lT(vec4 v1, vec4 v2)
        {
            return vec4(
                when_lt(v1.x, v2.x),
                when_lt(v1.y, v2.y),
                when_lt(v1.z, v2.z),
                when_lt(v1.w, v2.w)
            );
        }

        float any(vec4 v)
        {
            return when_eq(
                       when_eq(v.x, 1.0) +
                       when_eq(v.y, 1.0) +
                       when_eq(v.z, 1.0) +
                       when_eq(v.w, 1.0),
                       1.0);
        }

        void main(void) {
            float a = any(lT(vBC, vec4(0.02)));

            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.3) * (1.0 - a) + vec4(0.5, 0.5, 0.5, 0.3) * a;
            // gl_FragColor = vBC;
        }
      `;
    return fsSource;
}