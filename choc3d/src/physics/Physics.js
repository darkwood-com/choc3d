/**
 * @author Mathieu Ledru
 */

Choc3D.Physics = function () {

    this.objects = [];

    this.zero = Math.pow(10, -16); //adjust imprecision

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

        /*//produit scalaire entre la normale du plan et la direction de la bille
        var signeDirection = vitesse.dot(pl.getNormale());

        *//*
         * si signeDirection est proche de ZERO, on consid�re qu'il est nul
         * car le calcul de t donnerai un chiffre extremement grand
         *
         * si le signeDirection > ZERO cela veux dire que la bille va dans la direction oppos�e au plan, il n'y a pas collision
         *//*

        if ( -this.ZERO < signeDirection) return false;

        Vector3d deltaPos = new Vector3d();
        deltaPos.sub(pl.getPointPlan(), position);

        double t;
        //on cherche la collision entre la bille et le plan
        t = (pl.getNormale().dot(deltaPos)) / signeDirection;

        *//*
         * nous avons t qui est la collision entre le mileu de la bille et le plan.
         * ici, on calcule t qui est la collision entre la surface de la bille et le plan
         * et on enregistre les infos de la collision qui a eu lieu
         *//*

        //t = t*(1 - rayon/(t*vitesse.length()));
        lamda[1] = t;
        return true;*/

        return undefined;

    },

    collideBallBall: function( ballI, ballJ ) {

    },

    collideBallPlane: function( ball, plane ) {

    }
};
