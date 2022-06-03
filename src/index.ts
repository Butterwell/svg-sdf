
function distanceSquared(x: number, y: number, p: {x: number, y: number}) {
  const dx = p.x - x
  const dy = p.y - y
  return dx * dx + dy * dy
}

export function nomralize(raw: Array<number>, svgDomainSize: number, padAsMultipleOfSvgDomainSize: number) : Array<number> {
  const range = svgDomainSize * padAsMultipleOfSvgDomainSize * 2
  const max = range / 2
  const min = -max
  const normed = raw.map((v) => v < min ? 0 : v > max ? 1 :  (v / range) + 0.5)
  return normed
}

export function distanceToPath(x : number, y: number, path: SVGPathElement): number {
  const pathLength = path.getTotalLength()
  // TODO Test this heristic with complicated letters (or just change to 32)
  const sections = 128
  var chunk = pathLength / sections
  const chunks = [...Array(sections).keys()].map(i => i * chunk)
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

export function generateArrayFromPath(pathString: string, sdfSize: number, svgDomainSize: number, padAsMultipleOfSvgDomainSize: number) : Array<number> {
  const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  
  svgElement.appendChild(pathElement)
  svgElement.style.width = "1px"
  svgElement.style.height = "1px"
  svgElement.style.position = "fixed"
  svgElement.style.top = "0"
  svgElement.style.left = "0"
  document.body.appendChild(svgElement)

  pathElement.setAttribute('d', pathString);

  const domainSize = svgDomainSize + (svgDomainSize * padAsMultipleOfSvgDomainSize)
  const midDomain = domainSize / 2

  const box = svgElement.getBBox()
  const step = domainSize / sdfSize
  const halfStep = step / 2
  const midX = box.x + (box.width / 2)
  const startX = midX - midDomain - halfStep
  const midY = box.y + (box.height / 2)
  const startY = midY - midDomain - halfStep
  
  // The glyph units are scaled by 1 / (unitsPerEm * 72) - 72 pixels
  const raw = Array<number>(sdfSize*sdfSize)
  var point = pathElement.getPointAtLength(0) // create a point to work with
  var x = startX
  var y = startY
  for (var i = 0; i < sdfSize; i++) {
    y += step
    x = startX
    for (var j = 0; j < sdfSize; j++) {
      x += step
      point.x = x
      point.y = y
      var isIn = pathElement.isPointInFill(point)
      if (isIn) console.log(isIn)
      var distance = distanceToPath(x, y, pathElement)
      raw[i*sdfSize + j] = isIn ? distance : -distance
    }
  }
  const result = nomralize(raw, svgDomainSize, padAsMultipleOfSvgDomainSize)
  return result
}
