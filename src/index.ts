
function distanceSquared(x: number, y: number, p: {x: number, y: number}) {
  const dx = p.x - x
  const dy = p.y - y
  return dx * dx + dy * dy
}

export function distanceToPath(x : number, y: number, path: SVGPathElement): number {
  const pathLength = path.getTotalLength()
  // TODO Test this heristic with complicated letters (or just change to 32)
  var chunk = pathLength / 8.0
  const chunks = [0, chunk, chunk*2, chunk*3, chunk*4, chunk*5, chunk*6, chunk*7, pathLength]
  // Find closest point of initial choices
  var best = chunks.reduce((previous, current) => {
    let point = path.getPointAtLength(current)
    let distance2 = distanceSquared(x, y, point)
    let result = distance2 < previous.distance ? {length: current, distance: distance2} : previous
    return result
  }, {length: 0, distance: Infinity})
  // Near-binary search
  chunk *= 0.51
  let i = 0
  while (chunk > 0.0000001) {
    let aLength = best.length - chunk
    let bLength = best.length + chunk
    let aDistance = aLength > 0 ? distanceSquared(x, y, path.getPointAtLength(aLength)) : Infinity
    let bDistance = bLength < pathLength ? distanceSquared(x, y, path.getPointAtLength(bLength)) : Infinity
    if (aDistance < best.distance) {
      best = {length: aLength, distance: aDistance}
    } else if (bDistance < best.distance) {
      best = {length: bLength, distance: bDistance}
    } else {
      chunk *= 0.51 // Only divide if no change
    }
    i++
  }
  return Math.sqrt(best.distance)
}

// TODO add one-pixel svg to current page
export function generateArrayFromPath(pathString: string) : Array<number> {
  const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
  //const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  
  // svg.appendChild(pathEl)
  // pathEl.setAttribute('d', aPathData);
  // distanceToPath(16, -16, pathEl)
  // var point = pathEl.getPointAtLength(0)
  // for (var x=0; x < 70; x++) {
  //   for (var y=0; y < 70; y++) {
  //     point.x = x
  //     point.y = y
  //     var isIn = pathEl.isPointInFill(point)
  //     if (isIn) console.log(isIn)
  //   }
  // }

  pathElement.setAttribute('d', pathString)
  return [distanceToPath(0, 0, pathElement)]
}
