import CartesianPoint from './CartesianPoint.js';

/**
 * A Voronoi edge is a collection of vertices, which when joined together, forms one of the edges of a Voronoi cell.
 * @param {*} cartesianPoints An array of CartesianPoint or an array of x, y, z coordinates.
 */
function VoronoiEdge(cartesianPoints) {
	this._points = cartesianPoints.map(function (point) {
		if (!(point instanceof CartesianPoint)) {
			return new CartesianPoint(point);
		}
		return point;
	});
}

VoronoiEdge.prototype.latLngPath = function latLngPath() {
	return this._points.map(function (point) {
		return point.toLatLng();
	});
};

// Code adapted from http://lpetrich.org/Science/GeometryDemo/GeometryDemo_GMap.html
// function Add_GMapLine(...)
// not needed if using geodesic: true property in Google Maps polyline constructor.
VoronoiEdge.prototype.latLngPathSmooth = function latLngPath(threshold) {
	if (!threshold || this._points.length < 2) {
		return this.latLngPath();
	}
	
	var previousPoint = this._points[0];
	var smoothPoints = [previousPoint];
	for (var i = 1; i < this._points.length; i++) {
		var point = this._points[i];
		smoothPoints.push.apply(smoothPoints, splitSegment(previousPoint, point, threshold));
		smoothPoints.push(point);

		previousPoint = point;
	}

	// for loop is faster the Array.prototype.map - crucial for a larger array like smoothPoints
	for (var i = 0; i < smoothPoints.length; i++) {
		smoothPoints[i] = (new CartesianPoint(smoothPoints[i])).toLatLng();
	}
	return smoothPoints;

	// copied and refactored from http://lpetrich.org/Science/GeometryDemo/GeometryDemo_GMap.html
	function splitSegment(p0, p1, threshold) {
		p0 = new CartesianPoint(p0);
		p1 = new CartesianPoint(p1);
		
		var distance = p0.distanceTo(p1);
		var empty = [];
		if (distance < threshold) {
			return empty;
		}
		
		var px = new CartesianPoint(p0.x + p1.x, p0.y + p1.y, p0.z + p1.z);
		px = px.normalize();

		return empty.concat(splitSegment(p0, px, threshold), px, splitSegment(px, p1, threshold));
	}
};

export default VoronoiEdge;