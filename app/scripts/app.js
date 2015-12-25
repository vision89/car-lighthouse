/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

(function(document) {
  'use strict';

  // Grab a reference to our auto-binding template
  // and give it some initial binding values
  // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
  var app = document.querySelector('#app');

  app.displayInstalledToast = function() {

    document.querySelector('#caching-complete').show();

  };

  /**
   * Set up the default data for local storage
   * @return {[type]} [description]
   */
  app.initializeDefaultData = function() {

    app.set( 'carData', {

      viewMode: true,
      carLocation: null,
      showError: false,
      noteContent: ''

    });

  };

  /**
   * Check the data
   * @return {[type]} [description]
   */
  app.initializeData = function () {

    if ( app.carData === undefined || app.carData === null ) {

      //app.initializeDefaultData();

    }

  };

  // See https://github.com/Polymer/polymer/issues/1381
  window.addEventListener('WebComponentsReady', function() {

    app.distance = 0;

    var params = { scope: 'email' };

    /**
     * If ready gets distance between two points
     * @param  {[type]} coord1 [description]
     * @param  {[type]} coord2 [description]
     * @return {[type]}        [description]
     */
    function _computeDistance ( coord1, coord2 ) {

      if ( coord1 && coord2 ) {

        var d2r = 0.0174532925199433;

        var dlong = ( coord2.lng - coord1.lng ) * d2r;
        var dlat = ( coord2.lat - coord1.lat ) * d2r;
        var a = Math.pow( Math.sin( dlat / 2.0 ), 2 ) + Math.cos( coord1.lat * d2r ) * Math.cos( coord2.lat * d2r ) * Math.pow( Math.sin( dlong / 2.0 ), 2 );
        var c = 2 * Math.atan2( Math.sqrt( a ), Math.sqrt( 1 - a ) );
        app.distance = ( 3956 * c ).toFixed( 2 ); 

      }

    }

    /**
     * Update the distance every 5 seconds
     * @return {[type]} [description]
     */
    function _computeDistanceLoop ( timeout ) {

      setTimeout( function () {

        if ( app.coords ) {

          _computeDistance( { 'lat': app.coords.latitude, 'lng': app.coords.longitude }, app.carData.carLocation );

          _computeDistanceLoop( 5000 );

        }

      }, timeout );

    }


    /**
     * Update car location
     * @return {[type]} [description]
     */
    app.updateCarLocation = function () {

      app.set( 'carData.carLocation', {

        'lat': app.coords.latitude,
        'lng': app.coords.longitude

      });

      _computeDistance( { 'lat': app.coords.latitude, 'lng': app.coords.longitude }, app.carData.carLocation );

    };

    /**
     * Switch mode for displaying notes
     * @return {[type]} [description]
     */
    app.switchMode = function () {

      if ( app.carData.viewMode === false ) {

        app.note = {

          content: app.carData.noteContent

        };

      }

      app.set( 'carData.viewMode', !app.carData.viewMode );

    };

    /**
     * Get directions from the user to the car
     * @return {[type]} [description]
     */
    app.getDirections = function () {

      if ( app.carData.carLocation && app.coords ) {

        var url = 'http://maps.google.com/maps?saddr=' + app.coords.latitude + ',' + app.coords.longitude + '&daddr=' + app.carData.carLocation.lat + ',' + app.carData.carLocation.lng + '&mode=walking';

        var win = window.open(url, '_blank');
        win.focus();

        app.set( 'carData.showError', false );

      } else {

        app.set( 'carData.showError', true );

      }

    };

    /**
     * Set note after getting it from the db
     */
    app.setNote = function () {

      if ( app.note !== undefined && app.note !== null ) {

        app.set( 'carData.noteContent', app.note.content );

      }

    };

    app.showHelpModal = function () {

      app.$.helpDialog.toggle();

    };

    /**
     * User has succesfully logged in
     * @return {[type]} [description]
     */
    window.onload = function ( e ) {

      //Kick off the location updates
      setTimeout( function () {

        _computeDistanceLoop( 1000 );

      });

    };

    /**
     * User has logged out
     * @return {[type]} [description]
     */
    window.onbeforeunload = function ( e ) {

      var locationElement = document.querySelector( '#polymer-location' );
      locationElement.unsetWatch();

    };

  });

})( document );