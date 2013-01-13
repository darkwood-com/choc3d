/**
 * @author Mathieu Ledru
 */

Choc3D.Ball = function ( geometry, material ) {

    geometry = geometry || new THREE.SphereGeometry(0.5, 16, 16);
    material = material || new THREE.MeshPhongMaterial( { color: Math.random() * 0xffffff } );

    Choc3D.Object.call( this, new THREE.Mesh( geometry, material ) );

    this.radius = 0.5;

};

Choc3D.Ball.prototype = Object.create( Choc3D.Object.prototype );
