/**
 * @author Mathieu Ledru
 */

Choc3D.Physics = function () {

    this.objects = [];

    this.ZERO = Math.pow(2, -32); //adjust imprecision

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

        return undefined;

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

        var deltaPos = new THREE.Vector3();
        deltaPos.sub(plane.position, ball.position);

        //seek collision time between the ball and the plan
        var time = ( plane.normal.dot( deltaPos ) ) / dot;

        /*
         * we calculated time as the collision between the middle of the ball and the plan
         * here, we calculate time that is the collision between the surface of the ball and the plan
         */

        //time = time * ( 1 - ball.radius / ( time * ball.velocity.length() ) );

        return time;

    },

    collideBallBall: function( ballI, ballJ ) {

    },

    collideBallPlane: function( ball, plane ) {

        var dot = 2 * ball.velocity.dot( plane.normal );
        var k = plane.normal.clone();
        ball.velocity.sub( ball.velocity, k.multiplyScalar( dot ) );

    }
};
