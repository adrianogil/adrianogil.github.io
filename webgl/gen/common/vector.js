class Vector3
{
    constructor(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }

    add(v)
    {
        if (v instanceof Vector3)
            return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
        else
            return new Vector3(this.x + v, this.y + v, this.z + v);
    }
}