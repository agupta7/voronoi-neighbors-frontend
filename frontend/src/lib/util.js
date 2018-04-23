var util = {
	'stringToBytes': stringToBytes,
	'numToBytes': numToBytes,
	'floatToBytes': floatToBytes,
	'hexStringToBytes': hexStringToBytes,
	'bytesToHexString': bytesToHexString,
	'bytesToString': bytesToString,
	'Uint8': _Uint8
}

function stringToBytes(str) {
	var bytes = [];
	for (var i = 0; i < str.length; i++) {
		var charCode = str.charCodeAt(i);
		Array.prototype.push.apply(bytes, numToBytes(charCode));
	}
	return _Uint8(bytes);
}
function bytesToString(bytes) {
	return Array.from(bytes).map(function (charCode) {
		return String.fromCharCode(charCode);
	}).join('');
}

function numToBytes(num) {
	var bytes = [];
	while (num > 0) {
		bytes.unshift(num % 256);
		num = num >> 8;
	}
	return _Uint8(bytes);
}
function floatToBytes(doub) {
	var buffer = new ArrayBuffer(8);
	var view = new DataView(buffer);

	view.setFloat64(0, doub, false);
	var arr = Array.from(new Uint8Array(buffer));
	return arr;
}
function hexStringToBytes(hexString) {
	if (hexString.length % 2 != 0) {
		hexString = "0" + hexString;
	}

	var bytes = [];
	for (var i = 0; i < hexString.length; i += 2) {
		bytes.push(parseInt(hexString[i] + hexString[i+1], 16));
	}
	return _Uint8(bytes);
}
function bytesToHexString(bytes) {
	var str = '';
	return Array.from(bytes || []).map(function (byte) {
		var str = byte.toString(16);
		return str.length % 2 ? ('0' + str) : str;
	}).join('');
}

function _Uint8(arr) {
	if (typeof Uint8Array != "undefined")
		return Uint8Array.from(arr);
	else
		return arr;
}

export default util;