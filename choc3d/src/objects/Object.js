/**
 * @author Mathieu Ledru
 */

Choc3D.Object = function ( object3D ) {

    THREE.Object3D.call( this );

    this.weight = 0;
    this.velocity = new THREE.Vector3( 0, 0, 0 );

    this.add( object3D );

};

Choc3D.Object.prototype = Object.create( THREE.Object3D.prototype );
