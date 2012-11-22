/**
 * @author Mathieu Ledru
 */

Choc3D.Plane = function ( geometry, material ) {

    geometry = geometry || new THREE.PlaneGeometry(1, 1);
    material = material || new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff });

    THREE.Mesh.call( this, geometry, material );

};

Choc3D.Plane.prototype = Object.create( THREE.Mesh.prototype );
