function distanceSquared(x, y, p) {
    var dx = p.x - x;
    var dy = p.y - y;
    return dx * dx + dy * dy;
}
export function distanceToPath(x, y, path) {
    // point: {x, y}
    // path: svg Path
    var pathLength = path.getTotalLength();
    var chunk = pathLength / 8.0;
    var chunks = [0, chunk, chunk * 2, chunk * 3, chunk * 4, chunk * 5, chunk * 6, chunk * 7, pathLength];
    var best = chunks.reduce(function (previous, current) {
        var point = path.getPointAtLength(current);
        var distance2 = distanceSquared(x, y, point);
        var result = distance2 < previous.distance ? { length: current, distance: distance2 } : previous;
        return result;
    }, { length: 0, distance: Infinity });
    chunk *= 0.51;
    var i = 0;
    while (chunk > 0.0000001) {
        var aLength = best.length - chunk;
        var bLength = best.length + chunk;
        var aDistance = aLength > 0 ? distanceSquared(x, y, path.getPointAtLength(aLength)) : Infinity;
        var bDistance = bLength < pathLength ? distanceSquared(x, y, path.getPointAtLength(bLength)) : Infinity;
        console.log(aLength, aDistance);
        console.log(bLength, bDistance);
        if (aDistance < best.distance) {
            best = { length: aLength, distance: aDistance };
        }
        else if (bDistance < best.distance) {
            best = { length: bLength, distance: bDistance };
        }
        else {
            chunk *= 0.51;
        }
        i++;
        console.log(chunk, best, i);
    }
    return Math.sqrt(best.distance);
}
// TODO add one-pixel svg to current page
export function generateArrayFromPath(pathString) {
    var pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
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
    pathElement.setAttribute('d', pathString);
    return [distanceToPath(0, 0, pathElement)];
}
//# sourceMappingURL=index.js.map