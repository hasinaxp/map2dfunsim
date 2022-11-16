import { CreateCanvas, CreateImageData } from "./drawing.js";
import { clamp, Noise2D, PerlinNoiseMap, smoothstep, step } from "./math.js";


const VIEW_SIZE = 600


const c = CreateCanvas(VIEW_SIZE, VIEW_SIZE)

const frameTimeElement = document.createElement('h5');
document.body.appendChild(frameTimeElement);


class TarrainHeightmap {
    constructor(octaves, seed, baseScale = 96){
        this.octaves = octaves
        this.noise = new Noise2D(seed)
        this.scales = []
        this.amps = []
        this.totalAmp = 0
        this.scale = baseScale
        this.baseScale = baseScale
        for(let i  = 0; i < octaves; i++) {
            this.baseScale /= 2
            this.scales.push(this.baseScale)
            this.amps.push(1/(1 + i));
            this.totalAmp += 1/(1 + i);
        }
        console.log(this)
    }

    setScale(scale) {
        this.baseScale = scale
        this.scale = scale
        this.scales = []
        this.amps = []
        this.totalAmp = 0
        for(let i  = 0; i < this.octaves; i++) {
            this.baseScale /= 2
            this.scales.push(this.baseScale)
            this.amps.push(1/(1 + i));
            this.totalAmp += 1/(1 + i);
        }
    }
    getHeightMap(width, height, xoff, yoff)
    {
        let heightMaps = [];
        for(let i = 0; i < this.octaves; i++) {
            heightMaps.push(PerlinNoiseMap(width, height, this.scales[i], xoff / this.scales[i], yoff / this.scales[i], this.amps[i], this.noise))
        }
        let size = width * height
        this.finalHeightMap = new Array(size)
        this.width = width
        this.height = height
        for(let i = 0; i < size; i++)
        {
            let h = 0;
            for(let hm of heightMaps)
                h += hm[i];
            h /= this.totalAmp;
            this.finalHeightMap[i] = h;
        }
        return this.finalHeightMap;    
    }
    get(x,y) {
        return this.finalHeightMap[y * this.width + x];
    }
    getImage(t) {   
        let cx = CreateCanvas(this.width, this.height, false)
        let imd = new ImageData(this.width, this.height)
        let sz = this.width * this.height
        for(let i = 0; i < sz; i++) {
            let ind = i * 4;
            let v = Math.floor(this.finalHeightMap[i] * 200)
            let landMask = step(105, v);
            let landMask2 = step(105 - Math.abs(Math.sin(t)) * 8, v) - landMask;
            let grashMask = step(110, v);
            let dm1 = step(120, v);
            imd.data[ind] = landMask * (1 - grashMask) * 230 + landMask2 * 70
            imd.data[ind + 1] = (landMask) * (1 - dm1) * 100 + 140 * landMask + landMask2 * 70
            imd.data[ind + 2] =( v * 3 - 90) * (1- landMask) ;
            imd.data[ind + 3] = 255 
        }
        cx.putImageData(imd, 0, 0)
        return cx.canvas
    }
}
class CloudHightMap extends TarrainHeightmap  {
    constructor(octaves, seed, baseScale = 64){
        super(octaves,seed, baseScale)
    }
    getHeightMap(width, height, xoff, yoff)
    {
        let heightMaps = [];
        for(let i = 0; i < this.octaves; i++) {
            heightMaps.push(PerlinNoiseMap(width, height, this.scales[i], xoff , yoff, this.amps[i], this.noise))
        }
        let size = width * height
        this.finalHeightMap = new Array(size)
        this.width = width
        this.height = height
        for(let i = 0; i < size; i++)
        {
            let h = 0;
            for(let hm of heightMaps)
                h += hm[i];
            h /= this.totalAmp;
            this.finalHeightMap[i] = h;
        }
        return this.finalHeightMap;    
    }
    getImage(t) {   
        let cx = CreateCanvas(this.width, this.height, false)
        let imd = new ImageData(this.width, this.height)
        let sz = this.width * this.height
        for(let i = 0; i < sz; i++) {
            let ind = i * 4;
            let v = Math.floor(this.finalHeightMap[i] * 200)
            let mask = smoothstep(106, 125, v) 
            imd.data[ind] = 255
            imd.data[ind + 1] = 255
            imd.data[ind + 2] = 255
            imd.data[ind + 3] = mask * 250
        }
        cx.putImageData(imd, 0, 0)
        return cx.canvas
    }

}

let tarrainHeightMap = new TarrainHeightmap(6)
let coluds = new CloudHightMap(4, 3, 100)


let currentTime = 0
const bc = 300
let xoff = 100
let yoff = 100
let xoff2 = 0
let yoff2 = 0

let epoch = 0
tarrainHeightMap.getHeightMap(bc,bc,  xoff, yoff)
function render(t) {
    epoch++
    let ft = t - currentTime
    currentTime = t
    if(epoch % 20 === 0)
    frameTimeElement.innerHTML = `frame Time: ${ft.toFixed(2)} ms, fps: ${Math.ceil(1000/ft)}`

    requestAnimationFrame(render)
    c.clearRect(0, 0, c.canvas.width, c.canvas.height)
    if(dragging)
    tarrainHeightMap.getHeightMap(bc,bc,  xoff, yoff)
    coluds.getHeightMap(128,128,  xoff2, yoff2)
    xoff2 += .0004 * ft
    yoff2 += .0004 * ft
    
    c.drawImage(tarrainHeightMap.getImage(t * .001), 0,0, VIEW_SIZE, VIEW_SIZE)

    
    if(tarrainHeightMap.scale < 140)
        c.drawImage(coluds.getImage(t * .001), 0,0, VIEW_SIZE, VIEW_SIZE)
}

window.addEventListener( 'wheel', e => {
    let sc = (e.deltaY > 0 ? 1.03 : .97)
   let v = sc  * tarrainHeightMap.scale;
    yoff *= sc
    xoff *= sc
    yoff2 *= sc * 1.2
    xoff2 *= sc * 1.2
   tarrainHeightMap.setScale(v);
   tarrainHeightMap.getHeightMap(bc,bc,  xoff, yoff)
})
let dragging = false;
c.canvas.addEventListener('mousedown', e => {
    dragging = true;
    
})
window.addEventListener('mouseup', e => {
    dragging = false
})
let moveSensetivity = .5
let moveSensetivity2 = .05
window.addEventListener('mousemove',e => {
    if(dragging) {

        xoff -= e.movementX * moveSensetivity
        yoff -= e.movementY * moveSensetivity
        xoff2 -= e.movementX * moveSensetivity2
        yoff2 -= e.movementY * moveSensetivity2
    }
})

render(0);