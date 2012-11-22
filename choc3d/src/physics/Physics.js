/**
 * @author Mathieu Ledru
 */

Choc3D.Physics = function () {

    this.objects = [];

};

Choc3D.Physics.prototype = {

    constructor: Choc3D.Physics,

    add: function( object ) {

        if ( object instanceof THREE.Object3D ) {

            this.objects.push( object );

        }

    },

    remove: function ( object ) {

        var index = this.objects.indexOf( object );

        if ( index !== - 1 ) {

            this.objects.splice( index, 1 );

        }

    },

    update: function ( dt ) {

    }
};
