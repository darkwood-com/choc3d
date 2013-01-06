/**
 * @author Mathieu Ledru
 */

Choc3D.Physics = function () {

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

            //apply min collision if found between the two objects
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

            //apply collision time
            for ( i = 0; i < l; i ++ ) {

                var object = this.objects[ i ];

                object.position.addSelf( object.velocity );

            }

            dt -= collision.time;

        }

    },

    timeCollisionBallBall: function( ballI, ballJ ) {

        return undefined;

    },

    timeCollisionBallPlane: function( ball, plane ) {

        return undefined;

    },

    collideBallBall: function( ballI, ballJ ) {

    },

    collideBallPlane: function( ball, plane ) {

    }
};
