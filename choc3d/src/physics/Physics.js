/**
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
