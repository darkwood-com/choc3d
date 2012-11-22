/**
 * @author Mathieu Ledru
 */

Choc3D.Ball = function ( geometry, material ) {

    geometry = geometry || new THREE.SphereGeometry(0.5, 16, 16);
    material = material || new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff });

    THREE.Mesh.call( this, geometry, material );

};

Choc3D.Ball.prototype = Object.create( THREE.Mesh.prototype );
