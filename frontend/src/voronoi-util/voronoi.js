import CartesianPoint from './CartesianPoint.js';
import VoronoiEdge from './VoronoiEdge.js';
import delaunayTriangulation from '../lib/delaunayTriangles.js';

/**
 * Uses Loren Petrich's MIT Licensed Delaunay Triangulation library to calculate Voronoi cells in true spherical coordinates.
 * http://lpetrich.org/
 * http://lpetrich.org/Science/GeometryDemo/GeometryDemo_GMap.html
 * 
 * @param {*} latLngPoints 
 */
function voronoiDiagram(latLngPoints) {
	var cartesiansNormalized = latLngPoints.map(function (latlng) {
		return CartesianPoint.fromLatLng(latlng).normalize();
	});

	var delaunayTriangles = delaunayTriangulation(cartesiansNormalized, function distanceFormula(ptA, ptB) {
		var cartA = new CartesianPoint(ptA);
		var cartB = new CartesianPoint(ptB);

		return cartA.distanceTo(cartB);
	});
	delaunayTriangles.vor_positions_cp = delaunayTriangles.vor_positions.map(function (vor_point) {
		var cp = new CartesianPoint(vor_point);
		cp['neighborCells'] = [];
		return cp;
	});
	var voronoiEdges = calculateVoronoiEdges(delaunayTriangles);
	var voronoiCells = [];

	for (var i = 0; i < delaunayTriangles.indices.length && delaunayTriangles.vor_polygons[0]; i++) {
		var index = delaunayTriangles.indices[i];
		var voronoiCell = {
			'owner': latLngPoints[index],
			'index': index,
			'getNeighbors': _getNeighbors
		};
		voronoiCell['cellBoundary'] = _calculateCellBoundaries(delaunayTriangles, voronoiCell, index);

		voronoiCells.push(voronoiCell);
	}

	voronoiCells['getClosest'] = _getClosestCell;

	return {
		'cells': voronoiCells,
		'edges': voronoiEdges
	};
}

function calculateVoronoiEdges(delaunayTriangles) {
	// Transform each voronoi edge, which is a collection of points that forms a path on the map
	var voronoiEdges = delaunayTriangles.vor_edges.map(function (edgePointIndecies) {
		// Each edgePoint is a Cartesian coordinate
		var edgePoints = edgePointIndecies.map(function (pointIndex) {
			var cp = delaunayTriangles.vor_positions_cp[pointIndex];
			cp.vorpos_index = pointIndex;
			return cp;
		});

		return new VoronoiEdge(edgePoints);
	});

	return voronoiEdges;
}

function _calculateCellBoundaries(delaunayTriangles, voronoiCell, index) {
	var voronoiPolygon = delaunayTriangles.vor_polygons[index];
	var cellBoundary = voronoiPolygon.boundary.map(function (boundaryPointIndex) {
		var cp = delaunayTriangles.vor_positions_cp[boundaryPointIndex];
		cp['neighborCells'].push(voronoiCell);
		return cp;
	});
	cellBoundary.push(cellBoundary[0]); // complete the polygon

	return cellBoundary;
}

function _getNeighbors() {
	if (this._neighbors) {
		return this._neighbors;
	}

	var neigh = this._neighbors = [];
	for (var i = 0; i < this.cellBoundary.length; i++) {
		var boundaryPoint = this.cellBoundary[i];
		for (var j = 0; j < boundaryPoint.neighborCells.length; j++) {
			if (this != boundaryPoint.neighborCells[j] && neigh.indexOf(boundaryPoint.neighborCells[j]) < 0) {
				neigh.push(boundaryPoint.neighborCells[j]);
			}
		}
	}
	var referencePoint = CartesianPoint.fromLatLng(this.owner);
	neigh.sort(function (cellA, cellB) {
		var pointA = CartesianPoint.fromLatLng(cellA.owner);
		var pointB = CartesianPoint.fromLatLng(cellB.owner);
		var angleA = Math.atan2(pointA.y - referencePoint.y, pointA.x - referencePoint.x);
		var angleB = Math.atan2(pointB.y - referencePoint.y, pointB.x - referencePoint.x);
		return angleA - angleB;
	});

	return neigh;
}

function _getClosestCell(latLng) {
	var neighborhood = this;
	var point = CartesianPoint.fromLatLng(latLng);

	var closestCell = null;
	var shortest = null;

	for (var i = 0; i < neighborhood.length; i++) {
		var cell = neighborhood[i];
		var d = point.distanceTo(CartesianPoint.fromLatLng(cell.owner));
		if (shortest == null || d < shortest) {
			closestCell = cell;
			shortest = d;
		}
	}

	return closestCell;
}

export default voronoiDiagram;