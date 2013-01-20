/**
 * @author Mathieu Ledru
 */

var Choc3D = Choc3D || { VERSION: '1.0' };/**
 * @author Mathieu Ledru
 */

Choc3D.App = function() {

    this.renderer = new THREE.WebGLRenderer();
    this.scene = new Choc3D.Choc3DScene();
    this.camera = new THREE.PerspectiveCamera();
    this.light = new THREE.PointLight( 0xFFFFFF );

    // init

    this.camera.position.x = 2;
    this.camera.position.y = 1;
    this.camera.position.z = 2;

    this.scene.add(this.camera);

    this.light.position.copy(this.camera.position);
    this.scene.add(this.light);

};

Choc3D.App.prototype = {

    constructor: Choc3D.App,

    reshape: function(width, height)
    {
        var view_angle = 45,
            aspect = width / height,
            near = 0.1,
            far = 10000;

        this.camera.projectionMatrix.makePerspective(view_angle, aspect, near, far);
        this.renderer.setSize(width, height);
    },

    render: function()
    {
        this.renderer.render(this.scene, this.camera);
    },

    update: function(dt)
    {
        this.scene.update(dt);
    }

};/**
 * @author Mathieu Ledru
 */

Choc3D.Object = function ( object3D ) {

    THREE.Object3D.call( this );

    this.weight = 0;
    this.velocity = new THREE.Vector3( 0, 0, 0 );

    this.add( object3D );

};

Choc3D.Object.prototype = Object.create( THREE.Object3D.prototype );
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
/**
 * @author Mathieu Ledru
 */

Choc3D.Plane = function ( geometry, material ) {

    geometry = geometry || new THREE.PlaneGeometry(1, 1);
    material = material || new THREE.MeshPhongMaterial( { color: Math.random() * 0xffffff } );

    Choc3D.Object.call( this, new THREE.Mesh( geometry, material ) );

    this.normal = this.up.clone();

};

Choc3D.Plane.prototype = Object.create( Choc3D.Object.prototype );

Choc3D.Plane.prototype.lookAt = function ( vector ) {

    Choc3D.Object.prototype.lookAt.call( this, vector );

    this.normal.sub( vector, this.position ).normalize();

};/**
 * @author Mathieu Ledru
 */

Choc3D.Physics = function () {

    this.ZERO = Math.pow(2, -32); //adjust imprecision

    this.objects = [];

};

Choc3D.Physics.prototype = {

    constructor: Choc3D.Physics,

    add: function( object ) {

        if ( object instanceof Choc3D.Object ) {

            this.objects.push( object );

        }

    },

    remove: function ( object ) {

        var index = this.objects.indexOf( object );

        if ( index !== - 1 ) {

            this.objects.splice( index, 1 );

        }

    },

    /**
     * Update objects between dt
     * Possible collisions are :
     * - Ball vs Ball
     * - Ball vs Plan
     *
     * @param dt
     */
    update: function ( dt ) {

        var l = this.objects.length, i, j, objI, objJ, time;

        while ( dt > 0 ) {

            //search min collision time between objects
            var collision = {
                time: dt,
                objects: null
            };

            for ( i = 0; i < l; i ++ ) {

                for ( j = i + 1; j < l; j ++ ) {

                    objI = this.objects[ i ];
                    objJ = this.objects[ j ];

                    time = undefined;

                    if ( objI instanceof Choc3D.Ball && objJ instanceof Choc3D.Ball ) {

                        time = this.timeCollisionBallBall(objI, objJ);

                    } else if ( objI instanceof Choc3D.Ball  && objJ instanceof Choc3D.Plane
                             || objI instanceof Choc3D.Plane && objJ instanceof Choc3D.Ball  ) {

                        time = this.timeCollisionBallPlane(
                            objI instanceof Choc3D.Ball  ? objI : objJ,
                            objI instanceof Choc3D.Plane ? objI : objJ
                        );

                    }

                    if ( time !== undefined && time >= 0 && time < collision.time ) {

                        collision = {
                            time: time,
                            objects: { i: i, j: j }
                        };

                    }

                }

            }

            //apply time
            for ( i = 0; i < l; i ++ ) {

                var object = this.objects[ i ];
                var v = object.velocity.clone().multiplyScalar( collision.time );

                object.position.addSelf( v );

            }

            //apply collision if found between the two objects
            if( collision.objects ) {

                objI = this.objects[ collision.objects.i ];
                objJ = this.objects[ collision.objects.j ];

                if ( objI instanceof Choc3D.Ball && objJ instanceof Choc3D.Ball ) {

                    this.collideBallBall(objI, objJ);

                } else if ( objI instanceof Choc3D.Ball  && objJ instanceof Choc3D.Plane
                         || objI instanceof Choc3D.Plane && objJ instanceof Choc3D.Ball  ) {

                    this.collideBallPlane(
                        objI instanceof Choc3D.Ball  ? objI : objJ,
                        objI instanceof Choc3D.Plane ? objI : objJ
                    );

                }

            }

            dt -= collision.time;

        }

    },

    timeCollisionBallBall: function( ballI, ballJ ) {

        //relative position
        var p = new THREE.Vector3();
        p.sub(ballJ.position, ballI.position);

        //relative velocity
        var v = new THREE.Vector3();
        v.sub(ballJ.velocity, ballI.velocity);

        //relative square velocity
        var v2 = v.clone().multiplySelf(v);

        //kinematic viscosity
        var kv = p.clone().multiplySelf(v);

        //minimal distance between the two balls
        var d = ballI.radius + ballJ.radius;

        var c = v2.x + v2.y + v2.z;
        var b = 2*(kv.x*kv.y + kv.x*kv.z + kv.y*kv.z) + c * Math.pow(d, 2);
        b -= Math.pow(p.x, 2)*(v2.y + v2.z);
        b -= Math.pow(p.y, 2)*(v2.x + v2.z);
        b -= Math.pow(p.z, 2)*(v2.x + v2.y);

        //check if there is a collision (b >= 0)
        if(b < 0) return undefined;

        //then we can calculate b^(1/2)
        b = Math.sqrt(b);

        //we also can calculate a
        var a = -(kv.x + kv.y + kv.z);

        //there is a collision, we seek the min collision time >= 0
        //t1 and t2 are two possible time collision
        var time = undefined, t1, t2;

        t1 = a + b;
        if(t1 >= 0) time = t1;

        t2 = a - b;
        if(t2 >= 0 && time > t2) time = t2;

        //if time is undefined, then the collision is in the opposite direction
        if(time === undefined) return undefined;

        //divide time by c
        time /= c;

        //warning : fix imprecision in time calculation due to computation
        time -= time * this.ZERO;

        return time;

    },

    timeCollisionBallPlane: function( ball, plane ) {

        //dot product between the normal of the plan and the ball direction
        var dot = ball.velocity.dot( plane.normal );

        /*
         * if dot is near ZERO, we consider it value as undefined
         * because time collision calculation would be a to high number
         *
         * if dot > ZERO, it means the ball go to the opposite direction of the plan, there is no collision
         */

        if ( -this.ZERO < dot ) return undefined;

        //here, we calculate time that is the collision between the surface of the ball and the plan
        //we calculate the point on the ball surface that is most near the plan
        var surfacePosition = new THREE.Vector3();
        surfacePosition.sub(ball.position, plane.normal.clone().multiplyScalar(ball.radius));

        //then we calculate the vector to the collision
        var deltaPos = new THREE.Vector3();
        deltaPos.sub(plane.position, surfacePosition);

        //seek collision time between the ball and the plan
        var time = ( plane.normal.dot( deltaPos ) ) / dot;

        return time;

    },

    collideBallBall: function( ballI, ballJ ) {

        //relative velocity
        var v = new THREE.Vector3();
        v.sub(ballI.velocity, ballJ.velocity);

        //normal direction vector
        var k = new THREE.Vector3();
        k.sub(ballI.position, ballJ.position).normalize();

        //var factor
        var a = 2 / (1 / ballI.weight + 1 / ballJ.weight) * k.dot(v);

        //apply new velocities
        ballI.velocity.sub(ballI.velocity, k.clone().multiplyScalar(a/ballI.weight));
        ballJ.velocity.add(ballJ.velocity, k.clone().multiplyScalar(a/ballJ.weight));

    },

    collideBallPlane: function( ball, plane ) {

        var dot = 2 * ball.velocity.dot( plane.normal );
        var k = plane.normal.clone();
        ball.velocity.sub( ball.velocity, k.multiplyScalar( dot ) );

    }
};
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

    THREE.Scene.prototype.remove.call( this, object );

};

Choc3D.Choc3DScene.prototype.update = function( dt ) {

    this.physics.update( dt );

};
