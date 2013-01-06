/**
 * @author Mathieu Ledru
 */

Choc3D.Choc3DScene = function ( ) {

    THREE.Scene.call( this );

    this.physics = new Choc3D.Physics();

    var scope = this;

    //create cube
    function addPlane( u, v , depth ) {
        var w;

        if ( ( u === 'x' && v === 'y' ) || ( u === 'y' && v === 'x' ) ) {

            w = 'z';

        } else if ( ( u === 'x' && v === 'z' ) || ( u === 'z' && v === 'x' ) ) {

            w = 'y';

        } else if ( ( u === 'z' && v === 'y' ) || ( u === 'y' && v === 'z' ) ) {

            w = 'x';

        }

        var plane = new Choc3D.Plane();
        plane.position[ u ] = 0;
        plane.position[ v ] = 0;
        plane.position[ w ] = 0.5 * depth;

        plane.lookAt(new THREE.Vector3( 0, 0, 0 ));

        scope.add(plane);
    }

    addPlane( 'z', 'y' ,   1 );
    addPlane( 'z', 'y' , - 1 );
    addPlane( 'x', 'z' ,   1 );
    addPlane( 'x', 'z' , - 1 );
    addPlane( 'x', 'y' ,   1 );
    addPlane( 'x', 'y' , - 1 );

    //add balls
    for(var i = 0; i < 10; ++i) {
        this.addBall();
    }
};

Choc3D.Choc3DScene.prototype = Object.create( THREE.Scene.prototype );

Choc3D.Choc3DScene.prototype.addBall = function() {

    var ball = new Choc3D.Ball();
    ball.position.x = Math.random() - 0.5;
    ball.position.y = Math.random() - 0.5;
    ball.position.z = Math.random() - 0.5;
    ball.velocity.x = (Math.random() - 0.5) / 50;
    ball.velocity.y = (Math.random() - 0.5) / 50;
    ball.velocity.z = (Math.random() - 0.5) / 50;

    ball.scale.multiplyScalar(Math.random() / 5 + 0.1);

    this.add(ball);

};

Choc3D.Choc3DScene.prototype.add = function ( object ) {

    THREE.Scene.prototype.add.call( this, object );

    this.physics.add( object );

};

Choc3D.Choc3DScene.prototype.remove = function ( object ) {

    this.physics.remove( object );

    THREE.Scene.prototype.remove( this, object );

};

Choc3D.Choc3DScene.prototype.update = function( dt ) {

    this.physics.update( dt );

};
