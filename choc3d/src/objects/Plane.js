/**
 * @author Mathieu Ledru
 */

Choc3D.Plane = function ( geometry, material ) {

    geometry = geometry || new THREE.PlaneGeometry(1, 1);
    material = material || new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff });

    Choc3D.Object.call( this, new THREE.Mesh( geometry, material ) );

    this.normal = this.up.clone();

};

Choc3D.Plane.prototype = Object.create( Choc3D.Object.prototype );

Choc3D.Plane.prototype.computeNormal = function() {

    this.normal.copy(this.up);
    this.matrix.multiplyVector3(this.normal);
};

Choc3D.Plane.prototype.lookAt = function ( vector ) {

    Choc3D.Object.prototype.lookAt.call( this, vector );

    this.computeNormal();

};