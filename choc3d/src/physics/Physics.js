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

    update: function ( dt ) {

        for ( var i = 0, l = this.objects.length; i < l; i ++ ) {

            this.objects[ i ].position.addSelf( this.objects[ i ].velocity );

        }

    }
};
