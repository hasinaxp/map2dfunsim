
export function CreateCanvas(width, height, onscreen = true)
{
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    if(onscreen)
        document.body.appendChild(canvas)
    return canvas.getContext('2d')
}
export function CreateImageData(width, height) {
    let imageData = new ImageData(width, height);
    for(let i  = 0; i < width * height; i++)
        imageData.data[i * 4 + 3] = 255
    return imageData
}