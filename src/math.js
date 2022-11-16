export class vec2
{
    constructor(...args) {
        if(args.length == 1)
            this.x = this.y = args[0]
        else
            this.x = args[0], this.y = args[1]
    }
    copy() { return new vec2(this.x, this.y)}
    func(fn) { return new vec2(fn(this.x), fn(this.y)) }
    static dir(theta) { return new vec2(Math.cos(theta), Math.sin(theta))}
    static neg({x,y}) { return new vec2(-x, -y)}
    static len({x,y}) { return Math.sqrt(x * x + y * y)}
    static norm({x,y}) { const len = vec2.len({x,y}); return new vec2(x / len, y / len)}
    static dot(v1, v2) { return v1.x * v2.x + v1.y * v2.y; }
    static cross(v1, v2) { return v1.x * v2.y - v2.x * v1.y; }

    static add(v1, v2) { return new vec2(v1.x + v2.x, v1.y + v2.y)}
    static sub(v1, v2) { return new vec2(v1.x - v2.x, v1.y - v2.y)}
    static mul(v1, v2) { return new vec2(v1.x * v2.x, v1.y * v2.y)}
    static div(v1, v2) { return new vec2(v1.x / v2.x, v1.y / v2.y)}

    static adds(v1, s) { return new vec2(v1.x + s, v1.y + s)}
    static subs(v1, s) { return new vec2(v1.x - s, v1.y - s)}
    static muls(v1, s) { return new vec2(v1.x * s, v1.y * s)}
    static divs(v1, s) { return new vec2(v1.x / s, v1.y / s)}

    static lerp(v1, v2, t){ return vec2.add(v1, vec2.muls(vec2.sub(v2,v1),t))}
    
}


export const lerp = (a, b, t) => a + (b-a) * t
export const max = (a, b) => a > b ? a : b
export const min = (a, b) => a < b ? a : b
export const step = (e, x) => x < e ? 0 : 1
export const clamp = (e1, e2, x) => x < e1 ? e1 : x > e2? e2 : x
export const smoothstep =  (min, max, value) => {
    const x = Math.max(0, Math.min(1, (value-min)/(max-min)));
    return x*x*(3 - 2*x);
  }

let m_w = 123456789;
let m_z = 987654321;
const mask = 0xffffffff;

// Takes any integer
export function random_seed(i) {
    m_w = (123456789 + i) & mask;
    m_z = (987654321 - i) & mask;
}

// Returns number between 0 (inclusive) and 1.0 (exclusive),
// just like Math.random().
export function random()
{
    m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
    m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
    var result = ((m_z << 16) + (m_w & 65535)) >>> 0;
    result /= 4294967296;
    return result;
}
export function random2(x,y)
{
    x = (36969 * (x & 65535) + (x >> 16)) & mask;
    y = (18000 * (y & 65535) + (y >> 16)) & mask;
    var result = ((x << 16) + (y & 65535)) >>> 0;
    result /= 4294967296;
    return result;
}

const directions = [
    vec2.dir(0),
    vec2.dir(Math.PI / 4),
    vec2.dir(Math.PI / 2),
    vec2.dir(Math.PI * 3 / 4),
    vec2.dir(Math.PI),
    vec2.dir(Math.PI * 5 / 4),
    vec2.dir(Math.PI * 3 / 2),
    vec2.dir(Math.PI * 7 / 4),
]

console.log(directions)

export class Noise2D {
    constructor(seed = 0,size = 128) {
        random_seed(seed)
        this.table = []
        this.size  = size
        for(let i = 0; i < this.size * this.size ; i++)
            this.table.push(Math.abs(Math.floor(random() * directions.length - .00001)))
    }

    smooth(t)
    {
       return t * t * t * ( t *(t * 6 - 15)  + 10) 
    }
 
    val({x,y}) {
        x = Math.abs(x)
        y = Math.abs(y)
        //if(this.cache.has({x,y}))
        let ix = Math.floor(x)
        let iy = Math.floor(y)

        let fx = x - ix
        let fy = y - iy
        ix = ix % (this.size -1)
        iy = iy % (this.size -1)

        let off1 = iy * (this.size)
        let off2 = off1 + (this.size)

        let ptl = directions[this.table[off1 + ix]];
        let ptr = directions[this.table[off1 + ix + 1]];
        let pbr = directions[this.table[off2 + ix + 1]];
        let pbl = directions[this.table[off2 + ix]];
     

        let dtl = new vec2(fx, fy)
        let dtr = new vec2(fx -1, fy)
        let dbr = new vec2(fx -1,fy -1)
        let dbl = new vec2(fx,  fy -1)

        let vtl = vec2.dot(ptl, dtl)
        let vtr = vec2.dot(ptr, dtr)
        let vbr = vec2.dot(pbr, dbr)
        let vbl = vec2.dot(pbl, dbl)

        let sx = this.smooth(fx)
        let sy = this.smooth(fy)
        let v1 = lerp(vtl,vtr, sx)
        let v2 = lerp(vbl,vbr, sx)

        let v =  lerp(v1, v2, sy)
        return v;
    }
}

export function PerlinNoiseMap(width, height,  scale = 40, xoff = 0, yoff = 0, amp = 1, noise = null, seed = 0) {
    let heightMap = []
    if(!noise)
        noise = new Noise2D(seed);

    for(let y = 0; y < height; y++)
        for(let x = 0; x < width; x++)
        {
            let fx = x / scale + xoff
            let fy = y / scale + yoff
            let v = noise.val({x: fx, y: fy})
            heightMap.push(amp * (v + 1)/2)
        }
    return heightMap;
}

