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

    var ballVolume = function( radius ) {
        return (4 * Math.PI * Math.pow( radius, 3) / 3)
    };

    var ballCanBePlaced = function( ball ) {

        var vector = new THREE.Vector3();
        var unit = new THREE.Vector3(1, 1, 1);

        //check if ball is contained into Scene cube
        var cubeBox = new THREE.Box3();
        cubeBox.setFromCenterAndSize(vector, unit);
        var sphereBox = new THREE.Box3();
        sphereBox.setFromCenterAndSize(ball.position, unit.clone().multiplyScalar(2 * ball.radius));
        if( !cubeBox.containsBox(sphereBox) ) {
            return false;
        }

        //check if ball do not collide with Scene balls
        for ( var i = 0, l = this.children.length; i < l; i ++ ) {

            var child = this.children[i];
            if ( child instanceof Choc3D.Ball ) {

                vector.sub(ball.position, child.position);

                //if distance between positions is shorter than radius sum, then there is collision
                if(vector.lengthSq() <= Math.pow(ball.radius + child.radius, 2) + this.physics.ZERO) return false;

            }

        }

        return true;
    };

    var ball = new Choc3D.Ball();
    var radius = ball.radius;

    do {
        ball.position.x = Math.random() - 0.5;
        ball.position.y = Math.random() - 0.5;
        ball.position.z = Math.random() - 0.5;
        ball.velocity.x = (Math.random() - 0.5) / 1000;
        ball.velocity.y = (Math.random() - 0.5) / 1000;
        ball.velocity.z = (Math.random() - 0.5) / 1000;
        ball.radius = Math.random() / 25 + 0.05;

        //weight is proportional to the ball volume
        ball.weight = 2 * ballVolume.call( this, ball.radius );

    } while( !ballCanBePlaced.call( this, ball ) );

    ball.scale.multiplyScalar( ball.radius / radius );

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
