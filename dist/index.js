function distanceSquared(x, y, p) {
    var dx = p.x - x;
    var dy = p.y - y;
    return dx * dx + dy * dy;
}
export function nomralize(raw, svgDomainSize, padAsMultipleOfSvgDomainSize) {
    var range = svgDomainSize * padAsMultipleOfSvgDomainSize * 2;
    var max = range / 2;
    var min = -max;
    var normed = raw.map(function (v) { return v < min ? 0 : v > max ? 1 : (v / range) + 0.5; });
    return normed;
}
export function distanceToPath(x, y, path) {
    var pathLength = path.getTotalLength();
    // TODO Test this heristic with complicated letters (or just change to 32)
    var chunk = pathLength / 8.0;
    var chunks = [0, chunk, chunk * 2, chunk * 3, chunk * 4, chunk * 5, chunk * 6, chunk * 7, pathLength];
    // Find closest point of initial choices
    var best = chunks.reduce(function (previous, current) {
        var point = path.getPointAtLength(current);
        var distance2 = distanceSquared(x, y, point);
        var result = distance2 < previous.distance ? { length: current, distance: distance2 } : previous;
        return result;
    }, { length: 0, distance: Infinity });
    // Near-binary search
    chunk *= 0.51;
    var i = 0;
    while (chunk > 0.0000001) {
        var aLength = best.length - chunk;
        var bLength = best.length + chunk;
        var aDistance = aLength > 0 ? distanceSquared(x, y, path.getPointAtLength(aLength)) : Infinity;
        var bDistance = bLength < pathLength ? distanceSquared(x, y, path.getPointAtLength(bLength)) : Infinity;
        if (aDistance < best.distance) {
            best = { length: aLength, distance: aDistance };
        }
        else if (bDistance < best.distance) {
            best = { length: bLength, distance: bDistance };
        }
        else {
            chunk *= 0.51; // Only divide if no change
        }
        i++;
    }
    return Math.sqrt(best.distance);
}
export function generateArrayFromPath(pathString, sdfSize, svgDomainSize, padAsMultipleOfSvgDomainSize) {
    var pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElement.appendChild(pathElement);
    svgElement.style.width = "1px";
    svgElement.style.height = "1px";
    svgElement.style.position = "fixed";
    svgElement.style.top = "0";
    svgElement.style.left = "0";
    document.body.appendChild(svgElement);
    pathElement.setAttribute('d', pathString);
    var domainSize = svgDomainSize + (svgDomainSize * padAsMultipleOfSvgDomainSize);
    var midDomain = domainSize / 2;
    var box = svgElement.getBBox();
    var step = domainSize / sdfSize;
    var halfStep = step / 2;
    var midX = box.x + (box.width / 2);
    var startX = midX - midDomain - halfStep;
    var midY = box.y + (box.height / 2);
    var startY = midY - midDomain - halfStep;
    // The glyph units are scaled by 1 / (unitsPerEm * 72) - 72 pixels
    var raw = Array(sdfSize * sdfSize);
    var point = pathElement.getPointAtLength(0); // create a point to work with
    var x = startX;
    var y = startY;
    for (var i = 0; i < sdfSize; i++) {
        y += step;
        x = startX;
        for (var j = 0; j < sdfSize; j++) {
            x += step;
            point.x = x;
            point.y = y;
            var isIn = pathElement.isPointInFill(point);
            if (isIn)
                console.log(isIn);
            var distance = distanceToPath(x, y, pathElement);
            raw[i * sdfSize + j] = isIn ? distance : -distance;
        }
    }
    var result = nomralize(raw, svgDomainSize, padAsMultipleOfSvgDomainSize);
    return result;
}
//# sourceMappingURL=index.js.map